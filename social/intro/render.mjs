// Crea i video dell'intro social: apre intro.html, disegna un fotogramma alla volta e lo passa a ffmpeg.
// Uso: node social/intro/render.mjs [verticale|quadrato] (senza argomento li fa tutti e due)
// Serve Playwright con Chromium e ffmpeg installato.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const qui = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const FORMATI = {
  verticale: { w: 1080, h: 1920, file: 'studio-desideri-intro-9x16.mp4' }, // Reels, TikTok, Storie
  quadrato: { w: 1080, h: 1080, file: 'studio-desideri-intro-1x1.mp4' }, // post nel feed
};
const scelti = process.argv[2] ? [process.argv[2]] : Object.keys(FORMATI);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
  args: ['--allow-file-access-from-files'],
});

for (const nome of scelti) {
  const f = FORMATI[nome];
  const pagina = await browser.newPage({ viewport: { width: f.w, height: f.h } });
  await pagina.goto('file://' + path.join(qui, 'intro.html'));
  await pagina.evaluate(() => window.pronto);
  const durata = await pagina.evaluate(() => window.DURATA);
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    path.join(qui, f.file),
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const totale = Math.round(durata * FPS);
  for (let i = 0; i < totale; i++) {
    await pagina.evaluate((t) => window.disegna(t), i / FPS);
    const png = await pagina.screenshot({ type: 'png' });
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 60 === 0) process.stdout.write(`${nome}: ${Math.round((i / totale) * 100)}%\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`${nome}: fatto → ${f.file}`);
  await pagina.close();
}
await browser.close();
