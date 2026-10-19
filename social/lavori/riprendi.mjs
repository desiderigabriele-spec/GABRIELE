// Riprende lo scorrimento di un sito cliente, un fotogramma alla volta, su computer (1440×900) e telefono (390×844 ×2).
// Uso: node social/lavori/riprendi.mjs luigi
// Il sito va servito in locale (es. `python3 -m http.server 4400` nella cartella del sito sito-montini).
// Le icone Font Awesome arrivano dal pacchetto npm (cartella .cache), tracciamento e popup sono spenti.
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const qui = path.dirname(fileURLToPath(import.meta.url));
const SITI = {
  luigi: {
    url: 'http://localhost:4400/', fineComputer: 5600, fineTelefono: 8600,
    prima: () => {
      localStorage.setItem('lm_consent', JSON.stringify({ v: 1, ts: Date.now(), analytics: false, marketing: false }));
      sessionStorage.setItem('lm_popup', '1');
      localStorage.setItem('lm_popup', JSON.stringify({ until: Date.now() + 9e9 }));
    },
  },
};
const nome = process.argv[2] || 'luigi', sito = SITI[nome];
const N = 200; // fotogrammi per dispositivo: 6,7 secondi a 30 fps

const cache = path.join(qui, '.cache');
const fa = path.join(cache, 'package');
if (!fs.existsSync(fa)) {
  fs.mkdirSync(cache, { recursive: true });
  execSync('npm pack @fortawesome/fontawesome-free@6.5.1 --silent && tar xzf fortawesome-fontawesome-free-6.5.1.tgz', { cwd: cache });
}
const eInOut = (x) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });

for (const [cart, cfg, fine] of [['pc', { w: 1440, h: 900 }, sito.fineComputer], ['tel', { w: 390, h: 844, mob: true }, sito.fineTelefono]]) {
  const ctx = await browser.newContext({ viewport: { width: cfg.w, height: cfg.h }, deviceScaleFactor: cfg.mob ? 2 : 1, isMobile: !!cfg.mob, hasTouch: !!cfg.mob });
  await ctx.addInitScript(sito.prima);
  await ctx.route('**/*', (r) => {
    const u = r.request().url();
    if (u.includes('font-awesome') && u.endsWith('.css')) return r.fulfill({ contentType: 'text/css', body: fs.readFileSync(path.join(fa, 'css/all.min.css'), 'utf8').replaceAll('../webfonts/', '/__fa/') });
    if (u.includes('/__fa/')) return r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(path.join(fa, 'webfonts', u.split('/__fa/')[1])) });
    if (u.startsWith('http://localhost') || /fonts\.(googleapis|gstatic)/.test(u)) return r.continue();
    return r.abort(); // tracciamento e tutto il resto
  });
  const p = await ctx.newPage();
  await p.goto(sito.url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important;scrollbar-width:none} ::-webkit-scrollbar{display:none}' });
  // primo giro lento: il sito fa comparire i blocchi quando ci arrivi, così poi è tutto acceso
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 250) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(90); }
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1800);
  const dir = path.join(qui, nome, 'fotogrammi', cart);
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < N; i++) {
    const k = eInOut(Math.max(0, (i - 24) / (N - 24))); // fermo sull'apertura, poi scende morbido
    await p.evaluate((y) => window.scrollTo(0, y), Math.round(k * fine));
    await p.waitForTimeout(40);
    await p.screenshot({ path: path.join(dir, `${String(i).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 88 });
  }
  console.log(`${nome}/${cart}: ${N} fotogrammi`);
  await ctx.close();
}
await browser.close();
