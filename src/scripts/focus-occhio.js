// Focus, l'occhio della mascotte: un occhio vero disegnato in WebGL (iride con le fibre, riflesso quadrato
// della finestra e il quadratino rosso del logo nella cornea). Si apre, sbatte le palpebre, guarda dove gli dici
// e cambia pupilla con l'umore. Senza WebGL resta un occhio disegnato in SVG.

const PRE = `precision highp float;
uniform vec2 uRes; uniform vec2 uLook; uniform float uPup; uniform float uLid;
const float SCALA = 1.2;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return v; }
// rumore attorno a un cerchio senza cucitura: s va da 0 a 1 lungo l'angolo
float giro(float s, float n, float r, float m){ return mix(fbm(vec2(s * n, r * m)), fbm(vec2((s - 1.) * n, r * m)), s); }
float quadrato(vec2 p, float s){ vec2 q = abs(p); return max(q.x, q.y) - s; }
const vec3 ROSSO = vec3(.89, .024, .075);
`;
// un bulbo che ruota verso dove guarda, dentro una fessura a mandorla nel nero
const FRAG = `
void main(){
  vec2 d = (gl_FragCoord.xy - .5 * uRes) / min(uRes.x, uRes.y * 1.25) * SCALA;
  vec3 bg = vec3(.039), col = bg;
  float W = .5, Rb = .52;
  float xx = clamp(d.x / W, -1., 1.);
  float forma = pow(max(0., 1. - xx * xx), .85);
  float apre = 1. - uLid;
  float top = .30 * forma * apre - .015 * (1. - apre) * forma;
  float bot = -.235 * forma * apre - .015 * (1. - apre) * forma;
  float dentro = smoothstep(-.006, .006, top - d.y) * smoothstep(-.006, .006, d.y - bot) * step(abs(d.x), W);
  if (dentro > 0.) {
    vec3 n = vec3(d / Rb, sqrt(max(0., 1. - dot(d, d) / (Rb * Rb))));
    vec3 look = normalize(vec3(uLook, 1.6));
    float ang = acos(clamp(dot(n, look), -1., 1.));
    vec3 tx = normalize(cross(vec3(0., 1., 0.), look)); vec3 ty = cross(look, tx);
    float pa = atan(dot(n, ty), dot(n, tx));
    float rr = ang / .6;
    vec3 e = vec3(.74, .74, .73) * (.5 + .5 * n.z);
    if (rr < 1.08) {
      float s = pa / 6.2831853 + .5;
      float fib = giro(s, 60., rr, 2.4);
      float t = clamp((rr - uPup) / (1. - uPup), 0., 1.);
      vec3 ir = vec3(.2) + vec3(.58) * pow(fib, 1.3);
      ir *= .8 + .45 * exp(-pow((t - .3) / .1, 2.));
      ir *= 1. - .85 * smoothstep(.72, 1., t);
      ir *= .55 + .45 * n.z;
      e = mix(ir, e, smoothstep(.96, 1.05, rr));
      e = mix(vec3(.006), e, smoothstep(uPup - .02, uPup + .02, rr));
    }
    e *= .5 + .5 * smoothstep(1., .25, length(d / vec2(W, .3)));
    // riflessi sulla cornea: la finestra quadrata e il quadratino rosso del logo
    vec2 h = d - vec2(-.07, .07) - uLook * .012;
    e = mix(e, vec3(.97), 1. - smoothstep(-.004, .004, quadrato(h, .028)));
    vec2 ic = look.xy * Rb * .93;
    e = mix(e, ROSSO, 1. - smoothstep(-.004, .004, quadrato(d - ic - vec2(.035, .032), .013)));
    // ombra della palpebra di sopra
    e *= .3 + .7 * smoothstep(0., .075, top - d.y);
    col = mix(bg, e, dentro);
  }
  col += vec3(.5) * exp(-pow((d.y - top) / .007, 2.)) * step(abs(d.x), W * .9) * smoothstep(.8, 1., uLid) * step(.05, forma);
  gl_FragColor = vec4(col, 1.);
}`;

