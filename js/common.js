// Utilitaires partagés par tous les écrans
export const rnd = (a, b) => Math.random() * (b - a) + a;
export const ri = (a, b) => Math.floor(rnd(a, b + 1));
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const pad = (n, l = 2) => String(n).padStart(l, '0');
export const clock = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmt = (n, d = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
export const ip = () => `${ri(11, 223)}.${ri(0, 255)}.${ri(0, 255)}.${ri(1, 254)}`;
export const hex = n => Array.from({ length: n }, () => ri(0, 255).toString(16).padStart(2, '0')).join(' ').toUpperCase();
export const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
export const safeColor = (c, d) => /^#[0-9a-f]{6}$/i.test(c) ? c : d;

export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// ---- Son (WebAudio, aucun fichier) ----
let soundOn = true, actx = null;
export const setSound = v => { soundOn = v; };
function ac() {
  actx ||= new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
export function beep(freq = 880, dur = .08, vol = .04, type = 'sine') {
  if (!soundOn) return;
  try {
    const a = ac(), t = a.currentTime, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .02);
  } catch { }
}
export function tone(freq = 880, vol = .03, type = 'sine') {
  if (!soundOn) return () => { };
  try {
    const a = ac(), o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g).connect(a.destination); o.start();
    return () => { try { g.gain.setTargetAtTime(0, a.currentTime, .02); o.stop(a.currentTime + .15); } catch { } };
  } catch { return () => { }; }
}

// ---- Cycle de vie : tout ce qui est créé ici est nettoyé au démontage ----
export class Scope {
  constructor() { this.fns = []; }
  raf(fn) {
    let id, last = performance.now(), alive = true;
    const f = t => { if (!alive) return; const dt = Math.min(.1, (t - last) / 1000); last = t; fn(dt, t); id = requestAnimationFrame(f); };
    id = requestAnimationFrame(f);
    this.fns.push(() => { alive = false; cancelAnimationFrame(id); });
  }
  every(ms, fn) { const id = setInterval(fn, ms); this.fns.push(() => clearInterval(id)); return id; }
  after(ms, fn) { const id = setTimeout(fn, ms); this.fns.push(() => clearTimeout(id)); return id; }
  resize(el, fn) { const ro = new ResizeObserver(() => fn()); ro.observe(el); this.fns.push(() => ro.disconnect()); }
  add(fn) { this.fns.push(fn); }
  destroy() { this.fns.forEach(f => f()); this.fns = []; }
}

// Canvas net en HiDPI, re-dimensionnable
export function canvas(c) {
  const ctx = c.getContext('2d'), s = { ctx, c, w: 0, h: 0 };
  s.fit = () => {
    const r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    s.w = r.width; s.h = r.height;
    c.width = Math.max(1, Math.round(r.width * d)); c.height = Math.max(1, Math.round(r.height * d));
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  s.fit();
  // Chaque canvas se recale tout seul quand sa taille change
  new ResizeObserver(() => { const r = c.getBoundingClientRect(); if (Math.abs(r.width - s.w) > .5 || Math.abs(r.height - s.h) > .5) { s.fit(); s.onresize?.(); } }).observe(c);
  return s;
}

// Petit graphe défilant
export function spark(cv, color, n = 120) {
  const s = canvas(cv), data = [];
  const api = {
    s,
    push(v) { data.push(v); if (data.length > n) data.shift(); },
    draw() {
      const { ctx, w, h } = s;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, h * i / 4); ctx.lineTo(w, h * i / 4); ctx.stroke(); }
      if (data.length < 2) return;
      let mn = Math.min(...data), mx = Math.max(...data);
      if (mx - mn < 1e-6) { mx += 1; mn -= 1; }
      const p = (mx - mn) * .12; mn -= p; mx += p;
      const X = i => i / (n - 1) * w, Y = v => h - (v - mn) / (mx - mn) * h;
      ctx.beginPath(); data.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)));
      ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.lineTo(X(data.length - 1), h); ctx.lineTo(0, h); ctx.closePath();
      ctx.globalAlpha = .12; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1;
    }
  };
  s.onresize = () => api.draw();
  return api;
}

// Grand texte en surimpression (ACCESS GRANTED, ABORT, ...)
export function overlay(v, S) {
  const o = v.querySelector('.ov'), d = o.firstElementChild;
  let tid;
  S.add(() => clearTimeout(tid));
  return {
    show(t, cls = '', ms = 0) {
      clearTimeout(tid);
      o.className = 'ov on ' + cls; d.textContent = t;
      d.style.animation = 'none'; void d.offsetWidth; d.style.animation = '';
      if (ms) tid = setTimeout(() => { o.className = 'ov'; }, ms);
    },
    hide() { clearTimeout(tid); o.className = 'ov'; }
  };
}
