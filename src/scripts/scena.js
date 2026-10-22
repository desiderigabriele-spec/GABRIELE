// Il cielo stellato dietro al sito: stelle che brillano e scorrono piano, a profondità diverse,
// e ogni tanto una stella cadente. È «il viaggio»: a ogni capitolo del percorso dal primo sguardo al sì
// ([data-forma] della sezione al centro dello schermo) si va più veloci tra le stelle
// (fermi su «Guarda», scie su «Scrivici»), e scorrendo si accelera.
// Il salto tra le pagine: partendo le stelle accelerano fino alle scie; arrivando rallentano.
// WebGL puro, senza librerie: due disegni di punti (le stelle e la stella cadente).
// Con lo sfondo chiaro il cielo si ferma: c'è la luce del mattino (luce.js).

const rnd = (a = -1, b = 1) => a + Math.random() * (b - a);
// i colori arrivano allo shader in luce lineare (come li passava three.js): #C8C8C8 → 0,578
const lineare = (c) => (c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4));
const GRIGIO = lineare(200 / 255);

const TESTA = 'precision highp float;\nprecision highp int;\nuniform mat4 projectionMatrix, modelViewMatrix;\n';
const TESTA_FRAG = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';

const STELLE_VS = TESTA + /* glsl */ `
uniform float uTime, uScroll, uPR, uAspect, uWarp, uViaggio, uPercorso, uScia;
uniform vec2 uParallasse;
attribute vec3 position;
attribute vec4 aSeme;
varying float vLuce, vTinta, vStira;
varying vec2 vDir;
void main(){
  float v = aSeme.z;
  // deriva lenta verso sinistra e salita con lo scroll: le stelle vicine si muovono di più (profondità)
  float u = fract(position.x * 0.5 + 0.5 - uTime * (0.002 + v * 0.008)) * 2.0 - 1.0;
  float w = fract(position.y * 0.5 + 0.5 + uScroll * (0.03 + v * 0.12)) * 2.0 - 1.0;
  // dallo schermo al cielo: a ogni profondità le stelle coprono tutta la finestra, qualunque sia la forma
  float meta = (7.0 - position.z) * 0.3153 * 1.04;
  vec3 p = vec3(u * meta * uAspect, w * meta, position.z);
  p.xy += uParallasse * (0.15 + v * 0.6);
  // il viaggio: ogni stella ha la sua profondità, che avanza verso di noi e ricomincia da lontano
  float fase = fract(aSeme.w * 7.31 + aSeme.x * 0.159 + uPercorso);
  vec3 pv = vec3(vec2(position.x * uAspect, position.y) * 9.2, -22.0 + fase * 25.0);
  pv.xy += uParallasse * 0.4;
  p = mix(p, pv, uViaggio);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  // scintillio: ognuna col suo ritmo
  float s = 0.5 + 0.5 * sin(uTime * aSeme.y + aSeme.x);
  bool davanti = v > 1.0;
  vLuce = (0.3 + 0.9 * s * s) * (davanti ? 0.55 : 0.7 + v * 0.9);
  vTinta = aSeme.w;
  float base = (davanti ? 3.6 + (v - 1.15) * 5.0 : 1.5 + v * 3.2) * uPR * (0.85 + 0.35 * s);
  // velocità della luce: scorrendo forte la stella si allunga in verticale (più quelle vicine)
  vStira = 1.0 + uWarp * 6.0 * (0.25 + min(v, 1.3));
  vLuce *= 1.0 + uWarp * 0.6;
  // nel viaggio: le stelle nascono lontane e piccole, crescono avvicinandosi e si allungano verso l'esterno
  vec2 ndc0 = gl_Position.xy / gl_Position.w;
  vec2 radiale = normalize(ndc0 * vec2(uAspect, 1.0) + 1e-4);
  vDir = normalize(mix(vec2(0.0, 1.0), radiale, uViaggio));
  float vita = smoothstep(0.0, 0.3, fase) * (1.0 - smoothstep(0.86, 1.0, fase));
  vLuce *= mix(1.0, vita * (0.9 + fase * 1.2), uViaggio);
  base = mix(base, (1.6 + 2.8 * aSeme.w) * uPR * clamp(10.0 / -mv.z, 0.5, 3.0), uViaggio);
  vStira = mix(vStira, 1.0 + (uScia * 9.0 + uWarp * 5.0) * fase * fase, uViaggio);
  gl_PointSize = base * vStira;
}`;

