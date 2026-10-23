// Motore delle demo video (components/Demo.astro). Tutto dipende dal tempo t: la telecamera, i pezzi che compaiono,
// il quadratino che viaggia. Andare avanti, indietro o fermarsi è solo cambiare t, quindi ogni scena si può rivedere.
// Parte da sola quando la demo è a metà nello schermo; fuori dallo schermo e con la scheda nascosta sta ferma.
// Con «riduci movimento» non parte da sola e la telecamera salta invece di scivolare.
const ridotto = document.documentElement.classList.contains('ridotto') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const en = document.documentElement.lang === 'en';
const MOSSA = 0.9; // quanto ci mette la telecamera a spostarsi
const morbido = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, k) => a + (b - a) * k;
const euro = (v) => {
  const cent = Math.round((v % 1) * 100);
  const intero = String(Math.floor(v)).replace(/\B(?=(\d{3})+(?!\d))/g, en ? ',' : '.');
  const s = intero + (cent ? (en ? '.' : ',') + String(cent).padStart(2, '0') : '');
  return en ? `€${s}` : `${s} €`;
};

document.querySelectorAll('[data-demo]').forEach((player) => {
  const C = JSON.parse(player.querySelector('[data-config]').textContent);
  const FINE = C.fine;
  const SCENE = C.scene.map((s, i) => ({ ...s, b: i < C.scene.length - 1 ? C.scene[i + 1].a : FINE }));
  const ULTIMA = SCENE.length - 1;
  const mondo = player.querySelector('[data-mondo]');
  const pacco = player.querySelector('[data-pacco]');
  const barre = [...player.querySelectorAll('[data-barre] b')];
  const didascalia = player.querySelector('[data-didascalia]');
  const kick = player.querySelector('[data-kick]');
  const frase = player.querySelector('[data-frase]');
  const copertina = player.querySelector('[data-copertina]');
  const bottone = player.parentElement.querySelector('[data-demo-pausa]');
  const fili = Object.fromEntries([...player.querySelectorAll('[data-filo]')].map((p) => [p.dataset.filo, p]));
  const pacchi = C.pacchi.map(([f, a, b]) => ({ p: fili[f], a, b }));
  const cam = C.cam.map(([t, r]) => [t, C.riquadri[r], r === 'tutto']);
  const comparse = [...mondo.querySelectorAll('[data-in]')].map((el) => [el, +el.dataset.in, el.dataset.out ? +el.dataset.out : Infinity]);
  const accesi = [...mondo.querySelectorAll('[data-acc]')].map((el) => [el, +el.dataset.acc, el.dataset.accout ? +el.dataset.accout : Infinity]);
  const numeri = [...mondo.querySelectorAll('[data-conta]')].map((el) => [el, +el.dataset.conta, +el.dataset.ca, +el.dataset.cb]);

  // ---------- la telecamera ----------
  let W = 0, H = 0, largo = false;
  const misura = () => { W = player.clientWidth; H = player.clientHeight; largo = W / H > 1.1; };
  function inquadra([x, y, w, h], tutto) {
    let ax, ay, aw, ah;
    if (tutto) { ax = 0; ay = 0; aw = W; ah = H; }
    else if (largo) { ax = W * 0.37; ay = 40; aw = W * 0.63 - 24; ah = H - 64; }
    else { ax = 14; ay = 46; aw = W - 28; ah = H - 46 - Math.min(150, H * 0.24); }
    let s = Math.min(aw / w, ah / h);
    if (largo) s = Math.min(s, 1.2);
    return [s, ax + aw / 2 - (x + w / 2) * s, ay + ah / 2 - (y + h / 2) * s];
  }
  function telecamera(t) {
    let i = 0;
    while (i < cam.length - 1 && t >= cam[i + 1][0]) i++;
    const [t0, r, tutto] = cam[i];
    const prima = cam[Math.max(0, i - 1)][1];
    const k = i === 0 || ridotto ? 1 : morbido(Math.min(1, Math.max(0, (t - t0) / (i === 1 ? 1.6 : MOSSA))));
    const [s, tx, ty] = inquadra(r.map((v, j) => lerp(prima[j], v, k)), tutto);
    mondo.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
  }

  // ---------- un fotogramma ----------
  let t = 0, va = false, visto = false, tenuto = false, ultimo = 0, scena = -1, giroId = 0;
  function disegna() {
    let i = 0;
    while (i < ULTIMA && t >= SCENE[i + 1].a) i++;
    barre.forEach((b, j) => { const s = SCENE[j]; b.style.transform = `scaleX(${Math.min(1, Math.max(0, (t - s.a) / (s.b - s.a)))})`; });
    if (i !== scena) {
      scena = i;
      kick.textContent = SCENE[i].k; frase.textContent = SCENE[i].f;
      didascalia.classList.remove('entra'); void didascalia.offsetWidth; didascalia.classList.add('entra');
    }
    didascalia.classList.toggle('via', t < 2.9 || i === ULTIMA);
    copertina.style.opacity = t < 2.2 ? 1 : Math.max(0, 1 - (t - 2.2) / 0.6);
    copertina.style.visibility = t > 2.85 ? 'hidden' : 'visible';
    player.classList.toggle('fine', t >= SCENE[ULTIMA].a);
    telecamera(t);
    comparse.forEach(([el, a, b]) => el.classList.toggle('on', t >= a && t < b));
    accesi.forEach(([el, a, b]) => el.classList.toggle('acc', t >= a && t < b));
    numeri.forEach(([el, v, a, b]) => { el.textContent = euro(t >= b ? v : t <= a ? 0 : Math.round(v * morbido((t - a) / (b - a)))); });
    let vola = false;
    pacchi.forEach(({ p, a, b }) => {
      if (t >= a && t <= b && !ridotto) {
        const L = p.getTotalLength();
        const pt = p.getPointAtLength(L * morbido((t - a) / (b - a)));
        pacco.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
        vola = true;
      }
    });
    Object.values(fili).forEach((p) => p.classList.toggle('on', pacchi.some((x) => x.p === p && t >= x.a && t <= x.b + 0.6)));
    pacco.style.opacity = vola ? 1 : 0;
  }
  function segna() {
    bottone.textContent = va ? `❚❚ ${player.dataset.pausa}` : t >= FINE ? `↺ ${player.dataset.ricomincia}` : `▶ ${player.dataset.play}`;
    player.classList.toggle('in-corso', va);
  }
  function giro(ora) {
    const dt = ultimo ? Math.min(0.1, (ora - ultimo) / 1000) : 0;
    ultimo = ora;
    if (!va || !visto || tenuto || document.hidden) { giroId = 0; ultimo = 0; return; }
    t = Math.min(FINE, t + dt);
    if (t >= FINE) { va = false; segna(); }
    disegna();
    giroId = requestAnimationFrame(giro);
  }
  const riprendi = () => { if (!giroId && va && visto && !tenuto) giroId = requestAnimationFrame(giro); };
  const vaiA = (x) => { t = Math.max(0, Math.min(FINE, x)); disegna(); };
  const qui = () => { let i = 0; while (i < ULTIMA && t >= SCENE[i + 1].a) i++; return i; };
  function avanti() { const i = qui(); if (i < ULTIMA) vaiA(SCENE[i + 1].a); va = true; segna(); riprendi(); centra(); }
  function indietro() { const i = qui(); vaiA(t - SCENE[i].a > 1.5 ? SCENE[i].a : SCENE[Math.max(0, i - 1)].a); va = true; segna(); riprendi(); centra(); }
  // sul telefono, quando la si usa, la demo si mette intera nello schermo (sotto l'header)
  function centra() {
    if (window.innerWidth > 900) return;
    const r = player.getBoundingClientRect();
    const sopra = document.querySelector('[data-header]')?.offsetHeight || 0;
    if (r.top >= sopra - 2 && r.bottom <= window.innerHeight + 2) return;
    const y = r.top + window.scrollY - sopra - 8;
    if (window.gdLenis) window.gdLenis.scrollTo(y, { duration: 0.6 }); else window.scrollTo({ top: y, behavior: ridotto ? 'auto' : 'smooth' });
  }

  // ---------- i comandi: tocco a destra avanti, a sinistra indietro, tenendo premuto si ferma ----------
  let timer = 0, giu = null;
  player.addEventListener('pointerdown', (e) => {
    if (e.button > 0 || e.target.closest('a, button')) return;
    giu = e.clientX;
    timer = setTimeout(() => { tenuto = true; player.classList.add('fermo'); }, 230);
  });
  const su = (annulla) => {
    clearTimeout(timer);
    if (tenuto) { tenuto = false; player.classList.remove('fermo'); giu = null; riprendi(); return; }
    if (giu === null || annulla) { giu = null; return; }
    const r = player.getBoundingClientRect();
    const sinistra = giu - r.left < r.width / 3;
    giu = null;
    if (player.classList.contains('fine') && !sinistra) return;
    sinistra ? indietro() : avanti();
  };
  player.addEventListener('pointerup', () => su(false));
  player.addEventListener('pointercancel', () => su(true));
  player.addEventListener('contextmenu', (e) => e.preventDefault());
  player.addEventListener('keydown', (e) => {
    if (e.target.closest('a, button')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); avanti(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); indietro(); }
    if (e.key === ' ') { e.preventDefault(); bottone.click(); }
  });
  bottone.addEventListener('click', () => { if (t >= FINE) { vaiA(0); va = true; } else va = !va; segna(); riprendi(); });
  player.querySelector('[data-rivedi]').addEventListener('click', () => { vaiA(0); va = true; segna(); riprendi(); });
  document.addEventListener('visibilitychange', riprendi);

  if ('ResizeObserver' in window) new ResizeObserver(() => { misura(); disegna(); }).observe(player);
  let primaVolta = true;
  new IntersectionObserver(([v]) => {
    visto = v.isIntersecting;
    if (visto && primaVolta && !ridotto) { primaVolta = false; va = true; segna(); }
    riprendi();
  }, { threshold: 0.5 }).observe(player);
  misura();
  if (ridotto) t = SCENE[0].a + 3;
  disegna(); segna();
});
