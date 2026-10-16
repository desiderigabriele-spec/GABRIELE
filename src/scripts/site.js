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
