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
    """Value of `var` at the end of the 1-based nth iteration of the top-level
    for-loop. Works by snapshotting `var` each time the loop header re-fires
    (which happens once per iteration, plus once more when the iterator is
    exhausted). Values are deep-copied at capture time so later mutation of a
    list/dict can't corrupt an earlier snapshot."""
    lines = code.split("\n")
    header = next(i + 1 for i, ln in enumerate(lines) if ln.lstrip().startswith("for "))
    ends = []
    hits = [0]

    def tracer(frame, event, arg):
        if event == "call":
            return tracer
        if event == "line" and frame.f_lineno == header:
            hits[0] += 1
            if hits[0] >= 2:  # header hit k>=2 => iteration k-1 just finished
                ends.append(copy.deepcopy(frame.f_locals.get(var)))
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
    return ends[n - 1] if 0 < n <= len(ends) else None


def replace_line(code, lineno, new_stripped):
    """Return code with physical line `lineno` swapped for `new_stripped`,
    preserving the original line's indentation."""
    lines = code.split("\n")
    original = lines[lineno - 1]
    indent = original[: len(original) - len(original.lstrip())]
    lines[lineno - 1] = indent + new_stripped
    return "\n".join(lines)


# -------------------------------- result table --------------------------------
results = []  # (id, cat, tier, ok, computed, expected, note)


def record(qid, cat, tier, ok, computed, expected, note=""):
    results.append((qid, cat, tier, ok, computed, expected, note))


def as_option_text(value):
    """Render a computed Python value the way the options store it."""
    return value if isinstance(value, str) else str(value)


# ---------------------------- assisted-tier tables ----------------------------
# C6: the shipped code is meant to raise. We verify the error premise
# mechanically (the code really raises this exception). Which fix is correct is
# the author's assertion; the expected fixed output is documented for the reader.
C6_RAISES = {
    176: ("IndexError", "fixed prints -2 (sum of adjacent diffs)"),
    175: ("TypeError", "fixed prints 215 (int-cast slices)"),
    177: ("TypeError", "fixed prints VIOLET"),
    180: ("ValueError", "fixed leaves [7, 6, 4, 2]"),
    178: ("IndexError", "fixed leaves [5, 9, 5, 9]"),
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
def main():
    with open(QUESTIONS_PATH, encoding="utf-8") as f:
        questions = json.load(f)["questions"]

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

            elif cat == "C6":                   # verify the error premise
                if qid not in C6_RAISES:
                    raise KeyError(f"no C6 expectation for id {qid} — add one to C6_RAISES")
                want, note = C6_RAISES[qid]
                _, err, _ = run(q["code"])
                record(qid, cat, "assist", err == want, err, want, note)

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

    # ------------------------------- coverage guard -------------------------------
    # A check must exist for every question. If counts diverge, something was
    # skipped — never let that pass as green.
    checked_ids = {r[0] for r in results}
    all_ids = {q.get("id", "?") for q in questions}
    missing = all_ids - checked_ids
    coverage_ok = (len(results) == len(questions)) and not missing

    # ---------------------------------- report ----------------------------------
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
