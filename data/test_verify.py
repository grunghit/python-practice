# -*- coding: utf-8 -*-
"""Self-tests for verify.py — the tests the harness must pass to be trusted.

The harness's one job is to never report success while something is wrong.
So besides checking that the real question bank passes (the happy path), this
suite deliberately BREAKS the data in every way we've seen matter and asserts
the harness *catches* it. These are the ad-hoc probes from development, frozen
so they can't regress.

Run:  python3 -m unittest -v          (from the data/ directory)
   or python3 data/test_verify.py    (from anywhere)
"""
import os
import sys
import copy
import json
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import verify  # noqa: E402

REAL = json.load(open(verify.QUESTIONS_PATH, encoding="utf-8"))["questions"]


def by_id(questions, qid):
    return next(q for q in questions if q["id"] == qid)


def run_mutated(mutate):
    """Deep-copy the real bank, apply `mutate`, evaluate. Returns
    (results, coverage_ok, missing)."""
    qs = copy.deepcopy(REAL)
    mutate(qs)
    return verify.evaluate(qs)


def failures(results):
    return [r for r in results if not r[3]]   # r[3] is the ok flag


class HappyPath(unittest.TestCase):
    """The real, shipped question bank must verify cleanly."""

    def setUp(self):
        self.results, self.coverage_ok, self.missing = verify.evaluate(copy.deepcopy(REAL))

    def test_all_checks_pass(self):
        self.assertEqual(failures(self.results), [],
                         msg="a real question failed verification")

    def test_coverage(self):
        self.assertTrue(self.coverage_ok)
        self.assertEqual(self.missing, set())
        self.assertEqual(len(self.results), len(REAL))

    def test_one_record_per_question(self):
        # the property that prevents a silent false-green: every question
        # produces exactly one check.
        ids = [r[0] for r in self.results]
        self.assertEqual(len(ids), len(REAL))

    def test_evaluate_is_repeatable(self):
        # no global state: a second call must not accumulate.
        again, _, _ = verify.evaluate(copy.deepcopy(REAL))
        self.assertEqual(len(again), len(self.results))


class NoFalseGreen(unittest.TestCase):
    """Corrupt an answer or a snippet; the harness must flag it. One test per
    category, since each category derives truth differently."""

    def assertCaught(self, mutate):
        results, coverage_ok, _ = run_mutated(mutate)
        self.assertTrue(failures(results) or not coverage_ok,
                        msg="harness did NOT catch an injected fault (false green)")

    def test_C1_code_drift(self):
        def m(qs):
            q = next(q for q in qs if q["category"] == "C1")
            q["code"] = q["code"] + "\nprint('EXTRA')"
        self.assertCaught(m)

    def test_C4_answer_corrupted(self):
        def m(qs):
            q = next(q for q in qs if q["category"] == "C4")
            q["options"][q["correct_index"]] = "__wrong__"
        self.assertCaught(m)

    def test_C3_answer_corrupted(self):
        def m(qs):
            q = next(q for q in qs if q["category"] == "C3")
            q["options"][q["correct_index"]] = "99999"
        self.assertCaught(m)

    def test_C5_answer_corrupted(self):
        def m(qs):
            q = next(q for q in qs if q["category"] == "C5")
            q["options"][q["correct_index"]] = "__wrong__"
        self.assertCaught(m)

    def test_C6_distractor_marked_correct(self):
        # the gap this category's upgrade closed: correct_index -> a distractor.
        # Use a line-replacement question (175) whose option text is cross-checked.
        def m(qs):
            by_id(qs, 175)["correct_index"] = 2
        self.assertCaught(m)

    def test_C6_premise_broken(self):
        # buggy code no longer raises -> premise fails.
        def m(qs):
            q = by_id(qs, 177)
            q["code"] = q["code"].replace("txt[ch]", "ch")
        self.assertCaught(m)

    def test_C7_effect_drift(self):
        # change the snippet so the modification's effect differs from expected.
        def m(qs):
            q = by_id(qs, 123)
            q["code"] = q["code"].replace("a = [", "a = [0, ")
        self.assertCaught(m)

    def test_C2_premise_broken(self):
        # 149's true statement relies on len(a)==5; change the data so it isn't.
        def m(qs):
            q = by_id(qs, 149)
            q["code"] = q["code"].replace("a = [", "a = [99, ")
        self.assertCaught(m)


