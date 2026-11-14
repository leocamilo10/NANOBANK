// Animations de la landing : apparition au défilement, titre mot à mot, compteurs, inclinaison des cartes.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.add('js-anim');
  document.documentElement.classList.add('anim-ready');

  // 1. Titre du hero : chaque mot apparaît l'un après l'autre
  const h1 = document.querySelector('.hero h1');
  if (h1 && !h1.dataset.split) {
    h1.dataset.split = '1';
    let i = 0;
    const wrap = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part; frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.classList.contains('grad')) {
          n.classList.add('w'); n.style.setProperty('--i', i++);
        }
      });
    };
    wrap(h1);
  }

  // 2. Apparition au défilement, en cascade dans chaque groupe
  const targets = $$('section .eyebrow, section h2, .uses article, .bento article, .how li, .price, details, .final, .foot');
  targets.forEach(el => {
    el.classList.add('rv');
    const sib = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
    el.style.transitionDelay = `${Math.min(sib.indexOf(el), 6) * 90}ms`;
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    e.target.querySelectorAll('[data-count]').forEach(countUp);
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => io.observe(el));

  // 3. Compteurs : les chiffres défilent jusqu'à leur valeur
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = '1';
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suffix = el.dataset.suffix || '';
    const fmt = v => v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
    if (reduce) { el.innerHTML = fmt(to); return; }
    const t0 = performance.now(), dur = 1600;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.innerHTML = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  $$('.stats b').forEach(b => {
    const m = b.textContent.trim().match(/^([\d\s.,]+)\s*(.*)$/);
    if (!m) return;
    const raw = m[1].replace(/\s/g, ''), dec = raw.includes(',') ? raw.split(',')[1].length : 0;
    b.dataset.count = raw.replace(',', '.'); b.dataset.dec = dec; b.dataset.suffix = m[2] ? ' ' + m[2] : '';
    setTimeout(() => countUp(b), 900);
  });

  // 4. Inclinaison 3D des cartes sous la souris (ordinateur uniquement)
  if (!reduce && matchMedia('(hover: hover)').matches) {
    $$('.tilt, .price').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty('--ry', `${x * 7}deg`); c.style.setProperty('--rx', `${-y * 7}deg`);
      });
      c.addEventListener('pointerleave', () => { c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); });
    });
  }
})();
