// Dati del sito nella lingua richiesta: in inglese sovrappone i testi di data/en.js agli originali.
import * as sito from '../data/sito.js';
import * as listino from '../data/listino.js';
import { en } from '../data/en.js';
import { perId, listinoLingua } from './listino-lingua.js';

export function dati(lang = 'it') {
  if (lang !== 'en') return { ...sito, ...listino };
  return {
    ...sito,
    ...listinoLingua('en'),
    servizi: perId(sito.servizi, en.servizi),
    metodo: sito.metodo.map((m, i) => ({ ...m, ...en.metodo[i] })),
    lavori: perId(sito.lavori, en.lavori),
    faq: en.faq,
  };
}
