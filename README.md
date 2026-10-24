# Desideri&Code — sito di Gabriele Desideri

**Stato:** prima versione completa (anteprima, alcuni dati da confermare) · aggiornato il 22 ottobre 2026

Sito che porta il visitatore **dal primo sguardo al «sì»**: cinque capitoli (Attenzione, Interesse, Fiducia, Desiderio, Azione) accompagnati da un cielo stellato: a ogni capitolo si viaggia più veloci tra le stelle (con lo sfondo chiaro, stelle d'inchiostro sulla carta), più un **preventivo automatico** dove il cliente compone il progetto e vede il prezzo in tempo reale.

## Avviare il sito

```bash
npm install
npm run dev      # sviluppo su http://localhost:4321
npm run build    # build statica in dist/
npm run preview  # anteprima della build
```

Stack: Astro (statico) · WebGL scritto a mano per il cielo (nessuna libreria 3D) · Lenis per lo scroll fluido · animazioni d'ingresso in `src/scripts/moto.js` · font Inter Tight / Inter / JetBrains Mono ospitati in locale, solo alfabeto latino (`src/styles/caratteri.css`; Bodoni Moda, Hanken Grotesk e DM Mono solo nel confronto prima/dopo). Deploy pronto per Vercel (`vercel.json`).

## Dove si cambia cosa

| Cosa | File |
|---|---|
| Contatti, servizi, metodo, lavori, domande frequenti | `src/data/sito.js` |
| **Listino interno** (pacchetti, voci incluse, extra: sul sito solo nomi e voci, mai i prezzi) | `src/data/listino.js` |
| Home (italiano e inglese) | `src/components/Home.astro` · pagine `src/pages/index.astro`, `src/pages/en/index.astro` |
| Testi in inglese | interfaccia `src/i18n/ui.js` · dati (servizi, listino, FAQ) `src/data/en.js` |
| Il nome del visitatore: benvenuto e bottone NO/ME nell'header | `src/scripts/benvenuto.js` · `src/scripts/profilo.js` |
| Pagine dei servizi (testi, anteprime) | `src/components/PaginaServizio.astro` · `src/data/pagine-servizi.js` · `src/components/Anteprima.astro` · `src/styles/anteprime.css` · `src/styles/servizio.css` (pagine `/servizi/...`, `/en/services/...`) |
| Pagina «AI per aziende» (spiegata semplice) | `src/components/PaginaAI.astro` (pagine `/intelligenza-artificiale`, `/en/ai`) · `src/styles/ai.css` |
| Richiesta di preventivo (nome, cognome, email, telefono, servizi, progetto: il preventivo vero si manda scritto dopo la chiamata) | `src/components/Preventivo.astro` (pagine `/preventivo`, `/en/quote`) · `src/scripts/preventivo.js` · `src/styles/preventivo.css` |
| Cielo stellato e «viaggio» | `src/scripts/scena.js` (velocità per capitolo: attributo `data-forma` 0-4 sulle sezioni) · con lo sfondo chiaro le stelle sono d'inchiostro |
| Colori (nero e rosso, sfondo chiaro o scuro), tipografia, componenti | `src/styles/global.css` · effetti `src/styles/vita.css` · Focus `src/styles/assistente.css` |
| Invio preventivi su Google Fogli + Telegram | `apps-script/Code.gs` + variabile `PUBLIC_PREVENTIVO_ENDPOINT` (vedi `.env.example`) |
| Pagina «Chi siamo» e candidature | `src/components/PaginaChiSiamo.astro` (pagine `/chi-siamo`, `/en/about`) · `src/styles/chisiamo.css` · `src/scripts/candidatura.js` (invio con lo stesso `apps-script/Code.gs`, oppure email) |
| Blog | Articoli in `src/content/blog/*.md` (`src/content.config.ts`), pagine `src/pages/blog/` · `src/styles/blog.css`. Un articolo nuovo è una bozza (`bozza: true`) e va online con `bozza: false`; le bozze si vedono in locale con `MOSTRA_BOZZE=1`. Piano e regole: `docs/blog-piano.md` |

## Documenti

| File | Cosa contiene |
|---|---|
| [`docs/01-ricerca-mercato-prezzi.md`](docs/01-ricerca-mercato-prezzi.md) | Ricerca di mercato Milano/Italia, concorrenza, listino consigliato, psicologia dei prezzi, note fiscali |
| [`docs/02-benchmark-e-concept-sito.md`](docs/02-benchmark-e-concept-sito.md) | Analisi di Lusion, Active Theory, Igloo Inc, Lando Norris, Stripe, Linear…; concept, colori, font, struttura, specifica del preventivo |
| [`DA-CONFERMARE.md`](DA-CONFERMARE.md) | Dati e scelte da verificare prima di andare online |

## Accessibilità e prestazioni

- Testo vero, contrasto alto, navigazione da tastiera, link "Vai al contenuto".
- Con "riduci movimento" attivo: niente scroll fluido, niente animazioni, cielo fermo.
- Il cielo stellato si carica **dopo** il testo e si ferma con la scheda nascosta (con lo sfondo chiaro le stelle sono d'inchiostro); senza WebGL il sito funziona uguale.
- Il CSS comune è un file a parte con il nome che cambia a ogni modifica: si scarica una volta e resta in cache; l'HTML invece si ricontrolla sempre (`vercel.json`).
- Le animazioni che non si vedono (fuori dallo schermo o nel menu chiuso) stanno in pausa.
- Statistiche e pubblicità solo dopo il consenso cookie (`window.gdTrack` invia a `dataLayer` solo con consenso).
