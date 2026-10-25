import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// l'elenco del blog va nella mappa per Google solo quando c'è almeno un articolo pubblicato (bozza: false)
const blogPubblicato = fs.readdirSync('./src/content/blog').some((f) => f.endsWith('.md') && /^bozza:\s*false\s*$/m.test(fs.readFileSync(`./src/content/blog/${f}`, 'utf8')));

// Telefoni con iOS vecchio (es. iPhone 7 su iOS 15): prima di ogni misura in svh
// (altezza dello schermo) scriviamo la stessa misura in vh, che capiscono tutti.
const svhDiRiserva = () => ({
  postcssPlugin: 'svh-di-riserva',
  Declaration(decl) {
    if (!/\d(svh|dvh|lvh)\b/.test(decl.value) || decl.prev()?.prop === decl.prop) return;
    decl.cloneBefore({ value: decl.value.replace(/(\d)(svh|dvh|lvh)\b/g, '$1vh') });
  },
});
svhDiRiserva.postcss = true;

// Browser che il sito deve reggere: Safari 14 e iOS 14 in su (iPhone 6s/7/8 compresi).
const BROWSER = ['safari14', 'ios14', 'chrome90', 'firefox90', 'edge90'];

export default defineConfig({
  site: 'https://desidericode.it',
  trailingSlash: 'never',
  // la mappa del sito per Google (senza la pagina 404)
  integrations: [sitemap({ filter: (pagina) => !/\/404\/?$/.test(pagina) && (blogPubblicato || !/\/blog\/?$/.test(pagina)) })],
  // un link si inizia a scaricare appena lo tocchi o lo clicchi: col salto tra le stelle (440 ms) la pagina dopo è già pronta
  prefetch: { prefetchAll: true, defaultStrategy: 'tap' },
  // CSS: il blocco comune a tutte le pagine è un file a parte, con il nome che cambia a ogni modifica,
  // così il browser lo scarica una volta sola e lo riusa su ogni pagina; i pezzetti piccoli restano dentro la pagina.
  // Contro la pagina «nuda» (un CSS che non arriva): l'HTML non resta mai in cache (vercel.json)
  // e se un file di stile manca la pagina lo richiede e al bisogno si ricarica (Base.astro).
  // _sd: cartella nuova per JS, CSS e font, così nessun browser riusa file salvati con il vecchio nome.
  build: { format: 'file', inlineStylesheets: 'auto', assets: '_sd' },
  vite: {
    build: {
      target: BROWSER, cssTarget: ['safari14', 'ios14', 'chrome90', 'firefox90', 'edge90'],
      // dentro la pagina solo i CSS sotto i 12 KB; per font e immagini resta la regola di Vite (4 KB)
      assetsInlineLimit: (file, contenuto) => (file.endsWith('.css') ? contenuto.length < 12000 : undefined),
    },
    css: { postcss: { plugins: [svhDiRiserva()] } },
  },
});
