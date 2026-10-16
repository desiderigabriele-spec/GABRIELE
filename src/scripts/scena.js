// La Costellazione dei Desideri: migliaia di punti di luce che cambiano forma
// a ogni capitolo del percorso dal primo sguardo al sì.
//   0 OCCHIO     → attenzione (l'iride segue il mouse)
//   1 RETE       → interesse e intelligenza artificiale (impulsi lungo le connessioni)
//   2 SPIRALE    → fiducia, il percorso che porta al cliente
//   3 CUORE      → desiderio (batte)
//   4 STELLA     → azione, il «sì»
// La forma attiva la decide la sezione al centro dello schermo ([data-forma]).
import * as THREE from 'three';

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const vertexShader = /* glsl */ `
uniform float uTime, uForma, uSize, uPR, uVel, uBattito;
uniform vec2 uMouse, uSguardo;      // uSguardo = rotazione del bulbo (destra/sinistra, su/giù) in radianti
uniform float uPupilla, uCuore, uTintaForza;
uniform vec2 uRis;              // risoluzione dello schermo in pixel CSS
uniform vec4 uTesto[32];        // rettangoli del testo visibile (sinistra, alto, destra, basso)
uniform int uNTesto;
uniform vec3 uTinta;
uniform float uAspect;
uniform vec3 uColA[5];
uniform vec3 uColB[5];
attribute vec3 aP1, aP2, aP3, aP4;
attribute float aRand, aT;
attribute vec4 aOcchio;             // tipo di punto dell'occhio, due parametri, dimensione
varying vec3 vCol;
varying float vLuce, vVis;
${NOISE}

// ---------- L'OCCHIO ----------
// Una sfera fatta di luce che ruota tutta verso ciò che guardi.
// Davanti l'iride e la pupilla; i punti sul retro quasi spariscono, i bordi brillano (profondità).
const float RS = 1.25;    // raggio della sfera
const float RI = 0.6;     // raggio dell'iride
vec3 ruotaSguardo(vec3 p){
  float cp = cos(uSguardo.y), sp = sin(uSguardo.y);
  p = vec3(p.x, p.y * cp + p.z * sp, -p.y * sp + p.z * cp);
  float cy = cos(uSguardo.x), sy = sin(uSguardo.x);
  return vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
}
// punto sulla superficie, davanti, a distanza d dal centro dell'iride
vec3 superficie(vec2 d){ return ruotaSguardo(vec3(d, sqrt(max(RS * RS - dot(d, d), 0.0)))); }
// bordo della pupilla: cerchio che può diventare un cuore (chi torna sul sito)
vec2 bordoPupilla(float a, float r){
  vec2 cerchio = vec2(cos(a), sin(a)) * r;
  float t = 1.5707963 - a;
  float st = sin(t);
  vec2 cuore = vec2(16.0 * st * st * st, 13.0 * cos(t) - 5.0 * cos(2.0 * t) - 2.0 * cos(3.0 * t) - cos(4.0 * t)) / 17.0 * r * 1.35 + vec2(0.0, r * 0.12);
  return mix(cerchio, cuore, uCuore);
}
vec3 colIride0(float b);
// l'iride prende il colore del servizio che stai guardando
vec3 colIride(float b){
  vec3 tinta = mix(uTinta * 1.25 + 0.12, uTinta * 0.85, smoothstep(0.1, 1.0, b));
  return mix(colIride0(b), tinta, uTintaForza);
}
vec3 colIride0(float b){
  vec3 ambra = vec3(1.0, 0.71, 0.28), fuoco = vec3(1.0, 0.37, 0.23), magenta = vec3(0.82, 0.42, 0.84), viola = vec3(0.55, 0.42, 1.0), ciano = vec3(0.36, 0.88, 0.9);
  if (b < 0.12) return mix(ambra, fuoco, b / 0.12);
  if (b < 0.3) return mix(fuoco, magenta, (b - 0.12) / 0.18);
  if (b < 0.62) return mix(magenta, viola, (b - 0.3) / 0.32) * 1.2;
  return mix(viola, ciano, (b - 0.62) / 0.38) * 1.35;
}
vec3 eCol; float eVis; float eSize;
vec3 occhio(){
  float tipo = aOcchio.x, a = aOcchio.y, b = aOcchio.z;
  eVis = 1.0; eSize = aOcchio.w;
  vec3 p;
  if (tipo < 0.5) {            // superficie della sfera
    float ct = b, st = sqrt(max(1.0 - ct * ct, 0.0));
    p = ruotaSguardo(vec3(cos(a) * st, sin(a) * st, ct) * RS);
    float z = p.z / RS;                       // 1 davanti, -1 dietro
    float bordo = pow(1.0 - abs(z), 2.2);     // i bordi brillano: effetto sfera
    eCol = vec3(0.8, 0.74, 1.0) * (0.16 + 0.95 * bordo);
    eVis = mix(0.12, 1.0, smoothstep(-0.35, 0.15, z));
    // niente puntini sopra l'iride: lì si vede solo l'iride
    vec3 dav = ruotaSguardo(vec3(0.0, 0.0, 1.0));
    eVis *= smoothstep(0.82, 0.78, dot(normalize(p), dav));
  } else if (tipo < 6.5) {     // iride: fibre radiali leggermente ondulate, la pupilla le comprime
    float ang = a + 0.05 * sin(b * 9.0 + a * 5.0);
    vec2 interno = bordoPupilla(ang, uPupilla + 0.012);
    p = superficie(mix(interno, vec2(cos(ang), sin(ang)) * (RI - 0.02), b));
    eCol = colIride(b) * (0.45 + 0.6 * aRand) * (b > 0.25 && b < 0.38 ? 1.25 : 1.0);
  } else if (tipo < 7.5) {     // anello scuro attorno all'iride
    p = superficie(vec2(cos(a), sin(a)) * (RI + b * 0.025));
    eCol = vec3(0.42, 0.3, 0.95);
  } else if (tipo < 8.5) {     // bordo della pupilla
    p = superficie(bordoPupilla(a, uPupilla + b * 0.012));
    eCol = vec3(1.0, 0.75, 0.42);
  } else if (tipo < 9.5) {     // riflesso della luce: resta fermo, la luce viene da in alto a sinistra
    p = vec3(-0.34 + a, 0.38 + b, RS + 0.02);
    eCol = vec3(1.0);
  } else {                     // polvere attorno
    p = vec3(cos(a) * b, sin(a) * b, (aRand - 0.5) * 0.8);
    eCol = vec3(0.55, 0.45, 1.0) * 0.45;
  }
  p.z -= RS - 0.25;
  return p;
}
vec3 eye;
vec3 forma(int i){
  if (i == 0) return eye;
  if (i == 1) return aP1;
  if (i == 2) return aP2;
  if (i == 3) return aP3;
  return aP4;
}
vec3 colore(int i){
  if (i == 0) return eCol;
  vec3 a = uColA[0], b = uColB[0];
  if (i == 1) { a = uColA[1]; b = uColB[1]; }
  else if (i == 2) { a = uColA[2]; b = uColB[2]; }
  else if (i == 3) { a = uColA[3]; b = uColB[3]; }
  else if (i == 4) { a = uColA[4]; b = uColB[4]; }
  return mix(mix(a, b, aRand), uTinta * (0.8 + 0.4 * aRand), uTintaForza * 0.65);
}
mat2 ruota(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// Animazioni proprie di ogni forma
vec3 vivi(vec3 p, int i){
  if (i == 0) return p;
  if (i == 1) {
    p.xz = ruota(uTime * 0.08) * p.xz;
  } else if (i == 2) {
    p.xz = ruota(uTime * 0.25 + p.y * 0.3) * p.xz;
  } else if (i == 3) {
    float b = pow(sin(uTime * 2.4) * 0.5 + 0.5, 6.0);
    p *= 1.0 + b * 0.07 + uBattito * 0.06;
    p.xz = ruota(sin(uTime * 0.4) * 0.35) * p.xz;
  } else {
    p.xy = ruota(uTime * 0.05) * p.xy;
    p *= 1.0 + sin(uTime * 1.3 + aRand * 6.28) * 0.03;
  }
  return p;
}

void main(){
  float f = clamp(uForma, 0.0, 4.0);
  int i0 = int(floor(f));
  int i1 = min(i0 + 1, 4);
  float k = f - float(i0);
  // ogni punto parte con un piccolo ritardo diverso: la trasformazione "scorre"
  float t = smoothstep(0.0, 1.0, clamp((k - aRand * 0.35) / 0.65, 0.0, 1.0));
  eye = occhio();

  vec3 a = vivi(forma(i0), i0);
  vec3 b = vivi(forma(i1), i1);
  vec3 p = mix(a, b, t);

  // a metà trasformazione i punti si sparpagliano come polvere di stelle
  float volo = sin(t * 3.14159);
  vec3 n = vec3(snoise(p * 0.8 + aRand * 10.0), snoise(p * 0.8 + 31.0), snoise(p * 0.8 + 57.0));
  p += n * volo * 0.55;
  // respiro continuo
  p += vec3(snoise(p * 1.3 + uTime * 0.15)) * 0.025;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;

  // il mouse "spinge" i punti vicini
  vec2 ndc = clip.xy / clip.w;
  vec2 d = ndc - uMouse;
  d.x *= uAspect;
  float dist = length(d);
  // sull'occhio niente spinta: deve restare nitido mentre guarda
  float spinta = (1.0 - smoothstep(0.0, 0.28, dist)) * 0.09 * smoothstep(0.0, 0.8, f);
  ndc += normalize(d + 1e-5) * spinta * vec2(1.0 / uAspect, 1.0);
  // scorrendo veloce: scia verticale
  ndc.y += uVel * (aRand - 0.5) * 0.06;
  clip.xy = ndc * clip.w;
  gl_Position = clip;

  float pulse = 0.0;
  if (i0 == 1 || i1 == 1) pulse = pow(fract(aT - uTime * 0.35), 18.0) * (i0 == 1 ? 1.0 - t : t);
  vLuce = 0.55 + aRand * 0.45 + pulse * 2.0 + spinta * 6.0;
  vCol = mix(colore(i0), colore(i1), t);
  float vis = i0 == 0 ? mix(eVis, 1.0, t) : 1.0;
  // dove c'è testo le particelle si spengono: la lettura non viene mai disturbata
  vec2 px = vec2((ndc.x * 0.5 + 0.5) * uRis.x, (0.5 - ndc.y * 0.5) * uRis.y);
  float libero = 1.0;
  for (int j = 0; j < 32; j++) {
    if (j >= uNTesto) break;
    vec4 r = uTesto[j];
    float sd = max(max(r.x - px.x, px.x - r.z), max(r.y - px.y, px.y - r.w));
    libero = min(libero, smoothstep(-4.0, 22.0, sd));
  }
  vis *= mix(0.06, 1.0, libero);
  float dim = i0 == 0 ? mix(eSize, 1.0, t) : 1.0;
  vVis = vis;
  gl_PointSize = vis < 0.01 ? 0.0 : uSize * uPR * dim * (0.45 + aRand * 0.9) * (1.0 + pulse * 1.4) / -mv.z;
}`;

