# Intro social · Desideri & Code

Video di 14 secondi in motion graphics, senza audio (la musica si aggiunge in Instagram o TikTok), nello stile del sito: nero, bianco e il quadratino del logo.

| File | Formato | Dove |
|---|---|---|
| `desideri-code-intro-9x16.mp4` | 1080×1920, 30 fps | Reels, TikTok, Storie, YouTube Shorts |
| `desideri-code-intro-1x1.mp4` | 1080×1080, 30 fps | Post nel feed di Instagram, Facebook, LinkedIn |

## L'idea dei colori
Sul sito il logo resta sempre rosso. **Nei video il quadratino cambia colore** e passa per i cinque colori che il visitatore può scegliere sul sito (rosso, blu, verde, rosa, viola): non siamo legati a un colore, ci adattiamo ai gusti di chi ci sceglie.

## Cosa succede
- **0–3,5 s** — Nel buio arrivano i puntini e formano la griglia 12 × 12 della prima schermata del sito; il quadratino lampeggia come un cursore e cambia colore. Poi i puntini si stringono sul quadratino.
- **3,3–7 s** — «Trasformiamo chi ti guarda in chi ti sceglie»: l'ultima parola si riscrive (sceglie → scrive → chiama → sceglie) e a ogni parola il quadratino cambia colore.
- **7,1–9,9 s** — «Cosa facciamo»: Siti web, Negozi online, Automazioni e AI, Gestionali, Pubblicità, ognuno con il quadratino di un colore diverso.
- **9,9–14 s** — Firma: l'icona D&C e «Desideri&Code» con il quadratino che passa per tutti i colori, «Il tuo sito, nei colori che piacciono a te.», i cinque colori, Siti web · AI · Gestionali · Pubblicità, Milano · Italia e Svizzera. Finisce al buio, quindi si può mettere in loop.

## Modificarlo
Testi, tempi e colori sono in `intro.html` (si apre nel browser: `intro.html?play` lo fa girare, `intro.html?t=5` mostra il fotogramma ai 5 secondi).
Per rifare i video: `node social/intro/render.mjs` (serve Playwright con Chromium e ffmpeg; `CHROMIUM=/percorso/chrome` se Chromium non è quello di Playwright).