const STELLE_FS = TESTA_FRAG + /* glsl */ `
uniform vec3 uColore;
uniform float uOpacita;
varying float vLuce, vTinta, vStira;
varying vec2 vDir;
void main(){
  vec2 q = gl_PointCoord - 0.5;
  // la scia va nella direzione della stella (in verticale scorrendo, verso l'esterno nel viaggio):
  // la larghezza resta quella della stella, cresce solo la lunghezza
  vec2 dir = vec2(vDir.x, -vDir.y);
  float lungo = dot(q, dir), largo = dot(q, vec2(-dir.y, dir.x)) * vStira;
  float d = length(vec2(largo, lungo));
  if (d > 0.5) discard;
  float a = pow(smoothstep(0.5, 0.0, d), 1.8) * (vStira > 1.05 ? smoothstep(0.5, 0.15, abs(lungo)) : 1.0);
  vec3 c = uColore;
  if (vTinta < 0.2) c = mix(c, vec3(1.0), 0.55);                   // qualche stella più bianca
  gl_FragColor = vec4(c * vLuce, a * uOpacita);
}`;

const CADENTE_VS = TESTA + /* glsl */ `
uniform vec3 uInizio, uDir;
uniform float uProg, uPR;
attribute float aT;
varying float vA;
void main(){
  vec3 p = uInizio + uDir * (uProg * 9.0 - aT * 1.6);   // la testa avanza, la coda la segue
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  float vita = smoothstep(0.0, 0.15, uProg) * (1.0 - smoothstep(0.7, 1.0, uProg));
  vA = (1.0 - aT) * (1.0 - aT) * vita * step(0.0, uProg);
  gl_PointSize = (2.6 - aT * 1.8) * uPR;
}`;

const CADENTE_FS = TESTA_FRAG + /* glsl */ `
uniform vec3 uColore;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(mix(uColore, vec3(1.0), 0.6), smoothstep(0.5, 0.0, d) * vA);
}`;

// un programma con i suoi attributi (nell'ordine dato: il primo prende il posto 0) e le sue uniform
function programma(gl, vs, fs, attributi, uniform) {
  const sh = (tipo, src) => { const x = gl.createShader(tipo); gl.shaderSource(x, src); gl.compileShader(x); return x; };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  attributi.forEach((a, i) => gl.bindAttribLocation(p, i, a));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  const U = {};
  for (const n of uniform) U[n] = gl.getUniformLocation(p, n);
  return { p, U };
}

