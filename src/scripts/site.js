// Comportamenti comuni a tutte le pagine: scroll fluido, animazioni d'ingresso,
// cursore, effetto magnetico, card che si inclinano, header, menu, cookie e scena 3D.
import { avviaIntro } from './intro.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { numero } from '../data/formato.js';
import { avviaPersonalizza } from './benvenuto.js';
import { avviaEffetti } from './effetti.js';
import { avviaVita } from './vita.js';
import { avviaAssistente } from './assistente.js';
import { leggiProfilo, lang } from './profilo.js';

// l'avvio per primo: parte subito, mentre il resto si prepara
avviaIntro();

gsap.registerPlugin(ScrollTrigger);

const html = document.documentElement;
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
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
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
const barra = document.querySelector('[data-barra]');
let ultimo = 0;
function suScroll() {
  const y = window.scrollY;
  if (header) {
    header.classList.toggle('scorre', y > 20);
    // sul telefono, nella home, l'header resta: porta la linea dei capitoli
    const resta = html.classList.contains('con-capitoli') && window.innerWidth <= 900;
    header.classList.toggle('nascosto', y > 400 && y > ultimo && !resta && !html.classList.contains('menu-aperto'));
  }
  if (barra) barra.classList.toggle('visibile', y > window.innerHeight * 0.6);
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
    const aggiorna = () => {
      const y = innerHeight * 0.4;
      let qui = null;
      tutte.forEach(([v, s]) => { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) qui = v; });
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

// ---------- Animazioni d'ingresso ----------
function animaIngressi() {
  if (ridotto) return;
  // titoli divisi in righe: ogni riga sale da sotto una "tenda"
  document.querySelectorAll('[data-righe]').forEach((el) => {
    const righe = el.querySelectorAll('.riga > span');
    gsap.from(righe, {
      yPercent: 115, rotate: 2, duration: 1.1, ease: 'expo.out', stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
  document.querySelectorAll('[data-appare]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: Number(el.dataset.appare) || 0,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
  // gruppi in sequenza (card, passi, prezzi)
  document.querySelectorAll('[data-sequenza]').forEach((g) => {
    // a fine animazione tolgo transform e opacità scritti da GSAP: le card hanno una transizione CSS
    // sul transform (l'inclinazione al passaggio del mouse) che altrimenti le lascia 40px più in basso
    gsap.from(g.children, {
      opacity: 0, y: 40, duration: 1, ease: 'expo.out', stagger: 0.08, clearProps: 'transform,opacity',
      scrollTrigger: { trigger: g, start: 'top 85%', once: true },
    });
  });
}

// ---------- Contatori ----------
const fmt = { format: (n) => numero(n, lang) };
document.querySelectorAll('[data-conta]').forEach((el) => {
  const fine = Number(el.dataset.conta);
  if (ridotto) { el.textContent = fmt.format(fine); return; }
  const o = { v: 0 };
  gsap.to(o, {
    v: fine, duration: 1.6, ease: 'power3.out',
    onUpdate: () => { el.textContent = fmt.format(Math.round(o.v)); },
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
  });
});

// ---------- Sui bottoni d'azione il fuoco dello sfondo si accende (il puntatore resta quello del sistema) ----------
document.addEventListener('pointerover', (e) => {
  if (scena) scena.battito = e.target.closest('[data-azione], .btn-azione') ? 1 : 0;
});

// ---------- Effetto magnetico sui bottoni importanti ----------
if (finePointer && !ridotto) {
  document.querySelectorAll('[data-magnete], .btn-azione').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.28);
      y((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

// ---------- Card: bagliore che segue il mouse + leggera inclinazione ----------
if (finePointer && !ridotto) {
  document.querySelectorAll('.card').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 6}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
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

// ---------- Scena 3D: si carica dopo il testo, solo se serve ----------
let scena = null;
const canvas = document.querySelector('[data-scena]');
// profilo del visitatore (nome e colore) e pannello «Personalizza»
avviaPersonalizza(() => scena);
avviaAssistente();
function caricaScena() {
  if (!canvas || scena) return;
  // se la scena 3D non parte (telefono vecchio, WebGL spento), al suo posto si vede la griglia disegnata
  const senza = () => html.classList.add('scena-no');
  import('./scena.js').then((m) => { scena = m.avviaScena(canvas) || null; if (scena) html.classList.add('scena-on'); else senza(); }).catch(senza);
}

function avvio() {
  animaIngressi();
  avviaEffetti();
  avviaVita();
  ScrollTrigger.refresh();
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

// ==========================================================================
// Il fuoco: i puntini si accendono di rosso sul servizio che guardi, un cuore a chi torna
// ==========================================================================
// un solo colore per tutti i servizi: il rosso del logo
const accento = () => getComputedStyle(html).getPropertyValue('--rosso').trim() || '#e30613';
const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} } };
const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };

// ---------- 1. I puntini prendono il rosso quando guardi un servizio ----------
let tintaTimer = 0;
function tinta(id) {
  clearTimeout(tintaTimer);
  if (scena) scena.tinta = id ? accento() : null;
}
document.querySelectorAll('[data-iride]').forEach((el) => {
  el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') tinta(el.dataset.iride); });
  el.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') tinta(null); });
  el.addEventListener('focus', () => tinta(el.dataset.iride));
  el.addEventListener('blur', () => tinta(null));
  // su touch il colore resta qualche secondo dopo il tocco
  el.addEventListener('touchstart', () => { tinta(el.dataset.iride); tintaTimer = setTimeout(() => tinta(null), 2600); }, { passive: true });
});

// ---------- 3. Chi torna riceve un occhiolino ----------
const RITORNO = {
  it: { bentornato: 'Rieccoti', progetto: "Il tuo progetto è ancora qui, come l'avevi lasciato.", riprendi: 'Riprendi il preventivo' },
  en: { bentornato: 'Welcome back', progetto: 'Your project is still here, just as you left it.', riprendi: 'Resume your quote' },
};
(function bentornato() {
  if (ss.get('gd-sessione') || /^\/(preventivo|en\/quote)/.test(location.pathname)) return; // una volta per visita, non nel preventivo
  ss.set('gd-sessione', '1');
  const ultima = Number(ls.get('gd-ultima') || 0);
  ls.set('gd-ultima', String(Date.now()));
  if (!ultima || Date.now() - ultima < 30 * 60 * 1000) return; // prima visita, o appena uscito
  const box = document.querySelector('[data-ritorno]');
  if (!box) return;
  let progetto = null;
  try { progetto = JSON.parse(ls.get('gd-preventivo') || 'null'); } catch (_) {}
  const t = RITORNO[lang], nome = leggiProfilo().nome;
  if (nome) box.querySelector('[data-ritorno-titolo]').textContent = `${t.bentornato}, ${nome}!`;
  if (progetto && Object.keys(progetto.cat || {}).length) {
    box.querySelector('[data-ritorno-testo]').textContent = t.progetto;
    box.querySelector('[data-ritorno-link]').firstChild.textContent = `${t.riprendi} `;
  }
  const mostra = () => {
    setTimeout(() => {
      scena?.occhiolino?.();
      box.hidden = false;
      requestAnimationFrame(() => box.classList.add('visibile'));
      window.gdTrack('bentornato');
      setTimeout(() => chiudi(), 10000);
    }, 1400);
  };
  const chiudi = () => { box.classList.remove('visibile'); setTimeout(() => { box.hidden = true; }, 600); };
  box.querySelector('[data-ritorno-chiudi]').addEventListener('click', chiudi);
  // aspetta che la scena sia pronta, così l'occhiolino si vede
  const prova = (n = 0) => { if (scena || n > 25) mostra(); else setTimeout(() => prova(n + 1), 200); };
  if (html.classList.contains('intro-attiva')) window.addEventListener('gd-intro-fine', () => prova(), { once: true }); else prova();
})();

// ---------- 4. Lingua: chi ha il browser in un'altra lingua riceve un avviso discreto ----------
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
