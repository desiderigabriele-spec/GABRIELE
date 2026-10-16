// Preventivo automatico: legge le scelte del modulo, calcola i totali in tempo reale,
// salva il progetto nel browser e invia la richiesta.
import gsap from 'gsap';
import { categorie, tempi, scontoPacchetto, voucher } from '../data/listino.js';
import { contatti } from '../data/sito.js';

const ENDPOINT = import.meta.env.PUBLIC_PREVENTIVO_ENDPOINT || '';
const CHIAVE = 'gd-preventivo';
import { euro } from '../data/formato.js';
const traccia = (e, d) => window.gdTrack?.(e, d);

export function avviaPreventivo() {
  const form = document.querySelector('[data-preventivo]');
  if (!form) return;
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
    const unaFinale = lordo - scontoEuro;
    const aiFinale = unaAI * t.fattore * (1 - sconto);
    const risparmioVoucher = aiFinale >= voucher.soglia ? Math.min(aiFinale * voucher.percentuale, voucher.massimo) : 0;
    return { righe, una: unaFinale, mese, sconto, scontoEuro, tempi: t, nServizi, risparmioVoucher, maggiorazione: lordo - una };
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

  function animaNumero(el, chiave, valore, suffisso = '') {
    if (ridotto) { el.textContent = euro(valore) + suffisso; mostrati[chiave] = valore; return; }
    const o = { v: mostrati[chiave] };
    gsap.to(o, { v: valore, duration: 0.6, ease: 'power3.out', onUpdate: () => { el.textContent = euro(o.v) + suffisso; } });
    mostrati[chiave] = valore;
  }

  function aggiorna() {
    const stato = leggi();
    const r = calcola(stato);
    elRighe.innerHTML = '';
    if (!r.righe.length) {
      elRighe.innerHTML = '<li class="pv-vuoto">Scegli un servizio per iniziare.</li>';
    }
    for (const x of r.righe) {
      const li = document.createElement('li');
      const prezzo = [x.una ? euro(x.una) : '', x.mese ? `${euro(x.mese)}/mese` : ''].filter(Boolean).join(' + ');
      li.innerHTML = `<div><strong></strong><span class="pv-riga-liv"></span>${x.dett.length ? '<span class="pv-riga-dett"></span>' : ''}</div><span class="pv-riga-prezzo"></span>`;
      li.querySelector('strong').textContent = x.nome;
      li.querySelector('.pv-riga-liv').textContent = x.livello;
      if (x.dett.length) li.querySelector('.pv-riga-dett').textContent = '+ ' + x.dett.join(', ');
      li.querySelector('.pv-riga-prezzo').textContent = prezzo;
      elRighe.appendChild(li);
    }
    if (r.maggiorazione > 0) aggiungiRiga(`Corsia veloce (+20%)`, `+ ${euro(r.maggiorazione)}`);
    if (r.maggiorazione < 0) aggiungiRiga(`Senza fretta (−5%)`, `− ${euro(-r.maggiorazione)}`, true);
    if (r.scontoEuro > 0) aggiungiRiga(`Sconto pacchetto (−${r.sconto * 100}%)`, `− ${euro(r.scontoEuro)}`, true);

    animaNumero(elUna, 'una', r.una);
    animaNumero(elMese, 'mese', r.mese);
    elBreve.textContent = `${euro(r.una)}${r.mese ? ` + ${euro(r.mese)}/mese` : ''}`;

    // gamification dello sconto pacchetto
    const n = r.nServizi;
    elScontoBarra.style.width = `${Math.min(n, 3) / 3 * 100}%`;
    elScontoTesto.textContent = n >= 3 ? 'Sconto massimo sbloccato: −10% sulla parte una tantum'
      : n === 2 ? 'Sconto del 5% sbloccato! Con un terzo servizio arrivi al 10%'
      : n === 1 ? 'Aggiungi un secondo servizio: sblocchi il 5% di sconto'
      : 'Più servizi scegli, più risparmi';
    riep.querySelector('[data-sconto]').classList.toggle('attivo', n >= 2);

    if (r.risparmioVoucher > 0) {
      elVoucher.hidden = false;
      elVoucher.textContent = `Con il Voucher Doppia Transizione della Lombardia potresti risparmiare fino a ${euro(r.risparmioVoucher)} sulla parte AI (contributo del 50%, da verificare insieme: lo sportello si esaurisce in fretta).`;
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
  form.querySelectorAll('[data-extra]').forEach((r) => {
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
    const righe = [`Ciao Gabriele, ecco il mio progetto dal preventivo automatico:`, ''];
    for (const x of r.righe) {
      righe.push(`• ${x.nome} — ${x.livello}${x.dett.length ? ` (+ ${x.dett.join(', ')})` : ''}`);
    }
    righe.push('', `Tempi: ${r.tempi.nome}`);
    if (r.sconto) righe.push(`Sconto pacchetto: −${r.sconto * 100}%`);
    righe.push(`Totale indicativo: ${euro(r.una)} una tantum${r.mese ? ` + ${euro(r.mese)}/mese` : ''} (IVA esclusa)`);
    if (d) {
      righe.push('', `Nome: ${d.nome}`);
      if (d.azienda) righe.push(`Attività: ${d.azienda}`);
      if (d.settore) righe.push(`Settore: ${d.settore}`);
      righe.push(`Email: ${d.email}`, `Telefono: ${d.telefono}`, `Preferisco: ${d.canale}`);
      if (d.sito_attuale) righe.push(`Sito/social attuale: ${d.sito_attuale}`);
      if (d.messaggio) righe.push('', `Obiettivo: ${d.messaggio}`);
    }
    return righe.join('\n');
  }
  const waLink = (testo) => `https://wa.me/${contatti.whatsapp}?text=${encodeURIComponent(testo)}`;
  const mailLink = (testo) => `mailto:${contatti.email}?subject=${encodeURIComponent('Richiesta di preventivo dal sito')}&body=${encodeURIComponent(testo)}`;

  // senza indirizzo dello script, l'invio passa da WhatsApp (o email)
  if (!ENDPOINT) {
    const btn = form.querySelector('[data-invia]');
    btn.innerHTML = 'Invia su WhatsApp <span class="freccia" aria-hidden="true">→</span>';
    const mail = document.createElement('button');
    mail.type = 'button';
    mail.className = 'btn btn-vetro';
    mail.textContent = 'Invia per email';
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
      settore: f.settore.value, messaggio: f.messaggio.value.trim(), canale: f.canale.value, sito_attuale: f.sito_attuale.value.trim(),
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
    btn.textContent = 'Invio in corso…';
    try {
      // text/plain: richiesta "semplice", niente preflight CORS verso Google Apps Script
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          ...d, botcheck: '', progetto: testo, una: Math.round(r.una), mese: Math.round(r.mese), tempi: r.tempi.nome,
          servizi: r.righe.map((x) => `${x.nome} (${x.livello})`).join(', '), pagina: location.href,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.success === false) throw new Error('invio');
      fatto(d, 'modulo');
    } catch (_) {
      btn.disabled = false;
      btn.innerHTML = 'Riprova <span class="freccia" aria-hidden="true">→</span>';
      const err = form.querySelector('[data-errore="4"]');
      err.hidden = false;
      err.innerHTML = `Non sono riuscito a inviare la richiesta. Puoi mandarla <a href="${waLink(testo)}" target="_blank" rel="noopener">su WhatsApp</a> con un clic.`;
    }
  });

  function fatto(d, via) {
    traccia('preventivo_invio', { via });
    const r = calcola(leggi());
    const testo = testoProgetto(r, d);
    const box = form.querySelector('[data-fatto-azioni]');
    const p = form.querySelector('[data-fatto-testo]');
    p.textContent = via === 'modulo'
      ? `Grazie ${d.nome.split(' ')[0]}, ho ricevuto il tuo progetto. Ti ricontatto entro 24 ore${d.canale ? ` via ${d.canale.toLowerCase()}` : ''} con il preventivo definitivo.`
      : `Grazie ${d.nome.split(' ')[0]}! Si è aperto ${via === 'email' ? 'il programma di posta' : 'WhatsApp'} con il tuo progetto già scritto: premi invia e ti rispondo entro 24 ore.`;
    box.innerHTML = '';
    if (via !== 'modulo') {
      const a = document.createElement('a');
      a.className = 'btn btn-azione';
      a.href = via === 'email' ? mailLink(testo) : waLink(testo);
      a.target = '_blank'; a.rel = 'noopener';
      a.textContent = via === 'email' ? 'Apri di nuovo l\'email' : 'Apri di nuovo WhatsApp';
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
  }

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
  mostraBlocchi();
  aggiorna();
  vaiA(1, false);
}
