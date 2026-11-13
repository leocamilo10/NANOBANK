"""Assemble toute l'app en un seul fichier HTML autonome : dist/propdash.html"""
import re, pathlib

R = pathlib.Path(__file__).parent
read = lambda p: (R / p).read_text(encoding='utf-8')

def strip_imports(s):
    return re.sub(r'^import .*?;\s*$', '', s, flags=re.M)

js = [strip_imports(read('js/common.js')).replace('export ', '')]
names = ['bank']
for n in names:
    body = strip_imports(read(f'js/templates/{n}.js')).replace('export default {', 'return {', 1)
    js.append(f'const T_{n} = (() => {{\n{body}\n}})();')
js.append('const TEMPLATES = [T_bank];')
js.append(strip_imports(read('js/player.js')))

# Page d'accueil : on garde le contenu de index.html, sans nav externe ni iframes
page = read('index.html')
home = page[page.index('<nav'):page.index('<script')]
home = home.replace('href="app.html#t=bank"', 'href="#" data-open="bank"').replace('href="app.html"', 'href="#" data-open="bank"')
home = re.sub(r'<div class="hero-shot">.*?</div>', '<div class="hero-shot"><div class="mini" id="heroMini"></div></div>', home, flags=re.S)

js.append(r'''
// ---- Accueil intégré ----
const home = document.getElementById('home');
const grid = document.getElementById('grid');
grid.innerHTML = TEMPLATES.map(t => `
  <a class="card" href="#" data-open="${t.id}">
    <div class="thumb"><span>${t.emoji}</span></div>
    <div class="meta"><h3>${t.emoji} ${esc(t.name)}</h3><p>${esc(t.desc)}</p>
      <div class="tags">${t.tags.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>
  </a>`).join('');
let heroInst = null;
function showHome(on) {
  home.hidden = !on;
  document.body.classList.toggle('at-home', on);
  if (on && !heroInst) {
    const m = document.getElementById('heroMini');
    heroInst = T_bank.mount(m, Object.fromEntries(T_bank.schema.map(f => [f.key, f.default])));
    const fit = () => m.style.transform = `scale(${m.parentElement.clientWidth / 1280})`;
    new ResizeObserver(fit).observe(m.parentElement); fit();
  }
  if (!on && heroInst) { heroInst.destroy(); heroInst = null; document.getElementById('heroMini').innerHTML = ''; }
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-open]'); if (!a) return;
  e.preventDefault();
  const sel = document.getElementById('tpl'); sel.value = a.dataset.open; sel.dispatchEvent(new Event('change'));
  document.body.classList.remove('nopanel'); showHome(false); scrollTo(0, 0);
});
document.querySelectorAll('[data-soon]').forEach(a => a.onclick = e => { e.preventDefault(); alert('Paiement bientôt disponible !'); });
document.querySelector('.p-head .logo').onclick = e => { e.preventDefault(); showHome(true); };
showHome(!new URLSearchParams(location.hash.slice(1)).get('t'));
''')

script = '\n'.join(js)
# Pendant l'accueil, les raccourcis clavier de l'écran sont désactivés
script = script.replace("if (embed || e.target.closest?.('input,select,textarea')) return;",
                        "if (embed || !home.hidden || e.target.closest?.('input,select,textarea')) return;")
script = script.replace("const home = document.getElementById('home');", "")
script = "const home = document.getElementById('home');\n" + script

app = read('app.html')
body = app[app.index('<body>') + 6:app.index('<script')]
body = body.replace('href="index.html" class="logo"', 'href="#" class="logo"')

css_site = read('css/site.css').replace('body{', '#home{').replace('html{scroll-behavior:smooth}', '')
extra_css = '''
#home{position:fixed;inset:0;overflow:auto;z-index:500}
#home[hidden]{display:none}
.at-home #open,.at-home #wm{display:none}
.thumb{display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#2a2050,#0b0c12)}
.thumb>span{font-size:64px}
.mini{text-align:left;position:absolute;top:0;left:0;width:1280px;height:720px;transform-origin:0 0;pointer-events:none}
'''
out = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PropDash</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>
{read('css/app.css')}
{read('css/templates.css')}
{css_site}
{extra_css}
</style>
</head>
<body>
{body}
<div id="home">{home}</div>
<script type="module">
{script}
</script>
</body>
</html>
'''
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist/propdash.html').write_text(out, encoding='utf-8')
print('ok', len(out), 'octets')