const fragmentShader = /* glsl */ `
uniform float uOpacity;
varying vec3 vCol;
varying float vLuce, vVis;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  a = pow(a, 1.6);
  gl_FragColor = vec4(vCol * vLuce, a * uOpacity * vVis);
}`;

// ---------- Forme (coordinate in unità mondo, raggio ~1.5) ----------
const rnd = (a = -1, b = 1) => a + Math.random() * (b - a);
function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

// tipi: 0 superficie della sfera · 6 iride · 7 anello · 8 bordo pupilla · 9 riflesso · 10 polvere
const QUOTE = [[0, 0.42, 0.7], [6, 0.42, 0.72], [7, 0.05, 0.85], [8, 0.04, 0.75], [9, 0.006, 1.15], [10, 0.064, 0.8]];
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
function occhio(N, out, attr) {
  let i = 0;
  for (const [tipo, quota, dim] of QUOTE) {
    const n = tipo === 10 ? N - i : Math.round(N * quota);
    for (let k = 0; k < n && i < N; k++, i++) {
      let a = 0, b = 0;
      if (tipo === 0) { a = Math.random() * Math.PI * 2; b = rnd(-1, 1); }
      else if (tipo === 6) {
        // fibre radiali + collaretto + piccole "cripte" vuote
        for (let tent = 0; tent < 6; tent++) {
          a = Math.random() < 0.72 ? (((Math.random() * 260) | 0) / 260) * Math.PI * 2 + gauss() * 0.003 : Math.random() * Math.PI * 2;
          const r = Math.random();
          b = r < 0.22 ? 0.32 + gauss() * 0.035 : r < 0.4 ? Math.pow(Math.random(), 2) * 0.28 : Math.random();
          b = Math.min(Math.max(b, 0), 1);
          const cella = Math.floor((a / (Math.PI * 2)) * 40) * 7 + Math.floor(b * 7);
          if (!(b > 0.4 && hash(cella) < 0.3 && Math.random() < 0.85)) break;
        }
      }
      else if (tipo === 7 || tipo === 8) { a = Math.random() * Math.PI * 2; b = gauss(); }
      else if (tipo === 9) { const g = Math.random() < 0.75; a = g ? rnd(-0.05, 0.05) : 0.11 + gauss() * 0.01; b = g ? rnd(-0.04, 0.04) : -0.1 + gauss() * 0.01; }
      else { a = Math.random() * Math.PI * 2; b = 1.5 + Math.random() * 1.3; }
      attr[i * 4] = tipo; attr[i * 4 + 1] = a; attr[i * 4 + 2] = b; attr[i * 4 + 3] = dim;
      out[i * 3] = 0; out[i * 3 + 1] = 0; out[i * 3 + 2] = 0;
    }
  }
}

