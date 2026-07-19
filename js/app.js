/* ===========================================================================
   תרגול מעקב קוד · Python — application logic (vanilla JS)
   Modes: practice / exam / review-wrong (+ optional spaced repetition).
   All answers verified by execution (see data/verification.md).
   =========================================================================== */
'use strict';

/* ----------------------------- constants ------------------------------ */
const HE_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה'];
const STORE_KEY = 'pytrace.v1';
const CATEGORIES = {
  C1: 'פלט · מה יודפס',
  C2: 'טענה נכונה',
  C3: 'כמה פעמים רצה',
  C4: 'ערך בסיום הריצה',
  C5: 'ערך בתום איטרציה',
  C6: 'תיקון שגיאה',
  C7: 'השפעת שינוי שורה',
};
const DIFFICULTIES = ['קל', 'בינוני', 'קשה'];
const MODE_HINTS = {
  practice: 'משוב מיידי אחרי כל שאלה.',
  exam: 'ללא משוב עד הסוף; אפשר להגדיר טיימר ומספר שאלות.',
  review: 'מתרגל מחדש רק שאלות שטעית בהן בעבר.',
};

/* ------------------------------ DOM refs ------------------------------ */
const $ = (sel) => document.querySelector(sel);
const el = {
  setup: $('#setup-screen'),
  quiz: $('#quiz-screen'),
  summary: $('#summary-screen'),
  filterCategory: $('#filter-category'),
  filterDifficulty: $('#filter-difficulty'),
  modeHint: $('#mode-hint'),
  examOptions: $('#exam-options'),
  examTimerToggle: $('#exam-timer-toggle'),
  examMinutes: $('#exam-minutes'),
  examCount: $('#exam-count'),
  srsToggle: $('#srs-toggle'),
  setupSummary: $('#setup-summary'),
  startBtn: $('#start-btn'),
  // quiz
  progressLabel: $('#quiz-progress-label'),
  badgeCategory: $('#badge-category'),
  badgeDifficulty: $('#badge-difficulty'),
  statScore: $('#stat-score'),
  timer: $('#timer'),
  progressFill: $('#progress-fill'),
  progressBar: $('.progress'),
  codeBlock: $('#code-block'),
  questionPrompt: $('#question-prompt'),
  options: $('#options'),
  feedback: $('#feedback'),
  feedbackHeadline: $('#feedback-headline'),
  feedbackExplanation: $('#feedback-explanation'),
  reshuffleBtn: $('#reshuffle-btn'),
  restartBtn: $('#restart-btn'),
  prevBtn: $('#prev-btn'),
  nextBtn: $('#next-btn'),
  finishBtn: $('#finish-btn'),
  // summary
  summaryScoreNum: $('#summary-score-num'),
  summaryScoreText: $('#summary-score-text'),
  summaryBest: $('#summary-best'),
  summaryByCategory: $('#summary-by-category'),
  reviewWrongBtn: $('#review-wrong-btn'),
  summaryRestartBtn: $('#summary-restart-btn'),
  // misc
  themeToggle: $('#theme-toggle'),
};

/* ------------------------------ state -------------------------------- */
let ALL_QUESTIONS = [];
let persisted = loadPersisted();
const filters = { categories: new Set(), difficulties: new Set() };

/** active run */
let run = null; // {mode, items:[{q, order:[idx...], correctPos, chosen}], index, finished}
let timerId = null;
let timerRemaining = 0;

/* ============================ persistence ============================= */
function loadPersisted() {
  const base = { best: null, mastery: {}, wrongIds: [], theme: null };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return base;
    return Object.assign(base, JSON.parse(raw));
  } catch (e) {
    return base;
  }
}
function savePersisted() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(persisted)); }
  catch (e) { /* storage unavailable — ignore */ }
}

