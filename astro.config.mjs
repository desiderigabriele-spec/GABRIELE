import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.gabrieledesideri.it',
  trailingSlash: 'never',
  // CSS dentro ogni pagina: nessun file di stile da scaricare a parte, quindi la pagina
  // non può mai restare «nuda» per un CSS vecchio o rotto rimasto nella cache del browser.
  // _sd: cartella nuova per JS e font, così nessun browser riusa file salvati con il vecchio nome.
  build: { format: 'file', inlineStylesheets: 'always', assets: '_sd' },
});
