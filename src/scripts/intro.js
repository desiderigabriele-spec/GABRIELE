// Avvio della prima visita: compare il logo; dal suo quadratino rosso nasce il tondino con l'occhio vero di Focus.
// Si sveglia piano, sbatte due volte, si apre del tutto e guarda te con la pupilla che si allarga.
// Poi il logo vola nell'header e il tondino al suo posto in basso a destra, dove resta come Focus.
import { creaOcchio } from './focus-occhio.js';

const html = document.documentElement;
const EASE = 'cubic-bezier(.7,0,.2,1)';
const aspetta = (ms) => new Promise((r) => setTimeout(r, ms));

export function avviaIntro() {
  if (!html.classList.contains('intro-attiva')) return;
  const intro = document.querySelector('.intro');
  const marchio = intro?.querySelector('.intro-marchio');
  const ic = intro?.querySelector('.intro-ic');
  const bolla = intro?.querySelector('.intro-bolla');
  let chiusa = false;
  const fine = (occhio) => {
    if (chiusa) return;
    chiusa = true;
    try { sessionStorage.setItem('gd-intro', '1'); } catch (_) {}
    html.classList.remove('intro-attiva');
    window.dispatchEvent(new CustomEvent('gd-intro-fine', { detail: { occhio } }));
  };
  if (!intro || !marchio || !bolla || html.classList.contains('ridotto') || !intro.animate) { setTimeout(() => fine(false), 200); return; }

  const caricata = new Promise((ok) => {
    if (document.readyState === 'complete') ok();
    else { addEventListener('load', ok, { once: true }); setTimeout(ok, 3200); } // mai bloccare chi ha una connessione lenta
  });

  // l'occhio vive finché c'è l'avvio
  const o = creaOcchio(bolla);
  o.fermaBattiti();
  let ultimo = performance.now(), vivo = true;
  const giro = (t) => { if (!vivo) return; o.passo(t / 1000, Math.min(0.05, (t - ultimo) / 1000)); ultimo = t; requestAnimationFrame(giro); };
  requestAnimationFrame(giro);

  (async () => {
    // 1 · il logo
    await marchio.animate([{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out', fill: 'forwards' }).finished;
    // 2 · il tondino nasce dal quadratino rosso e sale sopra il logo
    const r = ic.getBoundingClientRect();
    const lato = bolla.offsetWidth;
    const cx = r.left + r.width * 0.494, cy = r.top + r.height * 0.813;
    const su = r.height * 0.813 + lato * 0.75;
    bolla.style.left = `${cx - lato / 2}px`;
    bolla.style.top = `${cy - lato / 2}px`;
    await bolla.animate([{ transform: 'translateY(0) scale(0)' }, { transform: `translateY(${-su}px) scale(1)` }], { duration: 440, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'forwards' }).finished;
    // 3 · si sveglia: si apre piano, si richiude, si riapre, sbatte, poi ti guarda con la pupilla grande
    o.apri(true, 0.9); await aspetta(380);
    o.apri(false, 3); await aspetta(160);
    o.apri(true, 1.4); await aspetta(300);
    o.battito(); await aspetta(260);
    o.apri(true, 3); o.guarda(0, 0); o.umore('interessato'); await aspetta(520);
    await caricata;
    // 4 · il tondino va al suo posto di Focus, il logo nell'header, il nero si apre sulla pagina
    const mobile = innerWidth <= 900, bordo = mobile ? 16 : 20;
    const dx = innerWidth - bordo - lato / 2 - cx, dy = innerHeight - bordo - lato / 2 - (cy - su);
    const voli = [bolla.animate([{ transform: `translateY(${-su}px)` }, { transform: `translate(${dx}px, ${dy - su}px)` }], { duration: 650, easing: EASE, fill: 'forwards' }).finished];
    const brand = document.querySelector('.site-header .brand-icona');
    if (brand) {
      const a = brand.getBoundingClientRect(), d = ic.getBoundingClientRect(), m = marchio.getBoundingClientRect(), k = a.height / d.height;
      marchio.style.transformOrigin = `${d.left + d.width / 2 - m.left}px ${d.top + d.height / 2 - m.top}px`;
      voli.push(marchio.animate([
        { transform: 'none', opacity: 1 },
        { transform: `translate(${a.left + a.width / 2 - (d.left + d.width / 2)}px, ${a.top + a.height / 2 - (d.top + d.height / 2)}px) scale(${k})`, opacity: 1, offset: 0.82 },
        { transform: `translate(${a.left + a.width / 2 - (d.left + d.width / 2)}px, ${a.top + a.height / 2 - (d.top + d.height / 2)}px) scale(${k})`, opacity: 0 },
      ], { duration: 650, easing: EASE, fill: 'forwards' }).finished);
    }
    intro.animate([{ backgroundColor: 'rgb(10,10,10)' }, { backgroundColor: 'rgba(10,10,10,0)' }], { duration: 650, easing: 'ease-in', fill: 'forwards' });
    await Promise.all(voli);
    vivo = false;
    fine(true);
  })().catch(() => fine(false));
}
