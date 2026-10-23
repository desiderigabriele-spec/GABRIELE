// La candidatura di «Lavora con noi» (components/PaginaChiSiamo.astro).
// Con lo script dei preventivi (PUBLIC_PREVENTIVO_ENDPOINT) la candidatura arriva nel foglio «Candidature» e il CV
// finisce in una cartella Drive (apps-script/Code.gs); senza, si apre un'email già scritta e il CV si allega lì.
const ENDPOINT = import.meta.env.PUBLIC_PREVENTIVO_ENDPOINT || '';
const MAX_CV = 5 * 1024 * 1024;

const form = document.querySelector('[data-candidatura]');
if (form) {
  const en = form.dataset.lang === 'en';
  const t = en ? {
    nome: 'Write your name.', email: 'Check your email address.', privacy: 'Tick the privacy box to send.', cv: 'The CV must be a PDF of up to 5 MB.',
    invio: 'Sending…', grazie: (n) => `Thanks ${n}! We got your application: we’ll reply within a week.`, mail: (n) => `Thanks ${n}! Your email is ready: attach your CV and press send.`,
    errore: 'It didn’t go through. Try again, or write to us at ', oggetto: 'Application', ruolo: 'Role', link: 'Link', messaggio: 'About me',
  } : {
    nome: 'Scrivi il tuo nome.', email: 'Controlla l’indirizzo email.', privacy: 'Spunta la casella della privacy per inviare.', cv: 'Il CV deve essere un PDF fino a 5 MB.',
    invio: 'Invio…', grazie: (n) => `Grazie ${n}! Abbiamo ricevuto la tua candidatura: ti rispondiamo entro una settimana.`, mail: (n) => `Grazie ${n}! L’email è pronta: allega il CV e premi invia.`,
    errore: 'Non è partita. Riprova, oppure scrivici a ', oggetto: 'Candidatura', ruolo: 'Ruolo', link: 'Link', messaggio: 'Su di me',
  };
  const f = form.elements;
  const err = form.querySelector('[data-errore]');
  const fatto = form.querySelector('[data-fatto]');
  const btn = form.querySelector('[data-invia]');
  const testoBtn = btn.innerHTML;

  // «Candidati per questo ruolo» sceglie già il ruolo
  document.querySelectorAll('[data-ruolo]').forEach((a) => a.addEventListener('click', () => { f.ruolo.value = a.dataset.ruolo; }));
  const ruolo = new URLSearchParams(location.search).get('ruolo');
  if (ruolo && [...f.ruolo.options].some((o) => o.value === ruolo)) f.ruolo.value = ruolo;

  const mostra = (msg, campo) => {
    err.hidden = !msg; err.textContent = msg || '';
    form.querySelector('.pv-privacy').classList.toggle('errore', campo === f.privacy);
    if (campo) campo.focus();
  };
  function valido() {
    if (!f.nome.value.trim()) return mostra(t.nome, f.nome), false;
    if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) return mostra(t.email, f.email), false;
    const cv = f.cv?.files?.[0];
    if (cv && (cv.size > MAX_CV || !/pdf$/i.test(cv.type || cv.name))) return mostra(t.cv, f.cv), false;
    if (!f.privacy.checked) return mostra(t.privacy, f.privacy), false;
    mostra('');
    return true;
  }
  const base64 = (file) => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = ko; r.readAsDataURL(file); });
  const nomeRuolo = () => f.ruolo.options[f.ruolo.selectedIndex].text;
  const finito = (msg) => { fatto.hidden = false; fatto.textContent = msg; form.classList.add('inviata'); window.gdTrack?.('candidatura_invio', { ruolo: f.ruolo.value }); };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (f.botcheck.checked || !valido()) return;
    const nome = f.nome.value.trim();
    const d = { tipo: 'candidatura', nome, email: f.email.value.trim(), ruolo: nomeRuolo(), link: f.link.value.trim(), messaggio: f.messaggio.value.trim(), pagina: location.href, botcheck: '' };
    if (!ENDPOINT) {
      const corpo = [`${t.ruolo}: ${d.ruolo}`, `${d.nome} · ${d.email}`, d.link && `${t.link}: ${d.link}`, d.messaggio && `\n${t.messaggio}: ${d.messaggio}`].filter(Boolean).join('\n');
      location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(`${t.oggetto}: ${d.ruolo} · ${nome}`)}&body=${encodeURIComponent(corpo)}`;
      finito(t.mail(nome.split(' ')[0]));
      return;
    }
    btn.disabled = true; btn.textContent = t.invio;
    try {
      const cv = f.cv?.files?.[0];
      if (cv) { d.cv = await base64(cv); d.cvNome = cv.name; }
      // text/plain: richiesta «semplice», niente preflight CORS verso Google Apps Script
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.success === false) throw new Error('invio');
      finito(t.grazie(nome.split(' ')[0]));
    } catch (_) {
      btn.disabled = false; btn.innerHTML = testoBtn;
      mostra(t.errore + form.dataset.email);
    }
  });
}