/* ============================ data loading =========================== */
async function loadQuestions() {
  try {
    const res = await fetch('./data/questions.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('http ' + res.status);
    const data = await res.json();
    if (data && Array.isArray(data.questions)) return data.questions;
    throw new Error('bad shape');
  } catch (e) {
    // file:// or offline → use inlined fallback
    const fb = window.__QUESTIONS_FALLBACK__;
    if (fb && Array.isArray(fb.questions)) return fb.questions;
    throw e;
  }
}

/* ============================== helpers ============================== */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function show(node) { node.hidden = false; }
function hide(node) { node.hidden = true; }

/* ===================== setup screen rendering ====================== */
function buildFilterChips() {
  el.filterCategory.innerHTML = '';
  Object.entries(CATEGORIES).forEach(([code, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = `${code} · ${label}`;
    b.setAttribute('aria-pressed', 'false');
    b.dataset.cat = code;
    b.addEventListener('click', () => {
      toggleSet(filters.categories, code);
      b.setAttribute('aria-pressed', String(filters.categories.has(code)));
      updateSetupSummary();
    });
    el.filterCategory.appendChild(b);
  });

  el.filterDifficulty.innerHTML = '';
  DIFFICULTIES.forEach((d) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = d;
    b.setAttribute('aria-pressed', 'false');
    b.dataset.diff = d;
    b.addEventListener('click', () => {
      toggleSet(filters.difficulties, d);
      b.setAttribute('aria-pressed', String(filters.difficulties.has(d)));
      updateSetupSummary();
    });
    el.filterDifficulty.appendChild(b);
  });
}
function toggleSet(set, val) { set.has(val) ? set.delete(val) : set.add(val); }

function currentMode() {
  return (document.querySelector('input[name="mode"]:checked') || {}).value || 'practice';
}

function selectedQuestions() {
  let qs = ALL_QUESTIONS.slice();
  const mode = currentMode();
  if (mode === 'review') {
    const wrong = new Set(persisted.wrongIds);
    qs = qs.filter((q) => wrong.has(q.id));
  }
  if (filters.categories.size) qs = qs.filter((q) => filters.categories.has(q.category));
  if (filters.difficulties.size) qs = qs.filter((q) => filters.difficulties.has(q.difficulty));
  return qs;
}

function updateSetupSummary() {
  const mode = currentMode();
  el.modeHint.textContent = MODE_HINTS[mode];
  el.examOptions.hidden = mode !== 'exam';
  const n = selectedQuestions().length;
  let txt = `${n} שאלות נבחרו`;
  if (mode === 'review' && n === 0) txt = 'אין עדיין שאלות שטעית בהן — תרגלו במצב רגיל תחילה.';
  if (mode === 'exam') {
    const cap = Math.min(parseInt(el.examCount.value, 10) || n, n);
    txt = `${cap} שאלות במבחן (מתוך ${n} זמינות)`;
  }
  el.setupSummary.textContent = txt;
  el.startBtn.disabled = n === 0;
  // keep exam count within range
  el.examCount.max = String(Math.max(1, n));
}

/* ========================= run construction ========================= */
function orderQuestions(qs, useSrs) {
  if (useSrs) {
    const wrong = new Set(persisted.wrongIds);
    // weighted: failed questions weighted heavier → appear earlier
    return qs
      .map((q) => ({ q, key: Math.random() * (wrong.has(q.id) ? 0.35 : 1) }))
      .sort((a, b) => a.key - b.key)
      .map((x) => x.q);
  }
  return shuffle(qs);
}

function startRun() {
  const mode = currentMode();
  let qs = selectedQuestions();
  if (!qs.length) return;

  qs = orderQuestions(qs, el.srsToggle.checked);

  if (mode === 'exam') {
    const cap = Math.min(parseInt(el.examCount.value, 10) || qs.length, qs.length);
    qs = qs.slice(0, cap);
  }

  run = {
    mode,
    items: qs.map((q) => {
      const order = shuffle(q.options.map((_, i) => i)); // shuffled display order of option indices
      return {
        q,
        order,
        correctPos: order.indexOf(q.correct_index), // displayed position of the correct option
        chosen: null, // displayed position the user clicked
      };
    }),
    index: 0,
    finished: false,
  };

  // timer
  stopTimer();
  if (mode === 'exam' && el.examTimerToggle.checked) {
    timerRemaining = (parseInt(el.examMinutes.value, 10) || 15) * 60;
    startTimer();
    show(el.timer);
  } else {
    hide(el.timer);
  }

  hide(el.setup); hide(el.summary); show(el.quiz);
  renderQuestion();
  el.quiz.scrollIntoView({ block: 'start' });
}

/* ============================== timer =============================== */
function startTimer() {
  updateTimerDisplay();
  timerId = setInterval(() => {
    timerRemaining--;
    updateTimerDisplay();
    if (timerRemaining <= 0) { stopTimer(); finishRun(); }
  }, 1000);
}
function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
function updateTimerDisplay() {
  const m = Math.floor(timerRemaining / 60);
  const s = timerRemaining % 60;
  el.timer.textContent = `⏱ ${m}:${String(s).padStart(2, '0')}`;
  el.timer.classList.toggle('is-low', timerRemaining <= 30);
}

/* ========================= question rendering ====================== */
function renderCode(code) {
  const lines = code.split('\n');
  const lang = (window.Prism && Prism.languages.python) ? Prism.languages.python : null;
  el.codeBlock.innerHTML = lines.map((line, i) => {
    const html = lang ? Prism.highlight(line, lang, 'python') : escapeHtml(line);
    return `<span class="code-line" data-ln="${i + 1}">${html || '&nbsp;'}</span>`;
  }).join('');
}

function renderQuestion() {
  const item = run.items[run.index];
  const q = item.q;
  const total = run.items.length;

  // scorebar
  el.progressLabel.textContent = `שאלה ${run.index + 1} מתוך ${total}`;
  el.badgeCategory.textContent = `${q.category} · ${CATEGORIES[q.category]}`;
  el.badgeDifficulty.textContent = q.difficulty;
  const answered = run.items.filter((it) => it.chosen !== null).length;
  const correct = run.items.filter((it) => it.chosen === it.correctPos).length;
  el.statScore.textContent = run.mode === 'exam'
    ? `נענו ${answered}/${total}`
    : `${correct} נכון · ${answered} נענו · ${total} סה"כ`;
  const pct = Math.round((run.index) / total * 100);
  el.progressFill.style.width = pct + '%';
  el.progressBar.setAttribute('aria-valuenow', String(pct));

  // code + prompt
  renderCode(q.code);
  el.questionPrompt.textContent = q.prompt;

  // options
  el.options.innerHTML = '';
  item.order.forEach((optIdx, pos) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.dataset.pos = String(pos);
    btn.innerHTML =
      `<span class="option__key" aria-hidden="true">${HE_LETTERS[pos]}</span>` +
      `<span class="option__text">${escapeHtml(q.options[optIdx])}</span>`;
    btn.addEventListener('click', () => choose(pos));
    el.options.appendChild(btn);
  });

  // feedback / locked state
  const isAnswered = item.chosen !== null;
  if (isAnswered && run.mode === 'exam') {
    // exam: lock + show the picked option, but do NOT reveal correctness
    [...el.options.children].forEach((b, i) => {
      b.disabled = true;
      b.setAttribute('aria-checked', String(i === item.chosen));
      if (i === item.chosen) b.classList.add('option--picked');
    });
    hide(el.feedback);
  } else if (isAnswered) {
    applyAnswered(item, true);
  } else {
    hide(el.feedback);
  }

  // controls
  el.prevBtn.disabled = run.index === 0;
  const last = run.index === total - 1;
  if (run.mode === 'exam') {
    el.nextBtn.hidden = last;
    el.finishBtn.hidden = !last;
  } else {
    el.nextBtn.hidden = false;
    el.finishBtn.hidden = true;
    el.nextBtn.textContent = last ? 'סיום ◂' : 'הבא ◂';
  }

  saveSessionSnapshot();
}

