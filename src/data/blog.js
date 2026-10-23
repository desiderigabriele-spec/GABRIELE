// Gli articoli del blog pronti per la pagina: senza bozze (salvo MOSTRA_BOZZE=1), dal più recente.
import { getCollection } from 'astro:content';

export const mostraBozze = process.env.MOSTRA_BOZZE === '1';

export async function articoli() {
  const tutti = await getCollection('blog', ({ data }) => mostraBozze || !data.bozza);
  return tutti.sort((a, b) => b.data.data.valueOf() - a.data.data.valueOf());
}

// minuti di lettura, a 200 parole al minuto
export const minuti = (testo = '') => Math.max(1, Math.round(testo.split(/\s+/).filter(Boolean).length / 200));

export const giorno = (d) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
