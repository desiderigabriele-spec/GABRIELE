# Studio Desideri — sito di Gabriele Desideri

**Stato:** prima versione completa (anteprima, alcuni dati da confermare) · aggiornato il 16 ottobre 2026

Sito che porta il visitatore **dal primo sguardo al «sì»**: cinque capitoli (Attenzione, Interesse, Fiducia, Desiderio, Azione) accompagnati da migliaia di particelle 3D che cambiano forma (occhio → rete neurale → spirale → cuore → stella), più un **preventivo automatico** dove il cliente compone il progetto e vede il prezzo in tempo reale.

## Avviare il sito

```bash
npm install
npm run dev      # sviluppo su http://localhost:4321
npm run build    # build statica in dist/
npm run preview  # anteprima della build
```

Stack: Astro (statico) · three.js (shader scritti a mano) · GSAP + ScrollTrigger · Lenis · font Syne / Inter / Instrument Serif / JetBrains Mono ospitati in locale. Deploy pronto per Vercel (`vercel.json`).

## Dove si cambia cosa

| Cosa | File |
|---|---|
| Contatti, servizi, metodo, lavori, domande frequenti | `src/data/sito.js` |
| **Prezzi del preventivo automatico** (livelli, extra, sconti, voucher) | `src/data/listino.js` |
| Home (italiano e inglese) | `src/components/Home.astro` · pagine `src/pages/index.astro`, `src/pages/en/index.astro` |
| Testi in inglese | interfaccia `src/i18n/ui.js` · dati (servizi, listino, FAQ) `src/data/en.js` |
| Benvenuto e personalizzazione (nome, settore, colore) | `src/scripts/benvenuto.js` · `src/scripts/profilo.js` |
| Preventivo automatico | `src/components/Preventivo.astro` (pagine `/preventivo`, `/en/quote`) · `src/scripts/preventivo.js` · `src/styles/preventivo.css` |
| Scena 3D a particelle | `src/scripts/scena.js` (forma per sezione: attributo `data-forma` 0-4, `data-lato`, `data-luce`, `data-scala`) |
| Colori, temi (blu, rosso, viola, verde), tipografia, componenti | `src/styles/global.css` |
| Invio preventivi su Google Fogli + Telegram | `apps-script/Code.gs` + variabile `PUBLIC_PREVENTIVO_ENDPOINT` (vedi `.env.example`) |

## Documenti

| File | Cosa contiene |
|---|---|
| [`docs/01-ricerca-mercato-prezzi.md`](docs/01-ricerca-mercato-prezzi.md) | Ricerca di mercato Milano/Italia, concorrenza, listino consigliato, psicologia dei prezzi, note fiscali |
| [`docs/02-benchmark-e-concept-sito.md`](docs/02-benchmark-e-concept-sito.md) | Analisi di Lusion, Active Theory, Igloo Inc, Lando Norris, Stripe, Linear…; concept, colori, font, struttura, specifica del preventivo |
| [`DA-CONFERMARE.md`](DA-CONFERMARE.md) | Dati e scelte da verificare prima di andare online |

## Accessibilità e prestazioni

- Testo vero, contrasto alto, navigazione da tastiera, link "Vai al contenuto".
- Con "riduci movimento" attivo: niente scroll fluido, niente animazioni, particelle ferme.
- La scena 3D si carica **dopo** il testo e usa meno particelle su telefoni e computer poco potenti; senza WebGL il sito funziona uguale.
- Statistiche e pubblicità solo dopo il consenso cookie (`window.gdTrack` invia a `dataLayer` solo con consenso).