function rete(N, out, tt) {
  const nodi = [];
  for (let i = 0; i < 46; i++) {
    const v = new THREE.Vector3(gauss(), gauss() * 0.75, gauss() * 0.8).normalize().multiplyScalar(0.5 + Math.random() * 1.1);
    nodi.push(v);
  }
  const archi = [];
  nodi.forEach((a, i) => {
    nodi.map((b, j) => [j, a.distanceTo(b)]).filter(([j]) => j !== i).sort((p, q) => p[1] - q[1]).slice(0, 3)
      .forEach(([j]) => { if (i < j) archi.push([a, nodi[j]]); });
  });
  const tmp = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    if (Math.random() < 0.3) {
      const n = nodi[(Math.random() * nodi.length) | 0];
      tmp.set(n.x + gauss() * 0.045, n.y + gauss() * 0.045, n.z + gauss() * 0.045);
      tt[i] = Math.random();
    } else {
      const [a, b] = archi[(Math.random() * archi.length) | 0];
      const u = Math.random();
      tmp.lerpVectors(a, b, u).add(new THREE.Vector3(gauss() * 0.01, gauss() * 0.01, gauss() * 0.01));
      tt[i] = u;
    }
    tmp.multiplyScalar(1.15);
    out[i * 3] = tmp.x; out[i * 3 + 1] = tmp.y; out[i * 3 + 2] = tmp.z;
  }
}

