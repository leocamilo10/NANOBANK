// Reflet de lumière qui suit la souris, uniquement sur le panneau survolé
let raf = 0, last = null;
addEventListener('pointermove', e => {
  last = e;
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    const g = last.target.closest?.('.glass');
    if (!g) return;
    const r = g.getBoundingClientRect();
    g.style.setProperty('--mx', `${last.clientX - r.left}px`);
    g.style.setProperty('--my', `${last.clientY - r.top}px`);
  });
}, { passive: true });
