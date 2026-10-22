// Effetti di luce sopra la pagina: stelline al clic sui bottoni d'azione
// e il percorso dei capitoli sul bordo sinistro (sul telefono, la linea sotto l'header).
const html = document.documentElement;
const ridotto = html.classList.contains('ridotto');
const rnd = (a, b) => a + Math.random() * (b - a);

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

// i colori del sito: il bianco del testo e il rosso del logo
function scoppio(x, y) {
  preparaTela();
  const cs = getComputedStyle(html);
  const t = cs.getPropertyValue('--latte').trim() || '#ffffff', a = cs.getPropertyValue('--rosso').trim() || '#e30613';
  const COLORI = [t, t, a, a, cs.getPropertyValue('--nebbia').trim() || '#a3a3a3'];
  for (let i = 0; i < 26; i++) {
    const ang = rnd(0, 6.283), v = rnd(1.6, 5.2);
    aggiungi({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - 1.5, vita: 0, durata: rnd(650, 1100), r: rnd(1.6, 3.4), c: COLORI[(Math.random() * COLORI.length) | 0], stella: Math.random() < 0.45, g: 0.09, alone: 8 });
  }
}

function stelline() {
  if (ridotto) return;
  // 7 · al clic su un bottone d'azione parte una pioggia di stelline (il cambio pagina lo fa il salto tra le stelle, vita.js)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-azione], .btn-azione, a[data-wa]');
    if (!b) return;
    const r = b.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
    scoppio(x, y);
  });
}

// ---------- 5 · il percorso: la luce scende con te e accende il capitolo in cui sei ----------
function percorso() {
  const nav = document.querySelector('[data-percorso]');
  if (!nav) return;
  const voci = [...nav.querySelectorAll('[data-capitolo]')];
  const sezioni = voci.map((a) => document.getElementById(a.dataset.capitolo));
  const luce = nav.querySelector('.guida-luce');
  // si riscrive solo quello che cambia: l'altezza della luce, e le voci quando cambia il capitolo
  let altezza = '', capitolo = -1;
  function aggiorna() {
    const y = scrollY + innerHeight * 0.4;
    const tops = sezioni.map((s) => (s ? s.getBoundingClientRect().top + scrollY : 0));
    let i = 0;
    tops.forEach((t, j) => { if (y >= t) i = j; });
    const dopo = tops[i + 1] ?? document.documentElement.scrollHeight;
    const f = Math.min(1, Math.max(0, (y - tops[i]) / Math.max(dopo - tops[i], 1)));
    const quota = Math.min(1, (i + (i < voci.length - 1 ? f : 0)) / (voci.length - 1));
    const h = `${quota * 100}%`;
    if (h !== altezza) { altezza = h; luce.style.height = h; }
    if (i !== capitolo) {
      capitolo = i;
      voci.forEach((a, j) => { a.classList.toggle('fatto', j < i); a.classList.toggle('qui', j === i); if (j === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }
    telefono?.(i, f);
  }
  const telefono = capitoliTelefono(voci);
  window.addEventListener('scroll', aggiorna, { passive: true });
  window.addEventListener('resize', aggiorna);
  aggiorna();
  document.fonts?.ready.then(aggiorna); // con i caratteri caricati le sezioni hanno la misura vera
}

// ---------- 5b · sul telefono: la linea a capitoli sotto l'header e il capitolo in cui sei accanto al logo ----------
// Toccando il capitolo si apre l'indice dei cinque capitoli. Sul computer c'è il percorso a sinistra.
function capitoliTelefono(voci) {
  const header = document.querySelector('[data-header]');
  const bar = header?.querySelector('.header-bar');
  if (!bar) return null;
  const nomi = voci.map((a) => a.textContent.trim());
  const etichetta = html.lang === 'en' ? 'Chapters' : 'Capitoli';
  const qui = html.lang === 'en' ? 'you are here' : 'sei qui';
  html.classList.add('con-capitoli');

  const linea = document.createElement('span');
  linea.className = 'cap-linea';
  linea.setAttribute('aria-hidden', 'true');
  linea.innerHTML = nomi.map(() => '<i></i>').join('');
  header.appendChild(linea);
  const pezzi = [...linea.children];

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cap-attuale';
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-expanded', 'false');
  bar.querySelector('.brand')?.after(btn);

  const indice = document.createElement('div');
  indice.className = 'cap-indice';
  indice.hidden = true;
  indice.setAttribute('role', 'dialog');
  indice.setAttribute('aria-label', etichetta);
  indice.innerHTML = `<div class="cap-velo" data-cap-chiudi></div><nav class="cap-foglio"><span class="mono">${etichetta}</span>${voci.map((a, k) => `<a href="${a.getAttribute('href')}" data-cap-chiudi><b>${String(k + 1).padStart(2, '0')}</b>${a.textContent.trim().replace(/^\d+\s·\s/, '')}<em>${qui}</em></a>`).join('')}</nav>`;
  document.body.appendChild(indice);
  const link = [...indice.querySelectorAll('a')];

  const apri = () => {
    indice.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => indice.classList.add('aperto'));
    link.find((l) => l.classList.contains('qui'))?.focus({ preventScroll: true });
  };
  const chiudi = () => {
    indice.classList.remove('aperto');
    btn.setAttribute('aria-expanded', 'false');
    setTimeout(() => { indice.hidden = true; }, 350);
  };
  btn.addEventListener('click', apri);
  indice.addEventListener('click', (e) => { if (e.target.closest('[data-cap-chiudi]')) chiudi(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !indice.hidden) { chiudi(); btn.focus(); } });

  let ultimo = -1;
  const riempito = pezzi.map(() => '');
  return (i, f) => {
    // il capitolo compare dopo il titolo dell'hero e prende il posto del nome accanto al logo
    html.classList.toggle('cap-su', scrollY > innerHeight * 0.55);
    pezzi.forEach((p, k) => {
      const v = String(k < i ? 1 : k === i ? f.toFixed(3) : 0);
      if (v !== riempito[k]) { riempito[k] = v; p.style.setProperty('--f', v); }
    });
    if (i === ultimo) return;
    ultimo = i;
    btn.innerHTML = `<span class="cap-testo">${nomi[i].replace(/^(\d+)/, '<b>$1</b>')}</span>`;
    btn.setAttribute('aria-label', `${nomi[i]}. ${etichetta}`);
    link.forEach((l, k) => { l.classList.toggle('qui', k === i); if (k === i) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
  };
}

export function avviaEffetti() {
  stelline();
  percorso();
}