class Robustness(unittest.TestCase):
    """Malformed input must produce a failing *record*, never crash the run,
    and never silently vanish."""

    def assertErrorRecord(self, mutate, qid):
        results, _, _ = run_mutated(mutate)
        row = next((r for r in results if r[0] == qid), None)
        self.assertIsNotNone(row, msg=f"question {qid} produced no record")
        self.assertFalse(row[3], msg=f"question {qid} should have failed")

    def test_unknown_category_is_error_not_skip(self):
        def m(qs):
            by_id(qs, 5)["category"] = "c1"   # lowercase typo
        # must still produce a record for id 5 (not silently dropped) and fail
        self.assertErrorRecord(m, 5)
        # and the total record count is unchanged (nothing vanished)
        results, _, _ = run_mutated(m)
        self.assertEqual(len(results), len(REAL))

    def test_new_assisted_id_does_not_crash(self):
        def m(qs):
            clone = copy.deepcopy(by_id(qs, 176))
            clone["id"] = 999            # C6 id with no expectation entry
            qs.append(clone)
        # should not raise; id 999 becomes a failing error record
        self.assertErrorRecord(m, 999)

    def test_malformed_C3_prompt_does_not_crash(self):
        def m(qs):
            q = next(q for q in qs if q["category"] == "C3")
            q["prompt"] = "no line reference here"
        q = next(q for q in REAL if q["category"] == "C3")
        self.assertErrorRecord(m, q["id"])

    def test_missing_options_is_guarded(self):
        def m(qs):
            by_id(qs, 5).pop("options")
        self.assertErrorRecord(m, 5)


class VarAfterIterationContract(unittest.TestCase):
    """The C5 loop helper: correctness on supported shapes, loud failure on
    unsupported ones."""
    f = staticmethod(verify.var_after_iteration)

    def test_single_for(self):
        self.assertEqual(self.f("acc=0\nfor x in [10,20,30]:\n    acc=acc+x\n", "acc", 2), 30)

    def test_while_loop(self):
        self.assertEqual(self.f("i=0\nacc=0\nwhile i<3:\n    acc=acc+i\n    i=i+1\n", "acc", 2), 1)

    def test_nested_single_top(self):
        self.assertEqual(self.f("t=0\nfor i in range(3):\n    for j in range(2):\n        t=t+1\n", "t", 1), 2)

    def test_list_value_is_deepcopied(self):
        self.assertEqual(self.f("out=[]\nfor i in range(4):\n    out.append(i)\n", "out", 2), [0, 1])

    def test_break_at_iteration_N(self):
        code = "acc=0\ncnt=0\nfor x in [1,2,3,4]:\n    acc=acc+x\n    cnt=cnt+1\n    if cnt==2: break\n"
        self.assertEqual(self.f(code, "acc", 2), 3)

    def test_two_sibling_loops_rejected(self):
        with self.assertRaises(ValueError):
            self.f("a=0\nfor x in [1,2]:\n    a=a+x\nfor y in [3,4]:\n    a=a+y\n", "a", 1)

    def test_loop_in_function_rejected(self):
        with self.assertRaises(ValueError):
            self.f("def r():\n    a=0\n    for x in [1,2]:\n        a=a+x\n", "a", 1)

    def test_single_line_body_rejected(self):
        with self.assertRaises(ValueError):
            self.f("acc=0\nfor x in [1,2]: acc=acc+x\n", "acc", 1)

    def test_iteration_beyond_loop_rejected(self):
        with self.assertRaises(ValueError):
            self.f("acc=0\nfor x in [1,2]:\n    acc=acc+x\n", "acc", 5)


if __name__ == "__main__":
    unittest.main(verbosity=2)
