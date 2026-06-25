# Verification report — answer correctness by execution

**Date:** 2026-06-25
**Method:** every one of the 45 snippets was executed with CPython 3.13 and the
real result (printed output / variable value / iteration count / exception)
was compared against the marked correct option (`options[0]`).
The harness is `verify.py` (re-runnable: `python3 verify.py`).

## Result: ✅ 45 / 45 confirmed correct — 0 mismatches

No marked answer had to be changed. No question was found ambiguous or wrong.

The `code` fields stored in `questions.json` were *also* re-executed directly
from the JSON for categories C1/C4 (output questions) to rule out transcription
drift — 0 mismatches.

## How each category was verified

| Cat | What was executed | Check |
|-----|-------------------|-------|
| C1 (output) | run snippet, capture `stdout` | equals `options[0]` |
| C2 (true statement) | run snippet, evaluate the factual claim in `options[0]` (alias length, sort immutability, `find` returning `-1`, `sum` on strings → `TypeError`, …) | claim holds |
| C3 (iteration count) | instrument the referenced line with a counter, run | counter equals `options[0]` |
| C4 (final value) | run snippet, capture printed value | equals `options[0]` |
| C5 (value after iteration N) | re-run the loop, return the variable at the end of iteration N | equals `options[0]` |
| C6 (fix the error) | run **original** → confirm it raises the stated exception; apply the fix in `options[0]` → confirm it runs and produces the intended result | both hold |
| C7 (effect of change) | run **original** and **modified** code, compare outputs | matches the effect described in `options[0]` |

## Per-question ground truth (summary)

| id | cat | verified result | marked option (א) |
|----|-----|-----------------|-------------------|
| 5 | C1 | `119 3` | 119 3 ✓ |
| 2 | C1 | `MeLoNbAnAnA` | MeLoNbAnAnA ✓ |
| 149 | C2 | `len(a)==5` (b is alias of a) | len(a)=5 ✓ |
| 151 | C2 | loop body runs 5× (2,5,8,11,14) | 5 פעמים ✓ |
| 95 | C3 | line 7 runs 2× (evens 14,12 before break@19) | 2 ✓ |
| 96 | C3 | line 7 runs 2× (evens >18: 22,20) | 2 ✓ |
| 12 | C4 | `t==9` (anti-diagonal 5+1+3) | 9 ✓ |
| 1 | C4 | `out==22` | 22 ✓ |
| 7 | C4 | `acc==78` (skip multiples of 3) | 78 ✓ |
| 74 | C5 | `acc==-2` after iter 2 | -2 ✓ |
| 71 | C5 | `total==-9` after iter 3 | -9 ✓ |
| 176 | C6 | original → IndexError; fix `range(len-1)` → d=-2 | option א ✓ |
| 175 | C6 | original → TypeError; fix `int(...)` → sum=215 | option א ✓ |
| 119 | C7 | orig 47 == mod 47 (index-0 term is ×0) | הפלט לא ישתנה ✓ |
| 124 | C7 | orig 1 == mod 1 (only even is 2) | הפלט לא ישתנה ✓ |
| 8 | C1 | `[2, 10, 3, 4, 3]` | ✓ |
| 3 | C1 | `wi*dowora*ge` | ✓ |
| 152 | C2 | `sorted` leaves `vals` unchanged | ✓ |
| 150 | C2 | `sum(parts)` → TypeError (strings) | ✓ |
| 97 | C3 | line 7 runs 3× (uppercase X,V,Q) | 3 ✓ |
| 100 | C3 | line 7 runs 2× (evens >15: 28,22) | 2 ✓ |
| 19 | C4 | `t==29` | 29 ✓ |
| 31 | C4 | `m==12` (6+6) | 12 ✓ |
| 14 | C4 | `out==-5` (even indices only) | -5 ✓ |
| 82 | C5 | `acc==23` after iter 5 | 23 ✓ |
| 72 | C5 | `res=='wdeMAO'` after iter 6 | wdeMAO ✓ |
| 73 | C5 | `out==[0, 5, 10, 7, 10]` after iter 5 | ✓ |
| 177 | C6 | original → TypeError; fix `ch.upper()` → VIOLET | option א ✓ |
| 121 | C7 | mod → IndexError (`range(len+1)`) | IndexError ✓ |
| 122 | C7 | mod → `MRECR` (step 2) | MRECR ✓ |
| 18 | C1 | `6 6` | 6 6 ✓ |
| 155 | C2 | `len(a)==5` (`b=b+[8]` rebinds b only) | 5 ✓ |
| 154 | C2 | `res==3` (`find` returns -1) | 3 ✓ |
| 98 | C3 | line 8 runs 3× (break after total 24) | 3 ✓ |
| 114 | C3 | line 7 runs 3× (evens >12: 14,16,20) | 3 ✓ |
| 17 | C4 | `d==60` (81-21) | 60 ✓ |
| 11 | C4 | `total==44` (check before add) | 44 ✓ |
| 33 | C4 | `out==92` | 92 ✓ |
| 78 | C5 | `acc==44` after iter 4 | 44 ✓ |
| 79 | C5 | `total==-4` after iter 4 | -4 ✓ |
| 180 | C6 | original → ValueError; fix `count`-guard → [7, 6, 4, 2] | option א ✓ |
| 178 | C6 | original → IndexError; fix new-list of odds → [5, 9, 5, 9] | option א ✓ |
| 123 | C7 | mod → len(a)=3 (`a[:]` copy) | 3 במקום 5 ✓ |
| 125 | C7 | orig 4 == mod 4 (13 not present) | הפלט לא ישתנה ✓ |
| 128 | C7 | orig 90 == mod 90 (index-0 term is ×0) | הפלט לא ישתנה ✓ |

## Notes
- C6/C7 questions were executed **twice** (original + fixed/modified) as required,
  to confirm both the failure of the original and the claimed effect of the change.
- Hebrew `explanation` strings in `questions.json` were derived from these traces.
