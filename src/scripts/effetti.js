// Effetti di luce sopra la pagina: stelline al clic sui bottoni d'azione,
// la parola firma del titolo che nasce dalle stelle e il percorso dei capitoli sul bordo sinistro.
const html = document.documentElement;
const ridotto = html.classList.contains('ridotto');
const rnd = (a, b) => a + Math.random() * (b - a);
const liscia = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} } };

// ---------- 7 + 8 · un livello trasparente sopra la pagina ----------
let tela = null, ctx = null, parti = [], inCorso = false, dpr = 1;
function preparaTela() {
  if (tela) return;
  tela = document.createElement('canvas');
  tela.className = 'tela-effetti';
  tela.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tela);
  ctx = tela.getContext('2d');
  misura();
  window.addEventListener('resize', misura);
}
function misura() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  tela.width = innerWidth * dpr; tela.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function stella(x, y, s) {
  ctx.beginPath(); ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x + s * 0.2, y - s * 0.2, x + s, y); ctx.quadraticCurveTo(x + s * 0.2, y + s * 0.2, x, y + s);
  ctx.quadraticCurveTo(x - s * 0.2, y + s * 0.2, x - s, y); ctx.quadraticCurveTo(x - s * 0.2, y - s * 0.2, x, y - s); ctx.fill();
}
let prima = 0;
function ciclo(ora) {
  const dt = Math.min(ora - (prima || ora), 50); prima = ora;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  parti = parti.filter((p) => (p.vita += dt) < p.durata);
  for (const p of parti) {
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= 0.985;
    ctx.globalAlpha = 1 - p.vita / p.durata; ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = p.alone;
    if (p.stella) stella(p.x, p.y, p.r * 1.8); else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  if (parti.length) requestAnimationFrame(ciclo); else { inCorso = false; prima = 0; }
}
function aggiungi(p) { parti.push(p); if (!inCorso) { inCorso = true; requestAnimationFrame(ciclo); } }

const COLORI = ['#ffffff', '#ffffff', '#d4d4d4', '#e30613', '#e30613'];
function scoppio(x, y) {
  preparaTela();
  for (let i = 0; i < 26; i++) {
    const a = rnd(0, 6.283), v = rnd(1.6, 5.2);
    aggiungi({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, vita: 0, durata: rnd(650, 1100), r: rnd(1.6, 3.4), c: COLORI[(Math.random() * COLORI.length) | 0], stella: Math.random() < 0.45, g: 0.09, alone: 8 });
  }
}

function stelline() {
  if (ridotto) return;
  // 7 · al clic su un bottone d'azione parte una pioggia di stelline (il cambio pagina lo fa la tendina rossa, vita.js)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-azione], .btn-azione, a[data-wa]');
    if (!b) return;
    const r = b.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
    scoppio(x, y);
  });
}

