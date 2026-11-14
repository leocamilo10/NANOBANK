import { TEMPLATES } from './templates/index.js';
import { setSound, esc } from './common.js';

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.hash.slice(1));
const embed = params.get('embed') === '1';
const play = params.get('p') === '1';
let tpl = TEMPLATES.find(t => t.id === params.get('t')) || TEMPLATES[0];
let cfg = {}, inst = null, timer;

if (embed) document.body.classList.add('embed', 'nopanel');
if (play) document.body.classList.add('nopanel');
setSound(!embed && params.get('snd') !== '0');
$('#snd').checked = params.get('snd') !== '0';

function readCfg() {
  cfg = {};
  for (const f of tpl.schema) {
    const v = params.get(f.key);
    cfg[f.key] = v == null ? f.default : f.type === 'checkbox' ? v === '1' : (f.type === 'number' || f.type === 'range') ? (Number(v) || f.default) : v;
  }
}
function writeHash() {
  const p = new URLSearchParams({ t: tpl.id });
  for (const f of tpl.schema) if (cfg[f.key] !== f.default) p.set(f.key, f.type === 'checkbox' ? (cfg[f.key] ? '1' : '0') : cfg[f.key]);
  if (!$('#snd').checked) p.set('snd', '0');
  history.replaceState(null, '', '#' + p.toString());
  return p;
}
function mount() {
  inst?.destroy?.();
  const st = $('#stage'); st.innerHTML = '';
  inst = tpl.mount(st, cfg);
  document.title = `${tpl.name} — PropDash`;
}
function buildPanel() {
  $('#tpl').innerHTML = TEMPLATES.map(t => `<option value="${t.id}" ${t === tpl ? 'selected' : ''}>${t.emoji} ${esc(t.name)}</option>`).join('');
  $('#form').innerHTML = tpl.schema.map(f => {
    const val = cfg[f.key];
    if (f.type === 'checkbox') return `<label class="chk"><input type="checkbox" name="${f.key}" ${val ? 'checked' : ''}> ${esc(f.label)}</label>`;
    if (f.type === 'select') return `<label class="fld">${esc(f.label)}<select name="${f.key}">${f.options.map(([v, l]) => `<option value="${esc(v)}" ${v === val ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
    if (f.type === 'textarea') return `<label class="fld">${esc(f.label)}<textarea name="${f.key}" rows="7">${esc(val)}</textarea></label>`;
    const extra = ['min', 'max', 'step'].filter(k => f[k] != null).map(k => `${k}="${f[k]}"`).join(' ');
    return `<label class="fld">${esc(f.label)}${f.type === 'range' ? ` <output>${esc(val)}</output>` : ''}<input type="${f.type}" name="${f.key}" value="${esc(val)}" ${extra}></label>`;
  }).join('');
  $('#keys').innerHTML = tpl.keys.map(([k, d]) => `<dt>${esc(k)}</dt><dd>${esc(d)}</dd>`).join('') + '<dt>Maj+H</dt><dd>afficher / masquer ce panneau</dd><dt>Maj+F</dt><dd>plein écran</dd>';
}

$('#tpl').onchange = e => {
  tpl = TEMPLATES.find(t => t.id === e.target.value);
  for (const k of [...params.keys()]) if (!['snd'].includes(k)) params.delete(k);
  readCfg(); writeHash(); buildPanel(); mount(); syncPhoneBtn();
};
$('#form').oninput = e => {
  const f = tpl.schema.find(f => f.key === e.target.name); if (!f) return;
  const el = e.target;
  cfg[f.key] = f.type === 'checkbox' ? el.checked : (f.type === 'number' || f.type === 'range') ? (Number(el.value) || 0) : el.value;
  if (f.type === 'range') el.previousElementSibling.textContent = el.value;
  writeHash();
  clearTimeout(timer); timer = setTimeout(mount, 250);
};
$('#snd').onchange = e => { setSound(e.target.checked); writeHash(); };

const toggleFs = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => { });
const togglePanel = () => { const show = document.body.classList.toggle('nopanel') === false; if (show) document.body.classList.remove('phone-mode'); };
$('#trig').onclick = () => inst?.trigger?.();
$('#alt').onclick = () => inst?.alt?.();
$('#rst').onclick = () => inst?.reset?.();
$('#fs').onclick = toggleFs;
const setPhone = on => {
  document.body.classList.toggle('phone-mode', on);
  if (on) { document.body.classList.add('nopanel'); if (!document.fullscreenElement) toggleFs(); }
};
$('#phone').onclick = () => setPhone(true);
const syncPhoneBtn = () => { $('#phone').hidden = !tpl.phone; if (!tpl.phone) document.body.classList.remove('phone-mode'); };
$('#close').onclick = $('#open').onclick = togglePanel;
$('#share').onclick = async () => {
  const p = writeHash(); p.set('p', '1'); if (tpl.phone) p.set('phone', '1');
  const url = `${location.origin}${location.pathname}#${p}`;
  try { await navigator.clipboard.writeText(url); $('#share').textContent = '✔ Lien copié !'; }
  catch { prompt('Copiez ce lien :', url); }
  setTimeout(() => $('#share').textContent = '🔗 Copier le lien de blague', 2000);
};

