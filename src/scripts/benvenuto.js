// «Il tuo nome»: lo chiediamo all'ingresso nel pannellino del benvenuto in basso, una volta sola, insieme ai cookie. Poi si cambia toccandolo
// dove è scritto (titolo dell'hero, preventivo, finale): si apre la tastiera lì, e mentre scrivi
// il nome cambia in tutti gli altri punti e nei messaggi WhatsApp.
import { leggiProfilo, salvaProfilo, pulisciNome, applicaProfilo, lang } from './profilo.js';

const traccia = (e, d) => window.gdTrack?.(e, d);
const TESTI = {
  it: { cambia: (n) => `Il tuo nome: ${n}. Premi per cambiarlo`, suggerimento: 'Tocca per cambiare il nome' },
  en: { cambia: (n) => `Your name: ${n}. Press to change it`, suggerimento: 'Tap to change your name' },
}[lang];

export function avviaPersonalizza(scena) {
  applicaProfilo(leggiProfilo());
  nomeModificabile();
  benvenuto(scena);
}

// ---------- il benvenuto: nome e cookie in un pannellino in basso, una sola conferma ----------
// Il nome si chiede una volta sola, i cookie finché non scegli. «Accetta ed entra» e «Solo necessari»
// hanno lo stesso peso. Il consenso non è mai già spuntato.
const CHIAVE_COOKIE = 'gd-cookie';
const leggi = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
const scrivi = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };

function benvenuto(scena) {
  const html = document.documentElement;
  const box = document.querySelector('[data-benvenuto]');
  if (!box) return;
  const form = box.querySelector('[data-bv-form]');
  const campo = box.querySelector('[data-bv-nome]');
  const parteNome = box.querySelector('[data-bv-nome-parte]');
  const parteCookie = box.querySelector('[data-bv-cookie-parte]');
  const titoloCookie = box.querySelector('[data-bv-cookie-titolo]');
  const si = box.querySelector('[data-bv-si]'), no = box.querySelector('[data-bv-no]');
  const [testoSi, testoAccetta, testoEntra] = JSON.parse(si.dataset.testi);
  let chiediNome = false, chiediCookie = false;

  const misura = () => html.style.setProperty('--benvenuto-alto', `${box.offsetHeight}px`);
  if ('ResizeObserver' in window) new ResizeObserver(misura).observe(box);

  function mostra(nome, cookie) {
    chiediNome = nome; chiediCookie = cookie;
    if (!nome && !cookie) return;
    parteNome.hidden = !nome;
    parteCookie.hidden = !cookie;
    titoloCookie.hidden = nome;
    box.querySelector('[data-bv-nome-resta]').hidden = !nome;
    no.hidden = !cookie;
    si.firstChild.textContent = `${nome && cookie ? testoSi : cookie ? testoAccetta : testoEntra} `;
    box.hidden = false;
    requestAnimationFrame(() => { box.classList.add('su'); misura(); });
    traccia(nome ? 'nome_chiesto' : 'cookie_chiesti');
  }
  function chiudi(sceltaCookie) {
    if (chiediCookie && sceltaCookie) scrivi(CHIAVE_COOKIE, sceltaCookie);
    if (chiediNome) {
      scrivi('gd-nome-chiesto', '1');
      const nome = pulisciNome(campo.value);
      if (nome) {
        const p = leggiProfilo();
        p.nome = nome; p.fatto = true;
        salvaProfilo(p); applicaProfilo(p);
        traccia('nome_dato');
        // le stelle scrivono il nome appena la scena è pronta
        let prove = 0;
        const scriviStelle = () => { const sc = scena(); if (sc?.scrivi) sc.scrivi(nome); else if (prove++ < 20) setTimeout(scriviStelle, 250); };
        scriviStelle();
      } else traccia('nome_saltato');
    }
    box.classList.remove('su');
    setTimeout(() => { box.hidden = true; html.style.setProperty('--benvenuto-alto', '0px'); }, 350);
    chiediNome = chiediCookie = false;
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    chiudi(e.submitter === no ? 'no' : 'si');
  });
  // Invio nel campo chiude solo la tastiera e porta ai bottoni: il consenso si dà sempre con un tocco sul bottone
  campo.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!chiediCookie) { form.requestSubmit(si); return; }
    campo.blur();
    si.focus({ preventScroll: true });
  });
  document.querySelectorAll('[data-cookie-apri]').forEach((b) => b.addEventListener('click', () => mostra(false, true)));

  const p = leggiProfilo();
  const serveNome = !p.nome && !leggi('gd-nome-chiesto');
  const serveCookie = !leggi(CHIAVE_COOKIE);
  if (!serveNome && !serveCookie) return;
  const vai = () => setTimeout(() => {
    if (html.classList.contains('menu-aperto')) return setTimeout(vai, 1500);
    mostra(serveNome, serveCookie);
  }, 900);
  if (html.classList.contains('intro-attiva')) window.addEventListener('gd-intro-fine', vai, { once: true }); else setTimeout(vai, 1600);
}

