// «Il tuo nome»: lo chiediamo all'ingresso con un riquadro, una volta sola. Poi si cambia toccandolo
// dove è scritto (titolo dell'hero, preventivo, finale): si apre la tastiera lì, e mentre scrivi
// il nome cambia in tutti gli altri punti e nei messaggi WhatsApp.
import { leggiProfilo, salvaProfilo, pulisciNome, applicaProfilo, lang } from './profilo.js';

const traccia = (e, d) => window.gdTrack?.(e, d);
const TESTI = {
  it: { cambia: (n) => `Il tuo nome: ${n}. Premi per cambiarlo`, suggerimento: 'Tocca per cambiare il nome' },
  en: { cambia: (n) => `Your name: ${n}. Press to change it`, suggerimento: 'Tap to change your name' },
}[lang];

export function avviaPersonalizza(scena) {
  const html = document.documentElement;
  let p = leggiProfilo();
  applicaProfilo(p);
  nomeModificabile();

  // alla prima visita chiediamo il nome, una volta sola: poi compare solo nei punti che contano
  const dialogo = document.querySelector('[data-chiedi-nome]');
  let giaChiesto = true;
  try { giaChiesto = !!localStorage.getItem('gd-nome-chiesto'); } catch (_) {}
  if (dialogo?.showModal && !p.nome && !giaChiesto) {
    const campo = dialogo.querySelector('[data-cn-nome]');
    const chiedi = () => setTimeout(() => {
      if (dialogo.open || html.classList.contains('menu-aperto')) return;
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
      salvaProfilo(p);
      applicaProfilo(p);
      traccia('nome_dato');
      // le stelle scrivono il nome appena la scena è pronta
      let prove = 0;
      const scrivi = () => { const s = scena(); if (s?.scrivi) s.scrivi(nome); else if (prove++ < 20) setTimeout(scrivi, 250); };
      scrivi();
    });
    // un clic fuori dal riquadro vale come chiudere
    dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close('no'); });
    if (html.classList.contains('intro-attiva')) window.addEventListener('gd-intro-fine', chiedi, { once: true }); else chiedi();
  }
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