export function avviaScena(canvas, { arrivo = false } = {}) {
  const html = document.documentElement;
  const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 820px)').matches;

  const opzioni = { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'low-power' };
  let gl = null;
  try { gl = canvas.getContext('webgl2', opzioni) || canvas.getContext('webgl', opzioni); } catch (_) {}
  if (!gl) return null; // niente WebGL: il sito resta completo, solo senza stelle
  const pr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);

  // ---------- Cielo stellato: stelle che brillano e scorrono piano, a profondità diverse ----------
  // position = posizione sullo schermo (-1..1) e profondità: lontane (z < 0) o poche davanti (z > 0)
  const S = mobile ? 1100 : 2600;
  const sp = new Float32Array(S * 3), seme = new Float32Array(S * 4);
  for (let i = 0; i < S; i++) {
    const davanti = Math.random() < 0.07;                   // poche stelle vicinissime a chi guarda
    const vicina = davanti ? 1.15 + Math.random() * 0.45 : Math.pow(Math.random(), 2.2);
    sp[i * 3] = rnd(-1, 1); sp[i * 3 + 1] = rnd(-1, 1);
    sp[i * 3 + 2] = davanti ? 1.5 + (vicina - 1.15) * 6.5 : -20 + vicina * 16;
    seme[i * 4] = Math.random() * 6.283;                    // fase dello scintillio
    seme[i * 4 + 1] = 0.6 + Math.random() * 2.2;            // velocità dello scintillio
    seme[i * 4 + 2] = vicina;                               // 0 lontana · 1 vicina · oltre 1 davanti
    seme[i * 4 + 3] = Math.random();                        // tinta: qualche stella più bianca
  }
  // ---------- Stella cadente: rara e discreta, solo nella parte alta del cielo ----------
  const SC = 48;
  const scT = new Float32Array(SC);
  for (let i = 0; i < SC; i++) scT[i] = i / (SC - 1);
  let prossimaCadente = 6 + Math.random() * 6, inizioCadente = -1;
  const cad = { inizio: [0, 0, 0], dir: [-1, -0.4, 0], prog: -1 };

  const stelle = programma(gl, STELLE_VS, STELLE_FS, ['position', 'aSeme'],
    ['projectionMatrix', 'modelViewMatrix', 'uTime', 'uScroll', 'uPR', 'uAspect', 'uWarp', 'uViaggio', 'uPercorso', 'uScia', 'uParallasse', 'uColore', 'uOpacita']);
  const cadente = programma(gl, CADENTE_VS, CADENTE_FS, ['aT'], ['projectionMatrix', 'modelViewMatrix', 'uInizio', 'uDir', 'uProg', 'uPR', 'uColore']);
  if (!stelle || !cadente) return null;
  const buffer = (dati) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, dati, gl.STATIC_DRAW); return b; };
  const bPos = buffer(sp), bSeme = buffer(seme), bT = buffer(scT);

  // la camera: 35° di campo, a 7 unità dal cielo (le stesse misure di prima, matrici comprese)
  const vista = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -7, 1]);
  const proiezione = new Float32Array(16);
  function proietta(aspetto) {
    const near = 0.1, far = 60;
    const top = near * Math.tan((Math.PI / 180) * 0.5 * 35), height = 2 * top, width = aspetto * height, left = -0.5 * width;
    const right = left + width, bottom = top - height;
    proiezione.fill(0);
    proiezione[0] = 2 * near / (right - left); proiezione[5] = 2 * near / (top - bottom);
    proiezione[8] = (right + left) / (right - left); proiezione[9] = (top + bottom) / (top - bottom);
    proiezione[10] = -(far + near) / (far - near); proiezione[11] = -1; proiezione[14] = (-2 * far * near) / (far - near);
  }

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE); // luce che si somma
  gl.clearColor(0, 0, 0, 0);

  // ---------- Dimensioni ----------
  let W = 0, H = 0, aspetto = 1;
  // le misure vengono dalla tela stessa (fissa a tutto schermo): con lo zoom a due dita non cambiano
  function ridimensiona() {
    const w = canvas.clientWidth || html.clientWidth;
    const h = canvas.clientHeight || html.clientHeight;
    if (w === W && h === H) return;
    W = w; H = h; aspetto = W / H;
    canvas.width = Math.floor(W * pr); canvas.height = Math.floor(H * pr);
    gl.viewport(0, 0, Math.round(W * pr), Math.round(H * pr));
    proietta(aspetto);
  }
  ridimensiona();
  window.addEventListener('resize', ridimensiona);

  // ---------- Il capitolo: dalla sezione al centro dello schermo ----------
  const sezioni = [...document.querySelectorAll('[data-forma]')];
  let capitolo = 0;
  function leggiCapitolo() {
    const c = H * 0.5;
    let scelta = null;
    for (const s of sezioni) {
      const r = s.getBoundingClientRect();
      if (r.top <= c && r.bottom >= c) scelta = s;
    }
    if (scelta) capitolo = Number(scelta.dataset.forma) || 0;
  }
  // velocità del viaggio per capitolo (strada al secondo): fermi, si parte piano, sicuri, si accelera, scie
  const VIAGGIO = [0, 0.035, 0.07, 0.13, 0.24];
  // il salto tra le pagine: partendo le stelle accelerano fino alle scie; arrivando rallentano
  let salto = arrivo ? 1 : 0, saltoVia = false;
  window.addEventListener('gd-salto', () => { saltoVia = true; });
  window.addEventListener('pageshow', (e) => { if (e.persisted) { saltoVia = false; salto = 0; } });

  // ---------- Il mouse: un filo di parallasse ----------
  let mx = 9, my = 9;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    mx = (e.clientX / W) * 2 - 1; my = -(e.clientY / H) * 2 + 1;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { mx = 9; my = 9; });

  const smoothstep = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  let ultimoScroll = window.scrollY, vel = 0;
  let warp = 0, viaggio = 0, percorso = 0, scia = 0;

  // ---------- Ciclo: si ferma con la scheda nascosta e con lo sfondo chiaro ----------
  const t0 = performance.now();
  let prima = t0, id = 0, frame = 0;
  const serve = () => !document.hidden && html.dataset.tema !== 'chiaro';
  function riprendi() {
    cancelAnimationFrame(id); id = 0;
    if (serve()) { prima = performance.now(); loop(); } else gl.clear(gl.COLOR_BUFFER_BIT);
  }
  document.addEventListener('visibilitychange', riprendi);
  window.addEventListener('gd-tema', riprendi);

  function loop() {
    id = requestAnimationFrame(loop);
    const adesso = performance.now();
    const dt = Math.min((adesso - prima) / 1000, 0.05);
    prima = adesso;
    const tReale = (adesso - t0) / 1000;
    const t = ridotto ? 0 : tReale;
    if (frame++ % 4 === 0) leggiCapitolo();

    const sy = window.scrollY;
    vel += ((sy - ultimoScroll) / Math.max(dt, 0.001) / 4000 - vel) * 0.1;
    ultimoScroll = sy;
    const morbido = (a, b, k) => a + (b - a) * (1 - Math.exp(-k * dt));

    // velocità della luce
    warp = morbido(warp, ridotto ? 0 : smoothstep(Math.abs(vel), 0.18, 1.3), 6);
    // il viaggio: si parte dal secondo capitolo; scorrendo si accelera un po'
    salto = saltoVia ? Math.min(1, salto + dt * 3.5) : Math.max(0, salto - dt * 1.3);
    const velViaggio = ridotto ? 0 : VIAGGIO[capitolo] + Math.min(Math.abs(vel), 1.5) * 0.12 * (capitolo > 0 ? 1 : 0) + salto * 0.9;
    viaggio = Math.max(salto, morbido(viaggio, ridotto || capitolo === 0 ? 0 : 1, 1.4));
    percorso += velViaggio * dt * viaggio;
    scia = Math.max(salto, morbido(scia, smoothstep(velViaggio, 0.1, 0.26), 3));
    // una stella cadente ogni 10-25 secondi (mai con «riduci movimento»)
    if (!ridotto) {
      if (inizioCadente < 0 && tReale > prossimaCadente) {
        inizioCadente = tReale;
        const verso = Math.random() < 0.5 ? -1 : 1;
        cad.inizio = [verso * rnd(1, 9), rnd(3.5, 7), -10];
        const dx = -verso * rnd(0.8, 1), dy = -rnd(0.3, 0.55), k = 1 / Math.sqrt(dx * dx + dy * dy);
        cad.dir = [dx * k, dy * k, 0];
      }
      if (inizioCadente >= 0) {
        cad.prog = (tReale - inizioCadente) / 1.4;
        if (cad.prog > 1) { inizioCadente = -1; cad.prog = -1; prossimaCadente = tReale + 10 + Math.random() * 15; }
      }
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    // le stelle: scintillio, deriva, salita con lo scroll e un filo di parallasse col mouse
    let U = stelle.U;
    gl.useProgram(stelle.p);
    gl.uniformMatrix4fv(U.projectionMatrix, false, proiezione); gl.uniformMatrix4fv(U.modelViewMatrix, false, vista);
    gl.uniform1f(U.uTime, t); gl.uniform1f(U.uScroll, (sy / H) * 0.6); gl.uniform1f(U.uPR, pr); gl.uniform1f(U.uAspect, aspetto);
    gl.uniform1f(U.uWarp, warp); gl.uniform1f(U.uViaggio, viaggio); gl.uniform1f(U.uPercorso, percorso); gl.uniform1f(U.uScia, scia);
    gl.uniform2f(U.uParallasse, mx < 5 ? -mx * 0.25 : 0, my < 5 ? -my * 0.15 : 0);
    gl.uniform3f(U.uColore, GRIGIO, GRIGIO, GRIGIO); gl.uniform1f(U.uOpacita, 0.9);
    gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bSeme); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, S);
    gl.disableVertexAttribArray(1);
    // la stella cadente, solo mentre passa
    if (inizioCadente >= 0) {
      U = cadente.U;
      gl.useProgram(cadente.p);
      gl.uniformMatrix4fv(U.projectionMatrix, false, proiezione); gl.uniformMatrix4fv(U.modelViewMatrix, false, vista);
      gl.uniform3f(U.uInizio, ...cad.inizio); gl.uniform3f(U.uDir, ...cad.dir); gl.uniform1f(U.uProg, cad.prog); gl.uniform1f(U.uPR, pr);
      gl.uniform3f(U.uColore, GRIGIO, GRIGIO, GRIGIO);
      gl.bindBuffer(gl.ARRAY_BUFFER, bT); gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, SC);
    }
  }
  if (serve()) loop();

  return {};
}
