// Preventivo automatico: legge le scelte del modulo, calcola i totali in tempo reale,
// salva il progetto nel browser e invia la richiesta.
import gsap from 'gsap';
import { dati as datiLingua } from '../i18n/dati.js';
import { euro as euroIn, franchi } from '../data/formato.js';
import { leggiProfilo } from './profilo.js';

const ENDPOINT = import.meta.env.PUBLIC_PREVENTIVO_ENDPOINT || '';
const CHIAVE = 'gd-preventivo';
const traccia = (e, d) => window.gdTrack?.(e, d);

const TESTI = {
  it: {
    mese: '/mese', vuoto: 'Scegli un servizio per iniziare.',
    veloce: 'Corsia veloce (+20%)', calma: 'Senza fretta (−5%)', sconto: (p) => `Sconto pacchetto (−${p}%)`,
    sconto3: 'Sconto massimo sbloccato: −10% sulla parte una tantum',
    sconto2: 'Sconto del 5% sbloccato! Con un terzo servizio arrivi al 10%',
    sconto1: 'Aggiungi un secondo servizio: sblocchi il 5% di sconto',
    sconto0: 'Più servizi scegli, più risparmi',
    voucher: (e) => `Con il Voucher Doppia Transizione della Lombardia potresti risparmiare fino a ${e} sulla parte AI (contributo del 50%, da verificare insieme: lo sportello si esaurisce in fretta).`,
    intro: 'Ciao Gabriele, ecco il mio progetto dal preventivo automatico:',
    tempi: 'Tempi', scontoRiga: 'Sconto pacchetto', totale: 'Totale indicativo', una: 'una tantum', iva: 'IVA esclusa',
    nome: 'Nome', attivita: 'Attività', settore: 'Settore', telefono: 'Telefono', preferisco: 'Preferisco', sito: 'Sito/social attuale', obiettivo: 'Obiettivo',
    oggetto: 'Richiesta di preventivo · Studio Desideri',
    inviaWa: 'Invia su WhatsApp', inviaMail: 'Invia per email', invio: 'Invio in corso…', riprova: 'Riprova',
    errore: (wa) => `Non sono riuscito a inviare la richiesta. Puoi mandarla <a href="${wa}" target="_blank" rel="noopener">su WhatsApp</a> con un clic.`,
    grazieModulo: (n, c) => `Grazie ${n}, ho ricevuto il tuo progetto. Ti ricontatto entro 24 ore${c ? ` via ${c.toLowerCase()}` : ''} con il preventivo definitivo.`,
    grazieApp: (n, email) => `Grazie ${n}! Si è aperto ${email ? 'il programma di posta' : 'WhatsApp'} con il tuo progetto già scritto: premi invia e ti rispondo entro 24 ore.`,
    riapriMail: "Apri di nuovo l'email", riapriWa: 'Apri di nuovo WhatsApp',
    incontri: 'Incontri di persona', circa: 'circa',
  },
  en: {
    mese: '/month', vuoto: 'Choose a service to get started.',
    veloce: 'Fast lane (+20%)', calma: 'No rush (−5%)', sconto: (p) => `Bundle discount (−${p}%)`,
    sconto3: 'Maximum discount unlocked: −10% on the one-off part',
    sconto2: '5% discount unlocked! Add a third service to reach 10%',
    sconto1: 'Add a second service to unlock a 5% discount',
    sconto0: 'The more services you choose, the more you save',
    voucher: (e) => `With the Lombardy "Doppia Transizione" voucher you could save up to ${e} on the AI part (50% grant, to be checked together: the fund runs out fast).`,
    intro: "Hi Gabriele, here's my project from the instant quote:",
    tempi: 'Timing', scontoRiga: 'Bundle discount', totale: 'Indicative total', una: 'one-off', iva: 'excl. VAT',
    nome: 'Name', attivita: 'Business', settore: 'Sector', telefono: 'Phone', preferisco: 'Preferred contact', sito: 'Current site/social', obiettivo: 'Goal',
    oggetto: 'Quote request · Studio Desideri',
    inviaWa: 'Send on WhatsApp', inviaMail: 'Send by email', invio: 'Sending…', riprova: 'Try again',
    errore: (wa) => `I couldn't send your request. You can send it <a href="${wa}" target="_blank" rel="noopener">on WhatsApp</a> in one click.`,
    grazieModulo: (n, c) => `Thank you ${n}, I've received your project. I'll get back to you within 24 hours${c ? ` by ${c.toLowerCase()}` : ''} with the final quote.`,
    grazieApp: (n, email) => `Thank you ${n}! ${email ? 'Your email app' : 'WhatsApp'} has opened with your project already written: press send and I'll reply within 24 hours.`,
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
    const stato = { cat: {}, tempi: form.elements.tempi?.value || 'normale' };
    form.querySelectorAll('input[name="cat"]:checked').forEach((i) => {
      const id = i.value;
      const liv = form.querySelector(`input[name="liv-${id}"]:checked`)?.value;
      const extra = {};
      form.querySelectorAll(`[data-blocco="${id}"] [data-extra]`).forEach((r) => {
        const q = Number(r.dataset.q || 0);
        if (q > 0) extra[r.dataset.extra.split('.')[1]] = q;
      });
      stato.cat[id] = { liv, extra };
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
  const elScontoBarra = riep.querySelector('[data-sconto-barra]');
  const mostrati = { una: 0, mese: 0 };

  // i totali girano come un contachilometri: ogni cifra scorre fino al valore nuovo, con un bagliore
  function animaNumero(el, chiave, valore) {
    const testo = euro(valore);
    const cambiato = mostrati[chiave] !== valore;
    mostrati[chiave] = valore;
    el.setAttribute('aria-label', testo);
    if (ridotto) { el.textContent = testo; return; }
    const forma = testo.replace(/\d/g, '0');
    if (el.dataset.forma !== forma) {
      el.dataset.forma = forma;
      el.innerHTML = '<span class="odo" aria-hidden="true">' + [...testo].map((ch) => (/\d/.test(ch)
        ? `<span class="odo-col"><span>${[...'0123456789'].map((d) => `<i>${d}</i>`).join('')}</span></span>`
        : `<span>${ch === ' ' ? '&nbsp;' : ch}</span>`)).join('') + '</span>';
    }
    const colonne = el.querySelectorAll('.odo-col > span');
    let k = 0;
    requestAnimationFrame(() => {
      for (const ch of testo) if (/\d/.test(ch)) colonne[k++].style.transform = `translateY(-${Number(ch) * 1.1}em)`;
    });
    if (cambiato) { el.classList.add('lampo'); clearTimeout(el._lampo); el._lampo = setTimeout(() => el.classList.remove('lampo'), 500); }
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
    elBreve.textContent = `${euro(r.una)}${r.mese ? ` + ${euro(r.mese)}${t.mese}` : ''}`;

    // gamification dello sconto pacchetto
    const n = r.nServizi;
    elScontoBarra.style.width = `${Math.min(n, 3) / 3 * 100}%`;
    elScontoTesto.textContent = n >= 3 ? t.sconto3 : n === 2 ? t.sconto2 : n === 1 ? t.sconto1 : t.sconto0;
    riep.querySelector('[data-sconto]').classList.toggle('attivo', n >= 2);

    if (r.risparmioVoucher > 0) {
      elVoucher.hidden = false;
      elVoucher.textContent = t.voucher(euro(r.risparmioVoucher));
    } else elVoucher.hidden = true;

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

  // ---------- Blocchi del passo 2 visibili solo per i servizi scelti ----------
  function mostraBlocchi() {
    const scelti = new Set([...form.querySelectorAll('input[name="cat"]:checked')].map((i) => i.value));
    form.querySelectorAll('[data-blocco]').forEach((b) => { b.hidden = !scelti.has(b.dataset.blocco); });
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
    if (e.target.name === 'cat') mostraBlocchi();
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
    if (progresso) progresso.style.width = `${[0, 8, 37, 66, 92, 100][n]}%`;
    const attivo = passi.find((p) => Number(p.dataset.passo) === n);
    if (!ridotto && attivo) gsap.fromTo(attivo, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
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
      const ok = !!form.querySelector('input[name="cat"]:checked');
      form.querySelector('[data-errore="1"]').hidden = ok;
      return ok;
    }
    if (n === 4) {
      let ok = true;
      ['nome', 'email', 'telefono', 'privacy'].forEach((k) => {
        const el = form.elements[k];
        let v = el.type === 'checkbox' ? el.checked : el.value.trim().length > 1;
        if (k === 'email') v = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        if (k === 'telefono') v = el.value.replace(/\D/g, '').length >= 6;
        el.closest('.pv-campo, .pv-privacy')?.classList.toggle('errore', !v);
        el.setAttribute('aria-invalid', String(!v));
        if (!v) ok = false;
      });
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
    if (n < passo || (n > passo && valido(passo) && n <= 4 && (n !== 2 || form.querySelector('input[name="cat"]:checked')))) vaiA(n);
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
      if (d.azienda) righe.push(`${t.attivita}: ${d.azienda}`);
      if (d.settore) righe.push(`${t.settore}: ${d.settore}`);
      righe.push(`Email: ${d.email}`, `${t.telefono}: ${d.telefono}`, `${t.preferisco}: ${d.canale}`);
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
      nome: f.nome.value.trim(), azienda: f.azienda.value.trim(), email: f.email.value.trim(), telefono: f.telefono.value.trim(),
      settore: f.settore.value ? f.settore.selectedOptions[0].textContent.trim() : '', messaggio: f.messaggio.value.trim(), canale: f.canale.value, sito_attuale: f.sito_attuale.value.trim(),
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
    for (const [id, s] of Object.entries(stato.cat || {})) {
      const cb = form.querySelector(`input[name="cat"][value="${id}"]`);
      if (!cb) continue;
      cb.checked = true;
      const radio = s.liv && form.querySelector(`input[name="liv-${id}"][value="${s.liv}"]`);
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
    const cb = form.querySelector(`input[name="cat"][value="${id}"]`);
    if (cb) cb.checked = true;
    const radio = liv && form.querySelector(`input[name="liv-${id}"][value="${liv}"]`);
    if (radio) radio.checked = true;
  }
  // il nome scelto in «Personalizza»
  const profilo = leggiProfilo();
  if (profilo.nome && !form.elements.nome.value) form.elements.nome.value = profilo.nome;
  mostraBlocchi();
  aggiorna();
  vaiA(1, false);
}
