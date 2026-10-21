# Da confermare prima di andare online

## Dati
- [ ] **Telefono e WhatsApp pubblici**: oggi `+39 338 342 4098` (dal CV). Va bene mostrarlo?
- [ ] **Email**: oggi `desiderigabriele@gmail.com`. Meglio un'email col dominio (es. `ciao@gabrieledesideri.it`).
- [ ] **Partita IVA** da mostrare nel footer (`contatti.piva` in `src/data/sito.js`).
- [ ] **Dominio**: oggi `gabrieledesideri.it` in `astro.config.mjs`, `robots.txt` e dati strutturati. Con il nome «Desideri&Code» i domini `studiodesideri.it` e `.com` sono già presi: liberi `studio-desideri.it`, `studio-desideri.com`, `studiodesiderimilano.it`, `studiodesideri.ch`. Tieni gabrieledesideri.it come reindirizzamento.
- [ ] **Nome «Desideri&Code»**: controllare che il marchio sia libero (UIBM, EUIPO) e che Instagram e LinkedIn siano liberi. In fattura: «Desideri&Code di Gabriele Desideri».
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
- [ ] Google Analytics 4 / Meta Pixel: da collegare solo dopo il consenso (gli eventi `preventivo_inizio`, `preventivo_passo`, `preventivo_invio`, `clic_contatto`, `nome_chiesto`, `nome_dato`, `nome_saltato`, `nome_cambiato`, `calcolo_aperto`, `calcolo_passo`, `lingua` sono già pronti in `dataLayer`).
- [ ] **Privacy**: le pagine `/privacy` e `/en/privacy` sono bozze da far controllare.
- [ ] **Svizzera**: far controllare a un consulente svizzero l'impostazione «stessi prezzi per tutti + incontri e SEO svizzera come extra» (art. 3a LCSl) e al commercialista le diciture delle fatture verso la Svizzera. Aggiornare ogni tanto il cambio in `src/data/listino.js` (`cambio.CHF`).
- [ ] **Pagine dei servizi** (`src/data/pagine-servizi.js`): rileggere tempi e cifre indicative (Shopify «tra 30 e 110 € al mese», collegamenti «1-2 settimane», sistemi «3-6 settimane», pubblicità «10-20 € al giorno per partire», «4-8 settimane» per i risultati) e la frase sulla Cura «puoi smettere quando vuoi».
- [ ] **Software «tuo, non in affitto»** (`src/components/TuoSoftware.astro`, FAQ di Software e AI): prima di vendere, mettere per iscritto nel contratto che codice e dati sono del cliente e che, se smette l'assistenza, gli consegni tutto; decidere dove installi il software (spazio intestato al cliente: per esempio un suo account cloud o hosting) e chi paga l'hosting dopo. Per l'AI usa le API per aziende (Anthropic o OpenAI) e firma il loro DPA; per i clienti che lo chiedono attiva server in Europa o conservazione zero. Ricontrolla ogni tanto le condizioni dei fornitori: oggi dicono niente addestramento sui dati delle API e conservazione breve (al massimo 30 giorni).
- [ ] **Cosa includono i pacchetti** (`include` in `src/data/listino.js` e `src/data/en.js`): rileggere le liste, perché ora sono promesse scritte. In particolare: identità visiva nel Signature (il logo resta un extra da 850 €), «Velocità al top (punteggio Google oltre 90)», «Scheda Google Business Profile» nel Presenza, tracciamento lato server nelle pubblicità Growth.
- [ ] **Nome «Desideri&Code»**: prima di stampare o registrare, controlla il marchio su UIBM ed EUIPO, il Registro Imprese e il nome su Instagram. Registra il dominio (per esempio desideriandcode.com o .it, che il 20 ottobre risultavano liberi). Aggiorna email, LinkedIn e firma. Il video intro in `social/intro/` è rifatto con il nome e lo stile nuovi. Il video «Lavori» di Luigi ha già il modello nuovo (`social/lavori/luigi/video.html`) ma va ancora renderizzato: serve il sito di Luigi in locale (`sito-montini`) per riprendere lo scorrimento (`node social/lavori/riprendi.mjs luigi`, poi `node social/lavori/render.mjs luigi`).
- [ ] **Gestionale su misura** (`src/data/listino.js`): i prezzi sono una prima proposta. Essenziale 4.900 € + 79 €/mese, Completo 8.900 € + 149 €/mese, Completo + AI 13.900 € + 249 €/mese; extra: area 1.500 €, funzione AI 1.900 €, migrazione 900 €, app 1.200 €. Vanno confrontati con i tempi veri di sviluppo, anche i tempi di consegna (4-6, 8-10 e 10-12 settimane). Da verificare anche se il Voucher Doppia Transizione copre i gestionali: per ora il preventivo lo calcola solo su Automazioni e AI.
- [ ] **Demo dal vivo** (`src/data/demo.js`): le cifre prima/dopo (5-10 minuti a messaggio, 45 minuti a preventivo, 3 minuti per controllare, 2 h 40 min risparmiate) sono indicative: tienile allineate a quello che vedi davvero sui primi progetti. La pagina promette che nella Diagnosi AI mostri al cliente come funzionerebbe da lui: prepara una demo base da adattare (per esempio un flusso n8n e un assistente con i suoi documenti).
- [ ] **Voucher Lombardia**: verificare che lo sportello 2026 sia ancora aperto prima di citarlo nelle campagne.

## Focus, l'AI vera nella chat
Oggi Focus risponde con i bottoni (prezzi, preventivo, WhatsApp) e passa le domande scritte a WhatsApp. Per farlo rispondere con l'AI (Claude) serve: una chiave API messa nelle impostazioni di Vercel, un tetto di spesa mensile e una riga nell'informativa privacy. Da decidere con Gabriele.