function choose(pos) {
  const item = run.items[run.index];
  if (item.chosen !== null) return; // locked

  item.chosen = pos;
  recordMastery(item);

  if (run.mode === 'exam') {
    // re-render locks the question and marks the picked option (no reveal)
    renderQuestion();
  } else {
    applyAnswered(item, false);
    renderScoreOnly();
  }
  saveSessionSnapshot();
}

function applyAnswered(item, silent) {
  const buttons = [...el.options.children];
  buttons.forEach((b, i) => {
    b.disabled = true;
    b.setAttribute('aria-checked', String(i === item.chosen));
    if (i === item.correctPos) {
      b.classList.add('is-correct');
      b.insertAdjacentHTML('beforeend', '<span class="option__mark" aria-hidden="true">✓</span>');
    }
    if (i === item.chosen && item.chosen !== item.correctPos) {
      b.classList.add('is-wrong');
      b.insertAdjacentHTML('beforeend', '<span class="option__mark" aria-hidden="true">✗</span>');
    }
  });

  const correct = item.chosen === item.correctPos;
  el.feedback.className = 'feedback ' + (correct ? 'is-correct' : 'is-wrong');
  el.feedbackHeadline.textContent = correct ? '✓ תשובה נכונה' : `✗ לא מדויק — התשובה הנכונה היא ${HE_LETTERS[item.correctPos]}`;
  el.feedbackExplanation.textContent = item.q.explanation || '';
  show(el.feedback);
  if (!silent) el.feedback.focus?.();
}

