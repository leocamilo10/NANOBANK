import { TEMPLATES } from './templates/index.js';
import { esc } from './common.js';

const grid = document.getElementById('grid');
grid.innerHTML = TEMPLATES.map(t => `
  <a class="card" href="app.html#t=${t.id}">
    <div class="thumb"><iframe data-src="app.html#t=${t.id}&embed=1" title="${esc(t.name)}" tabindex="-1"></iframe></div>
    <div class="meta"><h3>${t.emoji} ${esc(t.name)}</h3><p>${esc(t.desc)}</p>
      <div class="tags">${t.tags.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>
  </a>`).join('');

// Les aperçus sont rendus en 1280×720 puis réduits à la taille de la vignette
const scale = () => document.querySelectorAll('.thumb, .hero-shot').forEach(b => {
  const f = b.querySelector('iframe'); f.style.transform = `scale(${b.clientWidth / 1280})`;
});
new ResizeObserver(scale).observe(document.body); scale();

// Ne charger les aperçus animés que lorsqu'ils sont visibles
const io = new IntersectionObserver(es => es.forEach(e => {
  const f = e.target.querySelector('iframe');
  if (e.isIntersecting && !f.src) f.src = f.dataset.src;
}), { rootMargin: '200px' });
document.querySelectorAll('.thumb').forEach(t => io.observe(t));

document.querySelectorAll('[data-soon]').forEach(a => a.onclick = e => { e.preventDefault(); alert('Paiement bientôt disponible !'); });
