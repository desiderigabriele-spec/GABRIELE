# Video «Lavori» · Studio Desideri

Video in motion graphics che mostrano i siti fatti per i clienti, con effetti sonori sintetizzati da zero (nessun diritto da pagare).

## Luigi · Montini Luigino (22 secondi)
| File | Formato | Dove |
|---|---|---|
| `luigi/studio-desideri-lavori-luigi-9x16.mp4` | 1080×1920, 30 fps, audio | Reels, TikTok, Storie, Shorts |
| `luigi/studio-desideri-lavori-luigi-1x1.mp4` | 1080×1080, 30 fps, audio | Post nel feed |

- **0–3 s** «Lavori · 01», Montini *Luigino*, Idraulico · Sesto San Giovanni e Nord Milano (scintilla e pop).
- **3–10 s** Il sito vero che scorre in un portatile: «Un sito veloce, pensato per *chi ha un guasto.*», etichette «4,9 su Google» e «40 anni di esperienza».
- **10–17 s** Il sito su telefono: «E dal telefono, *un tocco e ti chiamano.*», freccia sulla barra Chiama · WhatsApp · Preventivo, notifica «Nuova richiesta dal sito» (con il suono di notifica; è segnata come *esempio*), «Trovato su Google in zona».
- **17–19 s** Cosa abbiamo fatto, quattro spunte.
- **19–22 s** «Il prossimo può essere *il tuo.*» e la firma STUDIO Desideri (colpo basso e scintilla).

## Rifarli
1. Servire il sito in locale: `python3 -m http.server 4400` nella cartella del sito (repository `sito-montini`).
2. `node social/lavori/riprendi.mjs luigi` — riprende lo scorrimento su computer e telefono (cartella `luigi/fotogrammi`, non salvata nel repository).
3. `node social/lavori/render.mjs luigi` — disegna i fotogrammi di `luigi/video.html`, crea i suoni con `suoni.py` e unisce tutto con ffmpeg.

Servono Playwright con Chromium, ffmpeg, Python 3 con numpy. Testi e tempi sono in `luigi/video.html`, i suoni in `suoni.py`.
