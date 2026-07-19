# -*- coding: utf-8 -*-
"""Ground-truth verification harness for the code-tracing questions.

Single source of truth: data/questions.json. Every check below executes the
**actual shipped code** from that file — there is no second, hand-copied copy
of any snippet here. If a question's code drifts from its answer, this harness
fails.

Two tiers of checks:

  MECHANICAL (C1, C3, C4, C5) — the correct answer is computed purely by
  running/instrumenting the shipped code, then compared to
  options[correct_index]. No per-question data lives in this file.

  ASSISTED (C2, C6, C7) — the answer is a natural-language statement, so it
  can't be selected by execution alone. For these we keep a small, auditable
  table of *structured expectations* (an expected exception, a one-line code
  change, an expected effect) and verify each one against the shipped code by
  executing it. The code is still never duplicated here.

Run:  python3 verify.py        # prints a per-question OK/XX table
Exit code is non-zero if any check fails.
"""
import io
import os
import re
import ast
import sys
import copy
import json
import contextlib

HERE = os.path.dirname(os.path.abspath(__file__))
# verify.py lives in data/ alongside questions.json
QUESTIONS_PATH = os.path.join(HERE, "questions.json")


# ------------------------------ execution helpers ------------------------------
def run(code):
    """Exec code in a fresh namespace. Return (stdout_stripped, exc_name|None, ns)."""
    buf = io.StringIO()
    exc = None
    ns = {}
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(code, "<question>", "exec"), ns)
    except Exception as e:  # noqa: BLE001 — we want to report any failure type
        exc = type(e).__name__
    return buf.getvalue().strip(), exc, ns


def count_line_runs(code, lineno):
    """How many times physical line `lineno` executes in the shipped code."""
    runs = [0]

    def tracer(frame, event, arg):
        if event == "call":
            return tracer
        if event == "line" and frame.f_lineno == lineno:
            runs[0] += 1
        return tracer

    prev = sys.gettrace()
    sys.settrace(tracer)
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compile(code, "<question>", "exec"), {})
    except Exception:
        pass
    finally:
        sys.settrace(prev)
    return runs[0]


def var_after_iteration(code, var, n):
    """Value of `var` at the end of the 1-based nth iteration of the snippet's
    single top-level loop.

    Contract (asserted, not assumed):
      * Exactly one loop at module top level — a `for` or a `while`. Nested
        loops inside its body are allowed; two sequential top-level loops make
        "iteration N" ambiguous and are rejected, as is a loop wrapped in a
        function (not reached at module level) and a single-line loop body.
      * The loop must actually run at least N iterations.
    Any violation raises, so the harness reports the question as an error rather
    than silently measuring the wrong loop or the wrong iteration.

    Mechanics: we watch line events in the module frame and keep the most recent
    value of `var` seen on a line *inside the loop body*. That pending value is
    committed as "end of this iteration" the moment control leaves the body —
    whether the loop header re-fires (next iteration / normal exhaustion) or
    execution jumps past the loop (a `break`). This captures the break iteration
    correctly, unlike counting header re-fires alone. Snapshots are deep-copied
    so later mutation of a list/dict can't corrupt an earlier one; counting is
    restricted to the module frame so nested calls can't interfere.
    """
    if n < 1:
        raise ValueError(f"iteration number must be >= 1, got {n}")

    top_loops = [node for node in ast.parse(code).body
                 if isinstance(node, (ast.For, ast.While))]
    if len(top_loops) != 1:
        raise ValueError(
            f"C5 needs exactly one top-level loop (for/while); found "
            f"{len(top_loops)}. Nested loops are fine; two sibling loops or a "
            f"loop inside a function are not supported."
        )
    loop = top_loops[0]
    header = loop.lineno
    # last body line — the loop's own body only (an `else:` clause is excluded,
    # since its statements run after the loop, not within an iteration).
    body_end = max(getattr(stmt, "end_lineno", stmt.lineno) for stmt in loop.body)
    if body_end <= header:
        raise ValueError("single-line loop body is not supported by the C5 harness")

    ends = []
    in_body = [False]

    def capture(frame):
        ends.append(copy.deepcopy(frame.f_locals.get(var)))
        in_body[0] = False

    def tracer(frame, event, arg):
        if event == "call":
            return tracer
        if frame.f_code.co_name != "<module>":
            return tracer
        if event == "line":
            ln = frame.f_lineno
            if header < ln <= body_end:      # executing a line inside the body
                in_body[0] = True
            elif in_body[0]:                 # first line after the body ran:
                capture(frame)               # header re-fire, or the line past a break
        elif event == "return" and in_body[0]:
            capture(frame)                   # loop was the last statement (break, no trailing line)
        return tracer

    prev = sys.gettrace()
    sys.settrace(tracer)
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compile(code, "<question>", "exec"), {})
    except Exception:
        pass
    finally:
        sys.settrace(prev)

    if n > len(ends):
        raise ValueError(
            f"loop completed only {len(ends)} iteration(s); cannot read the "
            f"value after iteration {n}"
        )
    return ends[n - 1]


