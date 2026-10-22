// Preventivo automatico: legge le scelte del modulo, calcola i totali in tempo reale,
// salva il progetto nel browser e invia la richiesta.
import { anima, cubicaOut } from './moto.js';
import { listinoLingua as datiLingua } from '../i18n/listino-lingua.js';
import { euro as euroIn, franchi } from '../data/formato.js';
import { leggiProfilo } from './profilo.js';

const ENDPOINT = import.meta.env.PUBLIC_PREVENTIVO_ENDPOINT || '';
const CHIAVE = 'gd-preventivo';
const traccia = (e, d) => window.gdTrack?.(e, d);

const TESTI = {
  it: {
    mese: '/mese', vuoto: 'Scegli un servizio per iniziare.',
    veloce: 'Corsia veloce (+20%)', calma: 'Senza fretta (−5%)', sconto: (p) => `Sconto pacchetto (−${p}%)`,
    sconto3: 'Hai lo sconto massimo: −10%',
    sconto2: 'Sconto −5% attivo. Con un terzo servizio diventa −10%',
    sconto1: 'Con un secondo servizio hai il 5% di sconto',
    sconto0: '',
    voucher: (e) => `In Lombardia il Voucher Doppia Transizione potrebbe coprire fino a ${e} della parte AI. Lo verifichiamo insieme.`,
    intro: 'Ciao Desideri&Code, ecco il mio progetto dal preventivo automatico:',
    tempi: 'Tempi', scontoRiga: 'Sconto pacchetto', totale: 'Totale indicativo', una: 'una tantum', iva: 'IVA esclusa',
    nome: 'Nome', telefono: 'Telefono', preferisco: 'Preferisco', sito: 'Sito/social attuale', obiettivo: 'Obiettivo',
    oggetto: 'Richiesta di preventivo · Desideri&Code',
    inviaWa: 'Invia su WhatsApp', inviaMail: 'Invia per email', invio: 'Invio in corso…', riprova: 'Riprova',
    errore: (wa) => `Non siamo riusciti a inviare la richiesta. Puoi mandarla <a href="${wa}" target="_blank" rel="noopener">su WhatsApp</a> con un clic.`,
    grazieModulo: (n, c) => `Grazie ${n}, abbiamo ricevuto il tuo progetto. Ti ricontattiamo entro 24 ore${c ? ` via ${c.toLowerCase()}` : ''} con il preventivo definitivo.`,
    grazieApp: (n, email) => `Grazie ${n}! Si è aperto ${email ? 'il programma di posta' : 'WhatsApp'} con il tuo progetto già scritto: premi invia e ti rispondiamo entro 24 ore.`,
    riapriMail: "Apri di nuovo l'email", riapriWa: 'Apri di nuovo WhatsApp',
    incontri: 'Incontri di persona', circa: 'circa',
  },
  en: {
    mese: '/month', vuoto: 'Choose a service to get started.',
    veloce: 'Fast lane (+20%)', calma: 'No rush (−5%)', sconto: (p) => `Bundle discount (−${p}%)`,
    sconto3: 'You have the maximum discount: −10%',
    sconto2: '−5% discount on. Add a third service for −10%',
    sconto1: 'Add a second service for 5% off',
    sconto0: '',
    voucher: (e) => `In Lombardy the "Doppia Transizione" voucher could cover up to ${e} of the AI part. We check it together.`,
    intro: "Hi Desideri&Code, here's my project from the instant quote:",
    tempi: 'Timing', scontoRiga: 'Bundle discount', totale: 'Indicative total', una: 'one-off', iva: 'excl. VAT',
    nome: 'Name', telefono: 'Phone', preferisco: 'Preferred contact', sito: 'Current site/social', obiettivo: 'Goal',
    oggetto: 'Quote request · Desideri&Code',
    inviaWa: 'Send on WhatsApp', inviaMail: 'Send by email', invio: 'Sending…', riprova: 'Try again',
    errore: (wa) => `We couldn't send your request. You can send it <a href="${wa}" target="_blank" rel="noopener">on WhatsApp</a> in one click.`,
    grazieModulo: (n, c) => `Thank you ${n}, we've received your project. We'll get back to you within 24 hours${c ? ` by ${c.toLowerCase()}` : ''} with the final quote.`,
    grazieApp: (n, email) => `Thank you ${n}! ${email ? 'Your email app' : 'WhatsApp'} has opened with your project already written: press send and we'll reply within 24 hours.`,
    riapriMail: 'Open the email again', riapriWa: 'Open WhatsApp again',
    incontri: 'In-person meetings', circa: 'approx.',
  },
};

