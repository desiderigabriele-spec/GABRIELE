// Numeri all'italiana con il punto delle migliaia anche a 4 cifre (Intl in it-IT scrive "1500").
export const numero = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const euro = (n) => `${numero(n)} €`;
