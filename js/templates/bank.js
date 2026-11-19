import { Scope, h, esc, beep, fmt, ri, safeColor } from '../common.js';

// ---- Icônes (traits SVG maison) ----
const P = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  list: 'M4 6h16M4 12h16M4 18h10',
  card: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18M7 15h4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  plus: 'M12 5v14M5 12h14',
  swap: 'M7 4L4 7l3 3M4 7h13M17 20l3-3-3-3M20 17H7',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5',
  bell: 'M6 9a6 6 0 0 1 12 0c0 6 3 7 3 7H3s3-1 3-7M10 20a2 2 0 0 0 4 0',
  back: 'M15 5l-7 7 7 7',
  chev: 'M9 6l6 6-6 6',
  down: 'M6 9l6 6 6-6',
  food: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4M17 3v18',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
  in: 'M17 7L7 17M7 9v8h8',
  out: 'M7 17L17 7M9 7h8v8',
  play: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM10 9l5 3-5 3z',
  fuel: 'M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M4 10h10M14 8l3 2v8a1.5 1.5 0 0 0 3 0V9l-3-3',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  gym: 'M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 19v2H6',
  coffee: 'M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h1a3 3 0 0 1 0 6h-1M8 3v2M12 3v2',
  cart: 'M3 4h2l2 11h11l2-8H6M9 20h.01M17 20h.01',
  snow: 'M12 2v20M4 6l16 12M20 6L4 18',
  wave: 'M8 8a6 6 0 0 1 0 8M12 5a10 10 0 0 1 0 14M4 10a3 3 0 0 1 0 4',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  gauge: 'M4 18a8 8 0 1 1 16 0M12 18l4-6',
  split: 'M16 3h5v5M8 3H3v5M21 3l-9 9M3 3l9 9v9',
  tag: 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01',
  flag: 'M5 21V4h11l-2 4 2 4H5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
  check: 'M5 12l5 5 9-10',
  del: 'M9 6h11v12H9l-6-6zM12 10l4 4M16 10l-4 4',
  piggy: 'M5 11a6 6 0 0 1 6-5h3a6 6 0 0 1 6 6v1l1 1v3h-2l-1 3h-3v-2h-4v2H8l-1-3a5 5 0 0 1-2-4M15 10h.01',
};
// Logo Nanobank : un N blanc + une étoile (la « nova ») sur fond dégradé
const LOGO = (size = 24) => `<svg class="bk-logo" width="${size}" height="${size}" viewBox="0 0 48 48"><defs><linearGradient id="nbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--c)"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--c) 45%,#fff)"/></linearGradient></defs><rect width="48" height="48" rx="14" fill="url(#nbg)"/><path d="M14 35V15l19 19V15" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 6l1.5 4.5L44 12l-4.5 1.5L38 18l-1.5-4.5L32 12l4.5-1.5z" fill="#fff"/></svg>`;
const ic = (k, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${P[k]}"/></svg>`;

// ---- Catégories de dépenses ----
const CATS = [
  { k: 'salary', n: 'Salaire', i: 'in', c: '#22c55e', re: /salaire|paie/i, pos: true },
  { k: 'in', n: 'Virement reçu', i: 'in', c: '#10b981', pos: true },
  { k: 'xfer', n: 'Virement envoyé', i: 'out', c: '#0ea5e9', re: /^virement à/i },
  { k: 'food', n: 'Restaurants', i: 'food', c: '#f97316', re: /resto|restaurant|pizza|burger|brasserie|zinc/i },
  { k: 'coffee', n: 'Cafés', i: 'coffee', c: '#d97706', re: /café|cafe|boulang/i },
  { k: 'grocery', n: 'Courses', i: 'cart', c: '#84cc16', re: /market|supermarch|courses|épicerie/i },
  { k: 'subs', n: 'Abonnements', i: 'play', c: '#a855f7', re: /stream|abonnement|music/i },
  { k: 'fuel', n: 'Transport', i: 'fuel', c: '#0ea5e9', re: /essence|station|carbur|train|métro|taxi/i },
  { k: 'health', n: 'Santé', i: 'heart', c: '#ef4444', re: /pharma|médec|santé|docteur/i },
  { k: 'sport', n: 'Sport', i: 'gym', c: '#14b8a6', re: /sport|gym|fitness|move/i },
  { k: 'home', n: 'Logement', i: 'home', c: '#6366f1', re: /loyer|énergie|assurance/i },
  { k: 'books', n: 'Loisirs', i: 'book', c: '#ec4899', re: /librairie|cinéma|livre|concert/i },
  { k: 'shop', n: 'Achats', i: 'bag', c: '#8b5cf6' },
];
const catOf = t => t.amount > 0 ? (CATS[0].re.test(t.label) ? CATS[0] : CATS[1]) : (CATS.find(c => !c.pos && c.re && c.re.test(t.label)) || CATS[CATS.length - 1]);

// "Libellé ; -12,50 ; Hier"  →  { label, amount, date }
const parseAmount = s => Number(String(s).replace(/[\s €$]/g, '').replace(',', '.')) || 0;
const hm = () => `${ri(7, 22)}:${String(ri(0, 59)).padStart(2, '0')}`;
function parseTx(text) {
  return String(text || '').split('\n').map(l => l.split(';').map(x => x.trim())).filter(p => p[0])
    .map(([label, amount, date]) => ({ label, amount: parseAmount(amount), date: date || '', time: hm() })).slice(0, 80);
}

const DEFAULT_TX = `Boulangerie du Marché ; -4,20 ; Aujourd’hui
Salaire — Studio Nova ; +2150,00 ; Hier
Streaming Plus ; -13,49 ; 10 nov.
Virement de Tom ; +25,00 ; 9 nov.
Supermarché du Coin ; -62,35 ; 8 nov.
Café des Arts ; -7,80 ; 7 nov.
Station Essence Rivière ; -58,10 ; 6 nov.
Pharmacie Centrale ; -12,90 ; 5 nov.
Remboursement de Inès ; +18,00 ; 4 nov.
Librairie Les Pages ; -24,50 ; 3 nov.
Salle de sport Move ; -29,99 ; 1 nov.
Loyer ; -780,00 ; 1 nov.`;

export default {
  id: 'bank', name: 'Nanobank — appli bancaire', emoji: '🏦',
  desc: 'Appli bancaire mobile de la banque fictive Nanobank : solde et opérations modifiables, navigable en mode téléphone.',
  tags: ['Blague', 'Réseaux sociaux'],
  phone: true,
  keys: [['Entrée', 'virement reçu'], ['Tab', 'paiement envoyé'], ['Échap', 'réinitialiser'], ['Clic / toucher', 'naviguer dans l’appli'], ['Chiffres', 'saisir un montant de virement']],
  schema: [
    { key: 'bank', label: 'Banque (fictive)', type: 'text', default: 'Nanobank' },
    { key: 'holder', label: 'Titulaire', type: 'text', default: 'Léa Martin' },
    { key: 'initials', label: 'Initiales de l’avatar (vide = auto)', type: 'text', default: '' },
    { key: 'balance', label: 'Solde du compte courant', type: 'number', default: 2450.8, step: 'any' },
    { key: 'savings', label: 'Solde de l’épargne', type: 'number', default: 8200, step: 'any' },
    { key: 'currency', label: 'Devise', type: 'text', default: '€' },
    { key: 'tx', label: 'Opérations (libellé ; montant ; date)', type: 'textarea', default: DEFAULT_TX },
    { key: 'contacts', label: 'Bénéficiaires (un par ligne)', type: 'textarea', default: 'Tom Bernard\nInès Moreau\nMamie\nLucas Petit\nColoc — Sam' },
    { key: 'inLabel', label: 'Virement reçu (Entrée) — libellé', type: 'text', default: 'Virement de Mamie' },
    { key: 'inAmount', label: 'Virement reçu — montant', type: 'number', default: 500, step: 'any' },
    { key: 'outLabel', label: 'Paiement (Tab) — libellé', type: 'text', default: 'Restaurant Le Zinc' },
    { key: 'outAmount', label: 'Paiement — montant', type: 'number', default: 86.5, step: 'any' },
    { key: 'layout', label: 'Format', type: 'select', default: 'auto', options: [['auto', 'Automatique (PC sur ordinateur, téléphone sur mobile)'], ['desktop', 'Ordinateur (PC)'], ['phone', 'Téléphone']] },
    { key: 'bg', label: 'Style de fond', type: 'select', default: 'aurore', options: [['aurore', 'Aurore (lumières douces)'], ['halo', 'Halo'], ['degrade', 'Dégradé vertical'], ['uni', 'Couleur unie']] },
    { key: 'color', label: 'Couleur principale', type: 'color', default: '#5b5bf7' },
    { key: 'color2', label: 'Couleur secondaire du fond', type: 'color', default: '#12a4a0' },
  ],
  mount(root, cfg) {
    const S = new Scope(), col = safeColor(cfg.color, '#5b5bf7'), cur = String(cfg.currency || '€').slice(0, 4);
    const money = (x, sign = false) => `${sign && x > 0 ? '+' : x < 0 ? '−' : ''}${fmt(Math.abs(x), 2)} ${cur}`;
    const big = x => { const [i, d] = fmt(Math.abs(x), 2).split(','); return `${x < 0 ? '−' : ''}${i}<small>,${d} ${esc(cur)}</small>`; };
    const holder = String(cfg.holder || '');
    const initials = (String(cfg.initials || '').trim() || holder.split(/\s+/).map(w => (w.match(/\p{L}/u) || [''])[0]).join('')).slice(0, 3).toUpperCase();
    const bankName = esc(cfg.bank), last4 = String(ri(1000, 9999)), firstName = holder.split(/\s+/)[0] || '';
    const month = new Date().toLocaleDateString('fr-FR', { month: 'long' });
    const icon = t => { const c = catOf(t); return `<i class="bk-ic" style="--k:${c.c}">${ic(c.i)}</i>`; };
    const toggle = (k, label, sub, on) => `<div class="bk-row"><i class="bk-ic sm">${ic(k)}</i><div><b>${label}</b><small>${sub}</small></div><button class="bk-sw ${on ? 'on' : ''}" data-sw="${k}"><span></span></button></div>`;
    const link = (k, label) => `<div class="bk-row"><i class="bk-ic sm">${ic(k)}</i><div><b>${label}</b></div>${ic('chev', 'mut')}</div>`;

    const v = h(`<div class="bk" data-bg="${esc(cfg.bg || 'aurore')}" style="--c:${col};--c2:${safeColor(cfg.color2, '#12a4a0')}"><div class="bk-phone">
      <div class="bk-status"><span class="bk-time"></span><span class="bk-sig"><i></i><i></i><i></i><i></i> 5G <b></b></span></div>
      <div class="bk-views">
        <section class="bk-view on" data-v="home">
          <div class="bk-glow"></div>
          <div class="bk-top"><button class="bk-av" data-tab="profile">${esc(initials)}</button><div class="bk-search">${ic('search')}Rechercher</div></div>
          <div class="bk-accounts">
            <div class="bk-acc"><small>${LOGO(18)} Compte courant · ${esc(cur === '€' ? 'EUR' : cur)}</small><div class="bk-bal" data-b="main"></div><span class="bk-pill">Comptes ${ic('down')}</span></div>
            <div class="bk-acc"><small>${ic('piggy')} Épargne · Coffre</small><div class="bk-bal">${big(+cfg.savings || 0)}</div><span class="bk-pill">+2,50 % par an</span></div>
          </div>
          <div class="bk-dots"><i class="on"></i><i></i></div>
          <div class="bk-actions">
            <button>${ic('plus')}<span>Ajouter</span></button><button data-go="send">${ic('swap')}<span>Virer</span></button>
            <button data-tab="card">${ic('card')}<span>Carte</span></button><button>${ic('more')}<span>Plus</span></button></div>
          <div class="bk-panel bk-insight" data-tab="tx"><div class="bk-ph"><b>Dépenses de ${month}</b><span data-s="spent"></span></div>
            <div class="bk-bar" data-s="bar"></div><div class="bk-legend" data-s="legend"></div></div>
          <div class="bk-panel"><div class="bk-ph"><b>Récent</b><a data-go="tx">Tout voir</a></div><ul data-l="recent"></ul></div>
        </section>

        <section class="bk-view" data-v="tx">
          <div class="bk-head"><button data-back>${ic('back')}</button><b>Transactions</b><span></span></div>
          <div class="bk-search dark">${ic('search')}Rechercher une opération</div>
          <div class="bk-chips"><span class="on">Tout</span><span>Entrées</span><span>Sorties</span></div>
          <div class="bk-sum"><div><small>${ic('in')} Entrées</small><b class="pos" data-s="in"></b></div><div><small>${ic('out')} Sorties</small><b data-s="out"></b></div></div>
          <div data-l="all"></div>
        </section>

        <section class="bk-view" data-v="detail"></section>

        <section class="bk-view" data-v="send">
          <div class="bk-head"><button data-back>${ic('back')}</button><b>Virer</b><span></span></div>
          <div class="bk-search dark">${ic('search')}Nom, IBAN ou téléphone</div>
          <div class="bk-ph"><b>Bénéficiaires</b></div>
          <ul class="bk-panel" data-l="contacts"></ul>
          <div class="bk-panel bk-newbtn" data-go="newrcpt"><div class="bk-row"><i class="bk-ic sm">${ic('plus')}</i><div><b>Nouveau bénéficiaire</b><small>Saisir un nom et un IBAN</small></div>${ic('chev', 'mut')}</div></div>
        </section>

        <section class="bk-view" data-v="newrcpt">
          <div class="bk-head"><button data-back>${ic('back')}</button><b>Nouveau bénéficiaire</b><span></span></div>
          <div class="bk-form">
            <label>Nom du bénéficiaire<input data-r="nname" type="text" autocomplete="off" maxlength="40" placeholder="Prénom Nom"></label>
            <label>IBAN<input data-r="niban" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="42" placeholder="FR76 1234 5678 9012 3456 7890 123"></label>
            <label><span>BIC <em>(facultatif)</em></span><input data-r="nbic" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="11" placeholder="ABCDFRPP"></label>
            <p class="bk-formerr" data-r="nerr"></p>
          </div>
          <button class="bk-cta" data-r="ngo" disabled>Continuer</button>
        </section>

        <section class="bk-view bk-amountv" data-v="amount">
          <div class="bk-head"><button data-back>${ic('back')}</button><b>Montant</b><span></span></div>
          <div class="bk-to"><i class="bk-ic" data-r="av"></i><div><small>Envoyer à</small><b data-r="name"></b><small data-r="iban"></small></div></div>
          <div class="bk-amt"><span data-r="amt">0</span><small>${esc(cur)}</small></div>
          <div class="bk-avail" data-r="avail"></div>
          <div class="bk-motif">${ic('doc')}<input data-r="note" placeholder="Ajouter un motif" maxlength="40"></div>
          <div class="bk-pad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'del'].map(k => `<button data-k="${k}">${k === 'del' ? ic('del') : k}</button>`).join('')}</div>
          <button class="bk-cta" data-r="send" disabled>Envoyer</button>
        </section>

        <section class="bk-view bk-sentv" data-v="sent">
          <div class="bk-okring">${ic('check')}</div>
          <h2>Virement envoyé</h2>
          <div class="bk-sentamt" data-r="samt"></div>
          <p data-r="sto"></p>
          <div class="bk-panel"><div class="bk-kv"><span>Depuis</span><b>Compte courant</b></div><div class="bk-kv"><span>Délai</span><b>Reçu sous 24 h</b></div><div class="bk-kv" data-r="sibanrow" hidden><span>IBAN</span><b data-r="siban"></b></div><div class="bk-kv"><span>Motif</span><b data-r="snote"></b></div></div>
          <button class="bk-cta" data-tab="home">Terminé</button>
        </section>

        <section class="bk-view" data-v="card">
          <div class="bk-head"><button data-back>${ic('back')}</button><b>Mes cartes</b><span></span></div>
          <div class="bk-cardwrap"><div class="bk-card">
            <div class="bk-card-top"><b class="bk-wordmark">${LOGO(26)}${bankName}</b><span>${ic('wave')}</span></div>
            <div class="bk-chip"></div><div class="bk-card-num">•••• ${last4}</div>
            <div class="bk-card-bot"><span>${esc(holder)}</span><span>12/29</span></div>
            <div class="bk-frost">${ic('snow')}<b>Carte gelée</b></div></div></div>
          <div class="bk-cardactions"><button data-sw-proxy="snow">${ic('snow')}<span>Geler</span></button><button>${ic('gauge')}<span>Plafonds</span></button><button>${ic('shield')}<span>Sécurité</span></button></div>
          <div class="bk-panel">${toggle('wave', 'Paiement sans contact', 'Activé sur cette carte', true)}${toggle('globe', 'Paiements en ligne', 'Achats sur internet', true)}${toggle('snow', 'Geler la carte', 'Bloque temporairement la carte', false)}</div>
          <p class="bk-note">Carte de démonstration : elle ne permet aucun paiement.</p>
        </section>

        <section class="bk-view" data-v="profile">
          <div class="bk-head"><button data-back>${ic('back')}</button><b>Profil</b><span></span></div>
          <div class="bk-prof"><i>${esc(initials)}</i><h3>${esc(holder)}</h3><small>Client ${bankName} · Standard</small></div>
          <div class="bk-brand">${LOGO(40)}<b>${bankName}</b></div>
          <div class="bk-panel">${link('user', 'Informations personnelles')}${link('shield', 'Sécurité et confidentialité')}${link('doc', 'Relevés et documents')}${link('bell', 'Notifications')}</div>
          <div class="bk-panel">${link('help', 'Aide')}${link('flag', 'Signaler un problème')}</div>
          <div class="bk-panel bk-about"><b>À propos de Nanobank</b><p>Nanobank est une banque fictive. Ce compte est une simulation : le solde, les opérations, les virements et la carte n’ont aucune valeur réelle et ne permettent aucun paiement.</p></div>
        </section>
      </div>
      <div class="bk-simbar">Simulation · aucune valeur réelle</div>
      <nav class="bk-tabs">
        <div class="bk-side-brand">${LOGO(30)}<b>${bankName}</b></div>
        <a data-tab="home" class="on">${ic('home')}<span>Accueil</span></a><a data-tab="tx">${ic('list')}<span>Transactions</span></a>
        <a data-tab="card">${ic('card')}<span>Cartes</span></a><a data-tab="profile">${ic('user')}<span>Profil</span></a>
        <div class="bk-side-user"><i>${esc(initials)}</i><div><b>${esc(holder)}</b><small>Compte courant</small></div></div></nav>
      <div class="bk-notif"><b>${LOGO(24)}${bankName}<small>maintenant</small></b><p></p></div>
    </div></div>`);
    // Format PC : choisi explicitement, ou automatiquement quand l'écran est large
    const desk = cfg.layout === 'desktop' || (cfg.layout !== 'phone' && (root.clientWidth || innerWidth) >= 900);
    v.classList.toggle('desk', desk);
    root.append(v);
    const q = s => v.querySelector(s);
    const bal = q('[data-b="main"]'), notif = q('.bk-notif'), tm = q('.bk-time'), acc = q('.bk-accounts'), dots = [...v.querySelectorAll('.bk-dots i')];

    let txs, target, shown, stack = ['home'], rcpt = '', amt = '';
    const contacts = String(cfg.contacts || '').split('\n').map(x => x.trim()).filter(Boolean).slice(0, 12);
    const avatar = n => `<i class="bk-ic" style="--k:${['#f97316', '#22c55e', '#0ea5e9', '#a855f7', '#ec4899', '#eab308'][[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % 6]}"><b>${esc(n.split(/\s+/).map(w => (w.match(/\p{L}/u) || [''])[0]).join('').slice(0, 2).toUpperCase())}</b></i>`;
    q('[data-l="contacts"]').innerHTML = contacts.map((n, i) => `<li data-c="${i}">${avatar(n)}<div><b>${esc(n)}</b><small>Virement reçu sous 24 h</small></div>${ic('chev', 'mut')}</li>`).join('') || '<li><div><small>Ajoutez des bénéficiaires dans le panneau</small></div></li>';
    const amountVal = () => Number(amt.replace(',', '.')) || 0;
    function renderAmount() {
      const a = amountVal(), ok = a > 0 && a <= target;
      q('[data-r="amt"]').textContent = amt ? amt.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
      q('.bk-amt').classList.toggle('err', a > target);
      q('[data-r="avail"]').textContent = a > target ? 'Solde insuffisant' : `Disponible : ${money(target)}`;
      q('[data-r="send"]').disabled = !ok;
    }
    function key(k) {
      if (k === 'del') amt = amt.slice(0, -1);
      else if (k === ',') { if (!amt.includes(',')) amt = (amt || '0') + ','; }
      else { if (/,\d\d$/.test(amt) || amt.replace(',', '').length >= 8) return; amt = amt === '0' ? k : amt + k; }
      renderAmount();
    }
    let rcptIban = '';
    const ibanClean = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const ibanFormat = s => ibanClean(s).replace(/(.{4})/g, '$1 ').trim();
    const ibanMask = s => { const c = ibanClean(s); return c.length > 8 ? `${c.slice(0, 4)} •••• •••• ${c.slice(-4)}` : c; };
    const ibanOk = s => /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(ibanClean(s));
    function checkNew() {
      const name = q('[data-r="nname"]').value.trim(), iban = q('[data-r="niban"]').value;
      const err = iban && ibanClean(iban).length >= 4 && !/^[A-Z]{2}[0-9]{2}/.test(ibanClean(iban)) ? 'Un IBAN commence par 2 lettres puis 2 chiffres (ex. FR76…).' : '';
      q('[data-r="nerr"]').textContent = err;
      q('[data-r="ngo"]').disabled = !(name.length >= 2 && ibanOk(iban));
    }
    function useNew() {
      const name = q('[data-r="nname"]').value.trim(), iban = q('[data-r="niban"]').value;
      if (!(name.length >= 2 && ibanOk(iban))) return;
      startAmount(name, ibanClean(iban));
    }
    function startAmount(name, iban) {
      rcpt = name; rcptIban = iban || ''; amt = '';
      q('[data-r="av"]').outerHTML = avatar(rcpt).replace('class="bk-ic"', 'class="bk-ic" data-r="av"');
      q('[data-r="name"]').textContent = rcpt; q('[data-r="note"]').value = '';
      q('[data-r="iban"]').textContent = rcptIban ? ibanMask(rcptIban) : '';
      renderAmount(); go('amount');
    }
    function pickRcpt(i) {
      return startAmount(contacts[i], '');
      rcpt = contacts[i]; amt = '';
      q('[data-r="av"]').outerHTML = avatar(rcpt).replace('class="bk-ic"', 'class="bk-ic" data-r="av"');
      q('[data-r="name"]').textContent = rcpt; q('[data-r="note"]').value = '';
      renderAmount(); go('amount');
    }
    function sendIt() {
      const a = amountVal(); if (!(a > 0 && a <= target)) return;
      const note = q('[data-r="note"]').value.trim();
      op(`Virement à ${rcpt}`, -a, null);
      q('[data-r="samt"]').textContent = money(a);
      q('[data-r="sto"]').textContent = `à ${rcpt}`;
      q('[data-r="snote"]').textContent = note || '—';
      q('[data-r="sibanrow"]').hidden = !rcptIban; q('[data-r="siban"]').textContent = rcptIban ? ibanMask(rcptIban) : '';
      stack = ['home', 'sent']; show('sent');
      beep(988, .1, .05); S.after(110, () => beep(1318, .25, .05));
    }
    const row = (t, i, isNew) => `<li data-i="${i}" class="${isNew ? 'new' : ''}">${icon(t)}<div><b>${esc(t.label)}</b><small>${esc(t.date)}${t.date ? ' · ' : ''}${t.time}</small></div><span class="${t.amount > 0 ? 'pos' : ''}">${money(t.amount, true)}</span></li>`;

    function renderLists(newFirst = false) {
      q('[data-l="recent"]').innerHTML = txs.slice(0, desk ? 6 : 4).map((t, i) => row(t, i, newFirst && i === 0)).join('');
      const groups = [];
      txs.forEach((t, i) => { const g = groups.find(g => g.d === t.date); g ? g.items.push([t, i]) : groups.push({ d: t.date, items: [[t, i]] }); });
      q('[data-l="all"]').innerHTML = groups.map(g => {
        const tot = g.items.reduce((a, [t]) => a + t.amount, 0);
        return `<div class="bk-gh"><span>${esc(g.d || 'Sans date')}</span><span>${money(tot, true)}</span></div><ul class="bk-panel">${g.items.map(([t, i]) => row(t, i, newFirst && i === 0)).join('')}</ul>`;
      }).join('');
      const inn = txs.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0), out = txs.filter(t => t.amount < 0).reduce((a, t) => a + t.amount, 0);
      q('[data-s="in"]').textContent = money(inn, true); q('[data-s="out"]').textContent = money(out, true);
      // Répartition des dépenses par catégorie
      const by = {};
      txs.filter(t => t.amount < 0).forEach(t => { const c = catOf(t); by[c.k] ??= { c, v: 0 }; by[c.k].v += -t.amount; });
      const arr = Object.values(by).sort((a, b) => b.v - a.v), tot = arr.reduce((a, x) => a + x.v, 0) || 1;
      q('[data-s="spent"]').textContent = money(-out);
      q('[data-s="bar"]').innerHTML = arr.map(x => `<i style="flex:${x.v};background:${x.c.c}"></i>`).join('');
      q('[data-s="legend"]').innerHTML = arr.slice(0, 3).map(x => `<span><i style="background:${x.c.c}"></i>${x.c.n} <b>${Math.round(x.v / tot * 100)} %</b></span>`).join('');
    }

    function detail(i) {
      const t = txs[i]; if (!t) return;
      const c = catOf(t), incoming = t.amount > 0;
      q('[data-v="detail"]').innerHTML = `
        <div class="bk-dethero" style="--k:${c.c}">
          <div class="bk-head"><button data-back>${ic('back')}</button><b></b><span></span></div>
          <i class="bk-ic xl" style="--k:${c.c}">${ic(c.i)}</i>
          <h3>${esc(t.label)}</h3><div class="bk-det-amt ${incoming ? 'pos' : ''}">${money(t.amount, true)}</div>
          <small>${esc(t.date)} · ${t.time}</small></div>
        <div class="bk-panel bk-steps"><div><i></i><b>${incoming ? 'Virement initié' : 'Paiement autorisé'}</b><small>${t.time}</small></div><div><i></i><b>Terminé</b><small>${esc(t.date)}</small></div></div>
        <div class="bk-panel">
          <div class="bk-kv"><span>Catégorie</span><b><i style="background:${c.c}"></i>${c.n}</b></div>
          <div class="bk-kv"><span>Compte</span><b>Compte courant</b></div>
          <div class="bk-kv"><span>Moyen</span><b>${incoming ? 'Virement' : 'Carte •••• ' + last4}</b></div></div>
        <div class="bk-cardactions">${incoming ? '' : `<button>${ic('split')}<span>Partager</span></button>`}<button>${ic('tag')}<span>Catégorie</span></button><button>${ic('flag')}<span>Signaler</span></button></div>`;
      go('detail');
    }

    function show(name) {
      v.querySelectorAll('.bk-view').forEach(s => s.classList.toggle('on', s.dataset.v === name));
      const tabFor = name === 'detail' ? (stack[stack.length - 2] || 'tx') : name;
      v.querySelectorAll('.bk-tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tabFor));
      v.classList.toggle('flow', ['send', 'newrcpt', 'amount', 'sent'].includes(name));
      q(`[data-v="${name}"]`).scrollTop = 0;
    }
    const go = name => {
      if (name === 'newrcpt') { ['nname', 'niban', 'nbic'].forEach(k => q(`[data-r="${k}"]`).value = ''); q('[data-r="nerr"]').textContent = ''; q('[data-r="ngo"]').disabled = true; }
      stack.push(name); show(name);
    };
    const back = () => { if (stack.length > 1) stack.pop(); show(stack[stack.length - 1]); };
    const setFrozen = on => {
      q('.bk-card').classList.toggle('frozen', on);
      q('[data-sw="snow"]').classList.toggle('on', on);
      q('[data-sw-proxy="snow"] span').textContent = on ? 'Dégeler' : 'Geler';
    };
    const filter = f => q('[data-l="all"]').querySelectorAll('li').forEach(li => {
      const t = txs[+li.dataset.i];
      li.hidden = f === 'Entrées' ? t.amount <= 0 : f === 'Sorties' ? t.amount >= 0 : false;
    });

    const onClick = e => {
      const c = e.target.closest('li[data-c]'); if (c) return pickRcpt(+c.dataset.c);
      const k = e.target.closest('[data-k]'); if (k) return key(k.dataset.k);
      if (e.target.closest('[data-r="send"]')) return sendIt();
      if (e.target.closest('[data-r="ngo"]')) return useNew();
      const li = e.target.closest('li[data-i]'); if (li) return detail(+li.dataset.i);
      if (e.target.closest('[data-back]')) return back();
      const sw = e.target.closest('[data-sw]');
      if (sw) { if (sw.dataset.sw === 'snow') setFrozen(!sw.classList.contains('on')); else sw.classList.toggle('on'); return; }
      if (e.target.closest('[data-sw-proxy]')) return setFrozen(!q('.bk-card').classList.contains('frozen'));
      const g = e.target.closest('[data-go]'); if (g) return go(g.dataset.go);
      const tab = e.target.closest('[data-tab]'); if (tab) { stack = tab.dataset.tab === 'home' ? ['home'] : ['home', tab.dataset.tab]; return show(tab.dataset.tab); }
      const chip = e.target.closest('.bk-chips span'); if (chip) { chip.parentElement.querySelectorAll('span').forEach(s => s.classList.toggle('on', s === chip)); return filter(chip.textContent); }
      const d = e.target.closest('.bk-dots i'); if (d) acc.scrollTo({ left: dots.indexOf(d) * acc.clientWidth, behavior: 'smooth' });
    };
    v.addEventListener('click', onClick);
    const onInput = e => {
      if (e.target.matches('[data-r="niban"]')) { const pos = e.target.value.length; e.target.value = ibanFormat(e.target.value); if (pos >= e.target.value.length - 1) e.target.selectionStart = e.target.selectionEnd = e.target.value.length; }
      if (e.target.matches('[data-r="nbic"]')) e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (e.target.closest('[data-v="newrcpt"]')) checkNew();
    };
    v.addEventListener('input', onInput);
    S.add(() => v.removeEventListener('input', onInput));
    const onScroll = () => { const k = Math.round(acc.scrollLeft / Math.max(1, acc.clientWidth)); dots.forEach((d, j) => d.classList.toggle('on', j === k)); };
    acc.addEventListener('scroll', onScroll, { passive: true });
    S.add(() => { v.removeEventListener('click', onClick); acc.removeEventListener('scroll', onScroll); });

    const init = () => {
      txs = parseTx(cfg.tx); target = shown = Number(cfg.balance) || 0;
      renderLists(); notif.classList.remove('on'); stack = ['home']; show('home'); setFrozen(false);
    };
    init();

    S.raf(dt => {
      shown += (target - shown) * Math.min(1, dt * 4);
      if (Math.abs(target - shown) < .005) shown = target;
      bal.innerHTML = big(shown);
    });
    const clk = () => { const n = new Date(); tm.textContent = `${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}`; };
    clk(); S.every(5000, clk);

    const op = (label, amount, msg) => {
      target += amount;
      const n = new Date();
      txs.unshift({ label, amount, date: 'Aujourd’hui', time: `${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}` });
      renderLists(true);
            if (!msg) return;
      notif.querySelector('p').textContent = msg;
      notif.classList.remove('on'); void notif.offsetWidth; notif.classList.add('on');
      S.after(4500, () => notif.classList.remove('on'));
    };
    return {
      trigger() { const a = Math.abs(+cfg.inAmount || 0); op(cfg.inLabel, a, `Vous avez reçu ${money(a)} · ${cfg.inLabel}`); beep(1046, .1, .05); S.after(120, () => beep(1568, .2, .05)); },
      alt() { const a = -Math.abs(+cfg.outAmount || 0); op(cfg.outLabel, a, `Paiement de ${money(-a)} chez ${cfg.outLabel}`); beep(880, .08, .04); },
      reset: init,
      onKey(e) {
        if (!q('[data-v="amount"]').classList.contains('on') || e.target.closest?.('input')) return;
        if (/^[0-9]$/.test(e.key)) key(e.key); else if (e.key === ',' || e.key === '.') key(','); else if (e.key === 'Backspace') key('del');
      },
      destroy: () => S.destroy(),
    };
  }
};