function renderScoreOnly() {
  const total = run.items.length;
  const answered = run.items.filter((it) => it.chosen !== null).length;
  const correct = run.items.filter((it) => it.chosen === it.correctPos).length;
  el.statScore.textContent = `${correct} נכון · ${answered} נענו · ${total} סה"כ`;
}

/* ============================ mastery ============================== */
function recordMastery(item) {
  const cat = item.q.category;
  if (!persisted.mastery[cat]) persisted.mastery[cat] = { correct: 0, answered: 0 };
  persisted.mastery[cat].answered++;
  const correct = item.chosen === item.correctPos;
  if (correct) persisted.mastery[cat].correct++;

  const wrong = new Set(persisted.wrongIds);
  if (correct) wrong.delete(item.q.id);
  else wrong.add(item.q.id);
  persisted.wrongIds = [...wrong];
  savePersisted();
}

/* ============================ navigation ========================== */
function next() {
  if (run.index < run.items.length - 1) { run.index++; renderQuestion(); el.quiz.scrollIntoView({ block: 'start' }); }
  else finishRun();
}
function prev() {
  if (run.index > 0) { run.index--; renderQuestion(); el.quiz.scrollIntoView({ block: 'start' }); }
}

/* ============================== finish ============================ */
function finishRun() {
  stopTimer();
  run.finished = true;
  const total = run.items.length;
  const correct = run.items.filter((it) => it.chosen === it.correctPos).length;
  const pct = total ? Math.round(correct / total * 100) : 0;

  el.summaryScoreNum.textContent = `${pct}%`;
  el.summaryScoreText.textContent = `${correct} מתוך ${total} תשובות נכונות`;

  // best score
  if (!persisted.best || pct > persisted.best.pct) {
    persisted.best = { pct, correct, total };
    el.summaryBest.textContent = `🏆 שיא חדש!`;
  } else {
    el.summaryBest.textContent = `השיא שלך: ${persisted.best.pct}%`;
  }
  savePersisted();

  // per-category breakdown (this run)
  const byCat = {};
  run.items.forEach((it) => {
    const c = it.q.category;
    if (!byCat[c]) byCat[c] = { correct: 0, total: 0 };
    byCat[c].total++;
    if (it.chosen === it.correctPos) byCat[c].correct++;
  });
  el.summaryByCategory.innerHTML = '';
  Object.entries(byCat).forEach(([code, s]) => {
    const ratio = s.total ? Math.round(s.correct / s.total * 100) : 0;
    const row = document.createElement('div');
    row.className = 'cat-row';
    row.innerHTML =
      `<span class="cat-row__label">${code} · ${CATEGORIES[code]}</span>` +
      `<span class="cat-row__num">${s.correct}/${s.total}</span>` +
      `<span class="cat-row__bar"><span class="cat-row__fill" style="width:${ratio}%"></span></span>`;
    el.summaryByCategory.appendChild(row);
  });

  const anyWrong = run.items.some((it) => it.chosen !== it.correctPos);
  el.reviewWrongBtn.hidden = !anyWrong;

  clearSessionSnapshot();
  hide(el.quiz); show(el.summary);
  el.summary.scrollIntoView({ block: 'start' });
}

