import { defineConfig } from 'astro/config';

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
  site: 'https://www.gabrieledesideri.it',
  trailingSlash: 'never',
  // CSS dentro ogni pagina: nessun file di stile da scaricare a parte, quindi la pagina
  // non può mai restare «nuda» per un CSS vecchio o rotto rimasto nella cache del browser.
  // _sd: cartella nuova per JS e font, così nessun browser riusa file salvati con il vecchio nome.
  build: { format: 'file', inlineStylesheets: 'always', assets: '_sd' },
  vite: {
    build: { target: BROWSER, cssTarget: ['safari14', 'ios14', 'chrome90', 'firefox90', 'edge90'] },
    css: { postcss: { plugins: [svhDiRiserva()] } },
  },
});