function conGL(canvas) {
  const g = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!g) return null;
  const sh = (tipo, src) => { const x = g.createShader(tipo); g.shaderSource(x, src); g.compileShader(x); return g.getShaderParameter(x, g.COMPILE_STATUS) ? x : null; };
  const vs = sh(g.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'), fs = sh(g.FRAGMENT_SHADER, PRE + FRAG);
  if (!vs || !fs) return null;
  const pr = g.createProgram();
  g.attachShader(pr, vs); g.attachShader(pr, fs); g.linkProgram(pr);
  if (!g.getProgramParameter(pr, g.LINK_STATUS)) return null;
  g.useProgram(pr);
  g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(pr, 'p'); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
  const U = {}; ['uRes', 'uLook', 'uPup', 'uLid'].forEach((n) => { U[n] = g.getUniformLocation(pr, n); });
  const disegna = (o) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    g.viewport(0, 0, w, h);
    g.uniform2f(U.uRes, w, h); g.uniform2f(U.uLook, o.lx, o.ly); g.uniform1f(U.uPup, o.pup); g.uniform1f(U.uLid, o.lid);
    g.drawArrays(g.TRIANGLES, 0, 3);
  };
  // a fine lavoro (l'occhio dell'avvio) si libera la scheda grafica
  disegna.spegni = () => { g.getExtension('WEBGL_lose_context')?.loseContext(); canvas.remove(); };
  return disegna;
}

// l'occhio in SVG, quando WebGL non c'è
const SVG = '<svg viewBox="0 0 64 44" aria-hidden="true" style="width:78%;height:auto"><path d="M2 22 Q32 -8 62 22 Q32 46 2 22Z" fill="#d9d9d9"/><circle cx="32" cy="22" r="12.5" fill="#5c5c5c" stroke="#1a1a1a" stroke-width="2.6"/><circle cx="32" cy="22" r="5.4" fill="#000"/><rect x="25" y="14" width="4.4" height="4.4" fill="#fff"/><rect x="36.5" y="17" width="2.8" height="2.8" fill="#e30613"/></svg>';

const UMORI = {
  riposo: { pup: 0.32 },
  ascolta: { pup: 0.5, guarda: [-0.5, -0.5] }, // mentre scrivi: pupilla grande, guarda il campo
  pensa: { pup: 0.3, guarda: [0.6, 0.7] }, // guarda in alto a destra, come chi ci pensa
  risponde: { pup: 0.36, guarda: [-0.7, 0.1], battito: true },
  interessato: { pup: 0.55 },
};

// box = elemento che contiene l'occhio (un tondo). Ritorna lo stato da muovere e passo(t, dt) da chiamare a ogni frame.
export function creaOcchio(box) {
  const canvas = document.createElement('canvas');
  box.appendChild(canvas);
  const disegna = conGL(canvas);
  const o = { lx: 0, ly: 0, tx: 0, ty: 0, pup: 0.32, tp: 0.32, apre: 0, verso: 0, blink: 2 + Math.random() * 2, blinkDa: -9 };
  if (!disegna) { canvas.remove(); box.insertAdjacentHTML('beforeend', SVG); }
  o.guarda = (x, y) => { o.tx = Math.max(-1, Math.min(1, x)); o.ty = Math.max(-1, Math.min(1, y)); };
  o.umore = (u) => {
    const m = UMORI[u] || UMORI.riposo;
    o.tp = m.pup;
    if (m.guarda) o.guarda(...m.guarda);
    if (m.battito) o.blink = 0;
  };
  // apri/chiudi la palpebra (0 = chiuso, 1 = aperto)
  o.apri = (si = true, vel = 2.2) => { o.verso = si ? 1 : -1; o.vel = vel; };
  // per l'avvio: un battito quando lo dici tu, e niente battiti a caso finché serve
  o.battito = () => { o.blink = 0; };
  o.fermaBattiti = () => { o.senzaBattiti = true; };
  o.spegni = () => disegna?.spegni();
  o.passo = (t, dt) => {
    if (!disegna) return;
    if (o.verso) { o.apre = Math.max(0, Math.min(1, o.apre + o.verso * dt * (o.vel || 2.2))); if (o.apre === 0 || o.apre === 1) o.verso = 0; }
    const k = Math.min(1, dt * 9);
    o.lx += (o.tx - o.lx) * k; o.ly += (o.ty - o.ly) * k;
    o.pup += (o.tp - o.pup) * Math.min(1, dt * 4);
    if (t > o.blink) { o.blinkDa = t; o.blink = o.senzaBattiti ? Infinity : t + 4 + Math.random() * 5; }
    const b = (t - o.blinkDa) / 0.18;
    disegna({ lx: o.lx, ly: o.ly, pup: o.pup + Math.sin(t * 1.3) * 0.008, lid: Math.max(1 - o.apre, b < 1 ? Math.sin(b * Math.PI) : 0) });
  };
  return o;
}
