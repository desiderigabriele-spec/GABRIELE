// Motore delle demo guidate (components/Demo.astro).
// Quando la demo entra nello schermo parte da sola: la tappa in alto si riempie come una storia e poi passa alla
// successiva. Col mouse sopra si ferma; Avanti, Indietro, le tappe, le frecce della tastiera o un clic nel palco
// la mettono in mano a chi guarda. A ogni passo un quadratino rosso porta l'informazione da un programma all'altro.
// Nel palco: data-da/data-fino = in che passi si vede un elemento, data-acceso = in che passi è evidenziato,
// data-attesa = prima i puntini «sta scrivendo», data-ritardo = compare dopo N ms, data-conta = numero che sale.
const ridotto = document.documentElement.classList.contains('ridotto');
const en = document.documentElement.lang === 'en';
const VIAGGIO = 900; // quanto ci mette il quadratino da un programma all'altro

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
const morbido = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const SVG = 'http://www.w3.org/2000/svg';

document.querySelectorAll('[data-demo]').forEach((demo) => {
  const palco = demo.querySelector('.demo-palco');
  const passi = [...demo.querySelectorAll('[data-demo-passo]')];
  const n = passi.length;
  const punti = [...demo.querySelectorAll('[data-demo-punto]')];
  const avanti = demo.querySelector('[data-demo-avanti]');
  const avantiTesto = demo.querySelector('[data-demo-avanti-testo]');
  const indietro = demo.querySelector('[data-demo-indietro]');
  const auto = demo.querySelector('[data-demo-auto]');
  const autoTesto = demo.querySelector('[data-demo-auto-testo]');
  const esito = demo.querySelector('[data-demo-esito]');
  const pannelli = [...palco.querySelectorAll('[data-pannello]')];
  const anelli = [...palco.querySelectorAll('[data-anello]')];
  const fili = palco.querySelector('.dm-fili');
  const pacco = palco.querySelector('.dm-pacco');
  const comparse = [...palco.querySelectorAll('[data-da], [data-fino]')];
  const accesi = [...palco.querySelectorAll('[data-acceso]')].map((el) => [el, passiDi(el.dataset.acceso)]);
  const scelte = [...palco.querySelectorAll('[data-demo-scegli]')];
  const sceltaTesti = [...palco.querySelectorAll('[data-demo-scelta]')];
  // i collegamenti della catena: tutte le coppie da → verso dei passi
  const tratte = passi.map((p) => {
    const da = p.dataset.sorgente;
    const verso = p.dataset.meta || (p.dataset.fuoco || '').split(' ')[0];
    return da && verso && da !== verso ? [da, verso] : null;
  });
  const coppie = [...new Set(tratte.filter(Boolean).map((t) => t.join('>')))].map((s) => s.split('>'));
  let cur = 0;
  let tempi = [];
  const dopo = (ms, f) => tempi.push(window.setTimeout(f, ms));

  // ---------- i fili tra i programmi e il quadratino che viaggia ----------
  // sul computer si attaccano ai riquadri; sul telefono, dove si vede un riquadro alla volta, alla catena di icone
  const visibile = (el) => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0;
  const ancora = (id) => {
    const p = palco.querySelector(`[data-pannello="${id}"]`);
    if (visibile(p) && getComputedStyle(palco.querySelector('.dm-catena')).display === 'none') return p;
    return palco.querySelector(`[data-anello="${id}"]`);
  };
  function percorso(da, verso) {
    const a = ancora(da), b = ancora(verso);
    if (!a || !b) return null;
    const P = palco.getBoundingClientRect(), r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
    const c1 = { x: r1.left + r1.width / 2 - P.left, y: r1.top + r1.height / 2 - P.top };
    const c2 = { x: r2.left + r2.width / 2 - P.left, y: r2.top + r2.height / 2 - P.top };
    const dx = c2.x - c1.x, dy = c2.y - c1.y;
    let p1, p2, t1, t2;
    if (Math.abs(dx) >= Math.abs(dy)) {
      const s = Math.sign(dx) || 1;
      p1 = { x: c1.x + s * r1.width / 2, y: c1.y }; p2 = { x: c2.x - s * r2.width / 2, y: c2.y };
      const k = Math.max(24, Math.abs(p2.x - p1.x) * 0.5);
      t1 = { x: p1.x + s * k, y: p1.y }; t2 = { x: p2.x - s * k, y: p2.y };
    } else {
      const s = Math.sign(dy) || 1;
      p1 = { x: c1.x, y: c1.y + s * r1.height / 2 }; p2 = { x: c2.x, y: c2.y - s * r2.height / 2 };
      const k = Math.max(16, Math.abs(p2.y - p1.y) * 0.5);
      t1 = { x: p1.x, y: p1.y + s * k }; t2 = { x: p2.x, y: p2.y - s * k };
    }
    return `M${p1.x},${p1.y} C${t1.x},${t1.y} ${t2.x},${t2.y} ${p2.x},${p2.y}`;
  }
  let tracciati = new Map();
  function disegnaFili() {
    const P = palco.getBoundingClientRect();
    fili.setAttribute('viewBox', `0 0 ${P.width} ${P.height}`);
    fili.replaceChildren();
    tracciati = new Map();
    coppie.forEach(([da, verso]) => {
      const d = percorso(da, verso);
      if (!d) return;
      const p = document.createElementNS(SVG, 'path');
      p.setAttribute('d', d);
      fili.appendChild(p);
      tracciati.set(`${da}>${verso}`, p);
    });
    accendiFilo();
  }
  function accendiFilo() {
    const t = tratte[cur - 1];
    tracciati.forEach((p, k) => p.classList.toggle('attivo', !!t && k === t.join('>')));
  }
  let viaggio = 0;
  function spedisci(da, verso) {
    cancelAnimationFrame(viaggio);
    const p = tracciati.get(`${da}>${verso}`);
    if (!p || ridotto) { pacco.classList.remove('va'); return; }
    const lungo = p.getTotalLength();
    const t0 = performance.now();
    pacco.classList.add('va');
    const giro = (t) => {
      const k = Math.min(1, (t - t0) / VIAGGIO);
      const pt = p.getPointAtLength(lungo * morbido(k));
      pacco.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
      if (k < 1) viaggio = requestAnimationFrame(giro);
      else {
        pacco.classList.remove('va');
        const arrivo = palco.querySelector(`[data-pannello="${verso}"]`);
        const anello = palco.querySelector(`[data-anello="${verso}"]`);
        [arrivo, anello].forEach((el) => { if (!el) return; el.classList.remove('arriva'); void el.offsetWidth; el.classList.add('arriva'); });
      }
    };
    viaggio = requestAnimationFrame(giro);
  }

  // ---------- un elemento che compare andando avanti: ritardo, poi i puntini «sta scrivendo», poi il contenuto ----------
  function arriva(el, base) {
    const ritardo = base + +(el.dataset.ritardo || 0);
    const attesa = el.hasAttribute('data-attesa');
    if (ritardo) el.classList.add('in-coda');
    dopo(ritardo, () => {
      el.classList.remove('in-coda');
      if (attesa) {
        el.classList.add('scrive');
        scorriChat();
        dopo(750, () => { el.classList.remove('scrive'); conta(el); scorriChat(); });
      } else { conta(el); scorriChat(); }
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
  // le chat scorrono in fondo, come quelle vere
  const scorriChat = () => palco.querySelectorAll('.tel-chat, .chat-corpo').forEach((c) => { c.scrollTop = c.scrollHeight; });
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
    const passo = passi[k - 1];
    const fuoco = (passo.dataset.fuoco || '').split(' ');
    pannelli.forEach((p) => {
      const id = p.dataset.pannello;
      p.classList.toggle('fuoco', fuoco.includes(id));
      p.classList.toggle('qui', id === fuoco[0]);
      p.classList.toggle('fuoco-mobile', id === fuoco[0]);
      if (id === fuoco[0]) p.dataset.tag = String(k).padStart(2, '0'); else delete p.dataset.tag;
    });
    anelli.forEach((a) => a.classList.toggle('qui', a.dataset.anello === fuoco[0]));
    // il quadratino parte, e quello che porta compare quando arriva
    const tratta = tratte[k - 1];
    const base = inAvanti && tratta ? VIAGGIO - 150 : 0;
    accendiFilo();
    if (inAvanti && tratta) spedisci(tratta[0], tratta[1]); else { cancelAnimationFrame(viaggio); pacco.classList.remove('va'); }
    comparse.forEach((el) => {
      const on = k >= +(el.dataset.da || 1) && k <= +(el.dataset.fino || 99);
      const era = el.classList.contains('visto');
      el.classList.toggle('visto', on);
      if (on && !era && inAvanti) arriva(el, base);
      else sistema(el);
    });
    accesi.forEach(([el, quali]) => {
      if (inAvanti && base && quali.has(k) && !quali.has(k - 1)) dopo(base, () => el.classList.add('acceso'));
      else el.classList.toggle('acceso', quali.has(k));
    });
    punti.forEach((p, i) => {
      p.classList.toggle('fatto', i < k - 1);
      p.classList.toggle('qui', i === k - 1);
      p.setAttribute('aria-current', i === k - 1 ? 'step' : 'false');
    });
    // la tappa attiva resta visibile nella fila (sul telefono scorre)
    const fila = punti[0].closest('ol'), tappa = punti[k - 1].parentElement;
    if (fila.scrollWidth > fila.clientWidth + 2) fila.scrollTo({ left: tappa.offsetLeft - (fila.clientWidth - tappa.offsetWidth) / 2, behavior: ridotto ? 'auto' : 'smooth' });
    esito.hidden = k !== n;
    indietro.disabled = k === 1;
    avantiTesto.textContent = k === n ? demo.dataset.ricomincia : demo.dataset.avanti;
    scorriChat();
    trascorso = 0;
    durata = durataDi(passo);
    riempi();
  }

  // ---------- da sola, come le storie ----------
  let suo = !ridotto;  // parte da sola finché chi guarda non prende in mano la demo
  let inVista = false, sopra = false, trascorso = 0, durata = 8000, ultimo = 0, giroAuto = 0;
  const durataDi = (p) => Math.min(11000, Math.max(6500, 3800 + 32 * (p.querySelector('p')?.textContent.length || 120))) + (p.dataset.sorgente ? VIAGGIO : 0);
  const gira = () => suo && inVista && !sopra && !document.hidden;
  function riempi() {
    punti.forEach((p, i) => p.style.setProperty('--p', i < cur - 1 ? 1 : i === cur - 1 ? (suo ? trascorso / durata : 1) : 0));
  }
  function tic(t) {
    const dt = ultimo ? t - ultimo : 0;
    ultimo = t;
    if (!gira()) { giroAuto = 0; ultimo = 0; return; }
    trascorso += dt;
    if (trascorso >= durata) {
      if (cur < n) vai(cur + 1);
      else { suo = false; segna(); riempi(); giroAuto = 0; ultimo = 0; return; }
    }
    riempi();
    giroAuto = requestAnimationFrame(tic);
  }
  function riprendi() { if (gira() && !giroAuto) { ultimo = 0; giroAuto = requestAnimationFrame(tic); } }
  function segna() {
    auto.setAttribute('aria-pressed', String(suo));
    autoTesto.textContent = suo ? demo.dataset.pausa : demo.dataset.play;
    demo.classList.toggle('da-sola', suo);
  }
  function prendi() { suo = false; segna(); riempi(); }

  avanti.addEventListener('click', () => { prendi(); vai(cur === n ? 1 : cur + 1); });
  indietro.addEventListener('click', () => { prendi(); vai(cur - 1, false); });
  auto.addEventListener('click', () => {
    suo = !suo;
    if (suo && cur === n) vai(1, false);
    segna(); riempi(); riprendi();
  });
  punti.forEach((p, i) => p.addEventListener('click', () => { prendi(); vai(i + 1, i + 1 === cur + 1); }));
  palco.querySelectorAll('[data-demo-vai]').forEach((b) => b.addEventListener('click', () => { prendi(); vai(cur + 1); }));
  scelte.forEach((b) => b.addEventListener('click', () => {
    if (b.closest('[data-da]') && cur !== +b.closest('[data-da]').dataset.da) return;
    prendi();
    scegli(b.dataset.demoScegli);
    vai(cur + 1);
  }));
  demo.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (e.target.closest('summary')) return;
    e.preventDefault();
    prendi();
    vai(cur + (e.key === 'ArrowRight' ? 1 : -1), e.key === 'ArrowRight');
  });
  // col mouse sopra si ferma (si legge con calma); toccando il palco sul telefono la si prende in mano
  demo.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { sopra = true; } });
  demo.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { sopra = false; riprendi(); } });
  palco.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') prendi(); });
  document.addEventListener('visibilitychange', riprendi);

  if ('ResizeObserver' in window) new ResizeObserver(() => disegnaFili()).observe(palco);
  else addEventListener('resize', disegnaFili);

  // primo passo subito; quando la demo entra nello schermo il primo messaggio «arriva» davvero e la demo parte
  vai(1, false);
  segna();
  disegnaFili();
  let primaVolta = true;
  new IntersectionObserver((voci) => {
    inVista = voci.some((v) => v.isIntersecting);
    if (inVista && primaVolta) {
      primaVolta = false;
      if (cur === 1) { comparse.forEach((el) => el.classList.remove('visto')); cur = 0; vai(1); }
      disegnaFili();
    }
    riprendi();
  }, { threshold: 0.45 }).observe(demo);
});