/* ====================== session snapshot (resume) ================= */
function saveSessionSnapshot() {
  try {
    if (!run || run.finished) return;
    const snap = {
      mode: run.mode,
      index: run.index,
      items: run.items.map((it) => ({ id: it.q.id, order: it.order, chosen: it.chosen })),
    };
    sessionStorage.setItem(STORE_KEY + '.session', JSON.stringify(snap));
  } catch (e) { /* ignore */ }
}
function clearSessionSnapshot() {
  try { sessionStorage.removeItem(STORE_KEY + '.session'); } catch (e) { /* ignore */ }
}
function restoreSessionSnapshot() {
  try {
    const raw = sessionStorage.getItem(STORE_KEY + '.session');
    if (!raw) return false;
    const snap = JSON.parse(raw);
    const byId = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
    const items = snap.items.map((s) => {
      const q = byId.get(s.id);
      if (!q) return null;
      return { q, order: s.order, correctPos: s.order.indexOf(q.correct_index), chosen: s.chosen };
    }).filter(Boolean);
    if (!items.length) return false;
    // only resume a session that has real progress (at least one answer)
    if (!items.some((it) => it.chosen !== null)) { clearSessionSnapshot(); return false; }
    run = { mode: snap.mode, items, index: Math.min(snap.index, items.length - 1), finished: false };
    hide(el.setup); hide(el.summary); show(el.quiz);
    hide(el.timer); // timers are not resumed
    renderQuestion();
    return true;
  } catch (e) { return false; }
}

/* ============================== keyboard ========================== */
function onKeydown(e) {
  if (el.quiz.hidden) return;
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea') return;

  if (e.key >= '1' && e.key <= '5') {
    const pos = parseInt(e.key, 10) - 1;
    const item = run.items[run.index];
    if (item.chosen === null && pos < item.order.length) { e.preventDefault(); choose(pos); }
    return;
  }
  // RTL navigation: visually, "next" is to the left
  if (e.key === 'ArrowLeft') { e.preventDefault(); next(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); prev(); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    if (run.mode === 'exam' && run.index === run.items.length - 1) finishRun();
    else next();
  }
  // 'R' reshuffles (matches the button tooltip). Require no modifiers so we
  // never hijack Ctrl+R / Cmd+R (browser reload).
  else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    reshuffle();
  }
}

/* ============================== theme ============================= */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  el.themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  el.themeToggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
  persisted.theme = theme;
  savePersisted();
}
function initTheme() {
  const pref = persisted.theme ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(pref);
}

/* ========================= reset / restart ======================= */
function backToSetup() {
  stopTimer();
  clearSessionSnapshot();
  run = null;
  hide(el.quiz); hide(el.summary); show(el.setup);
  updateSetupSummary();
  el.setup.scrollIntoView({ block: 'start' });
}
function reshuffle() {
  if (!run) return;
  // keep same question pool, fresh order + fresh option shuffles, reset answers
  const qs = shuffle(run.items.map((it) => it.q));
  run.items = qs.map((q) => {
    const order = shuffle(q.options.map((_, i) => i));
    return { q, order, correctPos: order.indexOf(q.correct_index), chosen: null };
  });
  run.index = 0;
  run.finished = false;
  renderQuestion();
}

/* ============================== wire-up ========================== */
function wireEvents() {
  document.querySelectorAll('input[name="mode"]').forEach((r) =>
    r.addEventListener('change', updateSetupSummary));
  el.examCount.addEventListener('input', updateSetupSummary);
  el.startBtn.addEventListener('click', startRun);

  el.nextBtn.addEventListener('click', next);
  el.prevBtn.addEventListener('click', prev);
  el.finishBtn.addEventListener('click', finishRun);
  el.reshuffleBtn.addEventListener('click', reshuffle);
  el.restartBtn.addEventListener('click', backToSetup);

  el.summaryRestartBtn.addEventListener('click', backToSetup);
  el.reviewWrongBtn.addEventListener('click', () => {
    // jump straight into a review-wrong run
    document.querySelector('input[name="mode"][value="review"]').checked = true;
    filters.categories.clear(); filters.difficulties.clear();
    document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    backToSetup();
    if (selectedQuestions().length) startRun();
  });

  el.themeToggle.addEventListener('click', () =>
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

  document.addEventListener('keydown', onKeydown);
}

/* ============================== boot ============================= */
async function boot() {
  initTheme();
  buildFilterChips();
  wireEvents();
  try {
    ALL_QUESTIONS = await loadQuestions();
  } catch (e) {
    el.setupSummary.textContent = 'שגיאה בטעינת השאלות. נסו לרענן את הדף.';
    el.startBtn.disabled = true;
    return;
  }
  updateSetupSummary();
  // resume an in-progress session (same tab) if present
  restoreSessionSnapshot();
}

document.addEventListener('DOMContentLoaded', boot);
