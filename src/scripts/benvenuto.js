// «Il tuo sito»: un pannellino sotto il bottone «Aa», con il nome, chiaro o scuro e il colore d'accento.
// Cambia subito: il nome compare nei titoli e nei messaggi, i colori su tutto il sito (il logo resta rosso).
import { leggiProfilo, salvaProfilo, pulisciNome, applicaProfilo, applicaAspetto, ASPETTI, ACCENTI } from './profilo.js';

const traccia = (e, d) => window.gdTrack?.(e, d);

export function avviaPersonalizza(scena) {
  const html = document.documentElement;
  let p = leggiProfilo();
  applicaProfilo(p);
  applicaAspetto(p);
  const box = document.querySelector('[data-pannello-tema]');
  if (!box) return;

  const input = box.querySelector('[data-pt-nome]');
  const bottoni = [...document.querySelectorAll('[data-personalizza]')];
  const invito = document.querySelector('[data-pt-invito]');
  let aperto = false, origine = null, nomeScritto = p.nome || '';

  const salva = () => { salvaProfilo(p); applicaProfilo(p); };
  const aspetti = [...box.querySelectorAll('[data-aspetto-scelta]')];
  const colori = [...box.querySelectorAll('[data-accento-scelta]')];
  const segna = () => {
    const ora = applicaAspetto(p);
    aspetti.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.aspettoScelta === ora.aspetto)));
    colori.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.accentoScelta === ora.accento)));
  };
  aspetti.forEach((b) => b.addEventListener('click', () => {
    if (!ASPETTI.includes(b.dataset.aspettoScelta)) return;
    p.aspetto = b.dataset.aspettoScelta; p.fatto = true; salvaProfilo(p); segna();
    traccia('personalizza_aspetto', { aspetto: p.aspetto });
  }));
  colori.forEach((b) => b.addEventListener('click', () => {
    if (!ACCENTI.includes(b.dataset.accentoScelta)) return;
    p.accento = b.dataset.accentoScelta; p.fatto = true; salvaProfilo(p); segna();
    traccia('personalizza_colore', { accento: p.accento });
  }));

  // il pannello si apre sotto il bottone dell'header (su telefono, sotto la barra in alto)
  function posiziona() {
    const b = bottoni.find((x) => x.offsetParent && x.closest('.site-header'));
    const d = b ? `${Math.max(12, Math.min(innerWidth - b.getBoundingClientRect().right - 24, innerWidth - 352))}px` : '12px';
    box.style.setProperty('--pt-destra', d);
    if (invito) invito.style.right = d;
  }
  function apri(da) {
    if (html.classList.contains('menu-aperto')) document.querySelector('[data-menu-toggle]')?.click();
    nascondiInvito();
    origine = da || null;
    p = leggiProfilo();
    input.value = p.nome || '';
    segna();
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
  invito?.addEventListener('click', (e) => {
    if (e.target.closest('[data-pt-invito-chiudi]')) { nascondiInvito(); return; }
    apri(bottoni[0]);
  });
  box.querySelector('[data-pt-chiudi]').addEventListener('click', () => chiudi());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aperto) chiudi(); });
  document.addEventListener('pointerdown', (e) => {
    if (aperto && !box.contains(e.target) && !e.target.closest('[data-personalizza]')) chiudi(false);
  });
  window.addEventListener('resize', () => { if (aperto) posiziona(); });

  // alla prima visita un piccolo invito sotto il bottone, una volta sola
  function nascondiInvito() {
    if (!invito || invito.hidden) return;
    invito.classList.remove('visibile');
    setTimeout(() => { invito.hidden = true; }, 400);
    try { localStorage.setItem('gd-invito', '1'); } catch (_) {}
  }
  let giaVisto = true;
  try { giaVisto = !!localStorage.getItem('gd-invito'); } catch (_) {}
  if (invito && !p.fatto && !giaVisto) {
    const mostra = () => setTimeout(() => {
      // non insieme all'avviso della lingua: ci riprova alla prossima visita
      if (aperto || html.classList.contains('menu-aperto') || document.querySelector('[data-avviso-lingua]:not([hidden])')) return;
      posiziona();
      invito.hidden = false;
      requestAnimationFrame(() => invito.classList.add('visibile'));
      setTimeout(nascondiInvito, 9000);
    }, 2600);
    if (html.classList.contains('intro-attiva')) window.addEventListener('gd-intro-fine', mostra, { once: true }); else mostra();
  }

  // i vecchi link «#personalizza» aprono il pannello
  if (location.hash === '#personalizza') { history.replaceState(null, '', location.pathname); setTimeout(() => apri(bottoni[0]), 300); }
}
