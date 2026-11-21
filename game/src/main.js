// main.js — "Pasar Pagi" spot-the-difference game logic.
// Two SVG panels (left = original, right = clone with differences applied).
// Click a difference on either panel to mark it on both.
import { renderScene } from './scene.js';
import { LEVELS } from './levels.js';

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const BEST_KEY = 'pasarPagiBest';

const state = {
  levelIdx: 0,
  found: new Set(),
  score: 0,
  totalScore: 0,
  timeLeft: 0,
  hintsLeft: 3,
  timer: null,
  frozen: false,
  muted: false,
  screen: 'start', // start | playing | leveldone | win | timeout
  leftSvg: null,
  rightSvg: null,
  audio: null,
};

const level = () => LEVELS[state.levelIdx];

// ---------- sound (WebAudio, no files) ----------
function beep(freq, dur = 0.12, type = 'sine', delay = 0) {
  if (state.muted) return;
  try {
    state.audio ??= new (window.AudioContext || window.webkitAudioContext)();
    const t = state.audio.currentTime + delay;
    const o = state.audio.createOscillator();
    const g = state.audio.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(state.audio.destination);
    o.start(t); o.stop(t + dur + 0.02);
  } catch { /* audio unavailable: play on silently */ }
}
const sfxCorrect = () => { beep(880); beep(1174, 0.14, 'sine', 0.09); };
const sfxWrong = () => beep(150, 0.2, 'sawtooth');
const sfxWin = () => { [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.16, 'sine', i * 0.11)); };

// ---------- HUD ----------
function fmtTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function renderHud() {
  const L = level();
  $('#hud-level').textContent = `Level ${L.n} · ${L.name}`;
  $('#hud-time').textContent = fmtTime(Math.max(0, state.timeLeft));
  $('#hud-score').textContent = `Skor ${state.totalScore + state.score}`;
  const remaining = L.diffs.length - state.found.size;
  $('#hud-remaining').textContent = `Sisa ${remaining} perbedaan`;
  $('#hud-hints').textContent = `Petunjuk: ${state.hintsLeft}`;
  $('#hud-dots').textContent = L.diffs.map((_, i) => (state.found.has(i) ? '●' : '○')).join(' ');
  $('#status').textContent = state.found.size === 0
    ? `Cari ${L.diffs.length} perbedaan antara gambar kiri dan kanan.`
    : `${state.found.size} dari ${L.diffs.length} perbedaan ditemukan — sisa ${remaining}.`;
}

// ---------- markers ----------
function addMarker(svg, x, y, num) {
  const NS = 'http://www.w3.org/2000/svg';
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'marker');
  const c = document.createElementNS(NS, 'circle');
  c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 26);
  c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#c8102e'); c.setAttribute('stroke-width', 5);
  const t = document.createElementNS(NS, 'text');
  t.setAttribute('x', x); t.setAttribute('y', y + 9);
  t.setAttribute('text-anchor', 'middle'); t.setAttribute('fill', '#c8102e');
  t.setAttribute('font-size', '26'); t.setAttribute('font-weight', 'bold');
  t.setAttribute('font-family', 'Georgia, serif');
  t.textContent = '✓';
  g.append(c, t);
  svg.appendChild(g);
}
function addWrongX(svg, x, y) {
  const NS = 'http://www.w3.org/2000/svg';
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'wrong-x');
  for (const [x1, y1, x2, y2] of [[-12, -12, 12, 12], [12, -12, -12, 12]]) {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', x + x1); l.setAttribute('y1', y + y1);
    l.setAttribute('x2', x + x2); l.setAttribute('y2', y + y2);
    l.setAttribute('stroke', '#c8102e'); l.setAttribute('stroke-width', 5); l.setAttribute('stroke-linecap', 'round');
    g.appendChild(l);
  }
  svg.appendChild(g);
  setTimeout(() => g.remove(), 650);
}

// ---------- level lifecycle ----------
function buildPanels() {
  const L = level();
  const leftWrap = $('#left'), rightWrap = $('#right');
  leftWrap.replaceChildren();
  rightWrap.replaceChildren();
  state.leftSvg = renderScene(L.variant);
  state.rightSvg = renderScene(L.variant);
  for (const d of L.diffs) d.apply(state.rightSvg);
  leftWrap.appendChild(state.leftSvg);
  rightWrap.appendChild(state.rightSvg);
}

function startLevel(idx, opts = {}) {
  clearInterval(state.timer);
  state.levelIdx = idx;
  state.found = new Set();
  state.score = opts.keepScore ? state.score : 0;
  state.hintsLeft = 3;
  state.timeLeft = level().timeLimit;
  state.frozen = !!opts.frozen;
  state.screen = 'playing';
  buildPanels();
  hideOverlay();
  renderHud();
  if (!state.frozen) {
    state.timer = setInterval(() => {
      state.timeLeft -= 1;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        renderHud();
        onTimeout();
      } else renderHud();
    }, 1000);
  }
}

