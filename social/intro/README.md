# Intro social · Studio Desideri

Video di 12 secondi in motion graphics, senza audio (la musica si aggiunge in Instagram o TikTok).

| File | Formato | Dove |
|---|---|---|
| `studio-desideri-intro-9x16.mp4` | 1080×1920, 30 fps | Reels, TikTok, Storie, YouTube Shorts |
| `studio-desideri-intro-1x1.mp4` | 1080×1080, 30 fps | Post nel feed di Instagram, Facebook, LinkedIn |

## Cosa succede
- **0–2,7 s** — Nel cielo stellato nasce il punto rosso. Si apre la sfera, si disegna la palpebra, cresce l'iride: si compone il marchio Eclisse, che sbatte le palpebre.
- **3,3 s** — Le stelle filano (salto di scena), il marchio sale.
- **3,5–6 s** — «Trasformiamo chi ti guarda in chi ti *sceglie.*»: «sceglie.» si forma dalle stelle; passa una stella cadente; l'occhio guarda le parole.
- **6,5–8,8 s** — «Cosa facciamo»: Siti web · Negozi online · Software con AI · Pubblicità. L'iride cambia colore come sul sito.
- **9–12 s** — Secondo salto di scena e firma: STUDIO Desideri, «Dal primo sguardo al sì.», Siti web · AI · Pubblicità, Milano · Italia e Svizzera. Il punto rosso batte. Finisce al buio, quindi si può mettere in loop.

## Modificarlo
Testi, tempi e colori sono in `intro.html` (si apre nel browser: `intro.html?play` lo fa girare, `intro.html?t=5` mostra il fotogramma ai 5 secondi).
Per rifare i video: `node social/intro/render.mjs` (serve Playwright con Chromium e ffmpeg).
