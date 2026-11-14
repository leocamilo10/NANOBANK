import { TEMPLATES } from './templates/index.js';
import { setSound, esc } from './common.js';
import { hasAccess } from './access.js';

// ---- Accès réservé aux clients ----
const SUBSCRIBE_URL = 'https://whop.com/nanobank/abonnement-nanobank-simulator';
if (!(await hasAccess())) {
  document.title = 'Nanobank — Accès réservé';
  document.body.className = 'locked';
  document.body.innerHTML = `
    <main class="lock">
      <svg width="56" height="56" viewBox="0 0 48 48"><rect width="48" height="48" rx="13" fill="#f3efe7"/><path d="M14 35V15l19 19V15" fill="none" stroke="#0b0b0c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 6l1.5 4.5L44 12l-4.5 1.5L38 18l-1.5-4.5L32 12l4.5-1.5z" fill="#b89a6a"/></svg>
      <p class="lock-eyebrow">Accès réservé</p>
      <h1>Débloque l’appli Nanobank.</h1>
      <p class="lock-txt">Un seul paiement pour personnaliser ton compte fictif, passer en mode téléphone et faire vivre tes idées.</p>
      <a class="lock-btn" href="${SUBSCRIBE_URL}" rel="noopener">Débloquer Nanobank — 32,90 €</a>
      <button class="lock-ghost" disabled>J’ai déjà acheté Nanobank · connexion bientôt disponible</button>
      <a class="lock-back" href="index.html">← Retour à l’accueil</a>
    </main>`;
  await new Promise(() => {}); // l'appli ne se charge pas
}

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

// Curseur masqué après 2 s d'inactivité
let idle;
addEventListener('mousemove', () => { document.body.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('idle'), 2000); });

// Mode « lien de blague » : écran noir, un clic → plein écran
if (play && !embed) {
  const gate = $('#gate'); gate.hidden = false;
  gate.onclick = () => { gate.hidden = true; toggleFs(); };
}

readCfg(); buildPanel(); mount(); syncPhoneBtn();
if (params.get('phone') === '1' && tpl.phone) document.body.classList.add('phone-mode', 'nopanel');
