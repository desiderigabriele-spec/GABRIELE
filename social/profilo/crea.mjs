// Uso: node social/profilo/crea.mjs (serve playwright). Crea profilo-nero.png e profilo-bianco.png, 1080×1080.
// L'immagine di profilo per Instagram e TikTok: D&C. al centro, dentro il cerchio in cui i social la ritagliano
import { chromium } from 'playwright';
import fs from 'node:fs';
const svg = fs.readFileSync('/home/user/GABRIELE/src/assets/logo-icona.svg', 'utf8');
const OUT = '/home/user/GABRIELE/social/profilo';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
for (const [nome, fondo, segno] of [['profilo-nero', '#0a0a0a', '#ffffff'], ['profilo-bianco', '#ffffff', '#0a0a0a']]) {
  await p.setContent(`<style>html,body{margin:0;background:${fondo}}#t{position:absolute;left:-9999px}</style><div id="t">${svg}</div><svg id="s" width="1080" height="1080"></svg>`);
  const out = await p.evaluate(({ fondo, segno }) => {
    const src = document.querySelector('#t svg');
    const paths = [...src.querySelectorAll('path, rect')].filter((q) => q.getAttribute('width') !== '512');
    // il riquadro delle lettere (senza il quadrato di fondo)
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    paths.forEach((q) => { const r = q.getBBox(); x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.width); y1 = Math.max(y1, r.y + r.height); });
    const w = x1 - x0, h = y1 - y0, cx = x0 + w / 2, cy = y0 + h / 2;
    // gli angoli del riquadro stanno dentro il 76% del raggio del cerchio
    const s = (540 * 0.76) / Math.hypot(w / 2, h / 2);
    const dst = document.getElementById('s');
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(540 540) scale(${s}) translate(${-cx} ${-cy})`);
    paths.forEach((q) => {
      const c = q.cloneNode(true);
      const f = c.getAttribute('fill') || '';
      // le lettere prendono il colore del segno, il quadratino resta rosso
      if (!/#e30613|#E30613|rosso|#e3/i.test(f)) c.setAttribute('fill', segno);
      g.appendChild(c);
    });
    dst.appendChild(g);
    return { w, h, s, fills: paths.map((q) => q.getAttribute('fill')) };
  }, { fondo, segno });
  console.log(nome, JSON.stringify(out));
  await p.screenshot({ path: `${OUT}/${nome}.png` });
}
await b.close();
