// Uso: node social/post/crea.mjs (serve playwright). Fa una foto 1080×1350 di ogni slide di post.html in social/post/png/.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const qui = path.dirname(fileURLToPath(import.meta.url));
const logo = fs.readFileSync(path.join(qui, '../../src/assets/logo-icona.svg'), 'utf8');
const out = path.join(qui, 'png'); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 1500 } });
await p.goto('file://' + path.join(qui, 'post.html'));
await p.evaluate((svg) => document.querySelectorAll('.marchio').forEach((m) => { m.innerHTML = m.innerHTML.replace('{{LOGO}}', svg); }), logo);
await p.evaluate(() => document.fonts.ready);
for (const s of await p.$$('.slide')) {
  const id = await s.getAttribute('id');
  await s.screenshot({ path: path.join(out, `post-${id}.png`) });
  console.log('post-' + id);
}
await b.close();
