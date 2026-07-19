# תרגול מעקב קוד · Python — Interactive Code-Tracing Practice

אתר תרגול אינטראקטיבי (עברית, RTL) לשאלות אמריקאיות במעקב אחר קוד פייתון.
45 שאלות מתוקפות, משוב מיידי עם הסבר, מצב מבחן, חזרה על טעויות ומעקב התקדמות.

A static, no-backend practice site where students drill Python **code-tracing**
multiple-choice questions. UI is Hebrew/RTL; code is shown LTR with real syntax
highlighting and a line-number gutter.

---

## Run it

**Option A — just open the file**
Double-click `index.html` (or open it in a browser). It works offline: if the
browser blocks `fetch()` under `file://`, the app falls back to an inlined copy
of the data in `js/questions-data.js`.

**Option B — local web server** (recommended; serves `data/questions.json` directly)
```bash
cd python-practice
python3 -m http.server 8000
# then open http://localhost:8000
```

No build step, no dependencies to install. Prism.js and Google Fonts load from a
CDN; the app still runs without them (plain text fallback, system fonts).

---

## Features

- **7 question categories** — output, true-statement, iteration-count, final value,
  value-after-iteration-N, fix-the-error, effect-of-line-change.
- **Real syntax highlighting** (Prism.js, Python grammar) + 1-based line-number
  gutter that matches "שורה N" references in the prompts.
- **Shuffled options** every render — the correct answer is tracked by position,
  so "always pick א" never works.
- **Immediate feedback** (practice): locks the question, marks correct/chosen,
  and shows a one-line Hebrew **explanation** derived from the executed trace.
- **Three modes**
  - תרגול (practice) — feedback after each question.
  - מבחן (exam) — optional timer + question count, **no feedback until the end**,
    then score + per-category review.
  - חזרה על טעויות (review-wrong) — re-drills only questions you missed.
  - **Spaced repetition** (optional) — weights missed questions to appear earlier.
- **Scoring & progress** — live correct/answered/total, progress bar, end-of-set
  summary with a per-category breakdown.
- **Filters** by category and difficulty (קל / בינוני / קשה).
- **Keyboard** — `1`–`5` select, `←`/`→` navigate (RTL-aware), `Enter` next.
- **Persistence** (`localStorage`, wrapped in try/catch) — best score, per-topic
  mastery, and the list of missed questions, across sessions. In-tab session
  resume via `sessionStorage`.
- **Accessibility** — radiogroup roles, `aria-live` feedback, visible focus rings,
  skip link, `prefers-reduced-motion`, ≥4.5:1 contrast in light **and** dark.
- **Dark / light theme** toggle (follows OS preference by default).
- **Responsive** down to ~360px; the code panel scrolls horizontally, never wraps.

---

## Project structure

```
python-practice/
  index.html              UI structure (RTL)
  css/styles.css          theme tokens, layout, light/dark
  js/app.js               all app logic (vanilla JS, no framework)
  js/questions-data.js    offline fallback — mirror of questions.json (generated)
  data/questions.json     the 45 questions (the data contract)
  data/verification.md    correctness report (all answers verified by execution)
  data/verify.py          re-runnable verification harness
  README.md               this file
```

### Data schema (`data/questions.json`)
```jsonc
{
  "id": 5,
  "category": "C1",            // C1..C7
  "difficulty": "קל",          // קל | בינוני | קשה
  "code": "…python source…",
  "prompt": "מה יודפס למסך?",
  "options": ["…", "…", …],    // options[0] is the correct answer
  "correct_index": 0,
  "explanation": "…Hebrew, 1–3 lines…"
}
```
`options[0]` is the correct answer by convention; the UI shuffles display order
and tracks the correct position. If you add questions, keep this contract.

---

## Correctness

Every answer was **verified by executing the code**, not trusted from the data.
See [`data/verification.md`](data/verification.md) — **45/45 confirmed, 0 mismatches**.
To re-verify:
```bash
cd python-practice/data
python3 verify.py        # prints a per-question OK/XX table
```
For "fix the error" (C6) and "effect of change" (C7) questions, both the original
and the modified/fixed code are executed to confirm the claimed effect.

---

## Design

"Calm code-editor" identity: page `#EEF1F6`, white cards, indigo primary
`#4338CA`, semantic green/red for feedback, and a dark code panel
(`#1E1E2E` / `#CDD6F4`) with a filename tab (`trace.py`), traffic-light dots and a
numbered gutter. Heebo for Hebrew UI, JetBrains Mono for code.
