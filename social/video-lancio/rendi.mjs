import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
const out = process.argv[2], FPS = 30, DUR = 26;
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => window.pronto);
const t0 = Date.now();
for (let f = 0; f < FPS * DUR; f++) {
  const data = await p.evaluate((t) => { render(t); return document.getElementById('out').toDataURL('image/jpeg', 0.93); }, f / FPS);
  if (!ff.stdin.write(Buffer.from(data.split(',')[1], 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 150 === 0) console.log('fotogramma', f, Math.round((Date.now() - t0) / 1000) + 's');
}
ff.stdin.end(); await new Promise((r) => ff.on('close', r));
await b.close(); console.log('fatto', Math.round((Date.now() - t0) / 1000) + 's');
