// Motore delle demo guidate (components/Demo.astro): un passo alla volta, con Avanti/Indietro,
// i puntini, le frecce della tastiera e «Guarda da solo».
// Nel palco: data-da/data-fino = in che passi si vede un elemento, data-acceso = in che passi è evidenziato,
// data-attesa = prima dei puntini «sta scrivendo», data-ritardo = compare dopo N ms, data-conta = numero che sale.
const ridotto = document.documentElement.classList.contains('ridotto');
const en = document.documentElement.lang === 'en';
const PASSO_AUTO = 6500;

const euro = (v) => {
  const cent = Math.round((v % 1) * 100);
  const intero = String(Math.floor(v)).replace(/\B(?=(\d{3})+(?!\d))/g, en ? ',' : '.');
  const s = intero + (cent ? (en ? '.' : ',') + String(cent).padStart(2, '0') : '');
  return en ? `€${s}` : `${s} €`;
};
// "2" → {2}, "3-4" → {3,4}, "1,5" → {1,5}
const passiDi = (s) => {
  const out = new Set();
  s.split(',').forEach((parte) => {
    const [a, b] = parte.split('-').map(Number);
    for (let i = a; i <= (b || a); i++) out.add(i);
  });
  return out;
};

document.querySelectorAll('[data-demo]').forEach((demo) => {
  const passi = [...demo.querySelectorAll('[data-demo-passo]')];
  const n = passi.length;
  const num = demo.querySelector('[data-demo-num]');
  const barra = demo.querySelector('[data-demo-barra]');
  const punti = [...demo.querySelectorAll('[data-demo-punto]')];
  const avanti = demo.querySelector('[data-demo-avanti]');
  const avantiTesto = demo.querySelector('[data-demo-avanti-testo]');
  const indietro = demo.querySelector('[data-demo-indietro]');
  const auto = demo.querySelector('[data-demo-auto]');
  const autoTesto = demo.querySelector('[data-demo-auto-testo]');
  const esito = demo.querySelector('[data-demo-esito]');
  const pannelli = [...demo.querySelectorAll('[data-pannello]')];
  const comparse = [...demo.querySelectorAll('[data-da], [data-fino]')];
  const accesi = [...demo.querySelectorAll('[data-acceso]')].map((el) => [el, passiDi(el.dataset.acceso)]);
  const scelte = [...demo.querySelectorAll('[data-demo-scegli]')];
  const sceltaTesti = [...demo.querySelectorAll('[data-demo-scelta]')];
  let cur = 0;
  let timer = 0;
  let tempi = [];
  const dopo = (ms, f) => tempi.push(window.setTimeout(f, ms));

  // un elemento che compare andando avanti: ritardo, poi i puntini «sta scrivendo», poi il contenuto
  function arriva(el) {
    const ritardo = +(el.dataset.ritardo || 0);
    const attesa = el.hasAttribute('data-attesa');
    if (ritardo) el.classList.add('in-coda');
    dopo(ritardo, () => {
      el.classList.remove('in-coda');
      if (attesa) {
        el.classList.add('scrive');
        dopo(750, () => { el.classList.remove('scrive'); conta(el); });
      } else conta(el);
    });
  }
  function conta(el) {
    el.querySelectorAll('[data-conta]').forEach((c) => {
      const fine = +c.dataset.conta;
      const t0 = performance.now();
      const giro = (t) => {
        const k = Math.min(1, (t - t0) / 1100);
        c.textContent = euro(k < 1 ? Math.round(fine * (1 - Math.pow(1 - k, 3))) : fine);
        if (k < 1) requestAnimationFrame(giro);
      };
      requestAnimationFrame(giro);
    });
  }
  function sistema(el) {
    el.classList.remove('in-coda', 'scrive');
    el.querySelectorAll('[data-conta]').forEach((c) => { c.textContent = euro(+c.dataset.conta); });
  }
  function scegli(valore) {
    scelte.forEach((b) => b.classList.toggle('scelto', b.dataset.demoScegli === valore));
    sceltaTesti.forEach((s) => { s.textContent = valore; });
  }

  function vai(k, anima = true) {
    k = Math.max(1, Math.min(n, k));
    const inAvanti = anima && !ridotto && k === cur + 1;
    tempi.forEach(clearTimeout);
    tempi = [];
    if (scelte.length && !scelte.some((b) => b.classList.contains('scelto')) && k > +scelte[0].closest('[data-da]').dataset.da) {
      scegli((scelte.find((b) => b.hasAttribute('data-predefinito')) || scelte[0]).dataset.demoScegli);
    }
    cur = k;
    demo.dataset.passo = String(k);
    passi.forEach((p, i) => { p.hidden = i !== k - 1; });
    const fuoco = (passi[k - 1].dataset.fuoco || '').split(' ');
    pannelli.forEach((p) => {
      p.classList.toggle('fuoco', fuoco.includes(p.dataset.pannello));
      p.classList.toggle('fuoco-mobile', p.dataset.pannello === fuoco[0]);
    });
    comparse.forEach((el) => {
      const on = k >= +(el.dataset.da || 1) && k <= +(el.dataset.fino || 99);
      const era = el.classList.contains('visto');
      el.classList.toggle('visto', on);
      if (on && !era && inAvanti) arriva(el);
      else sistema(el);
    });
    accesi.forEach(([el, quali]) => el.classList.toggle('acceso', quali.has(k)));
    num.textContent = String(k);
    barra.style.transform = `scaleX(${k / n})`;
    punti.forEach((p, i) => { p.classList.toggle('attivo', i < k); p.setAttribute('aria-current', i === k - 1 ? 'step' : 'false'); });
    esito.hidden = k !== n;
    indietro.disabled = k === 1;
    avantiTesto.textContent = k === n ? demo.dataset.ricomincia : demo.dataset.avanti;
    // le chat scorrono in fondo, come quelle vere
    demo.querySelectorAll('.tel-chat, .chat-corpo').forEach((c) => { c.scrollTop = c.scrollHeight; });
  }

  function ferma() {
    window.clearInterval(timer);
    timer = 0;
    auto.setAttribute('aria-pressed', 'false');
    autoTesto.textContent = demo.dataset.play;
  }
  function parti() {
    if (cur === n) vai(1, false);
    auto.setAttribute('aria-pressed', 'true');
    autoTesto.textContent = demo.dataset.pausa;
    timer = window.setInterval(() => {
      if (cur < n) vai(cur + 1);
      if (cur >= n) ferma();
    }, PASSO_AUTO);
  }

  avanti.addEventListener('click', () => { ferma(); vai(cur === n ? 1 : cur + 1); });
  indietro.addEventListener('click', () => { ferma(); vai(cur - 1, false); });
  auto.addEventListener('click', () => (timer ? ferma() : parti()));
  punti.forEach((p, i) => p.addEventListener('click', () => { ferma(); vai(i + 1, i + 1 === cur + 1); }));
  demo.querySelectorAll('[data-demo-vai]').forEach((b) => b.addEventListener('click', () => { ferma(); vai(cur + 1); }));
  scelte.forEach((b) => b.addEventListener('click', () => {
    if (b.closest('[data-da]') && cur !== +b.closest('[data-da]').dataset.da) return;
    ferma();
    scegli(b.dataset.demoScegli);
    vai(cur + 1);
  }));
  demo.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    ferma();
    vai(cur + (e.key === 'ArrowRight' ? 1 : -1), e.key === 'ArrowRight');
  });

  // primo passo subito; quando la demo entra nello schermo, il primo messaggio «arriva» davvero
  vai(1, false);
  const io = new IntersectionObserver((voci) => {
    if (!voci.some((v) => v.isIntersecting)) return;
    io.disconnect();
    if (cur !== 1) return;
    comparse.forEach((el) => el.classList.remove('visto'));
    cur = 0;
    vai(1);
  }, { threshold: 0.4 });
  io.observe(demo);
});
