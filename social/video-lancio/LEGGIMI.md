# Video di lancio (copione B)

Verticale 1080×1920, 26 secondi, 30 fotogrammi al secondo. Nero, laser rossi, fumo in WebGL, scritte sui colpi della musica.

- `index.html`: la scena. `render(t)` disegna il fotogramma al secondo `t` (sempre uguale).
- `energia.json`: il volume della musica di riferimento ogni 0,125 s, che muove fumo e polvere.
- `rendi.mjs`: apre la scena in Chromium e scrive l'mp4 con ffmpeg.

Per rifarlo: copiare qui i caratteri `inter-tight.woff2` e `mono.woff2` (da node_modules/@fontsource-variable),
servire la cartella su http://localhost:8765 (`python3 -m http.server 8765`) e lanciare `node rendi.mjs muto.mp4`.

La musica di riferimento è di un altro autore: si pubblica la versione senza audio e si aggiunge un brano dalla libreria di Instagram o TikTok, oppure si chiede il permesso all'autore.