def replace_line(code, lineno, new_stripped):
    """Return code with physical line `lineno` swapped for `new_stripped`,
    preserving the original line's indentation."""
    lines = code.split("\n")
    original = lines[lineno - 1]
    indent = original[: len(original) - len(original.lstrip())]
    lines[lineno - 1] = indent + new_stripped
    return "\n".join(lines)


def apply_line_fix(code, start, end, new_lines):
    """Return code with physical lines start..end (inclusive, 1-based) replaced
    by `new_lines`. Each replacement line carries its own indentation, so this
    can turn one line into several (e.g. wrapping a statement in an `if`)."""
    lines = code.split("\n")
    return "\n".join(lines[:start - 1] + list(new_lines) + lines[end:])


def as_option_text(value):
    """Render a computed Python value the way the options store it."""
    return value if isinstance(value, str) else str(value)


# ---------------------------- assisted-tier tables ----------------------------
# C6 ("fix the error"). For each question we verify, against the REAL buggy code:
#   1. it raises the expected exception (the error premise), and
#   2. applying the fix makes it run clean and print the intended answer.
# The fix is a line-range replacement (start, end, [new_lines]) applied to the
# shipped code. `expect` is the intended output, asserted independently of the
# run so a broken fix or wrong answer is caught rather than confirmed circularly.
# For fixes that are a single-line replacement, the harness also checks that the
# replacement text actually appears in options[correct_index] — tying the
# verified fix back to the marked-correct option. Prose fixes (a structural
# rewrite that isn't a verbatim code line in the option) can't be cross-checked
# that way and are flagged as such in the report.
C6 = {
    176: {"raises": "IndexError", "fix": (3, 3, ["for i in range(len(items) - 1):"]),
          "expect": "-2"},
    175: {"raises": "TypeError",  "fix": (5, 5, ["    parts.append(int(S[st:st + 2]))"]),
          "expect": "215"},
    177: {"raises": "TypeError",  "fix": (4, 4, ["    res = res + ch.upper()"]),
          "expect": "VIOLET"},
    180: {"raises": "ValueError", "fix": (3, 3, ["    if arr.count(5) > 0:",
                                                 "        arr.remove(5)"]),
          "expect": "[7, 6, 4, 2]"},
    178: {"raises": "IndexError", "fix": (2, 5, ["print([x for x in L if x % 2 != 0])"]),
          "expect": "[5, 9, 5, 9]"},
}

# C7: a one-line change (lineno, replacement) applied to the shipped code, plus
# the effect it should produce. The effect string is derived by executing the
# real code before/after — so it tracks the shipped snippet.
C7_CHANGE = {
    119: (3, "for i in range(1, len(nums)):", "no change"),
    124: (5, "pass", "no change"),
    121: (3, "for i in range(len(vals) + 1):", "raises IndexError"),
    122: (3, "for i in range(0, len(s), 2):", "MARKETCAR -> MRECR"),
    123: (2, "b = a[:]", "5 -> 3"),
    125: (4, "if x >= 13:", "no change"),
    128: (3, "for i in range(1, len(L)):", "no change"),
}


