// Il blog: un file Markdown per articolo in src/content/blog. Un articolo nuovo nasce come bozza (bozza: true)
// e va online solo quando la bozza diventa false. Per vedere le bozze in locale: MOSTRA_BOZZE=1 npx astro build
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    titolo: z.string(),
    // la frase sotto il titolo e la descrizione per Google (150-160 caratteri)
    descrizione: z.string(),
    data: z.coerce.date(),
    aggiornato: z.coerce.date().optional(),
    categoria: z.enum(['Prezzi', 'Siti web', 'Negozi online', 'Pubblicità', 'AI e automazioni', 'Contributi']),
    // il servizio a cui porta l'articolo, in fondo alla pagina
    servizio: z.enum(['sito', 'ecommerce', 'software', 'gestionale', 'ads', 'cura']).optional(),
    bozza: z.boolean().default(true),
  }),
});

export const collections = { blog };
