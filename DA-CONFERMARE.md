# Da confermare prima di andare online

## Dati
- [ ] **Telefono e WhatsApp pubblici**: oggi `+39 338 342 4098` (dal CV). Va bene mostrarlo?
- [ ] **Email**: oggi `desiderigabriele@gmail.com`. Meglio un'email col dominio (es. `ciao@gabrieledesideri.it`).
- [ ] **Partita IVA** da mostrare nel footer (`contatti.piva` in `src/data/sito.js`).
- [ ] **Dominio**: oggi `gabrieledesideri.it` in `astro.config.mjs`, `robots.txt` e dati strutturati. Con il nome «Studio Desideri» i domini `studiodesideri.it` e `.com` sono già presi: liberi `studio-desideri.it`, `studio-desideri.com`, `studiodesiderimilano.it`, `studiodesideri.ch`. Tieni gabrieledesideri.it come reindirizzamento.
- [ ] **Nome «Studio Desideri»**: controllare che il marchio sia libero (UIBM, EUIPO) e che Instagram e LinkedIn siano liberi. In fattura: «Studio Desideri di Gabriele Desideri».
- [ ] **Foto tua** per la sezione "Chi sono" (oggi c'è solo il testo con il percorso).

## Contenuti
- [ ] **Recensioni** di Luigi Montini e Lorenzo Baldassarri per «Parlano di noi»: incolla le loro parole in `recensione` (in `lavori`, `src/data/sito.js`, e la traduzione in `src/data/en.js`). Finché non arrivano la scheda mostra la sfida del progetto. Non inventarle: le recensioni false sono vietate.
- [ ] **Consenso dei clienti** a mostrare nome, screenshot e link del loro sito.
- [ ] **Numeri reali** per i casi studio (richieste al mese, tempi di caricamento): aggiungili a `fatto` quando li hai.
- [ ] **Testi in inglese** (`src/data/en.js`, `src/i18n/ui.js`, pagine `/en`): rileggili o falli rileggere da un madrelingua prima di fare pubblicità all'estero.
- [x] **Logo definitivo** «Eclisse flat» nel sito (`public/brand/`).
- [ ] **E-commerce lanciati**: se puoi nominarne uno o due (anche tuoi), diventano un terzo caso studio.

## Tecnica
- [ ] Creare il foglio "Preventivi", incollare `apps-script/Code.gs`, pubblicarlo come app web e impostare `PUBLIC_PREVENTIVO_ENDPOINT` su Vercel. Senza, il preventivo si invia su WhatsApp o per email.
- [ ] Bot Telegram (`BOT_TOKEN`, `CHAT_ID`) nelle proprietà dello script.
- [ ] Google Analytics 4 / Meta Pixel: da collegare solo dopo il consenso (gli eventi `preventivo_inizio`, `preventivo_passo`, `preventivo_invio`, `clic_contatto`, `personalizza_aperto`, `personalizza_nome`, `personalizza_colore`, `calcolo_aperto`, `calcolo_passo`, `lingua` sono già pronti in `dataLayer`).
- [ ] **Privacy**: le pagine `/privacy` e `/en/privacy` sono bozze da far controllare.
- [ ] **Svizzera**: far controllare a un consulente svizzero l'impostazione «stessi prezzi per tutti + incontri e SEO svizzera come extra» (art. 3a LCSl) e al commercialista le diciture delle fatture verso la Svizzera. Aggiornare ogni tanto il cambio in `src/data/listino.js` (`cambio.CHF`).
- [ ] **Pagine dei servizi** (`src/data/pagine-servizi.js`): rileggere tempi e cifre indicative (Shopify «tra 30 e 110 € al mese», collegamenti «1-2 settimane», sistemi «3-6 settimane», pubblicità «10-20 € al giorno per partire», «4-8 settimane» per i risultati) e la frase sulla Cura «puoi smettere quando vuoi».
- [ ] **Software «tuo, non in affitto»** (`src/components/TuoSoftware.astro`, FAQ di Software e AI): prima di vendere, mettere per iscritto nel contratto che codice e dati sono del cliente e che, se smette l'assistenza, gli consegni tutto; decidere dove installi il software (spazio intestato al cliente: per esempio un suo account cloud o hosting) e chi paga l'hosting dopo. Per l'AI usa le API per aziende (Anthropic o OpenAI) e firma il loro DPA; per i clienti che lo chiedono attiva server in Europa o conservazione zero. Ricontrolla ogni tanto le condizioni dei fornitori: oggi dicono niente addestramento sui dati delle API e conservazione breve (al massimo 30 giorni).
- [ ] **Voucher Lombardia**: verificare che lo sportello 2026 sia ancora aperto prima di citarlo nelle campagne.