addEventListener('keydown', e => {
  if (embed || e.target.closest?.('input,select,textarea')) return;
  if (e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); return toggleFs(); }
  if (e.shiftKey && e.key.toLowerCase() === 'h') { e.preventDefault(); return togglePanel(); }
  if (e.target.closest?.('button') && (e.key === 'Enter' || e.key === ' ')) e.target.blur();
  if (e.key === 'Enter') { e.preventDefault(); inst?.trigger?.(); }
  else if (e.key === 'Tab') { e.preventDefault(); inst?.alt?.(); }
  else if (e.key === 'Escape') inst?.reset?.();
  else inst?.onKey?.(e);
});

// Conseil d'installation : sur téléphone, le vrai plein écran passe par « Ajouter à l'écran d'accueil »
(() => {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone || !matchMedia('(max-width: 700px)').matches) return;
  try { if (localStorage.getItem('nb_tip_install')) return; } catch { /* stockage indisponible */ }
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const tip = document.createElement('div');
  tip.className = 'install-tip';
  tip.innerHTML = ios
    ? '<b>Plein écran comme une vraie appli</b><span>Touche <i>Partager</i> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg> puis <i>Sur l’écran d’accueil</i>.</span><button>OK</button>'
    : '<b>Plein écran comme une vraie appli</b><span>Ouvre le menu <i>⋮</i> puis <i>Installer l’appli</i> ou <i>Ajouter à l’écran d’accueil</i>.</span><button>OK</button>';
  const close = () => { tip.remove(); try { localStorage.setItem('nb_tip_install', '1'); } catch { /* stockage indisponible */ } };
  tip.querySelector('button').onclick = close;
  setTimeout(() => document.body.append(tip), 1200);
  setTimeout(() => tip.isConnected && tip.classList.add('out'), 14000);
})();

// Sur écran tactile : le bouton « Personnaliser » s'efface après 3,5 s, un toucher le fait réapparaître
let touchIdle;
const wake = () => { document.body.classList.remove('touch-idle'); clearTimeout(touchIdle); touchIdle = setTimeout(() => document.body.classList.add('touch-idle'), 3500); };
addEventListener('touchstart', wake, { passive: true }); wake();

// Curseur masqué après 2 s d'inactivité
let idle;
addEventListener('mousemove', () => { document.body.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('idle'), 2000); });

// Mode « lien de blague » : écran noir, un clic → plein écran
if (play && !embed) {
  const gate = $('#gate'); gate.hidden = false;
  gate.onclick = () => { gate.hidden = true; toggleFs(); };
}

readCfg(); buildPanel(); mount(); syncPhoneBtn();
if (tpl.phone && (params.get('phone') === '1' || matchMedia('(max-width: 700px)').matches)) document.body.classList.add('phone-mode', 'nopanel');
