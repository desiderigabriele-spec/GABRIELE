// Dati del sito nella lingua richiesta: in inglese sovrappone i testi di data/en.js agli originali.
import * as sito from '../data/sito.js';
import * as listino from '../data/listino.js';
import { en } from '../data/en.js';

const perId = (lista, testi) => lista.map((x) => ({ ...x, ...(testi?.[x.id] || {}) }));

function categorieEn() {
  return listino.categorie.map((c) => {
    const t = en.categorie[c.id] || {};
    return { ...c, ...t, livelli: perId(c.livelli, t.livelli), extra: perId(c.extra, t.extra) };
  });
}

export function dati(lang = 'it') {
  if (lang !== 'en') return { ...sito, ...listino };
  return {
    ...sito,
    ...listino,
    contatti: { ...sito.contatti, ...en.contatti },
    servizi: perId(sito.servizi, en.servizi),
    metodo: sito.metodo.map((m, i) => ({ ...m, ...en.metodo[i] })),
    lavori: perId(sito.lavori, en.lavori),
    faq: en.faq,
    categorie: categorieEn(),
    tempi: perId(listino.tempi, en.tempi),
  };
}
