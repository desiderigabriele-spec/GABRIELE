// La richiesta di preventivo (components/Preventivo.astro): controlla i campi, la manda allo script di Google
// (PUBLIC_PREVENTIVO_ENDPOINT) e, se lo script non c'è o non risponde, apre WhatsApp con la richiesta già scritta.
// Si riempie da sola con il nome del profilo, il servizio scelto (?s=sito o ?s=software:automazione)
// e quello che il visitatore ha calcolato nel «quanto ti fa risparmiare» della home.
import { leggiProfilo } from './profilo.js';

const ENDPOINT = import.meta.env.PUBLIC_PREVENTIVO_ENDPOINT || '';
const traccia = (e, d) => window.gdTrack?.(e, d);

const TESTI = {
  it: {
    nome: 'Scrivi il tuo nome.', cognome: 'Scrivi il tuo cognome.', email: 'Controlla l’indirizzo email.', telefono: 'Scrivi un numero di telefono.',
    privacy: 'Spunta la casella della privacy per inviare.', invio: 'Invio in corso…', riprova: 'Riprova',
    titolo: 'Richiesta di preventivo', servizi: 'Mi serve', azienda: 'Azienda', sito: 'Sito attuale', tempi: 'Partenza', canale: 'Preferisco', progetto: 'Il progetto',
    grazie: (n, c) => `Grazie ${n}! Abbiamo ricevuto la tua richiesta. Ti contattiamo entro 24 ore${c ? ` (${c.toLowerCase()})` : ''} per conoscerci, poi ti mandiamo il preventivo scritto.`,
    grazieWa: (n) => `Grazie ${n}! Si è aperto WhatsApp con la tua richiesta già scritta: premi invia e ti rispondiamo entro 24 ore.`,
    errore: (e) => `Non siamo riusciti a inviare la richiesta. Riprova, oppure scrivici a ${e} o su WhatsApp.`,
    riapriWa: 'Apri di nuovo WhatsApp', waSi: 'Mandala su WhatsApp',
  },
  en: {
    nome: 'Write your first name.', cognome: 'Write your last name.', email: 'Check your email address.', telefono: 'Write a phone number.',
    privacy: 'Tick the privacy box to send.', invio: 'Sending…', riprova: 'Try again',
    titolo: 'Quote request', servizi: 'I need', azienda: 'Company', sito: 'Current site', tempi: 'Start', canale: 'Preferred contact', progetto: 'The project',
    grazie: (n, c) => `Thank you ${n}! We’ve received your request. We’ll contact you within 24 hours${c ? ` (${c.toLowerCase()})` : ''} to get to know you, then send you the written quote.`,
    grazieWa: (n) => `Thank you ${n}! WhatsApp has opened with your request already written: press send and we’ll reply within 24 hours.`,
    errore: (e) => `We couldn’t send the request. Try again, or write to us at ${e} or on WhatsApp.`,
    riapriWa: 'Open WhatsApp again', waSi: 'Send it on WhatsApp',
  },
};

