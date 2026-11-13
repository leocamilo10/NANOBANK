// Aperçu de l'appli : rendu en 420×860 puis réduit à la taille du cadre
const scale = () => document.querySelectorAll('.hero-shot').forEach(b => {
  const f = b.querySelector('iframe, .mini'); if (f) f.style.transform = `scale(${b.clientWidth / 420})`;
});
new ResizeObserver(scale).observe(document.body); scale();

// Reflet de lumière qui suit la souris sur les panneaux en verre
addEventListener('pointermove', e => {
  document.querySelectorAll('.glass').forEach(g => {
    const r = g.getBoundingClientRect();
    g.style.setProperty('--mx', `${e.clientX - r.left}px`);
    g.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}, { passive: true });

document.querySelectorAll('[data-soon]').forEach(a => a.onclick = e => { e.preventDefault(); alert('Paiement bientôt disponible !'); });