def c7_effect(code, lineno, replacement):
    o_out, o_err, _ = run(code)
    m_out, m_err, _ = run(replace_line(code, lineno, replacement))
    if o_err or m_err:
        return f"raises {m_err}" if m_err and not o_err else f"orig {o_err} / mod {m_err}"
    if o_out == m_out:
        return "no change"
    return f"{o_out} -> {m_out}"


# C2: natural-language statements. Each predicate establishes the objective fact
# the true statement relies on, by executing the shipped code (and, where the
# statement is about a hypothetical edit, applying that edit to the real code).
def c2_predicate(qid, code):
    if qid in (149, 155):                       # aliasing: len(a) ends at 5
        _, _, ns = run(code)
        return len(ns["a"]) == 5, f"len(a)={len(ns['a'])}"
    if qid == 151:                              # loop body runs exactly 5 times
        n = count_line_runs(code, 3)            # first body line
        return n == 5, f"body runs {n}x"
    if qid == 152:                              # sorted() leaves vals unchanged
        literal = re.search(r"vals\s*=\s*(\[[^\]]*\])", code).group(1)
        _, _, ns = run(code)
        return ns["vals"] == json.loads(literal), f"vals={ns['vals']}"
    if qid == 154:                              # res ends at 3 (find returns -1)
        _, _, ns = run(code)
        return ns["res"] == 3, f"res={ns['res']}"
    if qid == 150:                              # adding print(sum(parts)) -> TypeError
        _, err, _ = run(code + "\nprint(sum(parts))")
        return err == "TypeError", f"sum(parts) raises {err}"
    return None, "no predicate"


