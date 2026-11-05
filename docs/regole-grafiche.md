# Regole grafiche del sito

Regole prese solo da fonti ufficiali o riconosciute. Valgono per tutte le pagine.

| Cosa | Regola | Fonte |
|---|---|---|
| Spazi | Tutti gli spazi sono multipli di 8 px (`--sp-1` … `--sp-16`) | Material Design, griglia a 8 dp |
| Spazio tra sezioni | `clamp(80px, 9vw, 128px)`: 80 px su telefono, 128 px su computer | Material Design (multipli di 8); scelta di ritmo |
| Titolo → contenuto | `clamp(40px, 5vw, 64px)` | come sopra |
| Lunghezza riga | testi lunghi al massimo ~62 caratteri (`.lead { max-width: 62ch }`) | WCAG 1.4.8 (≤ 80); Butterick, 45–90; ricerca sulla leggibilità, 50–70 |
| Interlinea | testo corrente almeno 1.5; titoli 1.0–1.2 | WCAG 1.4.12; Butterick, 120–145 % |
| Testo | mai sotto 16 px per il testo da leggere; footer e note 15 px (testo secondario) | Butterick, 15–25 px; web.dev |
| Contrasto | almeno 4.5:1 per il testo normale, 3:1 per il testo grande | WCAG 1.4.3 |
| Aree da toccare | col dito almeno 44 px; col mouse basta il minimo di 24 px (es. righe del footer ~34 px) | WCAG 2.5.5 / 2.5.8; Apple HIG 44 pt; web.dev 48 px |
| Dentro lo schermo | hero e passi del metodo stanno in una schermata anche sui portatili bassi (~650 px): misure legate all'altezza (svh) | scelta di progetto |
| Scritte che scorrono | due righe, `clamp(1.6rem, 3.4vw, 3rem)`, 24 px sopra e sotto | decorative: non devono rubare spazio al contenuto |


## Fonti
- WCAG 2.2, dimensione delle aree da toccare: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- WCAG 2.2, spaziatura del testo: https://www.w3.org/WAI/WCAG22/Understanding/text-spacing
- WCAG 2.2, contrasto minimo: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- Material Design, metodi di spaziatura: https://material.io/design/layout/spacing-methods.html
- web.dev, aree da toccare: https://web.dev/tap-targets
- Butterick, Practical Typography, lunghezza riga: https://practicaltypography.com/line-length.html
- Ricerca sulla lunghezza della riga (Visible Language): https://journals.uc.edu/index.php/vl/article/view/5765
- digital.gov, aree da toccare su mobile: https://digital.gov/guides/mobile-principles/tap-targets