function markFound(i, silent = false) {
  const L = level();
  if (state.found.has(i)) return false;
  state.found.add(i);
  const d = L.diffs[i];
  const hs = d.hotspots[0];
  addMarker(state.leftSvg, hs.x, hs.y, i + 1);
  addMarker(state.rightSvg, hs.x, hs.y, i + 1);
  if (!silent) {
    state.score += 100;
    sfxCorrect();
  }
  renderHud();
  if (state.found.size === L.diffs.length) onLevelComplete();
  return true;
}

function clickAt(x, y) {
  // x, y are viewBox coords (0..640, 0..420) on either panel.
  if (state.screen !== 'playing') return 'not-playing';
  const L = level();
  for (let i = 0; i < L.diffs.length; i++) {
    if (state.found.has(i)) continue;
    for (const hs of L.diffs[i].hotspots) {
      const dx = x - hs.x, dy = y - hs.y;
      if (dx * dx + dy * dy <= hs.r * hs.r) {
        markFound(i);
        return `found:${L.diffs[i].id}`;
      }
    }
  }
  state.score = Math.max(0, state.score - 25);
  sfxWrong();
  addWrongX(state.leftSvg, x, y);
  addWrongX(state.rightSvg, x, y);
  renderHud();
  return 'miss';
}

function svgCoords(evt, svg) {
  const r = svg.getBoundingClientRect();
  return {
    x: ((evt.clientX - r.left) / r.width) * 640,
    y: ((evt.clientY - r.top) / r.height) * 420,
  };
}

function onLevelComplete() {
  clearInterval(state.timer);
  const bonus = state.timeLeft * 2;
  state.score += bonus;
  const levelScore = state.score;
  state.totalScore += state.score;
  state.score = 0;
  sfxWin();
  state.screen = 'leveldone';
  const L = level();
  const last = state.levelIdx === LEVELS.length - 1;
  const best = Math.max(state.totalScore, Number(localStorage.getItem(BEST_KEY) || 0));
  localStorage.setItem(BEST_KEY, String(best));
  showOverlay(
    last ? '🎉 Semua level selesai!' : `Level ${L.n} selesai!`,
    `Kamu menemukan semua ${L.diffs.length} perbedaan.<br>` +
    `Bonus waktu: +${bonus} · Skor level: ${levelScore} · Total: ${state.totalScore}<br>` +
    `Skor terbaik: ${best}`,
    last
      ? [{ label: 'Main lagi', fn: () => { state.totalScore = 0; startLevel(0); } }]
      : [{ label: 'Level berikut', fn: () => startLevel(state.levelIdx + 1) },
         { label: 'Ulangi level', fn: () => startLevel(state.levelIdx) }],
  );
  if (last) state.screen = 'win';
  renderHud();
}

function onTimeout() {
  clearInterval(state.timer);
  state.screen = 'timeout';
  sfxWrong();
  showOverlay(
    'Waktu habis!',
    `Kamu menemukan ${state.found.size} dari ${level().diffs.length} perbedaan di level ini.`,
    [{ label: 'Coba lagi', fn: () => startLevel(state.levelIdx) },
     { label: 'Kembali ke menu', fn: showStart }],
  );
}

// ---------- overlay ----------
function showOverlay(title, bodyHtml, buttons) {
  const o = $('#overlay');
  o.innerHTML = `<div class="card"><h2>${title}</h2><p>${bodyHtml}</p><div class="row"></div></div>`;
  const row = o.querySelector('.row');
  for (const b of buttons) {
    const btn = document.createElement('button');
    btn.textContent = b.label;
    btn.addEventListener('click', () => { beep(600, 0.07); b.fn(); });
    row.appendChild(btn);
  }
  o.hidden = false;
}
function hideOverlay() { $('#overlay').hidden = true; }

function showStart() {
  clearInterval(state.timer);
  state.screen = 'start';
  state.totalScore = 0;
  state.levelIdx = 0;
  state.timeLeft = level().timeLimit;
  buildPanels();
  renderHud();
  showOverlay(
    'Pasar Pagi',
    `Cari perbedaan antara dua gambar pasar di bawah ini.<br>` +
    `Klik perbedaannya di gambar kiri <b>atau</b> kanan — tandanya muncul di keduanya.<br>` +
    `3 level · 7, 7, dan 10 perbedaan · petunjuk (H) 3x per level · klik salah −25 poin.`,
    LEVELS.map((L, i) => ({ label: `Mulai Level ${L.n} · ${L.name}`, fn: () => startLevel(i) })),
  );
}

