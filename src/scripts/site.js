// Comportamenti comuni a tutte le pagine: scroll fluido, animazioni d'ingresso,
// cursore, effetto magnetico, card che si inclinano, header, menu, cookie e scena 3D.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { numero } from '../data/formato.js';

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
  if (lenis) lenis.scrollTo(dest, { offset: -20 }); else dest.scrollIntoView({ behavior: ridotto ? 'auto' : 'smooth' });
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
    header.classList.toggle('nascosto', y > 400 && y > ultimo && !html.classList.contains('menu-aperto'));
  }
  if (barra) barra.classList.toggle('visibile', y > window.innerHeight * 0.6);
  ultimo = y;
}
window.addEventListener('scroll', suScroll, { passive: true });
suScroll();

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
    gsap.from(g.children, {
      opacity: 0, y: 40, duration: 1, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: g, start: 'top 85%', once: true },
    });
  });
}

// ---------- Contatori ----------
const fmt = { format: numero };
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

// ---------- Cursore ----------
if (finePointer && !ridotto) {
  html.classList.add('cursore-on');
  const c = document.querySelector('.cursore'), p = document.querySelector('.cursore-punto');
  const xc = gsap.quickTo(c, 'x', { duration: 0.45, ease: 'power3' }), yc = gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3' });
  const xp = gsap.quickTo(p, 'x', { duration: 0.08 }), yp = gsap.quickTo(p, 'y', { duration: 0.08 });
  window.addEventListener('pointermove', (e) => { html.classList.add('cursore-mosso'); xc(e.clientX); yc(e.clientY); xp(e.clientX); yp(e.clientY); }, { passive: true });
  document.addEventListener('pointerleave', () => html.classList.remove('cursore-mosso'));
  document.addEventListener('pointerover', (e) => {
    const az = e.target.closest('[data-azione], .btn-azione');
    const link = e.target.closest('a, button, summary, label, input[type="range"]');
    html.classList.toggle('cursore-azione', !!az);
    html.classList.toggle('cursore-sopra', !az && !!link);
    if (scena) scena.battito = az ? 1 : 0;
  });
}

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
  document.querySelectorAll('.lavoro-media').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
      el.style.setProperty('--rx', `${(0.5 - (e.clientY - r.top) / r.height) * 6}deg`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
}

// ---------- Metodo: indice che segue il passo attivo ----------
const indice = document.querySelectorAll('[data-indice] li');
if (indice.length) {
  document.querySelectorAll('[data-passo]').forEach((passo, i) => {
    ScrollTrigger.create({
      trigger: passo, start: 'top 55%', end: 'bottom 55%',
      onToggle: (s) => { if (s.isActive) indice.forEach((li, j) => li.classList.toggle('attivo', j === i)); },
    });
  });
}

// ---------- Cookie ----------
const banner = document.querySelector('[data-cookie]');
function salvaCookie(v) { try { localStorage.setItem(CHIAVE_COOKIE, v); } catch (_) {} banner.hidden = true; }
if (banner) {
  if (!consenso()) setTimeout(() => { banner.hidden = false; }, 2500);
  banner.querySelector('[data-cookie-si]').addEventListener('click', () => salvaCookie('si'));
  banner.querySelector('[data-cookie-no]').addEventListener('click', () => salvaCookie('no'));
  document.querySelector('[data-cookie-apri]')?.addEventListener('click', () => { banner.hidden = false; });
}

// ---------- Scena 3D: si carica dopo il testo, solo se serve ----------
let scena = null;
const canvas = document.querySelector('[data-scena]');
function caricaScena() {
  if (!canvas || scena) return;
  import('./scena.js').then((m) => { scena = m.avviaScena(canvas) || null; if (scena) html.classList.add('scena-on'); }).catch(() => {});
}

function avvio() {
  animaIngressi();
  ScrollTrigger.refresh();
  if ('requestIdleCallback' in window) requestIdleCallback(caricaScena, { timeout: 800 }); else setTimeout(caricaScena, 200);
}
if (html.classList.contains('intro-attiva')) window.addEventListener('gd-intro-fine', avvio, { once: true });
else avvio();

// tracciamento dei clic sui bottoni di conversione
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href="/preventivo"], a[href^="https://wa.me"], a[href^="tel:"], a[href^="mailto:"]');
  if (!a) return;
  const tipo = a.href.includes('wa.me') ? 'whatsapp' : a.href.startsWith('tel:') ? 'telefono' : a.href.startsWith('mailto:') ? 'email' : 'preventivo';
  window.gdTrack('clic_contatto', { tipo, posizione: a.closest('section')?.id || 'header' });
});

