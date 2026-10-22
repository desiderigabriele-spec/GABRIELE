// Comportamenti comuni a tutte le pagine: scroll fluido, animazioni d'ingresso,
// card che si inclinano, header, menu, tema chiaro/scuro e cielo stellato.
import { avviaIntro } from './intro.js';
import Lenis from 'lenis';
import { anima, quandoArriva } from './moto.js';
import { avviaPersonalizza } from './benvenuto.js';
import { avviaEffetti } from './effetti.js';
import { avviaVita } from './vita.js';
import { avviaAssistente } from './assistente.js';
import { leggiProfilo, lang } from './profilo.js';

// l'avvio per primo: parte subito, mentre il resto si prepara
avviaIntro();

const html = document.documentElement;
// il salto tra le stelle: chi arriva da un'altra pagina vede le stelle rallentare (va letto subito, poi la classe sparisce)
const arrivoSalto = html.classList.contains('salto-arrivo');
const ridotto = html.classList.contains('ridotto');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ---------- Tracciamento (parte solo dopo il consenso) ----------
const CHIAVE_COOKIE = 'gd-cookie';
function consenso() { try { return localStorage.getItem(CHIAVE_COOKIE); } catch (_) { return null; } }
window.gdTrack = function (evento, dati = {}) {
  if (consenso() !== 'si') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: evento, ...dati });
};

// ---------- Scroll fluido ----------
let lenis = null;
if (!ridotto) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95, autoRaf: true });
}
window.gdLenis = lenis;

// link interni con scroll morbido
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href*="#"]');
  if (!a) return;
  const url = new URL(a.href, location.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  const dest = document.querySelector(url.hash);
  if (!dest) return;
  e.preventDefault();
  chiudiMenu();
  // sul telefono, nella home, l'header resta sopra: la sezione parte sotto di lui
  const sopra = html.classList.contains('con-capitoli') && window.innerWidth <= 900 ? (header?.offsetHeight ?? 20) : 20;
  if (lenis) lenis.scrollTo(dest, { offset: -sopra }); else window.scrollTo({ top: dest.getBoundingClientRect().top + scrollY - sopra, behavior: ridotto ? 'auto' : 'smooth' });
  history.replaceState(null, '', url.hash);
});

// ---------- Header che si nasconde scendendo e ricompare salendo ----------
const header = document.querySelector('[data-header]');
let ultimo = 0;
function suScroll() {
  const y = window.scrollY;
  if (header) {
    header.classList.toggle('scorre', y > 20);
    // sul telefono, nella home, l'header resta: porta la linea dei capitoli
    const resta = html.classList.contains('con-capitoli') && window.innerWidth <= 900;
    header.classList.toggle('nascosto', y > 400 && y > ultimo && !resta && !html.classList.contains('menu-aperto'));
  }
  ultimo = y;
}
window.addEventListener('scroll', suScroll, { passive: true });
suScroll();

