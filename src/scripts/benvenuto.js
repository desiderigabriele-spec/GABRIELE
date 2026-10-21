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
  nomeHeader();
  nomeCheSiDecodifica();
  benvenuto(scena);
}

// ---------- il nome nell'header: NO/ME apre un campo piccolo, «Salva» chiama il sito con il tuo nome ----------
function nomeHeader() {
  const bt = document.querySelector('[data-nome-btn]'), pop = document.querySelector('[data-nome-pop]');
  if (!bt || !pop) return;
  const campo = pop.querySelector('input');
  // il campo vive fuori dall'header (che si sposta mentre scorri): si apre sotto al bottone, dentro lo schermo
  document.body.appendChild(pop);
  const metti = () => { const r = bt.getBoundingClientRect(); pop.style.top = `${Math.round(r.bottom + 10)}px`; const largo = Math.min(320, innerWidth - 32); pop.style.right = `${Math.max(16, Math.min(Math.round(innerWidth - r.right), innerWidth - largo - 16))}px`; };
  addEventListener('resize', () => { if (!pop.hidden) metti(); });
  const apri = (si) => {
    if (si) metti();
    pop.hidden = !si; bt.setAttribute('aria-expanded', String(si));
    if (si) { campo.value = leggiProfilo().nome || ''; requestAnimationFrame(() => campo.focus()); }
  };
  bt.addEventListener('click', (e) => { e.stopPropagation(); apri(pop.hidden); });
  pop.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = leggiProfilo(); const prima = q.nome || '';
    q.nome = pulisciNome(campo.value); q.fatto = true;
    salvaProfilo(q); applicaProfilo(q);
    apri(false); bt.focus();
    if (q.nome && q.nome !== prima) { decodificaTutti(); traccia('nome_cambiato'); }
  });
  document.addEventListener('click', (e) => { if (!pop.hidden && !pop.contains(e.target) && e.target !== bt) apri(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !pop.hidden) { apri(false); bt.focus(); } });
}

// ---------- il nome si decodifica: lettere di codice che diventano il tuo nome, come le etichette dei capitoli ----------
const SEGNI = '01<>/{}[]#$%&*+=?;:_';
const ridotto = document.documentElement.classList.contains('ridotto') || matchMedia('(prefers-reduced-motion: reduce)').matches;
function decodifica(el) {
  const nome = leggiProfilo().nome;
  if (!nome || ridotto || el.hasAttribute('data-in-modifica')) return;
  let f = 0;
  clearInterval(el._decodifica);
  el._decodifica = setInterval(() => {
    if (el.hasAttribute('data-in-modifica')) { clearInterval(el._decodifica); return; }
    f++;
    el.textContent = nome.split('').map((ch, k) => (ch === ' ' || f >= k * 2 + 5 ? ch : SEGNI[(k * 7 + f * 3) % SEGNI.length])).join('');
    if (f >= nome.length * 2 + 5) { clearInterval(el._decodifica); el.textContent = nome; }
  }, 42);
}
function decodificaTutti() {
  document.querySelectorAll('[data-nome]').forEach((el) => { const r = el.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) decodifica(el); });
}
function nomeCheSiDecodifica() {
  // ogni nome si decodifica la prima volta che arriva sullo schermo
  const io = new IntersectionObserver((voci) => voci.forEach((v) => { if (v.isIntersecting) { io.unobserve(v.target); decodifica(v.target); } }), { threshold: 0.6 });
  document.querySelectorAll('[data-nome]').forEach((el) => io.observe(el));
}

