// «Il tuo nome»: lo chiediamo all'ingresso con un riquadro; il pannellino sotto «Aa» serve a cambiarlo.
// Cambia mentre scrivi: il nome compare nei punti giusti (titolo, finale, messaggi).
import { leggiProfilo, salvaProfilo, pulisciNome, applicaProfilo } from './profilo.js';

const traccia = (e, d) => window.gdTrack?.(e, d);

export function avviaPersonalizza(scena) {
  const html = document.documentElement;
  let p = leggiProfilo();
  applicaProfilo(p);
  const box = document.querySelector('[data-pannello-tema]');
  if (!box) return;

  const input = box.querySelector('[data-pt-nome]');
  const bottoni = [...document.querySelectorAll('[data-personalizza]')];
  let aperto = false, origine = null, nomeScritto = p.nome || '';

  const salva = () => { salvaProfilo(p); applicaProfilo(p); };

  // il pannello si apre sotto il bottone dell'header (su telefono, sotto la barra in alto)
  function posiziona() {
    const b = bottoni.find((x) => x.offsetParent && x.closest('.site-header'));
    const d = b ? `${Math.max(12, Math.min(innerWidth - b.getBoundingClientRect().right - 24, innerWidth - 352))}px` : '12px';
    box.style.setProperty('--pt-destra', d);
  }
  function apri(da) {
    if (html.classList.contains('menu-aperto')) document.querySelector('[data-menu-toggle]')?.click();
    origine = da || null;
    p = leggiProfilo();
    input.value = p.nome || '';
    posiziona();
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('aperto'));
    bottoni.forEach((b) => b.setAttribute('aria-expanded', 'true'));
    aperto = true;
    setTimeout(() => input.focus({ preventScroll: true }), 80);
    traccia('personalizza_aperto');
  }
  function chiudi(rimetti = true) {
    if (!aperto) return;
    aperto = false;
    scriviNome();
    box.classList.remove('aperto');
    bottoni.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    setTimeout(() => { if (!aperto) box.hidden = true; }, 250);
    if (rimetti && origine?.offsetParent) origine.focus({ preventScroll: true });
  }

  // il nome: si vede subito nei titoli; le stelle lo scrivono quando hai finito
  function scriviNome() {
    if (p.nome && p.nome !== nomeScritto) { scena()?.scrivi?.(p.nome); traccia('personalizza_nome'); }
    nomeScritto = p.nome || '';
  }
  input.addEventListener('input', () => {
    p.nome = pulisciNome(input.value);
    p.fatto = true;
    salva();
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); chiudi(); } });
  input.addEventListener('change', scriviNome);

  bottoni.forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    if (aperto) chiudi(); else apri(b);
  }));
  box.querySelector('[data-pt-chiudi]').addEventListener('click', () => chiudi());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aperto) chiudi(); });
  document.addEventListener('pointerdown', (e) => {
    if (aperto && !box.contains(e.target) && !e.target.closest('[data-personalizza]')) chiudi(false);
  });
  window.addEventListener('resize', () => { if (aperto) posiziona(); });

  // alla prima visita chiediamo il nome, una volta sola: poi compare solo nei punti che contano
  const dialogo = document.querySelector('[data-chiedi-nome]');
  let giaChiesto = true;
  try { giaChiesto = !!localStorage.getItem('gd-nome-chiesto'); } catch (_) {}
  if (dialogo?.showModal && !p.nome && !giaChiesto) {
    const campo = dialogo.querySelector('[data-cn-nome]');
    const chiedi = () => setTimeout(() => {
      if (aperto || dialogo.open || html.classList.contains('menu-aperto')) return;
      dialogo.showModal();
      traccia('nome_chiesto');
    }, 700);
    dialogo.addEventListener('close', () => {
      try { localStorage.setItem('gd-nome-chiesto', '1'); } catch (_) {}
      const nome = pulisciNome(campo.value);
      if (dialogo.returnValue !== 'si' || !nome) { traccia('nome_saltato'); return; }
      p = leggiProfilo();
      p.nome = nome;
      p.fatto = true;
      salva();
      traccia('nome_dato');
      // le stelle scrivono il nome appena la scena è pronta
      let prove = 0;
      const scrivi = () => { const s = scena(); if (s?.scrivi) { s.scrivi(nome); nomeScritto = nome; } else if (prove++ < 20) setTimeout(scrivi, 250); };
      scrivi();
    });
    // un clic fuori dal riquadro vale come «preferisco di no»
    dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close('no'); });
    if (html.classList.contains('intro-attiva')) window.addEventListener('gd-intro-fine', chiedi, { once: true }); else chiedi();
  }

  // i vecchi link «#personalizza» aprono il pannello
  if (location.hash === '#personalizza') { history.replaceState(null, '', location.pathname); setTimeout(() => apri(bottoni[0]), 300); }
}
