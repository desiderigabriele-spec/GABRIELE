# Da confermare prima di andare online

## Dati
- [ ] **Telefono e WhatsApp pubblici**: oggi `+39 338 342 4098` (dal CV). Va bene mostrarlo?
- [ ] **Email**: oggi `desiderigabriele@gmail.com`. Meglio un'email col dominio (es. `ciao@gabrieledesideri.it`).
- [ ] **Partita IVA** da mostrare nel footer (`contatti.piva` in `src/data/sito.js`).
- [ ] **Dominio**: oggi `gabrieledesideri.it` in `astro.config.mjs`, `robots.txt` e dati strutturati.
- [ ] **Foto tua** per la sezione "Chi sono" (oggi c'è solo il testo con il percorso).

## Contenuti
- [ ] **Recensioni** di Luigi Montini e Lorenzo Baldassarri: lo spazio è pronto (`recensione` in `lavori`, `src/data/sito.js`). Finché non arrivano compare "Recensione del cliente in arrivo". Non inventarle.
- [ ] **Consenso dei clienti** a mostrare nome, screenshot e link del loro sito.
- [ ] **Numeri reali** per i casi studio (richieste al mese, tempi di caricamento): aggiungili a `fatto` quando li hai.
- [ ] **"Vendita immobiliare a Milano"** nel percorso: va bene mostrarlo? (È un punto di forza sulla vendita, ma decidi tu.)
- [ ] **Testi in inglese** (`src/data/en.js`, `src/i18n/ui.js`, pagine `/en`): rileggili o falli rileggere da un madrelingua prima di fare pubblicità all'estero.
- [ ] **Logo definitivo**: sostituire `src/assets/marchio.svg` e `public/favicon.svg` con l'SVG finale (il cerchio del punto con `class="punto-segnale"` per farlo pulsare).
- [ ] **E-commerce lanciati**: se puoi nominarne uno o due (anche tuoi), diventano un terzo caso studio.

## Tecnica
- [ ] Creare il foglio "Preventivi", incollare `apps-script/Code.gs`, pubblicarlo come app web e impostare `PUBLIC_PREVENTIVO_ENDPOINT` su Vercel. Senza, il preventivo si invia su WhatsApp o per email.
- [ ] Bot Telegram (`BOT_TOKEN`, `CHAT_ID`) nelle proprietà dello script.
- [ ] Google Analytics 4 / Meta Pixel: da collegare solo dopo il consenso (gli eventi `preventivo_inizio`, `preventivo_passo`, `preventivo_invio`, `clic_contatto`, `personalizza_nome`, `personalizza_settore`, `personalizza_colore`, `lingua` sono già pronti in `dataLayer`).
- [ ] **Privacy**: le pagine `/privacy` e `/en/privacy` sono bozze da far controllare.
- [ ] **Svizzera**: far controllare a un consulente svizzero l'impostazione «stessi prezzi per tutti + incontri e SEO svizzera come extra» (art. 3a LCSl) e al commercialista le diciture delle fatture verso la Svizzera. Aggiornare ogni tanto il cambio in `src/data/listino.js` (`cambio.CHF`).
- [ ] **Voucher Lombardia**: verificare che lo sportello 2026 sia ancora aperto prima di citarlo nelle campagne.