export function avviaPreventivo() {
  const form = document.querySelector('[data-preventivo]');
  if (!form) return;
  const lang = form.dataset.lang === 'en' ? 'en' : 'it';
  const t = TESTI[lang];
  const { categorie, tempi, incontri, cambio, scontoPacchetto, voucher, contatti } = datiLingua(lang);
  // Stessi prezzi per tutti: chi vuole li vede convertiti in franchi (scelta sua, mai automatica)
  let valuta = 'EUR';
  try { if (localStorage.getItem('gd-valuta') === 'CHF') valuta = 'CHF'; } catch (_) {}
  const euro = (n) => (valuta === 'CHF' ? franchi(n * cambio.CHF) : euroIn(n, lang));
  const ridotto = document.documentElement.classList.contains('ridotto');
  const passi = [...form.querySelectorAll('[data-passo]')];
  const indicatori = [...document.querySelectorAll('[data-passo-ind]')];
  const progresso = document.querySelector('[data-barra-progresso]');
  const riep = document.querySelector('[data-riepilogo]');
  let passo = 1, iniziato = false;

  // ---------- Stato ----------
  function leggi() {
    // un servizio principale (passo 1, pacchetto al passo 2) e gli altri aggiunti tra gli extra (pacchetto lì)
    const principale = form.querySelector('input[name="servizio"]:checked')?.value || '';
    const stato = { servizio: principale, cat: {}, tempi: form.elements.tempi?.value || 'normale' };
    const extraDi = (id) => {
      const extra = {};
      form.querySelectorAll(`[data-extra-cat="${id}"] [data-extra]`).forEach((r) => {
        const q = Number(r.dataset.q || 0);
        if (q > 0) extra[r.dataset.extra.split('.')[1]] = q;
      });
      return extra;
    };
    if (principale) stato.cat[principale] = { liv: form.querySelector(`input[name="liv-${principale}"]:checked`)?.value, extra: extraDi(principale) };
    form.querySelectorAll('input[name="altro"]:checked').forEach((i) => {
      const id = i.value;
      if (id === principale) return;
      stato.cat[id] = { liv: form.querySelector(`input[name="liv2-${id}"]:checked`)?.value, extra: extraDi(id) };
    });
    stato.incontri = {};
    form.querySelectorAll('[data-incontro]').forEach((r) => {
      const q = Number(r.dataset.q || 0);
      if (q > 0) stato.incontri[r.dataset.incontro] = q;
    });
    return stato;
  }

  function calcola(stato) {
    const righe = [];
    let una = 0, mese = 0, unaAI = 0;
    for (const [id, scelta] of Object.entries(stato.cat)) {
      const c = categorie.find((x) => x.id === id);
      const l = c.livelli.find((x) => x.id === scelta.liv) || c.livelli[0];
      let u = l.una || 0, m = l.mese || 0;
      const dett = [];
      for (const [eid, q] of Object.entries(scelta.extra)) {
        const e = c.extra.find((x) => x.id === eid);
        if (!e) continue;
        u += (e.una || 0) * q; m += (e.mese || 0) * q;
        dett.push(q > 1 ? `${e.nome} × ${q}` : e.nome);
      }
      righe.push({ id, nome: c.nome, livello: l.nome, dett, una: u, mese: m });
      una += u; mese += m;
      if (c.ai) unaAI += u;
    }
    const t = tempi.find((x) => x.id === stato.tempi) || tempi[0];
    const nServizi = Object.keys(stato.cat).filter((id) => id !== 'cura').length;
    const sconto = scontoPacchetto(nServizi);
    const lordo = una * t.fattore;
    const scontoEuro = lordo * sconto;
    // gli incontri di persona sono spese di viaggio: niente sconto pacchetto né corsia veloce
    const dettIncontri = [];
    let incontriEuro = 0;
    for (const [id, q] of Object.entries(stato.incontri || {})) {
      const e = incontri.find((x) => x.id === id);
      if (!e) continue;
      incontriEuro += e.una * q;
      dettIncontri.push(`${e.nome} × ${q}`);
    }
    const unaFinale = lordo - scontoEuro + incontriEuro;
    const aiFinale = unaAI * t.fattore * (1 - sconto);
    const risparmioVoucher = aiFinale >= voucher.soglia ? Math.min(aiFinale * voucher.percentuale, voucher.massimo) : 0;
    return { righe, una: unaFinale, mese, sconto, scontoEuro, tempi: t, nServizi, risparmioVoucher, maggiorazione: lordo - una, incontriEuro, dettIncontri };
  }

  // ---------- Riepilogo ----------
  const elRighe = riep.querySelector('[data-righe-riep]');
  const elUna = riep.querySelector('[data-tot-una]');
  const elMese = riep.querySelector('[data-tot-mese]');
  const elBreve = riep.querySelector('[data-tot-breve]');
  const elVoucher = riep.querySelector('[data-voucher]');
  const elScontoTesto = riep.querySelector('[data-sconto-testo]');
  const elMeseRiga = riep.querySelector('[data-tot-mese-riga]');
  const mostrati = { una: 0, mese: 0 };

  // il totale sale (o scende) contando fino al valore nuovo, con un breve bagliore
  function animaNumero(el, chiave, valore) {
    const da = mostrati[chiave];
    mostrati[chiave] = valore;
    if (ridotto || da === valore) { el.textContent = euro(valore); return; }
    el._ferma?.();
    el._ferma = anima({ durata: 0.6, curva: cubicaOut, passo: (k) => { el.textContent = euro(Math.round(da + (valore - da) * k)); } });
    el.classList.add('lampo'); clearTimeout(el._lampo); el._lampo = setTimeout(() => el.classList.remove('lampo'), 500);
  }

  function aggiorna() {
    const stato = leggi();
    const r = calcola(stato);
    elRighe.innerHTML = '';
    if (!r.righe.length) {
      elRighe.innerHTML = `<li class="pv-vuoto">${t.vuoto}</li>`;
    }
    for (const x of r.righe) {
      const li = document.createElement('li');
      const prezzo = [x.una ? euro(x.una) : '', x.mese ? `${euro(x.mese)}${t.mese}` : ''].filter(Boolean).join(' + ');
      li.innerHTML = `<div><strong></strong><span class="pv-riga-liv"></span>${x.dett.length ? '<span class="pv-riga-dett"></span>' : ''}</div><span class="pv-riga-prezzo"></span>`;
      li.querySelector('strong').textContent = x.nome;
      li.querySelector('.pv-riga-liv').textContent = x.livello;
      if (x.dett.length) li.querySelector('.pv-riga-dett').textContent = '+ ' + x.dett.join(', ');
      li.querySelector('.pv-riga-prezzo').textContent = prezzo;
      elRighe.appendChild(li);
    }
    if (r.maggiorazione > 0) aggiungiRiga(t.veloce, `+ ${euro(r.maggiorazione)}`);
    if (r.maggiorazione < 0) aggiungiRiga(t.calma, `− ${euro(-r.maggiorazione)}`, true);
    if (r.scontoEuro > 0) aggiungiRiga(t.sconto(r.sconto * 100), `− ${euro(r.scontoEuro)}`, true);
    if (r.incontriEuro > 0) aggiungiRiga(t.incontri, `+ ${euro(r.incontriEuro)}`);

    animaNumero(elUna, 'una', r.una);
    animaNumero(elMese, 'mese', r.mese);
    elMeseRiga.hidden = !r.mese;
    elBreve.textContent = `${euro(r.una)}${r.mese ? ` + ${euro(r.mese)}${t.mese}` : ''}`;

    // gamification dello sconto pacchetto
    const n = r.nServizi;
    elScontoTesto.textContent = n >= 3 ? t.sconto3 : n === 2 ? t.sconto2 : n === 1 ? t.sconto1 : t.sconto0;
    riep.querySelector('[data-sconto]').classList.toggle('attivo', n >= 2);

    if (r.risparmioVoucher > 0) {
      elVoucher.hidden = false;
      elVoucher.textContent = t.voucher(euro(r.risparmioVoucher));
    } else elVoucher.hidden = true;

    // quanti extra hai aggiunto, scritto accanto a «Aggiungi extra»
    form.querySelectorAll('[data-extra-box]').forEach((box) => {
      const k = [...box.querySelectorAll('[data-extra], [data-incontro]')].filter((x) => Number(x.dataset.q || 0) > 0).length
        + box.querySelectorAll('input[name="altro"]:checked').length
        + (box.querySelector('input[name="tempi"]:checked') && box.querySelector('input[name="tempi"]:checked').value !== 'normale' ? 1 : 0);
      box.querySelector('[data-extra-conta]').textContent = k ? `${k}` : '';
    });

    salva(stato);
    return r;
  }
  function aggiungiRiga(testo, prezzo, verde) {
    const li = document.createElement('li');
    li.className = verde ? 'pv-riga-sconto' : 'pv-riga-extra';
    li.innerHTML = '<div><strong></strong></div><span class="pv-riga-prezzo"></span>';
    li.querySelector('strong').textContent = testo;
    li.querySelector('.pv-riga-prezzo').textContent = prezzo;
    elRighe.appendChild(li);
  }

  // ---------- Passo 2: solo il pacchetto del servizio scelto. Passo 3: i suoi extra e quelli degli altri servizi aggiunti ----------
  function mostraBlocchi() {
    const principale = form.querySelector('input[name="servizio"]:checked')?.value;
    const altri = new Set([...form.querySelectorAll('input[name="altro"]:checked')].map((i) => i.value));
    form.querySelectorAll('[data-blocco]').forEach((b) => { b.hidden = b.dataset.blocco !== principale; });
    form.querySelectorAll('[data-extra-cat]').forEach((b) => { b.hidden = !(b.dataset.extraCat === principale || altri.has(b.dataset.extraCat)); });
    // tra gli «altri servizi» non c'è quello già scelto; quelli attivi mostrano i loro pacchetti
    form.querySelectorAll('[data-altro]').forEach((r) => {
      const id = r.dataset.altro, cb = r.querySelector('input[name="altro"]');
      r.hidden = id === principale;
      if (id === principale) cb.checked = false;
      r.classList.toggle('attivo', cb.checked);
    });
  }

  // ---------- Extra: + / − e interruttori ----------
  form.querySelectorAll('[data-extra], [data-incontro]').forEach((r) => {
    const max = Number(r.dataset.max || 1);
    const out = r.querySelector('[data-q]');
    const imposta = (q) => {
      q = Math.max(0, Math.min(max, q));
      r.dataset.q = String(q);
      if (out) out.textContent = String(q);
      const t = r.querySelector('[data-toggle]');
      if (t) t.checked = q > 0;
      r.classList.toggle('attivo', q > 0);
    };
    r._imposta = imposta;
    r.querySelector('[data-piu]')?.addEventListener('click', () => { imposta(Number(r.dataset.q || 0) + 1); aggiorna(); });
    r.querySelector('[data-meno]')?.addEventListener('click', () => { imposta(Number(r.dataset.q || 0) - 1); aggiorna(); });
    r.querySelector('[data-toggle]')?.addEventListener('change', (e) => { imposta(e.target.checked ? 1 : 0); aggiorna(); });
  });

  form.addEventListener('change', (e) => {
    if (e.target.name === 'servizio' || e.target.name === 'altro') mostraBlocchi();
    // scelto il servizio, si passa da soli al suo pacchetto
    if (e.target.name === 'servizio' && passo === 1) setTimeout(() => { if (passo === 1) vaiA(2); }, 380);
    if (!iniziato) { iniziato = true; traccia('preventivo_inizio'); }
    aggiorna();
  });

  // ---------- Navigazione tra i passi ----------
  function vaiA(n, focus = true) {
    passo = n;
    passi.forEach((p) => { p.hidden = Number(p.dataset.passo) !== n; });
    indicatori.forEach((li) => {
      const i = Number(li.dataset.passoInd);
      li.classList.toggle('attivo', i === n);
      li.classList.toggle('fatto', i < n);
    });
    if (progresso) progresso.style.width = `${[0, 10, 38, 66, 90, 100][n]}%`;
    const attivo = passi.find((p) => Number(p.dataset.passo) === n);
    if (!ridotto && attivo) {
      attivo._ferma?.();
      attivo._ferma = anima({ durata: 0.6, passo: (k, fine) => { attivo.style.opacity = String(k); attivo.style.transform = fine ? 'translate(0px, 0px)' : `translate3d(0px, ${24 * (1 - k)}px, 0px)`; } });
    }
    if (focus) {
      const top = form.getBoundingClientRect().top + window.scrollY - 210;
      if (window.gdLenis) window.gdLenis.scrollTo(top, { duration: 0.8 }); else window.scrollTo({ top, behavior: ridotto ? 'auto' : 'smooth' });
      (attivo.querySelector('legend') || attivo)?.setAttribute?.('tabindex', '-1');
      setTimeout(() => (attivo.querySelector('legend') || attivo).focus?.({ preventScroll: true }), 50);
    }
    traccia('preventivo_passo', { passo: n });
    salva(leggi());
  }

  function valido(n) {
    if (n === 1) {
      const ok = !!form.querySelector('input[name="servizio"]:checked');
      form.querySelector('[data-errore="1"]').hidden = ok;
      return ok;
    }
    if (n === 4) {
      // nome e cognome, almeno un contatto (email o telefono) e il consenso
      const f = form.elements;
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim());
      const telOk = f.telefono.value.replace(/\D/g, '').length >= 6;
      const esiti = { nome: f.nome.value.trim().length > 2, email: emailOk || telOk, telefono: emailOk || telOk, privacy: f.privacy.checked };
      // un'email scritta male resta un errore anche se c'è il telefono
      if (f.email.value.trim() && !emailOk) esiti.email = false;
      let ok = true;
      for (const [k, v] of Object.entries(esiti)) {
        f[k].closest('.pv-campo, .pv-privacy')?.classList.toggle('errore', !v);
        f[k].setAttribute('aria-invalid', String(!v));
        if (!v) ok = false;
      }
      form.querySelector('[data-errore="4"]').hidden = ok;
      return ok;
    }
    return true;
  }

  form.addEventListener('click', (e) => {
    if (e.target.closest('[data-avanti]')) { if (valido(passo)) vaiA(passo + 1); }
    if (e.target.closest('[data-indietro]')) vaiA(Math.max(1, passo - 1));
  });
  indicatori.forEach((li) => li.addEventListener('click', () => {
    const n = Number(li.dataset.passoInd);
    if (n < passo || (n > passo && n <= 4 && valido(1) && valido(passo))) vaiA(n);
  }));

  // ---------- Riepilogo su mobile ----------
  const toggle = riep.querySelector('[data-riep-toggle]');
  toggle.addEventListener('click', () => {
    const aperto = riep.classList.toggle('aperto');
    toggle.setAttribute('aria-expanded', String(aperto));
  });

  // ---------- Invio ----------
  function testoProgetto(r, d) {
    const righe = [t.intro, ''];
    for (const x of r.righe) {
      righe.push(`• ${x.nome} — ${x.livello}${x.dett.length ? ` (+ ${x.dett.join(', ')})` : ''}`);
    }
    righe.push('', `${t.tempi}: ${r.tempi.nome}`);
    if (r.sconto) righe.push(`${t.scontoRiga}: −${r.sconto * 100}%`);
    if (r.dettIncontri.length) righe.push(`${t.incontri}: ${r.dettIncontri.join(', ')}`);
    // nel messaggio il totale resta in euro; se il cliente guarda i franchi, aggiungo la conversione
    const inEuro = (n) => euroIn(n, lang);
    const chf = valuta === 'CHF' ? ` (${t.circa} ${franchi(r.una * cambio.CHF)}${r.mese ? ` + ${franchi(r.mese * cambio.CHF)}${t.mese}` : ''})` : '';
    righe.push(`${t.totale}: ${inEuro(r.una)} ${t.una}${r.mese ? ` + ${inEuro(r.mese)}${t.mese}` : ''}${chf} (${t.iva})`);
    if (d) {
      righe.push('', `${t.nome}: ${d.nome}`);
      if (d.email) righe.push(`Email: ${d.email}`);
      if (d.telefono) righe.push(`${t.telefono}: ${d.telefono}`);
      righe.push(`${t.preferisco}: ${d.canale}`);
      if (d.sito_attuale) righe.push(`${t.sito}: ${d.sito_attuale}`);
      if (d.messaggio) righe.push('', `${t.obiettivo}: ${d.messaggio}`);
    }
    return righe.join('\n');
  }
  const waLink = (testo) => `https://wa.me/${contatti.whatsapp}?text=${encodeURIComponent(testo)}`;
  const mailLink = (testo) => `mailto:${contatti.email}?subject=${encodeURIComponent(t.oggetto)}&body=${encodeURIComponent(testo)}`;

  // senza indirizzo dello script, l'invio passa da WhatsApp (o email)
  if (!ENDPOINT) {
    const btn = form.querySelector('[data-invia]');
    btn.innerHTML = `${t.inviaWa} <span class="freccia" aria-hidden="true">→</span>`;
    const mail = document.createElement('button');
    mail.type = 'button';
    mail.className = 'btn btn-vetro';
    mail.textContent = t.inviaMail;
    mail.addEventListener('click', () => {
      if (!valido(4)) return;
      const d = dati();
      location.href = mailLink(testoProgetto(calcola(leggi()), d));
      fatto(d, 'email');
    });
    form.querySelector('.pv-invio').prepend(mail);
  }

  function dati() {
    const f = form.elements;
    return {
      nome: f.nome.value.trim(), email: f.email.value.trim(), telefono: f.telefono.value.trim(),
      messaggio: f.messaggio.value.trim(), canale: f.canale.value,
      // campi che il foglio Preventivi si aspetta ancora: restano vuoti
      sito_attuale: (f.sito?.value || '').trim(),
    };
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.elements.botcheck.checked) return; // trappola per i bot
    if (!valido(4)) return;
    const d = dati();
    const r = calcola(leggi());
    const testo = testoProgetto(r, d);
    if (!ENDPOINT) {
      window.open(waLink(testo), '_blank', 'noopener');
      fatto(d, 'whatsapp');
      return;
    }
    const btn = form.querySelector('[data-invia]');
    btn.disabled = true;
    btn.textContent = t.invio;
    form.classList.add('invio-in-corso');
    try {
      // text/plain: richiesta "semplice", niente preflight CORS verso Google Apps Script
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          ...d, botcheck: '', progetto: testo, una: Math.round(r.una), mese: Math.round(r.mese), tempi: r.tempi.nome,
          servizi: r.righe.map((x) => `${x.nome} (${x.livello})`).join(', '), pagina: location.href, lingua: lang,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.success === false) throw new Error('invio');
      fatto(d, 'modulo');
    } catch (_) {
      form.classList.remove('invio-in-corso');
      btn.disabled = false;
      btn.innerHTML = `${t.riprova} <span class="freccia" aria-hidden="true">→</span>`;
      const err = form.querySelector('[data-errore="4"]');
      err.hidden = false;
      err.innerHTML = t.errore(waLink(testo));
    }
  });

  function fatto(d, via) {
    form.classList.remove('invio-in-corso');
    traccia('preventivo_invio', { via });
    const r = calcola(leggi());
    const testo = testoProgetto(r, d);
    const box = form.querySelector('[data-fatto-azioni]');
    const p = form.querySelector('[data-fatto-testo]');
    const primo = d.nome.split(' ')[0];
    p.textContent = via === 'modulo' ? t.grazieModulo(primo, d.canale) : t.grazieApp(primo, via === 'email');
    box.innerHTML = '';
    if (via !== 'modulo') {
      const a = document.createElement('a');
      a.className = 'btn btn-azione';
      a.href = via === 'email' ? mailLink(testo) : waLink(testo);
      a.target = '_blank'; a.rel = 'noopener';
      a.textContent = via === 'email' ? t.riapriMail : t.riapriWa;
      box.appendChild(a);
    }
    vaiA(5);
    try { localStorage.removeItem(CHIAVE); } catch (_) {}
  }

  // ---------- Salvataggio nel browser ----------
  function salva(stato) {
    try { localStorage.setItem(CHIAVE, JSON.stringify({ ...stato, passo: Math.min(passo, 3) })); } catch (_) {}
  }
  function ripristina(stato) {
    // i progetti salvati prima avevano solo l'elenco dei servizi: il primo diventa quello principale
    const principale = stato.servizio || Object.keys(stato.cat || {})[0];
    for (const [id, s] of Object.entries(stato.cat || {})) {
      const primo = id === principale;
      const cb = form.querySelector(primo ? `input[name="servizio"][value="${id}"]` : `input[name="altro"][value="${id}"]`);
      if (!cb) continue;
      cb.checked = true;
      const radio = s.liv && form.querySelector(`input[name="${primo ? 'liv' : 'liv2'}-${id}"][value="${s.liv}"]`);
      if (radio) radio.checked = true;
      for (const [eid, q] of Object.entries(s.extra || {})) {
        form.querySelector(`[data-extra="${id}.${eid}"]`)?._imposta?.(q);
      }
    }
    const t = stato.tempi && form.querySelector(`input[name="tempi"][value="${stato.tempi}"]`);
    if (t) t.checked = true;
    for (const [id, q] of Object.entries(stato.incontri || {})) {
      form.querySelector(`[data-incontro="${id}"]`)?._imposta?.(q);
    }
  }

  // ---------- € / CHF ----------
  function mostraValuta() {
    document.querySelectorAll('[data-prezzo]').forEach((el) => {
      const una = Number(el.dataset.una), mese = Number(el.dataset.mese);
      el.textContent = [una ? euro(una) : '', mese ? `${euro(mese)}${t.mese}` : ''].filter(Boolean).join(' + ');
    });
    document.querySelectorAll('[data-valuta-scegli]').forEach((b) => {
      if (b.closest('.pv-valuta')) b.setAttribute('aria-pressed', String(b.dataset.valutaScegli === valuta));
    });
    const nota = document.querySelector('[data-valuta-nota]');
    if (nota) nota.hidden = valuta !== 'CHF';
    const svizzera = document.querySelector('[data-svizzera]');
    if (svizzera && valuta === 'CHF') svizzera.hidden = true;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-valuta-scegli]');
    if (!b) return;
    valuta = b.dataset.valutaScegli === 'CHF' ? 'CHF' : 'EUR';
    try { localStorage.setItem('gd-valuta', valuta); } catch (_) {}
    traccia('valuta', { valuta });
    mostraValuta();
    aggiorna();
  });
  // chi ha il fuso orario svizzero riceve solo un suggerimento: decide lui se vedere i franchi
  try {
    const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const box = document.querySelector('[data-svizzera]');
    if (box && fuso === 'Europe/Zurich' && valuta !== 'CHF') box.hidden = false;
  } catch (_) {}
  mostraValuta();

  // ---------- Avvio: progetto salvato o servizio arrivato dal link (?s=sito:presenza) ----------
  let salvato = null;
  try { salvato = JSON.parse(localStorage.getItem(CHIAVE) || 'null'); } catch (_) {}
  if (salvato) ripristina(salvato);
  const param = new URLSearchParams(location.search).get('s');
  if (param) {
    const [id, liv] = param.split(':');
    const cb = form.querySelector(`input[name="servizio"][value="${id}"]`);
    if (cb) cb.checked = true;
    const altro = form.querySelector(`input[name="altro"][value="${id}"]`);
    if (altro) altro.checked = false;
    const radio = liv && form.querySelector(`input[name="liv-${id}"][value="${liv}"]`);
    if (radio) radio.checked = true;
  }
  // il nome scelto in «Personalizza»
  const profilo = leggiProfilo();
  if (profilo.nome && !form.elements.nome.value) form.elements.nome.value = profilo.nome;
  // i lavori scelti nel calcolo «Quanto ti fa risparmiare» della home
  try {
    const calcolo = localStorage.getItem('gd-calcolo');
    if (calcolo && !form.elements.messaggio.value) form.elements.messaggio.value = calcolo;
    localStorage.removeItem('gd-calcolo');
  } catch (_) {}
  mostraBlocchi();
  aggiorna();
  form.querySelectorAll('[data-extra-box]').forEach((box) => { if (box.querySelector('[data-extra-conta]').textContent) box.open = true; });
  vaiA(1, false);
}