// ---------- il benvenuto: nome e cookie in un pannellino in basso, una sola conferma ----------
// Il nome si chiede una volta sola, i cookie finché non scegli. «Accetta ed entra» e «Solo necessari»
// «Personalizza» apre le scelte nello stesso riquadro, tutte spente; «Continua senza accettare» rifiuta subito.
// Il consenso non è mai già spuntato.
const CHIAVE_COOKIE = 'gd-cookie';
const CHIAVE_SCELTE = 'gd-cookie-scelte';
const leggiScelte = () => { try { return JSON.parse(localStorage.getItem(CHIAVE_SCELTE) || '{}') || {}; } catch (_) { return {}; } };
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
  const scelte = box.querySelector('[data-bv-scelte]');
  const categorie = [...box.querySelectorAll('[data-bv-cat]:not([disabled])')];
  const si = box.querySelector('[data-bv-si]'), no = box.querySelector('[data-bv-no]'), senza = box.querySelector('[data-bv-senza]');
  const [testoSi, testoAccetta, testoEntra, testoTutti] = JSON.parse(si.dataset.testi);
  const [testoPersonalizza, testoSalva] = JSON.parse(no.dataset.testi);
  let chiediNome = false, chiediCookie = false, personalizzo = false;

  const misura = () => html.style.setProperty('--benvenuto-alto', `${box.offsetHeight}px`);
  if ('ResizeObserver' in window) new ResizeObserver(misura).observe(box);

  // la vista: il testo con «Personalizza | Accetta», oppure le scelte con «Salva le mie scelte | Accetta tutti»
  function vista() {
    parteCookie.hidden = !chiediCookie || personalizzo;
    scelte.hidden = !chiediCookie || !personalizzo;
    no.hidden = !chiediCookie;
    senza.hidden = !chiediCookie;
    no.textContent = personalizzo ? testoSalva : testoPersonalizza;
    si.firstChild.textContent = `${personalizzo ? testoTutti : chiediNome && chiediCookie ? testoSi : chiediCookie ? testoAccetta : testoEntra} `;
    requestAnimationFrame(misura);
  }
  function mostra(nome, cookie) {
    chiediNome = nome; chiediCookie = cookie; personalizzo = false;
    if (!nome && !cookie) return;
    parteNome.hidden = !nome;
    titoloCookie.hidden = nome;
    box.querySelector('[data-bv-nome-resta]').hidden = !nome;
    // le scelte partono sempre spente (o come le avevi lasciate): il consenso si dà solo con un gesto
    const prima = leggiScelte();
    categorie.forEach((c) => { c.checked = !!prima[c.dataset.bvCat]; });
    vista();
    box.hidden = false;
    requestAnimationFrame(() => { box.classList.add('su'); misura(); });
    traccia(nome ? 'nome_chiesto' : 'cookie_chiesti');
  }
  // scelta: { statistica, pubblicita } oppure null se non si chiedevano i cookie
  function chiudi(scelta) {
    if (chiediCookie && scelta) {
      scrivi(CHIAVE_SCELTE, JSON.stringify(scelta));
      scrivi(CHIAVE_COOKIE, scelta.statistica || scelta.pubblicita ? 'si' : 'no');
    }
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
    chiediNome = chiediCookie = personalizzo = false;
  }
  const tutti = () => ({ statistica: true, pubblicita: true });
  const nessuno = () => ({ statistica: false, pubblicita: false });
  const quelliScelti = () => Object.fromEntries(categorie.map((c) => [c.dataset.bvCat, c.checked]));
  // «Accetta» / «Accetta tutti» (anche dalle scelte vale per tutto, come dice il bottone)
  form.addEventListener('submit', (e) => { e.preventDefault(); chiudi(chiediCookie ? tutti() : null); });
  // «Personalizza» apre le scelte; lì diventa «Salva le mie scelte» e salva esattamente quello che è acceso
  no.addEventListener('click', () => {
    if (!personalizzo) { personalizzo = true; vista(); categorie[0]?.focus({ preventScroll: true }); return; }
    chiudi(quelliScelti());
  });
  senza.addEventListener('click', () => chiudi(nessuno()));
  // lo sfondo: gli stessi due stati del bottone nell'header
  const bottoniTema = [...box.querySelectorAll('[data-bv-tema]')];
  const segnaTema = () => bottoniTema.forEach((b) => b.setAttribute('aria-pressed', String((html.dataset.tema === 'chiaro') === (b.dataset.bvTema === 'chiaro'))));
  bottoniTema.forEach((b) => b.addEventListener('click', () => { if ((html.dataset.tema === 'chiaro') !== (b.dataset.bvTema === 'chiaro')) document.querySelector('[data-tema-btn]')?.click(); segnaTema(); }));
  window.addEventListener('gd-tema', segnaTema);
  segnaTema();
  // Invio nel campo chiude solo la tastiera e porta ai bottoni: il consenso si dà sempre con un tocco sul bottone
  campo.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!chiediCookie) { form.requestSubmit(si); return; }
    campo.blur();
    si.focus({ preventScroll: true });
  });
  document.querySelectorAll('[data-cookie-apri]').forEach((b) => b.addEventListener('click', () => { mostra(false, true); personalizzo = true; vista(); }));

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
