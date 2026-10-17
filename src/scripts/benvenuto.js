// Il benvenuto nell'hero: tre domande saltabili (nome, di cosa ti occupi, colore).
// Ogni risposta cambia subito qualcosa sulla pagina, così il visitatore vede che vale la pena rispondere.
import { lang, leggiProfilo, salvaProfilo, pulisciNome, impostaTema, applicaProfilo, SETTORI, TEMI_SITO } from './profilo.js';

const TESTI = {
  it: {
    piacere: (n) => `Piacere, ${n}. `,
    fatto: (n) => (n ? `Fatto, ${n}. Il sito adesso è un po' più tuo.` : "Fatto. Il sito adesso è un po' più tuo."),
  },
  en: {
    piacere: (n) => `Nice to meet you, ${n}. `,
    fatto: (n) => (n ? `Done, ${n}. This site is now a little more yours.` : 'Done. This site is now a little more yours.'),
  },
}[lang];

const traccia = (e, d) => window.gdTrack?.(e, d);
const ss = { set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} } };

export function avviaBenvenuto(scena) {
  const box = document.querySelector('[data-benvenuto]');
  const html = document.documentElement;
  let p = leggiProfilo();
  applicaProfilo(p);
  if (!box) return;

  const passi = [...box.querySelectorAll('[data-bv-passo]')];
  const puntini = [...box.querySelectorAll('.bv-passi i')];
  const input = box.querySelector('input[name="nome"]');
  const colori = [...box.querySelectorAll('[data-tema-scelta]')];

  function vai(n, focus = true) {
    passi.forEach((el) => { el.hidden = Number(el.dataset.bvPasso) !== n; });
    puntini.forEach((el, i) => { el.classList.toggle('attivo', i + 1 === n); el.classList.toggle('fatto', i + 1 < n); });
    box.classList.toggle('bv-chiuso', n === 4);
    if (n === 2) box.querySelector('[data-bv-saluto]').textContent = p.nome ? TESTI.piacere(p.nome) : '';
    if (n === 3) colori.forEach((c) => c.setAttribute('aria-checked', String(c.dataset.temaScelta === (p.tema || 'blu'))));
    if (n === 4) box.querySelector('[data-bv-fatto]').textContent = TESTI.fatto(p.nome);
    if (focus) {
      const primo = passi[n - 1]?.querySelector('input, button:not([data-bv-salta])');
      setTimeout(() => primo?.focus({ preventScroll: true }), 60);
    }
  }
  const usato = () => ss.set('gd-personalizzato', '1'); // niente finestra d'uscita per chi ha appena personalizzato
  const salva = () => { salvaProfilo(p); applicaProfilo(p); };

  // 1. Il nome
  box.querySelector('[data-bv-passo="1"]').addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = pulisciNome(input.value);
    usato();
    if (nome) {
      const nuovo = nome !== p.nome;
      p.nome = nome; salva();
      if (nuovo) { scena()?.scrivi?.(nome); traccia('personalizza_nome'); }
    }
    vai(2);
  });
  // 2. Di cosa ti occupi
  box.querySelectorAll('[data-settore]').forEach((b) => b.addEventListener('click', () => {
    if (!SETTORI[b.dataset.settore]) return;
    usato();
    p.settore = b.dataset.settore; salva();
    traccia('personalizza_settore', { settore: p.settore });
    vai(3);
  }));
  // 3. Il colore: anteprima passandoci sopra, scelta con il clic
  colori.forEach((c) => {
    c.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') impostaTema(c.dataset.temaScelta); });
    c.addEventListener('focus', () => impostaTema(c.dataset.temaScelta));
    c.addEventListener('click', () => {
      if (!TEMI_SITO.includes(c.dataset.temaScelta)) return;
      usato();
      p.tema = c.dataset.temaScelta; p.fatto = true; salva();
      impostaTema(p.tema);
      traccia('personalizza_colore', { tema: p.tema });
      vai(4);
    });
  });
  box.querySelector('.bv-colori')?.addEventListener('pointerleave', () => impostaTema(p.tema));
  box.querySelector('.bv-colori')?.addEventListener('focusout', (e) => { if (!e.currentTarget.contains(e.relatedTarget)) impostaTema(p.tema); });

  // Salta: passa alla domanda dopo
  box.querySelectorAll('[data-bv-salta]').forEach((b) => b.addEventListener('click', () => {
    const n = Number(b.closest('[data-bv-passo]').dataset.bvPasso);
    if (n === 3) { p.fatto = true; salva(); }
    vai(n + 1);
  }));
  box.querySelector('[data-bv-modifica]').addEventListener('click', () => { if (input) input.value = p.nome || ''; vai(1); });
  box.querySelector('[data-bv-chiudi]').addEventListener('click', () => {
    if (!p.fatto) { p.saltato = true; salvaProfilo(p); }
    box.classList.add('bv-via');
    setTimeout(() => { box.hidden = true; }, 500);
    traccia('personalizza_chiuso');
  });

  // il bottone «Personalizza» dell'header riapre il benvenuto
  function apri() {
    box.hidden = false; box.classList.remove('bv-via');
    if (input) input.value = p.nome || '';
    const top = box.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35;
    if (window.gdLenis) window.gdLenis.scrollTo(Math.max(0, top), { duration: 1 }); else window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    vai(1);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-personalizza]');
    if (!a) return;
    e.preventDefault();
    if (html.classList.contains('menu-aperto')) document.querySelector('[data-menu-toggle]')?.click();
    apri();
  });

  // stato iniziale
  if (location.hash === '#personalizza') { history.replaceState(null, '', location.pathname); apri(); }
  else if (p.fatto) vai(4, false);
  else if (p.saltato) box.hidden = true;
  else vai(1, false);
}
