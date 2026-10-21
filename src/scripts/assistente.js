// Focus, l'assistente: il tondino in basso a destra. Spunta dopo qualche secondo, l'occhio si apre e guarda
// il bottone del preventivo; una nuvoletta, una volta per visita. Aperto, è una chat a bottoni: prezzi veri,
// preventivo già compilato, WhatsApp con il riassunto. Le domande scritte vanno a Gabriele su WhatsApp.
import { creaOcchio } from './focus-occhio.js';
import { leggiProfilo } from './profilo.js';

const html = document.documentElement;
const traccia = (e, d) => window.gdTrack?.(e, d);
const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} } };
const saluta = html.lang === 'en' ? 'Hi' : 'Ciao';
const pulisci = (t) => String(t).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

export function avviaAssistente() {
  const box = document.querySelector('[data-focus]');
  const datiEl = document.getElementById('focus-dati');
  if (!box || !datiEl) return;
  const D = JSON.parse(datiEl.textContent);
  const T = D.testi;
  const ridotto = html.classList.contains('ridotto');
  const bolla = box.querySelector('[data-focus-bolla]');
  const pannello = box.querySelector('[data-focus-pannello]');
  const msg = box.querySelector('[data-focus-msg]');
  const scelte = box.querySelector('[data-focus-scelte]');
  const form = box.querySelector('[data-focus-form]');
  const campo = form.querySelector('input');
  const linkPv = box.querySelector('[data-focus-pv]');
  const linkWa = box.querySelector('[data-focus-wa]');
  const fumetto = box.querySelector('[data-focus-fumetto]');
  const mobile = () => window.matchMedia('(max-width: 900px)').matches;
  const nome = () => leggiProfilo().nome || '';
  const scelto = { servizio: null, quando: null, domanda: null };
  let aperta = false, occhio = null, occhioTesta = null, visibile = false;

  // ---------- WhatsApp e preventivo seguono quello che hai detto ----------
  function testoWa() {
    const n = nome();
    const parti = [n ? T.waSaluto.replace('{n}', n) : T.waSalutoSenzaNome];
    if (scelto.domanda) parti.push(T.waDomanda.replace('{q}', scelto.domanda));
    else if (scelto.servizio) parti.push(T.waServizio.replace('{s}', T.nomi[scelto.servizio] || scelto.servizio) + (scelto.quando ? `, ${scelto.quando.toLocaleLowerCase()}.` : '.'));
    else parti.push(T.waGenerico);
    parti.push(T.waFine);
    return parti.join(' ');
  }
  const urlWa = () => `https://wa.me/${D.wa}?text=${encodeURIComponent(testoWa())}`;
  const urlPv = () => (scelto.servizio ? `${D.preventivo}?s=${scelto.servizio}` : D.preventivo);
  const aggiornaLink = () => { linkWa.href = urlWa(); linkPv.href = urlPv(); };

  // ---------- i messaggi ----------
  const aggiungi = (chi, contenuto) => {
    const m = document.createElement('div');
    m.className = `fm fm-${chi}`;
    m.innerHTML = contenuto;
    msg.appendChild(m);
    msg.scrollTop = msg.scrollHeight;
    return m;
  };
  const bottoni = (lista) => {
    scelte.innerHTML = '';
    lista.forEach(([testo, azione, stile]) => {
      const b = document.createElement(typeof azione === 'string' ? 'a' : 'button');
      b.textContent = testo;
      if (stile) b.className = stile;
      if (typeof azione === 'string') { b.href = azione; if (azione.startsWith('https://wa.me')) { b.target = '_blank'; b.rel = 'noopener'; } b.addEventListener('click', () => traccia('focus_link', { dove: stile || 'link' })); }
      else { b.type = 'button'; b.addEventListener('click', () => { aggiungi('tu', pulisci(testo)); azione(); }); }
      scelte.appendChild(b);
    });
    requestAnimationFrame(() => { msg.scrollTop = msg.scrollHeight; });
  };
  const umore = (u) => { occhio?.umore(u); occhioTesta?.umore(u); };
  async function rispondi(contenuto, poi) {
    scelte.innerHTML = '';
    umore('pensa');
    const s = aggiungi('lui fm-scrive', '<i></i><i></i><i></i>');
    await new Promise((r) => setTimeout(r, ridotto ? 0 : 750));
    s.remove();
    umore('risponde');
    aggiungi('lui', contenuto);
    setTimeout(() => umore('riposo'), 900);
    aggiornaLink();
    if (poi) bottoni(poi);
  }

  // ---------- il percorso ----------
  const iniziali = () => [
    [T.quanto, prezzi],
    [T.vogliPreventivo, preventivo],
    [T.cosaAi, ai],
    [T.persona, whatsapp],
  ];
  function prezzi() {
    const righe = D.servizi.map((s) => `<a class="fm-riga" href="${s.url}"><span>${pulisci(s.titolo)}</span><b>${pulisci(s.da)}</b></a>`).join('');
    rispondi(`${T.prezzi}<span class="fm-prezzi">${righe}</span>${T.prezziDopo}`, [[T.calcolaMio, preventivo, 'forte'], [T.scrivoWa, whatsapp, 'wa']]);
  }
  function preventivo() {
    rispondi(T.diCosa, D.servizi.map((s) => [s.titolo, () => servizio(s.id)]));
  }
  function servizio(id) {
    scelto.servizio = id; scelto.domanda = null;
    rispondi(T.perQuando, [[T.entroMese, () => quando(T.entroMese)], [T.dueTre, () => quando(T.dueTre)], [T.valuto, () => quando(T.valuto)]]);
  }
  function quando(q) {
    scelto.quando = q;
    const s = D.servizi.find((x) => x.id === scelto.servizio);
    aggiornaLink();
    rispondi(T.riepilogo.replace('{n}', pulisci(T.nomi[s.id] || s.titolo)).replace('{s}', pulisci(s.titolo)).replace('{p}', pulisci(s.da)), [[T.apriPreventivo, urlPv(), 'forte'], [T.mandaWa, urlWa(), 'wa']]);
    traccia('focus_preventivo', { servizio: scelto.servizio });
  }
  function ai() {
    rispondi(T.ai, [[T.miInteressa, () => servizio('software'), 'forte'], [T.leggiAi, D.ai], [T.persona, whatsapp, 'wa']]);
  }
  function whatsapp() {
    aggiornaLink();
    rispondi(`${T.passoGabriele}<span class="fm-wa">${pulisci(testoWa())}</span>`, [[T.apriWa, urlWa(), 'wa'], [T.torna, () => rispondi(T.tornaTesto, iniziali())]]);
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = campo.value.trim().slice(0, 300);
    if (!q) return;
    aggiungi('tu', pulisci(q));
    campo.value = '';
    scelto.domanda = q;
    aggiornaLink();
    rispondi(`${T.libera}<span class="fm-wa">${pulisci(testoWa())}</span>`, [[T.apriWa, urlWa(), 'wa'], [T.torna, () => { scelto.domanda = null; rispondi(T.tornaTesto, iniziali()); }]]);
    traccia('focus_domanda');
  });
  campo.addEventListener('input', () => umore(campo.value ? 'ascolta' : 'riposo'));

  // ---------- aprire e chiudere ----------
  function apri() {
    if (aperta) return;
    aperta = true;
    pannello.hidden = false;
    requestAnimationFrame(() => box.classList.add('aperta'));
    bolla.setAttribute('aria-expanded', 'true');
    bolla.setAttribute('aria-label', T.chiudi);
    nascondiFumetto(true);
    if (!occhioTesta) { occhioTesta = creaOcchio(box.querySelector('[data-focus-occhio-testa]')); occhioTesta.apre = 1; }
    if (!msg.childElementCount) {
      const n = nome();
      rispondi(n ? `${saluta} ${pulisci(n)}, ${T.ciao}` : T.ciaoSenzaNome, iniziali());
    }
    aggiornaLink();
    if (!mobile()) setTimeout(() => campo.focus({ preventScroll: true }), 200);
    traccia('focus_aperto');
  }
  function chiudi(rimetti = true) {
    if (!aperta) return;
    aperta = false;
    box.classList.remove('aperta');
    bolla.setAttribute('aria-expanded', 'false');
    bolla.setAttribute('aria-label', T.apri);
    setTimeout(() => { if (!aperta) pannello.hidden = true; }, 250);
    if (rimetti) bolla.focus({ preventScroll: true });
  }
  bolla.addEventListener('click', () => (aperta ? chiudi() : apri()));
  box.querySelector('[data-focus-chiudi]').addEventListener('click', () => chiudi());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aperta) chiudi(); });
  document.addEventListener('pointerdown', (e) => { if (aperta && !mobile() && !box.contains(e.target)) chiudi(false); });

  // ---------- la nuvoletta: una volta per visita ----------
  function nascondiFumetto(segna) {
    fumetto.classList.remove('su');
    setTimeout(() => { fumetto.hidden = true; }, 350);
    if (segna) ss.set('gd-focus-fumetto', '1');
  }
  function mostraFumetto() {
    // chi torna dopo un po': la nuvoletta dice bentornato e, se c'è, il preventivo lasciato a metà
    const ritorno = window.gdRitorno;
    if (ritorno && !aperta && !/preventivo|quote/.test(location.pathname)) {
      window.gdRitorno = null;
      const b = fumetto.querySelector('[data-focus-fumetto-apri]');
      b.textContent = ritorno.testo;
      b.dataset.ritorno = ritorno.preventivo ? '1' : '';
      fumetto.hidden = false;
      requestAnimationFrame(() => fumetto.classList.add('su'));
      ss.set('gd-focus-fumetto', '1');
      setTimeout(() => nascondiFumetto(false), 9000);
      return;
    }
    if (aperta || ss.get('gd-focus-fumetto') || /preventivo|quote/.test(location.pathname)) return;
    // non sopra il bottone dell'hero: aspetta che la prima schermata sia passata
    if (window.scrollY < innerHeight * 0.8) {
      const dopo = () => { if (window.scrollY >= innerHeight * 0.8) { removeEventListener('scroll', dopo); setTimeout(mostraFumetto, 1200); } };
      addEventListener('scroll', dopo, { passive: true });
      return;
    }
    const n = nome();
    // la frase della sezione che hai davanti, col nome davanti se c'è
    const riga = innerHeight * 0.45;
    const qui = [...document.querySelectorAll('main section[id]')].find((x) => { const r = x.getBoundingClientRect(); return r.top <= riga && r.bottom > riga; });
    const frase = T.contesti?.[qui?.id] || T.fumetto;
    const maiuscola = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    fumetto.querySelector('[data-focus-fumetto-apri]').textContent = n ? `${n}, ${frase}` : maiuscola(frase);
    fumetto.hidden = false;
    requestAnimationFrame(() => fumetto.classList.add('su'));
    ss.set('gd-focus-fumetto', '1');
    setTimeout(() => nascondiFumetto(false), 7000);
  }
  fumetto.querySelector('[data-focus-fumetto-apri]').addEventListener('click', (e) => {
    // il preventivo lasciato a metà: la nuvoletta porta dritta lì
    if (e.currentTarget.dataset.ritorno) { nascondiFumetto(true); location.href = linkPv.href; return; }
    apri();
  });
  fumetto.querySelector('[data-focus-fumetto-chiudi]').addEventListener('click', () => nascondiFumetto(true));

  // ---------- lo sguardo ----------
  let mano = -1e9;
  // dove sta il punto (x, y) rispetto all'occhio: la direzione, più decisa quando è lontano
  const verso = (x, y) => {
    const r = bolla.getBoundingClientRect();
    const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2), d = Math.max(1, Math.hypot(dx, dy));
    const forza = Math.min(1, d / 260);
    return [(dx / d) * forza, (-dy / d) * forza];
  };
  // segue il mouse
  window.addEventListener('pointermove', (e) => {
    if (!occhio || aperta || e.pointerType === 'touch') return;
    mano = performance.now();
    occhio.guarda(...verso(e.clientX, e.clientY));
  }, { passive: true });
  // dove clicchi o tocchi col dito, guarda lì e la pupilla si allarga un attimo
  let tGuarda = 0;
  window.addEventListener('pointerdown', (e) => {
    if (!occhio || aperta || box.contains(e.target)) return;
    mano = performance.now();
    occhio.guarda(...verso(e.clientX, e.clientY));
    occhio.umore('interessato');
    clearTimeout(tGuarda);
    tGuarda = setTimeout(() => { occhio.umore('riposo'); }, 1400);
  }, { passive: true });
  // a riposo guarda il bottone rosso più vicino: chi visita segue lo sguardo (gaze cueing)
  function guardaBottone() {
    if (!occhio || aperta || performance.now() - mano < 3000) return;
    const r = bolla.getBoundingClientRect();
    const b = [...document.querySelectorAll('.btn-azione, [data-azione]')].map((el) => el.getBoundingClientRect()).find((x) => x.width && x.bottom > 0 && x.top < innerHeight);
    if (b && Math.random() < 0.7) occhio.guarda(((b.left + b.width / 2) - (r.left + r.width / 2)) / 500, -((b.top + b.height / 2) - (r.top + r.height / 2)) / 400);
    else occhio.guarda((Math.random() - 0.7) * 0.9, (Math.random() - 0.3) * 0.6);
  }
  setInterval(guardaBottone, 2600);

  // ---------- quando spunta ----------
  // dopo 3 secondi e poi resta lì, fisso; mai sopra la finestra del nome
  function puoMostrare() {
    if (html.classList.contains('menu-aperto') || html.classList.contains('intro-attiva')) return false;
    return true;
  }
  function spunta(subito = false) {
    if (visibile) return;
    visibile = true;
    box.hidden = false;
    if (!occhio) occhio = creaOcchio(box.querySelector('[data-focus-occhio]'));
    // arriva dall'avvio: l'occhio è già sveglio e ti guarda
    if (subito) { occhio.apre = 1; occhio.umore('interessato'); setTimeout(() => occhio.umore('riposo'), 1400); }
    requestAnimationFrame(() => box.classList.add('su'));
    setTimeout(() => { occhio.apri(); guardaBottone(); }, ridotto || subito ? 0 : 450);
    setTimeout(mostraFumetto, 3200);
  }
  let pronto = false;
  setTimeout(() => { pronto = true; }, 3000);
  // all'avvio l'occhio vola nel tondino: lì il tondino c'è già, senza entrata, e l'occhio è aperto
  window.addEventListener('gd-intro-fine', (e) => {
    if (!e.detail?.occhio || visibile) return;
    pronto = true;
    box.classList.add('subito');
    spunta(true);
    setTimeout(() => box.classList.remove('subito'), 600);
  });
  setInterval(() => {
    if (!pronto) return;
    if (!visibile && puoMostrare()) spunta();
  }, 400);

  // ---------- il disegno: solo quando si vede ----------
  let prima = performance.now() / 1000;
  function giro(now) {
    requestAnimationFrame(giro);
    const t = now / 1000, dt = Math.min(0.05, t - prima);
    if (dt < 1 / 40) return; // 40 fotogrammi al secondo bastano
    prima = t;
    if (document.hidden) return;
    if (occhio && box.classList.contains('su')) occhio.passo(t, dt);
    if (occhioTesta && aperta) occhioTesta.passo(t, dt);
  }
  requestAnimationFrame(giro);
}
