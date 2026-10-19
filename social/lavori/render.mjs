// Crea i video «Lavori»: disegna video.html un fotogramma alla volta, aggiunge i suoni di suoni.py.
// Uso: node social/lavori/render.mjs luigi [verticale|quadrato]
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const qui = path.dirname(fileURLToPath(import.meta.url));
const nome = process.argv[2] || 'luigi';
const FPS = 30;
const FORMATI = { verticale: [1080, 1920, '9x16'], quadrato: [1080, 1080, '1x1'] };
const scelti = process.argv[3] ? [process.argv[3]] : Object.keys(FORMATI);

const wav = path.join(os.tmpdir(), `suoni-${nome}.wav`);
execFileSync('python3', [path.join(qui, 'suoni.py'), nome, wav], { stdio: 'inherit' });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--allow-file-access-from-files'] });
for (const f of scelti) {
  const [w, h, sigla] = FORMATI[f];
  const pagina = await browser.newPage({ viewport: { width: w, height: h } });
  await pagina.goto('file://' + path.join(qui, nome, 'video.html'));
  await pagina.evaluate(() => window.pronto);
  const durata = await pagina.evaluate(() => window.DURATA);
  const uscita = path.join(qui, nome, `studio-desideri-lavori-${nome}-${sigla}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-i', wav,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', uscita],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const totale = Math.round(durata * FPS);
  for (let i = 0; i < totale; i++) {
    await pagina.evaluate((t) => window.disegna(t), i / FPS);
    const png = await pagina.screenshot({ type: 'png' });
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 90 === 0) console.log(`${f}: ${Math.round((i / totale) * 100)}%`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`${f}: fatto → ${path.relative(process.cwd(), uscita)}`);
  await pagina.close();
}
await browser.close();