// ---------- Menu a capsula: la luce che scivola, la sezione in vista, il pannello dei servizi ----------
(function navigazione() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  const luce = nav.querySelector('.nav-luce');
  const voci = [...nav.querySelectorAll('.nav-voce')];
  let aperto = false, timer = 0;
  const su = (el) => {
    // sul telefono il menu è nascosto: niente da misurare
    if (!el || !el.offsetParent) { luce.style.opacity = '0'; return; }
    luce.style.width = `${el.offsetWidth}px`;
    luce.style.transform = `translateX(${el.offsetLeft + (el.offsetParent !== nav ? el.offsetParent.offsetLeft : 0)}px)`;
    luce.style.opacity = '1';
  };
  const attiva = () => voci.find((v) => v.classList.contains('attiva'));
  voci.forEach((v) => { v.addEventListener('pointerenter', () => su(v)); v.addEventListener('focus', () => su(v)); });
  nav.addEventListener('pointerleave', () => { if (!aperto) su(attiva()); });
  nav.addEventListener('focusout', (e) => { if (!nav.contains(e.relatedTarget)) su(attiva()); });

  // in home: si accende la voce della sezione che stai guardando
  const sezioni = voci.filter((v) => v.dataset.sezione).map((v) => [v, document.getElementById(v.dataset.sezione)]).filter(([, s]) => s);
  const btnServizi = nav.querySelector('[data-mega-btn]');
  const servizi = document.getElementById('servizi');
  if (sezioni.length || servizi) {
    const tutte = [...sezioni, ...(servizi && btnServizi ? [[btnServizi, servizi]] : [])];
    // la luce si sposta solo quando cambia la sezione (passando col mouse o aprendo il pannello la rimettono a posto loro)
    let prima;
    const aggiorna = () => {
      const y = innerHeight * 0.4;
      let qui = null;
      tutte.forEach(([v, s]) => { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) qui = v; });
      if (qui === prima) return;
      prima = qui;
      voci.forEach((v) => v.classList.toggle('attiva', v === qui));
      if (!nav.matches(':hover') && !aperto) su(qui);
    };
    window.addEventListener('scroll', aggiorna, { passive: true });
    aggiorna();
  } else su(attiva());
  window.addEventListener('resize', () => su(attiva()));
  document.fonts?.ready.then(() => su(attiva()));

  // il pannello dei servizi: si apre passandoci sopra (mouse) o con un clic / Invio
  const mega = nav.querySelector('[data-mega]');
  const pannello = mega?.querySelector('[data-mega-pannello]');
  if (!mega || !pannello) return;
  function apri() {
    clearTimeout(timer);
    if (aperto) return;
    aperto = true;
    pannello.hidden = false;
    requestAnimationFrame(() => pannello.classList.add('aperto'));
    btnServizi.setAttribute('aria-expanded', 'true');
    su(btnServizi);
  }
  function chiudi(subito) {
    clearTimeout(timer);
    const fai = () => {
      if (!aperto) return;
      aperto = false;
      pannello.classList.remove('aperto');
      btnServizi.setAttribute('aria-expanded', 'false');
      setTimeout(() => { if (!aperto) pannello.hidden = true; }, 250);
      if (!nav.matches(':hover')) su(attiva());
    };
    if (subito) fai(); else timer = setTimeout(fai, 180);
  }
  btnServizi.addEventListener('click', () => (aperto ? chiudi(true) : apri()));
  if (finePointer) {
    mega.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { clearTimeout(timer); timer = setTimeout(apri, 90); } });
    mega.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') chiudi(); });
  }
  mega.addEventListener('focusout', (e) => { if (!mega.contains(e.relatedTarget)) chiudi(true); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aperto) { chiudi(true); btnServizi.focus(); } });
  document.addEventListener('pointerdown', (e) => { if (aperto && !mega.contains(e.target)) chiudi(true); });
  pannello.addEventListener('click', (e) => { if (e.target.closest('a')) chiudi(true); });
  window.addEventListener('scroll', () => { if (aperto && window.scrollY > 40) chiudi(true); }, { passive: true });
})();