// ==========================================================================
// L'occhio: colore dell'iride per servizio, sorpresa all'uscita, occhiolino a chi torna
// ==========================================================================
const COLORI_SERVIZIO = { sito: '#FFB547', ecommerce: '#FF6B8A', software: '#8B6CFF', integrazioni: '#A98BFF', ads: '#5CE1E6', cura: '#4BE3A5' };
const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} } };
const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };

// ---------- 1. L'iride prende il colore del servizio che guardi ----------
let tintaTimer = 0;
function tinta(id) {
  clearTimeout(tintaTimer);
  if (scena) scena.tinta = id ? COLORI_SERVIZIO[id] || null : null;
}
document.querySelectorAll('[data-iride]').forEach((el) => {
  el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') tinta(el.dataset.iride); });
  el.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') tinta(null); });
  el.addEventListener('focus', () => tinta(el.dataset.iride));
  el.addEventListener('blur', () => tinta(null));
  // su touch il colore resta qualche secondo dopo il tocco
  el.addEventListener('touchstart', () => { tinta(el.dataset.iride); tintaTimer = setTimeout(() => tinta(null), 2600); }, { passive: true });
});

// ---------- 2. Sta per andarsene: l'occhio si spalanca e lo ferma ----------
const uscita = document.querySelector('[data-uscita]');
const caricata = Date.now();
let uscitaAperta = false, focusPrima = null;
function apriUscita(motivo) {
  if (!uscita || uscitaAperta || ss.get('gd-uscita') || html.classList.contains('menu-aperto')) return;
  if (Date.now() - caricata < 6000) return; // non disturbare chi è appena arrivato
  uscitaAperta = true;
  ss.set('gd-uscita', '1');
  focusPrima = document.activeElement;
  uscita.hidden = false;
  requestAnimationFrame(() => html.classList.add('uscita-aperta'));
  if (scena) scena.sorpresa = true;
  lenis?.stop();
  setTimeout(() => uscita.querySelector('[data-uscita-si]')?.focus({ preventScroll: true }), 400);
  window.gdTrack('uscita_mostrata', { motivo });
}
function chiudiUscita() {
  if (!uscitaAperta) return;
  uscitaAperta = false;
  html.classList.remove('uscita-aperta');
  if (scena) scena.sorpresa = false;
  lenis?.start();
  setTimeout(() => { uscita.hidden = true; }, 500);
  focusPrima?.focus?.({ preventScroll: true });
}
if (uscita) {
  // desktop: il mouse esce dalla finestra verso l'alto (verso la X o le schede)
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget && e.clientY <= 8) apriUscita('mouse'); });
  // touch: dopo aver letto metà pagina, una risalita veloce verso l'alto
  let yPrima = window.scrollY, tPrima = performance.now(), maxLetto = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY, t = performance.now();
    const doc = document.documentElement.scrollHeight - window.innerHeight;
    maxLetto = Math.max(maxLetto, doc > 0 ? y / doc : 0);
    const v = (y - yPrima) / Math.max(t - tPrima, 1); // px/ms
    if (!finePointer && maxLetto > 0.5 && v < -3.2 && Date.now() - caricata > 20000) apriUscita('risalita');
    yPrima = y; tPrima = t;
  }, { passive: true });
  uscita.querySelector('[data-uscita-chiudi]').addEventListener('click', chiudiUscita);
  uscita.addEventListener('click', (e) => { if (e.target === uscita) chiudiUscita(); });
  uscita.querySelector('[data-uscita-si]').addEventListener('click', () => window.gdTrack('uscita_clic'));
  document.addEventListener('keydown', (e) => {
    if (!uscitaAperta) return;
    if (e.key === 'Escape') chiudiUscita();
    if (e.key === 'Tab') {
      const f = [...uscita.querySelectorAll('a, button')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
}

// ---------- 3. Chi torna riceve un occhiolino ----------
(function bentornato() {
  if (ss.get('gd-sessione') || location.pathname.startsWith('/preventivo')) return; // una volta per visita, non nel preventivo
  ss.set('gd-sessione', '1');
  const ultima = Number(ls.get('gd-ultima') || 0);
  ls.set('gd-ultima', String(Date.now()));
  if (!ultima || Date.now() - ultima < 30 * 60 * 1000) return; // prima visita, o appena uscito
  const box = document.querySelector('[data-ritorno]');
  if (!box) return;
  let progetto = null;
  try { progetto = JSON.parse(ls.get('gd-preventivo') || 'null'); } catch (_) {}
  if (progetto && Object.keys(progetto.cat || {}).length) {
    box.querySelector('[data-ritorno-testo]').textContent = 'Il tuo progetto è ancora qui, come l\'avevi lasciato.';
    box.querySelector('[data-ritorno-link]').firstChild.textContent = 'Riprendi il preventivo ';
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
