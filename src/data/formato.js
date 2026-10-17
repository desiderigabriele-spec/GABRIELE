// Numeri all'italiana con il punto delle migliaia anche a 4 cifre (Intl in it-IT scrive "1500").
// In inglese: virgola delle migliaia e simbolo davanti (€1,500).
export const numero = (n, lang = 'it') => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.');
export const euro = (n, lang = 'it') => (lang === 'en' ? `€${numero(n, 'en')}` : `${numero(n)} €`);
// Franchi svizzeri all'uso svizzero (CHF 1'410), arrotondati a 10 sopra i mille e a 5 sotto
export const franchi = (n) => `CHF ${String(n >= 1000 ? Math.round(n / 10) * 10 : Math.round(n / 5) * 5).replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