const form = document.querySelector('[data-preventivo]');
if (form) {
  const lang = form.dataset.lang === 'en' ? 'en' : 'it';
  const t = TESTI[lang];
  const f = form.elements;
  const err = form.querySelector('[data-errore]');
  const btn = form.querySelector('[data-invia]');
  const testoBtn = btn.innerHTML;

  // già compilato quello che sappiamo
  const p = leggiProfilo();
  if (p.nome && !f.nome.value) f.nome.value = p.nome;
  const s = new URLSearchParams(location.search).get('s');
  if (s) form.querySelectorAll('[name="servizi"]').forEach((c) => { if (c.value === s.split(':')[0]) c.checked = true; });
  try {
    const calcolo = localStorage.getItem('gd-calcolo');
    if (calcolo && !f.messaggio.value) {
      f.messaggio.value = calcolo;
      form.querySelector('[name="servizi"][value="software"]').checked = true;
      localStorage.removeItem('gd-calcolo');
    }
  } catch (_) {}

  const mostra = (msg, campo) => {
    err.hidden = !msg; err.textContent = msg || '';
    form.querySelectorAll('.errore').forEach((x) => x.classList.remove('errore'));
    if (campo) { (campo.closest('label') || campo).classList.add('errore'); campo.focus(); }
  };
  function valido() {
    if (!f.nome.value.trim()) return mostra(t.nome, f.nome), false;
    if (!f.cognome.value.trim()) return mostra(t.cognome, f.cognome), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) return mostra(t.email, f.email), false;
    if (f.telefono.value.replace(/\D/g, '').length < 6) return mostra(t.telefono, f.telefono), false;
    if (!f.privacy.checked) return mostra(t.privacy, f.privacy), false;
    mostra('');
    return true;
  }
  const leggi = () => ({
    nome: f.nome.value.trim(), cognome: f.cognome.value.trim(), email: f.email.value.trim(), telefono: f.telefono.value.trim(),
    azienda: f.azienda.value.trim(), sito: f.sito.value.trim(), messaggio: f.messaggio.value.trim(),
    tempi: f.tempi.value, canale: f.canale.value,
    servizi: [...form.querySelectorAll('[name="servizi"]:checked')].map((c) => c.dataset.nomeServizio),
  });
  const testo = (d) => [
    `${t.titolo} · Desideri&Code`, '',
    `${d.nome} ${d.cognome}${d.azienda ? ` · ${d.azienda}` : ''}`, `${d.email} · ${d.telefono}`,
    d.servizi.length && `${t.servizi}: ${d.servizi.join(', ')}`,
    d.sito && `${t.sito}: ${d.sito}`, `${t.tempi}: ${d.tempi}`, `${t.canale}: ${d.canale}`,
    d.messaggio && `\n${t.progetto}: ${d.messaggio}`,
  ].filter(Boolean).join('\n');
  const waLink = (d) => `https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(testo(d))}`;

  function fatto(d, via) {
    btn.closest('.pv-invio').hidden = true;
    const box = form.querySelector('[data-fatto]');
    box.hidden = false;
    form.classList.add('inviato');
    box.querySelector('[data-fatto-testo]').textContent = via === 'modulo' ? t.grazie(d.nome, d.canale) : t.grazieWa(d.nome);
    const azioni = box.querySelector('[data-fatto-azioni]');
    azioni.replaceChildren();
    if (via === 'whatsapp') {
      const a = Object.assign(document.createElement('a'), { className: 'btn btn-vetro', href: waLink(d), target: '_blank', rel: 'noopener', textContent: t.riapriWa });
      azioni.appendChild(a);
    }
    box.focus({ preventScroll: true });
    box.scrollIntoView({ block: 'center', behavior: 'smooth' });
    traccia('preventivo_invio', { via, servizi: d.servizi.join(',') });
  }

  let iniziato = false;
  form.addEventListener('input', () => { if (!iniziato) { iniziato = true; traccia('preventivo_inizio'); } });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (f.botcheck.checked || !valido()) return;
    const d = leggi();
    if (!ENDPOINT) {
      window.open(waLink(d), '_blank', 'noopener');
      fatto(d, 'whatsapp');
      return;
    }
    btn.disabled = true; btn.textContent = t.invio;
    try {
      // text/plain: richiesta «semplice», niente preflight CORS verso Google Apps Script
      const res = await fetch(ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          tipo: 'richiesta', nome: `${d.nome} ${d.cognome}`, azienda: d.azienda, email: d.email, telefono: d.telefono, canale: d.canale,
          servizi: d.servizi.join(', '), tempi: d.tempi, sito_attuale: d.sito, messaggio: d.messaggio, progetto: testo(d),
          pagina: location.href, lingua: lang, botcheck: '',
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.success === false) throw new Error('invio');
      fatto(d, 'modulo');
    } catch (_) {
      btn.disabled = false; btn.innerHTML = testoBtn;
      mostra(t.errore(form.dataset.email));
      const a = Object.assign(document.createElement('a'), { href: waLink(d), target: '_blank', rel: 'noopener', textContent: ` ${t.waSi} ↗` });
      err.appendChild(a);
    }
  });
}