function spirale(N, out) {
  const bracci = 3;
  for (let i = 0; i < N; i++) {
    const t = Math.pow(Math.random(), 0.85);
    const braccio = i % bracci;
    const y = 1.45 - t * 2.9;
    const r = 1.65 * Math.pow(1 - t, 1.25) + 0.06;
    const a = t * Math.PI * 7 + (braccio / bracci) * Math.PI * 2;
    const sparso = Math.random() < 0.15 ? 0.25 : 0.035;
    out[i * 3] = Math.cos(a) * r + gauss() * sparso;
    out[i * 3 + 1] = y + gauss() * sparso * 0.6;
    out[i * 3 + 2] = Math.sin(a) * r + gauss() * sparso;
  }
}

function cuore(N, out) {
  for (let i = 0; i < N; i++) {
    const t = Math.random() * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const guscio = Math.random() < 0.55;
    const s = guscio ? 1 + gauss() * 0.012 : Math.pow(Math.random(), 0.5);
    const x = (hx / 17) * s * 1.35, y = (hy / 17) * s * 1.35 + 0.12;
    const spessore = Math.sqrt(Math.max(0, 1 - s * s)) * 0.55 + 0.04;
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = (Math.random() < 0.5 ? -1 : 1) * Math.random() * spessore;
  }
}

function stella(N, out) {
  const raggi = 14;
  for (let i = 0; i < N; i++) {
    const r = Math.random();
    if (r < 0.3) {
      const v = new THREE.Vector3(gauss(), gauss(), gauss()).normalize().multiplyScalar(Math.pow(Math.random(), 2) * 0.32);
      out[i * 3] = v.x; out[i * 3 + 1] = v.y; out[i * 3 + 2] = v.z;
    } else if (r < 0.85) {
      const k = i % raggi, a = (k / raggi) * Math.PI * 2 + (k % 2) * 0.1;
      const lungo = (k % 2 ? 1.25 : 2.1) * Math.pow(Math.random(), 1.8) + 0.12;
      out[i * 3] = Math.cos(a) * lungo + gauss() * 0.02 * lungo;
      out[i * 3 + 1] = Math.sin(a) * lungo + gauss() * 0.02 * lungo;
      out[i * 3 + 2] = gauss() * 0.05;
    } else {
      // anello: il cerchio che si chiude
      const a = Math.random() * Math.PI * 2, rr = 1.05 + gauss() * 0.015;
      out[i * 3] = Math.cos(a) * rr; out[i * 3 + 1] = Math.sin(a) * rr; out[i * 3 + 2] = gauss() * 0.02;
    }
  }
}