// ---------- il nome si cambia dove è scritto ----------
function nomeModificabile() {
  const etichetta = (el) => { el.setAttribute('aria-label', TESTI.cambia(el.textContent)); el.title = TESTI.suggerimento; };
  document.querySelectorAll('[data-nome]').forEach((el) => {
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.classList.add('nome-tocca');
    etichetta(el);
    el.addEventListener('click', inizia);
    el.addEventListener('keydown', (e) => { if (!el.isContentEditable && (e.key === 'Enter' || e.key === ' ')) inizia(e); });
  });

  function inizia(e) {
    const el = e.currentTarget;
    if (el.isContentEditable) return;
    e.preventDefault();
    e.stopPropagation();
    const prima = el.textContent;
    el.dataset.inModifica = '';
    el.removeAttribute('role');
    el.setAttribute('role', 'textbox');
    el.setAttribute('aria-label', TESTI.suggerimento);
    el.contentEditable = 'plaintext-only';
    if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true';
    el.spellcheck = false;
    el.setAttribute('autocapitalize', 'words');
    el.setAttribute('enterkeyhint', 'done');
    el.classList.add('nome-modifica');
    el.focus();
    // seleziona tutto: scrivendo si sostituisce il nome
    const r = document.createRange(); r.selectNodeContents(el);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);

    const aggiorna = () => {
      if (el.textContent.length > 24) { el.textContent = el.textContent.slice(0, 24); const c = document.createRange(); c.selectNodeContents(el); c.collapse(false); s.removeAllRanges(); s.addRange(c); }
      const q = leggiProfilo();
      q.nome = pulisciNome(el.textContent);
      q.fatto = true;
      salvaProfilo(q);
      applicaProfilo(q); // cambia il nome in tutti gli altri punti (questo resta com'è mentre scrivi)
    };
    const fine = (annulla) => {
      el.removeEventListener('input', aggiorna);
      el.removeEventListener('keydown', tasti);
      el.removeEventListener('blur', sfuoca);
      if (annulla) el.textContent = prima;
      const q = leggiProfilo();
      q.nome = pulisciNome(el.textContent);
      salvaProfilo(q);
      el.contentEditable = 'false';
      el.removeAttribute('contenteditable');
      el.classList.remove('nome-modifica');
      delete el.dataset.inModifica;
      el.setAttribute('role', 'button');
      applicaProfilo(q);
      document.querySelectorAll('[data-nome]').forEach(etichetta);
      if (q.nome !== prima) traccia('nome_cambiato');
    };
    const tasti = (k) => {
      if (k.key === 'Enter') { k.preventDefault(); el.blur(); }
      if (k.key === 'Escape') { k.preventDefault(); fine(true); }
    };
    const sfuoca = () => fine(false);
    el.addEventListener('input', aggiorna);
    el.addEventListener('keydown', tasti);
    el.addEventListener('blur', sfuoca);
  }
}