// ---------- Menu mobile ----------
const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
function chiudiMenu() {
  if (!menu || !menu.classList.contains('aperto')) return;
  menu.classList.remove('aperto');
  menu.setAttribute('inert', '');
  toggle?.setAttribute('aria-expanded', 'false');
  html.classList.remove('menu-aperto');
  lenis?.start();
}
toggle?.addEventListener('click', () => {
  const apri = !menu.classList.contains('aperto');
  if (!apri) return chiudiMenu();
  menu.classList.add('aperto');
  menu.removeAttribute('inert');
  toggle.setAttribute('aria-expanded', 'true');
  html.classList.add('menu-aperto');
  lenis?.stop();
});
menu?.addEventListener('click', (e) => { if (e.target.closest('a')) chiudiMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') chiudiMenu(); });

// ---------- Tra una sezione e l'altra: più aria e una fila di stelle che si accendono una dopo l'altra ----------
// (non tra sezioni dello stesso capitolo, segnate con data-attaccata, né dove c'è già uno stacco come le righe che scorrono)
(function fileDiStelle() {
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((voci) => voci.forEach((v) => v.target.classList.toggle('vista', v.isIntersecting)), { rootMargin: '0px 0px -10% 0px' }) : null;
  document.querySelectorAll('main section.sezione').forEach((sez) => {
    const prima = sez.previousElementSibling;
    if (!prima || !prima.matches('section') || sez.hasAttribute('data-attaccata')) return;
    const fila = document.createElement('div');
    fila.className = 'stelle-fila';
    fila.setAttribute('aria-hidden', 'true');
    fila.innerHTML = Array.from({ length: 56 }, (_, k) => `<i style="--k:${k}"></i>`).join('');
    sez.before(fila);
    if (io) io.observe(fila); else fila.classList.add('vista');
  });
})();

// ---------- Le illustrazioni dei servizi si muovono solo quando si vedono ----------
// (fuori dallo schermo restano in pausa e riprendono da dove erano)
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((voci) => voci.forEach((v) => v.target.classList.toggle('in-vista', v.isIntersecting)));
  document.querySelectorAll('.sv-ill').forEach((el) => io.observe(el));
} else document.querySelectorAll('.sv-ill').forEach((el) => el.classList.add('in-vista'));

// ---------- Animazioni d'ingresso ----------
// le transform scritte come le scriveva GSAP: in 3D mentre si muove, in 2D alla fine
const sposta = (y, fine = false) => (fine ? 'translate(0px, 0px)' : `translate3d(0px, ${y}px, 0px)`);
function animaIngressi() {
  if (ridotto) return;
  // titoli divisi in righe: ogni riga sale da sotto una "tenda"
  document.querySelectorAll('[data-righe]').forEach((el) => {
    const righe = [...el.querySelectorAll('.riga > span')];
    const metti = (r, k, fine) => { r.style.transform = fine ? 'translate(0%, 0%)' : `translate(0%, ${115 * (1 - k)}%) rotate(${2 * (1 - k)}deg)`; };
    righe.forEach((r) => metti(r, 0));
    quandoArriva(el, 0.88, () => righe.forEach((r, i) => anima({ durata: 1.1, ritardo: i * 0.09, passo: (k, fine) => metti(r, k, fine) })));
  });
  document.querySelectorAll('[data-appare]').forEach((el) => {
    quandoArriva(el, 0.9, () => anima({
      durata: 1, ritardo: Number(el.dataset.appare) || 0,
      passo: (k, fine) => { el.style.opacity = String(k); el.style.transform = sposta(28 * (1 - k), fine); },
    }));
  });
  // gruppi in sequenza (card, passi, prezzi)
  document.querySelectorAll('[data-sequenza]').forEach((g) => {
    // a fine animazione tolgo transform e opacità: le card hanno una transizione CSS
    // sul transform (l'inclinazione al passaggio del mouse) che altrimenti le lascia 40px più in basso
    const figli = [...g.children];
    const metti = (f, k) => { f.style.opacity = String(k); f.style.transform = sposta(40 * (1 - k)); };
    // in attesa restano in 2D (come con GSAP): niente livelli grafici in più per le card ferme
    figli.forEach((f) => { f.style.opacity = '0'; f.style.transform = 'translate(0px, 40px)'; });
    quandoArriva(g, 0.85, () => figli.forEach((f, i) => anima({
      durata: 1, ritardo: i * 0.08,
      passo: (k) => metti(f, k),
      fine: () => { f.style.removeProperty('transform'); f.style.removeProperty('opacity'); },
    })));
  });
}

// ---------- Card: bagliore che segue il mouse + leggera inclinazione ----------
if (finePointer && !ridotto) {
  document.querySelectorAll('.card').forEach((el) => {
    // un calcolo per fotogramma, anche con i mouse che mandano più eventi al secondo
    let ultimo = null, id = 0;
    const metti = () => {
      id = 0;
      if (!ultimo) return;
      const r = el.getBoundingClientRect();
      const px = (ultimo.clientX - r.left) / r.width, py = (ultimo.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 6}deg)`;
    };
    el.addEventListener('pointermove', (e) => { ultimo = e; if (!id) id = requestAnimationFrame(metti); });
    el.addEventListener('pointerleave', () => { ultimo = null; cancelAnimationFrame(id); id = 0; el.style.transform = ''; });
  });
}

// ---------- Sfondo chiaro o scuro: il bottone nell'header, la scelta resta per le visite dopo ----------
(function tema() {
  const btn = document.querySelector('[data-tema-btn]');
  if (!btn) return;
  const [vaiChiaro, vaiScuro] = JSON.parse(btn.dataset.testi);
  const etichetta = () => { const chiaro = html.dataset.tema === 'chiaro'; btn.setAttribute('aria-label', chiaro ? vaiScuro : vaiChiaro); btn.title = btn.getAttribute('aria-label'); };
  etichetta();
  btn.addEventListener('click', () => {
    const chiaro = html.dataset.tema !== 'chiaro';
    html.classList.add('tema-cambia');
    if (chiaro) html.dataset.tema = 'chiaro'; else delete html.dataset.tema;
    try { localStorage.setItem('gd-tema', chiaro ? 'chiaro' : 'scuro'); } catch (_) {}
    etichetta();
    window.dispatchEvent(new Event('gd-tema'));
    window.gdTrack?.('tema', { tema: chiaro ? 'chiaro' : 'scuro' });
    setTimeout(() => html.classList.remove('tema-cambia'), 450);
  });
})();

// ---------- Cookie: il consenso si dà nel benvenuto in basso (benvenuto.js) ----------

// ---------- Cielo stellato: si carica dopo il testo (con lo sfondo chiaro è d'inchiostro) ----------
const canvas = document.querySelector('[data-scena]');
// il nome del visitatore (benvenuto e bottone NO/ME) e Focus, l'assistente
avviaPersonalizza();
avviaAssistente();
function caricaScena() {
  if (!canvas) return;
  // se WebGL non c'è il sito resta completo, solo senza stelle
  import('./scena.js').then((m) => m.avviaScena(canvas, { arrivo: arrivoSalto })).catch(() => {});
}

function avvio() {
  animaIngressi();
  avviaEffetti();
  avviaVita();
  if ('requestIdleCallback' in window) requestIdleCallback(caricaScena, { timeout: 800 }); else setTimeout(caricaScena, 200);
}
if (html.classList.contains('intro-attiva')) window.addEventListener('gd-intro-fine', avvio, { once: true });
else avvio();

// tracciamento dei clic sui bottoni di conversione
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="/preventivo"], a[href^="/en/quote"], a[href^="https://wa.me"], a[href^="tel:"], a[href^="mailto:"]');
  if (!a) return;
  const tipo = a.href.includes('wa.me') ? 'whatsapp' : a.href.startsWith('tel:') ? 'telefono' : a.href.startsWith('mailto:') ? 'email' : 'preventivo';
  window.gdTrack('clic_contatto', { tipo, posizione: a.closest('section')?.id || 'header' });
});

// ---------- Chi torna: lo saluta Focus, l'occhio, nella sua nuvoletta ----------
const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} } };
const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };

const RITORNO = {
  it: { bentornato: 'Rieccoti', progetto: 'Il tuo preventivo è ancora qui: lo riprendiamo?', semplice: 'Ti calcolo il prezzo in 2 minuti?' },
  en: { bentornato: 'Welcome back', progetto: 'Your quote is still here: shall we pick it up?', semplice: 'Shall I work out your price in 2 minutes?' },
};
(function bentornato() {
  if (ss.get('gd-sessione') || /^\/(preventivo|en\/quote)/.test(location.pathname)) return; // una volta per visita, non nel preventivo
  ss.set('gd-sessione', '1');
  const ultima = Number(ls.get('gd-ultima') || 0);
  ls.set('gd-ultima', String(Date.now()));
  if (!ultima || Date.now() - ultima < 30 * 60 * 1000) return; // prima visita, o appena uscito
  // non c'è più un riquadro: lo dice Focus, l'occhio, nella sua nuvoletta (assistente.js)
  let progetto = null;
  try { progetto = JSON.parse(ls.get('gd-preventivo') || 'null'); } catch (_) {}
  const t = RITORNO[lang], nome = leggiProfilo().nome;
  const haProgetto = !!(progetto && (progetto.servizio || Object.keys(progetto.cat || {}).length));
  window.gdRitorno = {
    testo: `${nome ? `${t.bentornato}, ${nome}!` : `${t.bentornato}!`} ${haProgetto ? t.progetto : t.semplice}`,
    preventivo: haProgetto,
  };
  window.gdTrack('bentornato');
})();

// ---------- Lingua: chi ha il browser in un'altra lingua riceve un avviso discreto ----------
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-lingua]');
  if (!a) return;
  ls.set('gd-lingua', a.dataset.lingua);
  window.gdTrack('lingua', { lingua: a.dataset.lingua });
});
(function avvisoLingua() {
  const box = document.querySelector('[data-avviso-lingua]');
  if (!box || ls.get('gd-lingua') || ss.get('gd-avviso-lingua')) return;
  const browser = (navigator.languages?.[0] || navigator.language || 'it').toLowerCase();
  const vuoleItaliano = browser.startsWith('it');
  // sulla pagina italiana l'avviso propone l'inglese a chi non ha il browser in italiano, e viceversa
  if ((box.dataset.per === 'en') === vuoleItaliano) return;
  ss.set('gd-avviso-lingua', '1');
  const chiudi = () => { box.classList.remove('visibile'); setTimeout(() => { box.hidden = true; }, 500); };
  box.querySelector('[data-avviso-chiudi]').addEventListener('click', () => { ls.set('gd-lingua', lang); chiudi(); });
  setTimeout(() => {
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('visibile'));
    setTimeout(chiudi, 12000);
  }, html.classList.contains('intro-attiva') ? 3200 : 1500);
})();