const COLORI = {
  A: ['#8B6CFF', '#8B6CFF', '#8B6CFF', '#FF5E3A', '#FFB547'],
  B: ['#5CE1E6', '#5CE1E6', '#FF7A59', '#FF4D8D', '#FFE2B0'],
};

export function avviaScena(canvas) {
  const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 820px)').matches;
  const debole = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  } catch (_) {
    return null; // niente WebGL: il sito resta completo, solo senza particelle
  }
  const pr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.z = 7;
  camera.updateMatrixWorld(); // serve subito per proiettare il centro dell'occhio sullo schermo

  // ---------- Particelle principali ----------
  const N = mobile ? (debole ? 4500 : 7000) : (debole ? 9000 : 15000);
  const p0 = new Float32Array(N * 3), p1 = new Float32Array(N * 3), p2 = new Float32Array(N * 3), p3 = new Float32Array(N * 3), p4 = new Float32Array(N * 3);
  const occ = new Float32Array(N * 4), tt = new Float32Array(N), ra = new Float32Array(N);
  occhio(N, p0, occ); rete(N, p1, tt); spirale(N, p2); cuore(N, p3); stella(N, p4);
  for (let i = 0; i < N; i++) ra[i] = Math.random();

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(p0, 3));
  geo.setAttribute('aP1', new THREE.BufferAttribute(p1, 3));
  geo.setAttribute('aP2', new THREE.BufferAttribute(p2, 3));
  geo.setAttribute('aP3', new THREE.BufferAttribute(p3, 3));
  geo.setAttribute('aP4', new THREE.BufferAttribute(p4, 3));
  geo.setAttribute('aOcchio', new THREE.BufferAttribute(occ, 4));
  geo.setAttribute('aT', new THREE.BufferAttribute(tt, 1));
  geo.setAttribute('aRand', new THREE.BufferAttribute(ra, 1));

  const uniforms = {
    uTime: { value: 0 }, uForma: { value: 0 }, uSize: { value: mobile ? 30 : 34 }, uPR: { value: pr },
    uVel: { value: 0 }, uBattito: { value: 0 }, uOpacity: { value: 0 }, uAspect: { value: 1 },
    uMouse: { value: new THREE.Vector2(9, 9) }, uSguardo: { value: new THREE.Vector2() },
    uPupilla: { value: 0.2 }, uCuore: { value: 0 },
    uRis: { value: new THREE.Vector2(1, 1) }, uTesto: { value: Array.from({ length: 32 }, () => new THREE.Vector4()) }, uNTesto: { value: 0 },
    uTinta: { value: new THREE.Color('#8B6CFF') }, uTintaForza: { value: 0 },
    uColA: { value: COLORI.A.map((c) => new THREE.Color(c)) },
    uColB: { value: COLORI.B.map((c) => new THREE.Color(c)) },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const punti = new THREE.Points(geo, mat);
  punti.frustumCulled = false;
  const gruppo = new THREE.Group();
  gruppo.add(punti);
  scene.add(gruppo);

  // ---------- Stelle lontane (profondità, effetto spazio) ----------
  const S = mobile ? 700 : 1600;
  const sp = new Float32Array(S * 3);
  for (let i = 0; i < S; i++) { sp[i * 3] = rnd(-14, 14); sp[i * 3 + 1] = rnd(-9, 9); sp[i * 3 + 2] = rnd(-20, -4); }
  const sgeo = new THREE.BufferGeometry();
  sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const smat = new THREE.PointsMaterial({ color: 0xb6a3ff, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
  const stelle = new THREE.Points(sgeo, smat);
  scene.add(stelle);

  // ---------- Dimensioni ----------
  let W = 0, H = 0;
  function ridimensiona() {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = W / H;
  }
  ridimensiona();
  window.addEventListener('resize', ridimensiona);

  // ---------- Stato: dalla sezione al centro dello schermo ----------
  // data-forma="0..4", data-lato="destra|sinistra|centro", data-luce="0..1", data-scala
  const sezioni = [...document.querySelectorAll('[data-forma]')];
  const obiettivo = { forma: 0, x: 0, y: 0, luce: 1, scala: 1 };
  function leggiStato() {
    const c = H * 0.5;
    let scelta = null;
    for (const s of sezioni) {
      const r = s.getBoundingClientRect();
      if (r.top <= c && r.bottom >= c) scelta = s;
    }
    if (!scelta && !segnali.sorpresa) return;
    if (!scelta) scelta = sezioni[0] || document.body;
    const altezzaMondo = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const larghezzaMondo = altezzaMondo * camera.aspect;
    const lato = scelta.dataset.lato || 'centro';
    const spost = mobile ? 0 : larghezzaMondo * 0.24;
    obiettivo.forma = Number(scelta.dataset.forma) || 0;
    obiettivo.x = lato === 'destra' ? spost : lato === 'sinistra' ? -spost : 0;
    obiettivo.y = (mobile ? Number(scelta.dataset.yMobile) || 0 : Number(scelta.dataset.y) || 0) * altezzaMondo;
    obiettivo.luce = scelta.dataset.luce != null ? Number(scelta.dataset.luce) : 1;
    // su telefono la forma sta dietro al testo: più tenue, per lasciarlo leggibile
    if (mobile) obiettivo.luce *= scelta.dataset.luceMobile != null ? Number(scelta.dataset.luceMobile) : lato !== 'centro' ? 0.45 : 1;
    obiettivo.scala = mobile && scelta.dataset.scalaMobile ? Number(scelta.dataset.scalaMobile) : (Number(scelta.dataset.scala) || 1) * (mobile ? 0.82 : 1);
    if (segnali.sorpresa) {
      // chi sta per andarsene: le particelle tornano occhio, al centro, e lo guardano
      obiettivo.forma = 0; obiettivo.x = 0; obiettivo.luce = 1;
      obiettivo.y = altezzaMondo * (mobile ? 0.17 : 0.13);
      obiettivo.scala = mobile ? 0.62 : 0.85;
    }
  }

  // ---------- Interazione ----------
  const mouse = new THREE.Vector2(9, 9);
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    mouse.set((e.clientX / W) * 2 - 1, -(e.clientY / H) * 2 + 1);
  }, { passive: true });
  document.addEventListener('pointerleave', () => mouse.set(9, 9));

  // ---------- Dove guarda l'occhio ----------
  // Segue il mouse, il punto in cui clicchi e il dito su touch. Se non fai niente
  // guarda il bottone del preventivo ([data-sguardo-meta]): le persone guardano
  // istintivamente dove guarda un volto (gaze cueing).
  const html = document.documentElement;
  const bersaglio = { x: W * 0.5, y: H * 0.5 };
  let ultimoInput = -1e9, toccoAttivo = false, dita = false;
  const ora = () => performance.now();
  // segnali dall'esterno (site.js): battito = interesse, sorpresa = sta per uscire, tinta = colore del servizio
  // occhiolino = per chi torna: la pupilla diventa un cuore
  const segnali = { battito: 0, sorpresa: false, tinta: null, occhiolino: () => { inizioCuore = orologio.elapsedTime; } };
  let inizioCuore = -1;
  let dilata = 0, restringi = 0;
  function guarda(x, y, touch) {
    bersaglio.x = x; bersaglio.y = y; ultimoInput = ora(); dita = touch;
    if (!html.classList.contains('sguardo-usato')) html.classList.add('sguardo-usato');
  }
  window.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') guarda(e.clientX, e.clientY, false); }, { passive: true });
  window.addEventListener('pointerdown', (e) => {
    guarda(e.clientX, e.clientY, e.pointerType === 'touch');
    restringi = 1; // un clic è come un lampo di luce: la pupilla si stringe
    if (e.target.closest?.('[data-azione], .btn-azione')) segnali.battito = 1;
  }, { passive: true });
  window.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') setTimeout(() => { segnali.battito = 0; }, 900); }, { passive: true });
  window.addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) { toccoAttivo = true; guarda(t.clientX, t.clientY, true); } }, { passive: true });
  window.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) guarda(t.clientX, t.clientY, true); }, { passive: true });
  window.addEventListener('touchend', () => { toccoAttivo = false; ultimoInput = ora(); }, { passive: true });

  // a riposo: resta dove l'hai lasciato, poi gira con calma verso il bottone del preventivo
  function bersaglioARiposo() {
    const meta = document.querySelector('[data-sguardo-meta]');
    if (meta) {
      const r = meta.getBoundingClientRect();
      if (r.bottom > 0 && r.top < H) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return bersaglio;
  }

  // ---------- Il testo resta pulito ----------
  // Misuro le righe di testo della pagina: le particelle che ci passano sopra si spengono.
  const SEL_TESTO = 'main :is(h1, h2, h3, p, li, summary, label, dt, dd, blockquote, output, .btn, .capitolo, .mono, .piano-prezzo, .piano-nome, .pacchetto-tag, .tags span, .certificati span)';
  const SEL_FISSO = '.site-header .brand, .site-header .nav, .site-header .header-cta, .uscita:not([hidden]) :is(h2, p, .btn, .capitolo), .ritorno.visibile';
  let righe = [];
  function misuraTesto() {
    righe = [];
    const sy = window.scrollY;
    const rng = document.createRange();
    const visti = new Set();
    for (const el of document.querySelectorAll(SEL_TESTO)) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.bottom < -H || r.top > H * 2) continue;
      // i bottoni e le etichette contano per intero, non solo le lettere
      if (el.matches('.btn, .pacchetto-tag, .tags span, .certificati span')) { righe.push([r.left, r.top + sy, r.right, r.bottom + sy]); continue; }
      // solo le righe di testo vere (non i blocchi interi, che sono larghi quanto la colonna)
      const giro = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = giro.nextNode(); n; n = giro.nextNode()) {
        if (visti.has(n) || !n.textContent.trim()) continue;
        visti.add(n);
        rng.selectNodeContents(n);
        for (const q of rng.getClientRects()) if (q.width > 2 && q.height > 2) righe.push([q.left, q.top + sy, q.right, q.bottom + sy]);
      }
    }
  }
  function unisci(a, b) { return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]; }
  const area = (r) => (r[2] - r[0]) * (r[3] - r[1]);
  function rettangoliVisibili() {
    const sy = window.scrollY;
    let v = [];
    for (const r of righe) { const t = r[1] - sy, bt = r[3] - sy; if (bt > -20 && t < H + 20) v.push([r[0], t, r[2], bt]); }
    for (const el of document.querySelectorAll(SEL_FISSO)) {
      const q = el.getBoundingClientRect();
      if (q.width && q.height && q.bottom > 0 && q.top < H) v.push([q.left, q.top, q.right, q.bottom]);
    }
    // stessa riga e vicini: un solo rettangolo
    v.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    const righeUnite = [];
    for (const r of v) {
      const u = righeUnite[righeUnite.length - 1];
      if (u && Math.min(u[3], r[3]) - Math.max(u[1], r[1]) > (r[3] - r[1]) * 0.5 && r[0] - u[2] < 40 && u[0] - r[2] < 40) righeUnite[righeUnite.length - 1] = unisci(u, r);
      else righeUnite.push(r);
    }
    // al massimo 32: unisco le coppie che aggiungono meno area vuota
    while (righeUnite.length > 32) {
      let migliore = 0, costo = Infinity;
      for (let i = 0; i < righeUnite.length - 1; i++) {
        const c = area(unisci(righeUnite[i], righeUnite[i + 1])) - area(righeUnite[i]) - area(righeUnite[i + 1]);
        if (c < costo) { costo = c; migliore = i; }
      }
      righeUnite.splice(migliore, 2, unisci(righeUnite[migliore], righeUnite[migliore + 1]));
    }
    return righeUnite;
  }
  misuraTesto();
  window.addEventListener('resize', () => setTimeout(misuraTesto, 100));
  document.addEventListener('toggle', () => setTimeout(misuraTesto, 50), true); // domande che si aprono

  const centro = new THREE.Vector3();
  const colTinta = new THREE.Color();
  const sguardo = new THREE.Vector2();

  let ultimoScroll = window.scrollY, vel = 0;

  // ---------- Ciclo ----------
  const orologio = new THREE.Clock();
  let attivo = true, frame = 0;
  document.addEventListener('visibilitychange', () => { attivo = !document.hidden; if (attivo) { orologio.getDelta(); loop(); } });

  function loop() {
    if (!attivo) return;
    requestAnimationFrame(loop);
    const dt = Math.min(orologio.getDelta(), 0.05);
    const tReale = orologio.elapsedTime;
    const t = ridotto ? 0 : tReale;
    if (frame++ % 4 === 0) leggiStato();
    if (frame % 45 === 0) misuraTesto();

    const sy = window.scrollY;
    vel += ((sy - ultimoScroll) / Math.max(dt, 0.001) / 4000 - vel) * 0.1;
    ultimoScroll = sy;

    const morbido = (a, b, k) => a + (b - a) * (1 - Math.exp(-k * dt));
    uniforms.uTime.value = t;
    uniforms.uForma.value = ridotto ? obiettivo.forma : morbido(uniforms.uForma.value, obiettivo.forma, segnali.sorpresa ? 7 : 2.2);
    uniforms.uOpacity.value = morbido(uniforms.uOpacity.value, obiettivo.luce, 2.5);
    uniforms.uVel.value = ridotto ? 0 : THREE.MathUtils.clamp(vel, -1.5, 1.5);
    uniforms.uBattito.value = morbido(uniforms.uBattito.value, segnali.battito, 6);
    uniforms.uMouse.value.lerp(mouse, 1 - Math.exp(-8 * dt));

    // sguardo: dal punto sullo schermo alla rotazione del bulbo
    const fermo = !toccoAttivo && ora() - ultimoInput > (dita ? 2500 : 4500);
    centro.copy(gruppo.position).project(camera);
    const ex = (centro.x + 1) * 0.5 * W, ey = (1 - centro.y) * 0.5 * H;
    const b = segnali.sorpresa ? { x: ex, y: ey + 30 } : fermo ? bersaglioARiposo() : bersaglio;
    const D = H * 0.75;
    let yaw = THREE.MathUtils.clamp(Math.atan((b.x - ex) / D), -0.5, 0.5);
    let pitch = THREE.MathUtils.clamp(Math.atan(-(b.y - ey) / D), -0.36, 0.36);
    if (!Number.isFinite(yaw) || !Number.isFinite(pitch)) { yaw = 0; pitch = 0; }
    // segue il puntatore in modo deciso; quando torna da solo verso il bottone lo fa con calma
    const kSguardo = fermo ? 2.5 : 9;
    sguardo.x = morbido(sguardo.x, yaw, kSguardo);
    sguardo.y = morbido(sguardo.y, pitch, kSguardo);
    uniforms.uSguardo.value.set(sguardo.x, sguardo.y);

    // pupilla: si allarga quando qualcosa interessa (bottoni), si stringe a un clic
    dilata = morbido(dilata, Math.max(segnali.battito, segnali.sorpresa ? 1 : 0), 4);
    restringi = morbido(restringi, 0, 3);
    uniforms.uPupilla.value = 0.2 + 0.08 * dilata + (segnali.sorpresa ? 0.06 : 0) - 0.06 * restringi + Math.sin(t * 0.8) * 0.008;
    // pupilla a cuore per chi torna: si forma, resta un attimo, torna rotonda
    let cuore = 0;
    if (inizioCuore >= 0) {
      const w = tReale - inizioCuore;
      cuore = w < 0.4 ? w / 0.4 : w < 2.2 ? 1 : w < 2.8 ? 1 - (w - 2.2) / 0.6 : 0;
      if (w > 2.8) inizioCuore = -1;
    }
    uniforms.uCuore.value = cuore * cuore * (3 - 2 * cuore);
    if (segnali.tinta) uniforms.uTinta.value.lerp(colTinta.set(segnali.tinta), 1 - Math.exp(-8 * dt));
    uniforms.uTintaForza.value = morbido(uniforms.uTintaForza.value, segnali.tinta ? 1 : 0, 5);

    const kPos = segnali.sorpresa ? 6 : 2.2;
    gruppo.position.x = morbido(gruppo.position.x, obiettivo.x, kPos);
    gruppo.position.y = morbido(gruppo.position.y, obiettivo.y, kPos);
    const sc = morbido(gruppo.scale.x, obiettivo.scala, kPos);
    gruppo.scale.setScalar(sc);
    // leggera rotazione verso il mouse per dare profondità (non sull'occhio: guarda già lui)
    const peso = Math.min(uniforms.uForma.value, 1);
    const mx = mouse.x < 5 ? mouse.x : 0, my = mouse.y < 5 ? mouse.y : 0;
    gruppo.rotation.y = morbido(gruppo.rotation.y, mx * 0.25 * peso, 3);
    gruppo.rotation.x = morbido(gruppo.rotation.x, -my * 0.15 * peso, 3);
    stelle.position.y = (sy / H) * 0.6;
    stelle.rotation.z = t * 0.005;

    // rettangoli del testo visibile
    const rett = rettangoliVisibili();
    uniforms.uNTesto.value = rett.length;
    rett.forEach((r, i) => uniforms.uTesto.value[i].set(r[0], r[1], r[2], r[3]));
    uniforms.uRis.value.set(W, H);

    renderer.render(scene, camera);
  }
  loop();

  return segnali;
}