# --------------------------------- run checks ---------------------------------
def evaluate(questions):
    """Run every check against the given parsed questions.

    Pure and self-contained: builds its own result list, mutates no global
    state, and can be called repeatedly with different data (that's what makes
    the harness testable). Returns (results, coverage_ok, missing_ids), where
    results is a list of (id, cat, tier, ok, computed, expected, note) tuples.
    """
    results = []

    def record(qid, cat, tier, ok, computed, expected, note=""):
        results.append((qid, cat, tier, ok, computed, expected, note))

    for q in sorted(questions, key=lambda x: x["id"]):
        qid = q.get("id", "?")
        cat = q.get("category", "?")
        # Each question is guarded: a malformed prompt, missing id, or bad
        # category fails *that* check (and is reported) instead of crashing the
        # whole run. Every question therefore always produces exactly one record.
        try:
            correct = q["options"][q["correct_index"]]

            if cat in ("C1", "C4"):             # answer is the printed output
                out, err, _ = run(q["code"])
                computed = f"<{err}>" if err else out
                record(qid, cat, "mech", computed == correct, computed, correct)

            elif cat == "C3":                   # answer is a line-execution count
                m = re.search(r"שורה\s*(\d+)", q["prompt"])
                if not m:
                    raise ValueError("C3 prompt has no 'שורה N' line reference")
                lineno = int(m.group(1))
                computed = str(count_line_runs(q["code"], lineno))
                record(qid, cat, "mech", computed == correct, computed, correct,
                       f"line {lineno}")

            elif cat == "C5":                   # answer is var value after iter N
                mv = re.search(r"המשתנה\s+([A-Za-z_]\w*)", q["prompt"])
                mn = re.search(r"האיטרציה\s*ה-?\s*(\d+)", q["prompt"])
                if not (mv and mn):
                    raise ValueError("C5 prompt missing variable or iteration N")
                var, n = mv.group(1), int(mn.group(1))
                computed = as_option_text(var_after_iteration(q["code"], var, n))
                record(qid, cat, "mech", computed == correct, computed, correct,
                       f"{var} after iter {n}")

            elif cat == "C6":                   # premise + the fix actually works
                if qid not in C6:
                    raise KeyError(f"no C6 expectation for id {qid} — add one to C6")
                spec = C6[qid]
                start, end, new_lines = spec["fix"]

                _, buggy_err, _ = run(q["code"])              # 1. error premise
                fixed = apply_line_fix(q["code"], start, end, new_lines)
                fixed_out, fixed_err, _ = run(fixed)          # 2. fix works + right answer

                premise_ok = buggy_err == spec["raises"]
                fix_ok = fixed_err is None and fixed_out == spec["expect"]

                # 3. for a single-line replacement, the fix text must appear in the
                #    marked-correct option (ties the working fix to the option).
                single_line = start == end and len(new_lines) == 1
                if single_line:
                    xref_ok = new_lines[0].strip() in q["options"][q["correct_index"]]
                    note = "premise+fix+option"
                else:
                    xref_ok = True                            # prose fix: not text-checkable
                    note = "premise+fix (option text not machine-checked)"

                ok = premise_ok and fix_ok and xref_ok
                if not premise_ok:
                    computed = f"buggy raised {buggy_err}"
                elif not fix_ok:
                    computed = f"fixed -> {fixed_err or fixed_out!r}"
                elif not xref_ok:
                    computed = "fix text not found in correct option"
                else:
                    computed = f"raises {buggy_err}, fixed -> {spec['expect']}"
                record(qid, cat, "assist", ok, computed, spec["expect"], note)

            elif cat == "C7":                   # verify effect of the one-line change
                if qid not in C7_CHANGE:
                    raise KeyError(f"no C7 expectation for id {qid} — add one to C7_CHANGE")
                lineno, repl, want = C7_CHANGE[qid]
                got = c7_effect(q["code"], lineno, repl)
                record(qid, cat, "assist", got == want, got, want, f"line {lineno}")

            elif cat == "C2":                   # verify the statement's premise
                ok, note = c2_predicate(qid, q["code"])
                if ok is None:
                    raise KeyError(f"no C2 predicate for id {qid} — add one to c2_predicate")
                record(qid, cat, "assist", bool(ok), note, "true-statement holds")

            else:                               # unknown / typo'd category
                raise ValueError(f"unknown category {cat!r}")

        except Exception as e:                  # noqa: BLE001 — turn any fault into a failed check
            record(qid, cat, "error", False, f"<{type(e).__name__}: {e}>", "—")

    # A check must exist for every question. If counts diverge, something was
    # skipped — never let that pass as green.
    checked_ids = {r[0] for r in results}
    all_ids = {q.get("id", "?") for q in questions}
    missing = all_ids - checked_ids
    coverage_ok = (len(results) == len(questions)) and not missing
    return results, coverage_ok, missing


def main(path=QUESTIONS_PATH):
    with open(path, encoding="utf-8") as f:
        questions = json.load(f)["questions"]
    results, coverage_ok, missing = evaluate(questions)

    print("=" * 78)
    print(f"{'ID':>4} {'CAT':<4} {'TIER':<7} {'OK':<4} computed  vs  expected   | note")
    print("=" * 78)
    n_fail = 0
    for qid, cat, tier, ok, comp, exp, note in results:
        flag = "OK " if ok else "XX "
        if not ok:
            n_fail += 1
        print(f"{qid:>4} {cat:<4} {tier:<7} {flag} {str(comp)!r:>20} vs "
              f"{str(exp)!r:<14} | {note}")
    print("=" * 78)
    mech = sum(1 for r in results if r[2] == "mech")
    assist = sum(1 for r in results if r[2] == "assist")
    print(f"TOTAL: {len(results)} checks ({mech} mechanical, {assist} assisted), "
          f"{n_fail} mismatches")
    if not coverage_ok:
        print(f"COVERAGE FAILURE: {len(questions)} questions but {len(results)} "
              f"checks; missing ids: {sorted(missing)}")
    return 1 if (n_fail or not coverage_ok) else 0


if __name__ == "__main__":
    sys.exit(main())
