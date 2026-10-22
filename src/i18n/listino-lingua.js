// Il listino nella lingua richiesta: categorie, tempi, incontri e contatti. Lo usa il preventivo nel browser,
// che così non si porta dietro gli altri testi del sito (servizi, metodo, lavori, domande).
import { contatti } from '../data/sito.js';
import * as listino from '../data/listino.js';
import { enContatti, enCategorie, enIncontri, enTempi } from '../data/en-listino.js';

export const perId = (lista, testi) => lista.map((x) => ({ ...x, ...(testi?.[x.id] || {}) }));

export function categorieEn() {
  return listino.categorie.map((c) => {
    const t = enCategorie[c.id] || {};
    return { ...c, ...t, livelli: perId(c.livelli, t.livelli), extra: perId(c.extra, t.extra) };
  });
}

export function listinoLingua(lang = 'it') {
  if (lang !== 'en') return { ...listino, contatti };
  return {
    ...listino,
    contatti: { ...contatti, ...enContatti },
    categorie: categorieEn(),
    tempi: perId(listino.tempi, enTempi),
    incontri: perId(listino.incontri, enIncontri),
  };
}
