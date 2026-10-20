// Il profilo che il visitatore sceglie nel pannello «Il tuo sito»: il nome, chiaro o scuro, il colore d'accento.
// Resta solo nel suo browser (localStorage) e serve a rendere il sito più suo.
const CHIAVE = 'gd-profilo';
const html = document.documentElement;
export const lang = html.lang === 'en' ? 'en' : 'it';

const TESTI = {
  it: {
    wa: (n) => `Ciao, sono ${n}. Ho visto il sito di Desideri & Code e vorrei parlarvi di un progetto.`,
    // saluti senza genere: vanno bene per Marco e per Giulia
    saluto: (h) => (h >= 5 && h < 14 ? 'Buongiorno ' : h >= 14 && h < 18 ? 'Ciao ' : 'Buonasera '),
  },
  en: {
    wa: (n) => `Hi, I'm ${n}. I saw the Desideri & Code website and I'd like to talk to you about a project.`,
    saluto: (h) => (h >= 5 && h < 12 ? 'Good morning, ' : h >= 12 && h < 18 ? 'Good afternoon, ' : 'Good evening, '),
  },
}[lang];

export const ASPETTI = ['scuro', 'chiaro'];
export const ACCENTI = ['rosso', 'blu', 'verde', 'rosa', 'viola'];
const sistemaChiaro = () => window.matchMedia?.('(prefers-color-scheme: light)').matches;

// chiaro o scuro: quello scelto, altrimenti quello del telefono o del computer; il colore: quello scelto, altrimenti il rosso
export function applicaAspetto(p = leggiProfilo()) {
  const aspetto = ASPETTI.includes(p.aspetto) ? p.aspetto : sistemaChiaro() ? 'chiaro' : 'scuro';
  const accento = ACCENTI.includes(p.accento) ? p.accento : 'rosso';
  if (aspetto === 'chiaro') html.dataset.tema = 'chiaro'; else delete html.dataset.tema;
  if (accento === 'rosso') delete html.dataset.accento; else html.dataset.accento = accento;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', aspetto === 'chiaro' ? '#FAFAF8' : '#0A0A0A');
  window.dispatchEvent(new CustomEvent('gd-aspetto', { detail: { aspetto, accento } }));
  return { aspetto, accento };
}
// se il visitatore non ha scelto, il sito segue il sistema anche quando cambia (per esempio di sera)
window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change', () => { if (!leggiProfilo().aspetto) applicaAspetto(); });
// il colore d'accento in uso, per chi disegna su canvas (scena 3D, griglia, mappa)
export const coloreAccento = () => getComputedStyle(html).getPropertyValue('--rosso').trim() || '#e30613';
export const coloreTesto = () => getComputedStyle(html).getPropertyValue('--latte').trim() || '#ffffff';

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

// Applica il profilo alla pagina: nome nei titoli e nei messaggi
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
}
