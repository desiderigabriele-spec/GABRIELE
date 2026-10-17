// Il profilo che il visitatore sceglie nel benvenuto: nome, di cosa si occupa, colore.
// Resta solo nel suo browser (localStorage) e serve a rendere il sito più suo.
const CHIAVE = 'gd-profilo';
const html = document.documentElement;
export const lang = html.lang === 'en' ? 'en' : 'it';

export const TEMI_SITO = ['blu', 'rosso', 'viola', 'verde'];

// servizi consigliati e lavoro da mostrare per primo, per settore
export const SETTORI = {
  professionista: { servizi: ['sito', 'ads'], lavoro: 'lorenzo' },
  artigiano: { servizi: ['sito', 'ads'], lavoro: 'montini' },
  immobiliare: { servizi: ['sito', 'ads', 'integrazioni'], lavoro: 'lorenzo' },
  negozio: { servizi: ['ecommerce', 'ads'], lavoro: 'montini' },
  azienda: { servizi: ['software', 'integrazioni'], lavoro: 'lorenzo' },
  altro: { servizi: [], lavoro: 'lorenzo' },
};

const TESTI = {
  it: {
    wa: (n) => `Ciao Gabriele, sono ${n}. Ho visto il tuo sito e vorrei parlarti di un progetto.`,
    consigliato: 'Consigliato per te',
    // saluti senza genere: vanno bene per Marco e per Giulia
    saluto: (h) => (h >= 5 && h < 14 ? 'Buongiorno ' : h >= 14 && h < 18 ? 'Ciao ' : 'Buonasera '),
  },
  en: {
    wa: (n) => `Hi Gabriele, I'm ${n}. I saw your website and I'd like to talk about a project.`,
    consigliato: 'Recommended for you',
    saluto: (h) => (h >= 5 && h < 12 ? 'Good morning, ' : h >= 12 && h < 18 ? 'Good afternoon, ' : 'Good evening, '),
  },
}[lang];

export function leggiProfilo() {
  try { return JSON.parse(localStorage.getItem(CHIAVE) || 'null') || {}; } catch (_) { return {}; }
}
export function salvaProfilo(p) {
  try { localStorage.setItem(CHIAVE, JSON.stringify(p)); } catch (_) {}
}

// solo lettere, spazi, apostrofi e trattini; iniziale maiuscola
export function pulisciNome(v) {
  const n = String(v || '').replace(/[^\p{L}\s'’-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  return n ? n.charAt(0).toLocaleUpperCase(lang) + n.slice(1) : '';
}

export function impostaTema(tema) {
  const t = TEMI_SITO.includes(tema) ? tema : 'blu';
  if (t === 'blu') delete html.dataset.tema; else html.dataset.tema = t;
  window.dispatchEvent(new CustomEvent('gd-tema', { detail: t }));
}

// Applica il profilo alla pagina: nome nei titoli e nei messaggi, servizi consigliati, ordine dei lavori
const originali = new WeakMap();
export function applicaProfilo(p = leggiProfilo()) {
  const nome = p.nome || '';
  html.classList.toggle('ha-nome', !!nome);
  document.querySelectorAll('[data-nome]').forEach((el) => { el.textContent = nome; });
  // nell'hero il nome arriva con il saluto dell'ora: Buongiorno, Ciao (pomeriggio), Buonasera
  const saluto = TESTI.saluto(new Date().getHours());
  document.querySelectorAll('[data-saluto]').forEach((el) => { el.textContent = nome ? saluto : ''; });
  document.querySelectorAll('[data-riga-nome]').forEach((el) => { el.hidden = !nome; });
  document.querySelectorAll('[data-nome-prefisso]').forEach((el) => { el.textContent = nome ? `${nome}, ` : ''; });
  // dopo il nome la frase prosegue in minuscolo («Marco, trasformo…»)
  document.querySelectorAll('[data-minuscola]').forEach((el) => {
    if (!originali.has(el)) originali.set(el, el.textContent);
    const t = originali.get(el);
    el.textContent = nome ? t.charAt(0).toLocaleLowerCase(lang) + t.slice(1) : t;
  });
  document.querySelectorAll('a[data-wa]').forEach((a) => {
    const u = new URL(a.href);
    if (nome) u.searchParams.set('text', TESTI.wa(nome)); else if (!a.dataset.waTesto) u.searchParams.delete('text');
    if (a.dataset.waTesto && !nome) u.searchParams.set('text', a.dataset.waTesto);
    a.href = u.toString();
  });

  const settore = SETTORI[p.settore];
  document.querySelectorAll('[data-consiglio]').forEach((el) => el.remove());
  document.querySelectorAll('.consigliato').forEach((el) => el.classList.remove('consigliato'));
  if (settore) {
    settore.servizi.forEach((id) => {
      document.querySelectorAll(`.servizio[data-iride="${id}"], .pv-cat-card[data-iride="${id}"]`).forEach((card) => {
        card.classList.add('consigliato');
        const b = document.createElement('span');
        b.className = 'badge-consiglio';
        b.dataset.consiglio = '';
        b.textContent = TESTI.consigliato;
        card.appendChild(b);
      });
    });
    const lista = document.querySelector('[data-lavori]');
    const primo = lista?.querySelector(`[data-lavoro="${settore.lavoro}"]`);
    if (primo && lista.firstElementChild !== primo) lista.prepend(primo);
  }
}
