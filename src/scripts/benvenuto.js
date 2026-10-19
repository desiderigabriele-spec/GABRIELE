// «Personalizza»: un pannellino sotto il bottone dei colori, con il nome e il colore.
// Tutto cambia mentre scegli: il nome compare nei titoli, il colore su tutto il sito.
import { leggiProfilo, salvaProfilo, pulisciNome, impostaTema, applicaProfilo, TEMI_SITO } from './profilo.js';

const traccia = (e, d) => window.gdTrack?.(e, d);

export function avviaPersonalizza(scena) {
  const html = document.documentElement;
  let p = leggiProfilo();
  applicaProfilo(p);
  const box = document.querySelector('[data-pannello-tema]');
  if (!box) return;

  const input = box.querySelector('[data-pt-nome]');
  const colori = [...box.querySelectorAll('[data-tema-scelta]')];
  const bottoni = [...document.querySelectorAll('[data-personalizza]')];
  const invito = document.querySelector('[data-pt-invito]');
  let aperto = false, origine = null, nomeScritto = p.nome || '';

  const salva = () => { salvaProfilo(p); applicaProfilo(p); };
  const segnaColore = () => colori.forEach((c) => c.setAttribute('aria-checked', String(c.dataset.temaScelta === (p.tema || 'blu'))));

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
    segnaColore();
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
    impostaTema(p.tema);
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

  // il colore: anteprima passandoci sopra, scelta con il clic
  colori.forEach((c) => {
    c.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') impostaTema(c.dataset.temaScelta); });
    c.addEventListener('focus', () => impostaTema(c.dataset.temaScelta));
    c.addEventListener('click', () => {
      if (!TEMI_SITO.includes(c.dataset.temaScelta)) return;
      p.tema = c.dataset.temaScelta; p.fatto = true; salva();
      impostaTema(p.tema); segnaColore();
      traccia('personalizza_colore', { tema: p.tema });
    });
  });
  const gruppo = box.querySelector('.pt-colori');
  gruppo.addEventListener('pointerleave', () => impostaTema(p.tema));
  gruppo.addEventListener('focusout', (e) => { if (!gruppo.contains(e.relatedTarget)) impostaTema(p.tema); });

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