// ---------- 6 · la parola firma del titolo nasce dalle stelle ----------
function titoloDalleStelle() {
  const el = document.querySelector('[data-stelle]');
  const fine = () => { html.classList.remove('stelle-titolo'); ss.set('gd-stelle', '1'); };
  if (!el || !html.classList.contains('stelle-titolo') || ridotto) { html.classList.remove('stelle-titolo'); return; }
  setTimeout(fine, 5000); // in ogni caso la parola non resta mai nascosta
  const r = el.getBoundingClientRect();
  if (!r.width || r.bottom < 0 || r.top > innerHeight) { fine(); return; }
  const pad = 24, w = Math.ceil(r.width + pad * 2), h = Math.ceil(r.height + pad * 2), d = Math.min(window.devicePixelRatio || 1, 2);
  const c = document.createElement('canvas');
  c.className = 'stelle-tela';
  c.setAttribute('aria-hidden', 'true');
  Object.assign(c.style, { left: `${r.left + scrollX - pad}px`, top: `${r.top + scrollY - pad}px`, width: `${w}px`, height: `${h}px` });
  c.width = w * d; c.height = h * d;
  document.body.appendChild(c);
  const g = c.getContext('2d');
  g.setTransform(d, 0, 0, d, 0, 0);
  // disegno la parola con lo stesso carattere, poi prendo i pixel pieni come stelle
  const cs = getComputedStyle(el);
  const off = document.createElement('canvas'); off.width = w; off.height = h;
  const o = off.getContext('2d');
  o.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  if ('letterSpacing' in o) o.letterSpacing = cs.letterSpacing;
  const m = o.measureText(el.textContent);
  o.fillStyle = cs.color;
  o.fillText(el.textContent, pad, pad + (m.fontBoundingBoxAscent || r.height * 0.8));
  const px = o.getImageData(0, 0, w, h).data;
  const punti = [];
  const passo = r.height > 70 ? 3 : 2;
  for (let y = 0; y < h; y += passo) for (let x = 0; x < w; x += passo) {
    const i = (y * w + x) * 4;
    if (px[i + 3] > 140) punti.push({ tx: x, ty: y, x: rnd(-w * 0.6, w * 1.6), y: rnd(-h * 1.2, h * 2), col: `rgb(${px[i]},${px[i + 1]},${px[i + 2]})`, r: rnd(0.7, 1.5), ritardo: (x / w) * 0.45 + Math.random() * 0.25 });
  }
  const t0 = performance.now();
  let rivelata = false;
  function anima(ora) {
    const t = (ora - t0) / 1000;
    g.clearRect(0, 0, w, h);
    let tutti = true;
    for (const p of punti) {
      const k = liscia((t - p.ritardo) / 1.1);
      if (k < 1) tutti = false;
      g.globalAlpha = 0.35 + 0.65 * k;
      g.fillStyle = p.col;
      g.beginPath(); g.arc(p.x + (p.tx - p.x) * k, p.y + (p.ty - p.y) * k, p.r, 0, 6.283); g.fill();
    }
    if (tutti && !rivelata) {
      rivelata = true;
      fine(); // la parola vera torna visibile con una dissolvenza, le stelle si spengono
      c.style.transition = 'opacity .8s ease';
      requestAnimationFrame(() => { c.style.opacity = '0'; });
      setTimeout(() => c.remove(), 900);
    }
    if (!rivelata || t < 3) requestAnimationFrame(anima);
  }
  requestAnimationFrame(anima);
}

// ---------- 5 · il percorso: la luce scende con te e accende il capitolo in cui sei ----------
function percorso() {
  const nav = document.querySelector('[data-percorso]');
  if (!nav) return;
  const voci = [...nav.querySelectorAll('[data-capitolo]')];
  const sezioni = voci.map((a) => document.getElementById(a.dataset.capitolo));
  const luce = nav.querySelector('.guida-luce');
  function aggiorna() {
    const y = scrollY + innerHeight * 0.4;
    const tops = sezioni.map((s) => (s ? s.getBoundingClientRect().top + scrollY : 0));
    let i = 0;
    tops.forEach((t, j) => { if (y >= t) i = j; });
    const dopo = tops[i + 1] ?? document.documentElement.scrollHeight;
    const f = Math.min(1, Math.max(0, (y - tops[i]) / Math.max(dopo - tops[i], 1)));
    const quota = Math.min(1, (i + (i < voci.length - 1 ? f : 0)) / (voci.length - 1));
    luce.style.height = `${quota * 100}%`;
    voci.forEach((a, j) => { a.classList.toggle('fatto', j < i); a.classList.toggle('qui', j === i); if (j === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', aggiorna, { passive: true });
  window.addEventListener('resize', aggiorna);
  aggiorna();
}

export function avviaEffetti() {
  stelline();
  percorso();
  // dopo l'ingresso a tenda delle righe del titolo
  setTimeout(titoloDalleStelle, ridotto ? 0 : 1250);
}
