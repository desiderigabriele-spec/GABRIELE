// Numeri all'italiana con il punto delle migliaia anche a 4 cifre (Intl in it-IT scrive "1500").
// In inglese: virgola delle migliaia e simbolo davanti (€1,500).
export const numero = (n, lang = 'it') => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.');
export const euro = (n, lang = 'it') => (lang === 'en' ? `€${numero(n, 'en')}` : `${numero(n)} €`);