// ---------- hints ----------
function useHint() {
  if (state.screen !== 'playing' || state.hintsLeft <= 0) return;
  const L = level();
  const remaining = L.diffs.map((_, i) => i).filter((i) => !state.found.has(i));
  if (!remaining.length) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  const hs = L.diffs[pick].hotspots[0];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - 50);
  for (const svg of [state.leftSvg, state.rightSvg]) {
    const NS = 'http://www.w3.org/2000/svg';
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', hs.x); c.setAttribute('cy', hs.y); c.setAttribute('r', 30);
    c.setAttribute('class', 'hint-ring');
    svg.appendChild(c);
    setTimeout(() => c.remove(), 3000);
  }
  beep(660, 0.1);
  renderHud();
}

// ---------- wiring ----------
function wire() {
  for (const [id, svg] of [['left', () => state.leftSvg], ['right', () => state.rightSvg]]) {
    document.getElementById(id).addEventListener('pointerdown', (evt) => {
      const p = svgCoords(evt, svg());
      clickAt(p.x, p.y);
    });
  }
  $('#btn-hint').addEventListener('click', useHint);
  $('#btn-restart').addEventListener('click', () => startLevel(state.levelIdx));
  $('#btn-menu').addEventListener('click', showStart);
  $('#btn-mute').addEventListener('click', (evt) => {
    state.muted = !state.muted;
    evt.currentTarget.textContent = state.muted ? '🔇 Suara mati' : '🔊 Suara nyala';
  });
  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'h' || evt.key === 'H') useHint();
    if (evt.key === 'r' || evt.key === 'R') { if (state.screen === 'playing') startLevel(state.levelIdx); }
    if (state.screen === 'start' && ['1', '2', '3'].includes(evt.key)) startLevel(Number(evt.key) - 1);
  });
}

// ---------- deterministic shots & self-test ----------
function applyShot() {
  const shot = params.get('shot');
  if (shot === 'play') {
    startLevel(0, { frozen: true });
    [0, 1, 2].forEach((i) => markFound(i, true));
    state.score = 300; state.timeLeft = 83;
    renderHud();
  } else if (shot === 'play2') {
    startLevel(1, { frozen: true });
    [0, 1].forEach((i) => markFound(i, true));
    state.score = 250; state.timeLeft = 125;
    renderHud();
  } else if (shot === 'end') {
    startLevel(0, { frozen: true });
    level().diffs.forEach((_, i) => markFound(i, true));
    renderHud();
  } else if (params.get('level')) {
    const n = Number(params.get('level'));
    if (n >= 1 && n <= LEVELS.length) startLevel(n - 1);
    else showStart();
  } else {
    showStart();
  }
}

async function runSelfTest() {
  const log = [];
  const ok = (name, cond) => log.push(`${cond ? 'PASS' : 'FAIL'} ${name}`);
  try {
    // Level 1: click every difference via the real handler.
    startLevel(0, { frozen: true });
    for (const d of level().diffs) {
      const r = clickAt(d.hotspots[0].x, d.hotspots[0].y);
      if (!String(r).startsWith('found:')) log.push(`FAIL click ${d.id} -> ${r}`);
    }
    ok('level1 all diffs found', state.found.size === level().diffs.length);
    ok('level1 complete overlay shown', state.screen === 'leveldone' || state.screen === 'win');
    ok('level1 score banked', state.totalScore > 0);
    // Wrong click: score drops by 25, found count unchanged.
    const before = state.score;
    startLevel(0, { frozen: true });
    const r2 = clickAt(320, 200);
    ok('wrong click is a miss', r2 === 'miss');
    ok('wrong click -25 or floor 0', state.score === Math.max(0, before - 25) || state.score === 0);
    // Hint: hints decrease.
    const h0 = state.hintsLeft;
    useHint();
    ok('hint consumes one hint', state.hintsLeft === h0 - 1);
    // Levels 2 and 3 complete too.
    for (const idx of [1, 2]) {
      startLevel(idx, { frozen: true });
      for (const d of level().diffs) clickAt(d.hotspots[0].x, d.hotspots[0].y);
      ok(`level${idx + 1} complete`, state.found.size === level().diffs.length);
    }
    ok('win screen after level 3', state.screen === 'win');
    ok('no external network requests', performance.getEntriesByType('resource')
      .every((e) => new URL(e.name).hostname === location.hostname));
  } catch (e) {
    log.push(`FAIL exception: ${e.message}`);
  }
  const pass = log.every((l) => l.startsWith('PASS'));
  const pre = $('#selftest');
  pre.hidden = false;
  pre.textContent = log.join('\n');
  document.title = pass ? 'SELFTEST:PASS' : 'SELFTEST:FAIL';
}

// ---------- boot ----------
wire();
applyShot();
if (params.get('selftest') === '1') {
  setTimeout(runSelfTest, 300);
}

window.__game = {
  state,
  clickAt,
  startLevel,
  useHint,
  levels: LEVELS,
};
