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
uniform vec3 uIride[5];          // colori dell'iride dal centro al bordo (cambiano con il tema)
uniform vec3 uPelle, uAnello, uAlone;
uniform float uScritta;            // 0 = forme normali, 1 = i punti scrivono il nome del visitatore
attribute vec3 aP1, aP2, aP3, aP4;
attribute vec4 aP5;                // punto della scritta (w = 1 se fa parte delle lettere)
attribute float aRand, aT;
attribute vec4 aOcchio;             // tipo di punto dell'occhio, due parametri, dimensione
varying vec3 vCol;
varying float vLuce, vVis;
${NOISE}

// ---------- L'OCCHIO ----------
// Il logo «Eclisse» fatto di luce: sfera avorio, iride ambra con la pupilla grande,
// palpebra a mezzaluna e una fessura scura attorno. Ruota tutto insieme verso ciò che guarda.
const float RS = 1.25;    // raggio della sfera
const float RI = 0.74;    // raggio dell'iride (nel logo è grande, più di metà della sfera)
const float RV = 0.88;    // fessura scura: attorno all'iride la sfera non si vede
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
  if (b < 0.12) return mix(uIride[0], uIride[1], b / 0.12);
  if (b < 0.3) return mix(uIride[1], uIride[2], (b - 0.12) / 0.18);
  if (b < 0.62) return mix(uIride[2], uIride[3], (b - 0.3) / 0.32) * 1.15;
  return mix(uIride[3], uIride[4], (b - 0.62) / 0.38) * 1.3;
}
vec3 eCol; float eVis; float eSize;
vec3 occhio(){
  float tipo = aOcchio.x, a = aOcchio.y, b = aOcchio.z;
  eVis = 1.0; eSize = aOcchio.w;
  vec3 p;
  if (tipo < 0.5) {            // sfera avorio, piena come nel logo
    float ct = b, st = sqrt(max(1.0 - ct * ct, 0.0));
    vec3 q = vec3(cos(a) * st, sin(a) * st, ct) * RS;   // posizione prima della rotazione
    p = ruotaSguardo(q);
    float z = p.z / RS;                       // 1 davanti, -1 dietro
    eCol = uPelle * (0.5 + 0.22 * smoothstep(-0.3, 1.0, z));
    eVis = mix(0.04, 1.0, smoothstep(-0.25, 0.2, z));
    // fessura scura: attorno all'iride la sfera sparisce, così l'occhio si stacca come nel logo
    if (q.z > 0.0) eVis *= smoothstep(RV, RV + 0.05, length(q.xy));
  } else if (tipo < 6.5) {     // iride ambra: fibre radiali leggermente ondulate, la pupilla le comprime
    float ang = a + 0.05 * sin(b * 9.0 + a * 5.0);
    vec2 interno = bordoPupilla(ang, uPupilla + 0.012);
    p = superficie(mix(interno, vec2(cos(ang), sin(ang)) * (RI - 0.02), b));
    eCol = colIride(b) * (0.5 + 0.4 * aRand);
  } else if (tipo < 7.5) {     // palpebra: mezzaluna sopra l'iride, verso l'alto a destra
    float ang = 0.95 + a * 1.15;
    float spessore = 0.17 * (1.0 - a * a);  // si assottiglia alle punte
    p = superficie(vec2(cos(ang), sin(ang)) * (RI + 0.035 + b * spessore));
    eCol = uAnello * (0.75 + 0.4 * aRand);
  } else if (tipo < 8.5) {     // bordo della pupilla
    p = superficie(bordoPupilla(a, uPupilla + b * 0.012));
    eCol = vec3(1.0, 0.75, 0.42);
  } else if (tipo < 9.5) {     // riflesso: un puntino bianco sul bordo della pupilla, come nel logo
    p = superficie(vec2(0.42, 0.62) * uPupilla + vec2(a, b) * 0.35);
    p.z += 0.02;
    eCol = vec3(1.0);
  } else {                     // polvere attorno, appena accennata
    p = vec3(cos(a) * b, sin(a) * b, (aRand - 0.5) * 0.8);
    eCol = uAlone * 0.25;
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

  // il nome: i punti lasciano la forma e compongono le lettere, gli altri restano polvere tenue
  float s = smoothstep(0.0, 1.0, clamp((uScritta - aRand * 0.3) / 0.7, 0.0, 1.0));
  bool lettera = aP5.w > 0.5;
  p = mix(p, lettera ? aP5.xyz : p * (1.15 + 0.5 * aRand), s);

  // a metà trasformazione i punti si sparpagliano come polvere di stelle
  float volo = max(sin(t * 3.14159), sin(s * 3.14159) * 0.7);
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
  vCol = mix(vCol, mix(uColB[0], vec3(1.0), 0.45) * (0.75 + 0.5 * aRand), s);
  float vis = i0 == 0 ? mix(eVis, 1.0, t) : 1.0;
  vis = mix(vis, lettera ? 1.0 : 0.1, s);
  // dietro ai blocchi di testo la luce cala con una sfumatura ampia (velo morbido, nessun contorno)
  vec2 px = vec2((ndc.x * 0.5 + 0.5) * uRis.x, (0.5 - ndc.y * 0.5) * uRis.y);
  float libero = 1.0;
  for (int j = 0; j < 32; j++) {
    if (j >= uNTesto) break;
    vec4 r = uTesto[j];
    float sd = max(max(r.x - px.x, px.x - r.z), max(r.y - px.y, px.y - r.w));
    libero = min(libero, smoothstep(-40.0, 80.0, sd));
  }
  vis *= mix(0.24, 1.0, libero);
  float dim = i0 == 0 ? mix(eSize, 1.0, t) : 1.0;
  dim = mix(dim, 0.75, s);
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

// tipi: 0 sfera · 6 iride · 7 palpebra · 8 bordo pupilla · 9 riflesso · 10 polvere
const QUOTE = [[0, 0.48, 1.9], [6, 0.33, 1.25], [7, 0.1, 1.2], [8, 0.04, 0.75], [9, 0.004, 0.9], [10, 0.046, 0.7]];
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
function occhio(N, out, attr) {
  let i = 0;
  for (const [tipo, quota, dim] of QUOTE) {
    const n = tipo === 10 ? N - i : Math.round(N * quota);
    for (let k = 0; k < n && i < N; k++, i++) {
      let a = 0, b = 0;
      if (tipo === 0) {
        // sfera piena: quasi tutti i punti uniformi sul disco che si vede davanti, gli altri sul resto della sfera
        a = Math.random() * Math.PI * 2;
        b = Math.random() < 0.85 ? Math.sqrt(1 - Math.random()) : rnd(-1, 1);
      }
      else if (tipo === 6) {
        // fibre radiali + collaretto + piccole "cripte" vuote
        for (let tent = 0; tent < 6; tent++) {
          a = Math.random() < 0.72 ? (((Math.random() * 260) | 0) / 260) * Math.PI * 2 + gauss() * 0.003 : Math.random() * Math.PI * 2;
          const r = Math.random();
          // densità uniforme su tutta l'iride (ambra piena come nel logo), con un collaretto appena più fitto
          b = r < 0.12 ? 0.32 + gauss() * 0.035 : Math.sqrt(Math.random());
          b = Math.min(Math.max(b, 0), 1);
          const cella = Math.floor((a / (Math.PI * 2)) * 40) * 7 + Math.floor(b * 7);
          if (!(b > 0.4 && hash(cella) < 0.15 && Math.random() < 0.6)) break;
        }
      }
      else if (tipo === 7) { a = rnd(-1, 1); b = Math.random(); }
      else if (tipo === 8) { a = Math.random() * Math.PI * 2; b = gauss(); }
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

// Il nome del visitatore scritto con i punti: disegno il testo su una tela e prendo i pixel pieni.
// larghezza = spazio massimo in unità locali, quota = parte dei punti che diventa lettera
function scritta(nome, N, out, larghezza, quota) {
  const tela = document.createElement('canvas');
  const ctx = tela.getContext('2d', { willReadFrequently: true });
  const font = (px) => `800 ${px}px 'Bricolage Grotesque Variable', 'Bricolage Grotesque', system-ui, sans-serif`;
  const alto = 140;
  ctx.font = font(alto);
  const w = Math.ceil(ctx.measureText(nome).width) + 20;
  tela.width = w; tela.height = alto * 1.3;
  ctx.font = font(alto);
  ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
  ctx.fillText(nome, 10, tela.height / 2);
  const dati = ctx.getImageData(0, 0, tela.width, tela.height).data;
  const pieni = [];
  for (let y = 0; y < tela.height; y += 2) for (let x = 0; x < tela.width; x += 2) if (dati[(y * tela.width + x) * 4 + 3] > 140) pieni.push(x, y);
  // le lettere stanno in "larghezza", ma non diventano più alte di 1.1
  const k = Math.min(larghezza / tela.width, 1.1 / alto);
  const n = pieni.length / 2;
  for (let i = 0; i < N; i++) {
    if (!n || Math.random() > quota) { out[i * 4 + 3] = 0; continue; }
    const j = ((Math.random() * n) | 0) * 2;
    out[i * 4] = (pieni[j] + Math.random() * 2 - tela.width / 2) * k;
    out[i * 4 + 1] = -(pieni[j + 1] + Math.random() * 2 - tela.height / 2) * k;
    out[i * 4 + 2] = gauss() * 0.04;
    out[i * 4 + 3] = 1;
  }
}

// Iride ambra uguale in ogni tema, come nel logo (dal centro al bordo)
const IRIDE = ['#FFE6A8', '#FFD27A', '#FFC25E', '#FFB547', '#F5A23A'];
// Colori delle particelle per tema: A/B = le due tinte di ogni forma (occhio, rete, spirale, cuore, stella)
export const TEMI = {
  blu: {
    A: ['#3D7BFF', '#3D7BFF', '#3D7BFF', '#FF3347', '#FFB547'], B: ['#5CC8FF', '#5CC8FF', '#9FE8FF', '#FF6A8A', '#FFE2B0'],
    iride: IRIDE, pelle: '#F2F4F8', anello: '#3D7BFF', alone: '#5C8DFF', stelle: '#9CC0FF',
  },
  rosso: {
    A: ['#FF3347', '#FF6A3D', '#FF3347', '#FF3347', '#FFB547'], B: ['#FFB547', '#FFD27A', '#FFB547', '#FF6A3D', '#FFE2B0'],
    iride: IRIDE, pelle: '#F6EFE6', anello: '#FF3347', alone: '#FF7352', stelle: '#FFCFAE',
  },
  viola: {
    A: ['#8B6CFF', '#8B6CFF', '#8B6CFF', '#FF5E3A', '#FFB547'], B: ['#5CE1E6', '#5CE1E6', '#FF7A59', '#FF4D8D', '#FFE2B0'],
    iride: IRIDE, pelle: '#F4F1EA', anello: '#8B6CFF', alone: '#8B73FF', stelle: '#B6A3FF',
  },
  verde: {
    A: ['#22D47E', '#22D47E', '#22D47E', '#FF5E3A', '#FFB547'], B: ['#C6F36B', '#8FF0B4', '#C6F36B', '#FF7A59', '#FFE2B0'],
    iride: IRIDE, pelle: '#EEF5F0', anello: '#22D47E', alone: '#3DDB8F', stelle: '#9EF0C2',
  },
};
const temaIniziale = () => TEMI[document.documentElement.dataset.tema] ? document.documentElement.dataset.tema : 'blu';
const COLORI = TEMI[temaIniziale()];

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
  const p5 = new Float32Array(N * 4);
  geo.setAttribute('aP5', new THREE.BufferAttribute(p5, 4));

  const uniforms = {
    uTime: { value: 0 }, uForma: { value: 0 }, uSize: { value: mobile ? 30 : 34 }, uPR: { value: pr },
    uVel: { value: 0 }, uBattito: { value: 0 }, uOpacity: { value: 0 }, uAspect: { value: 1 },
    uMouse: { value: new THREE.Vector2(9, 9) }, uSguardo: { value: new THREE.Vector2() },
    uPupilla: { value: 0.3 }, uCuore: { value: 0 }, uScritta: { value: 0 },
    uRis: { value: new THREE.Vector2(1, 1) }, uTesto: { value: Array.from({ length: 32 }, () => new THREE.Vector4()) }, uNTesto: { value: 0 },
    uTinta: { value: new THREE.Color('#FF3347') }, uTintaForza: { value: 0 },
    uColA: { value: COLORI.A.map((c) => new THREE.Color(c)) },
    uColB: { value: COLORI.B.map((c) => new THREE.Color(c)) },
    uIride: { value: COLORI.iride.map((c) => new THREE.Color(c)) },
    uPelle: { value: new THREE.Color(COLORI.pelle) }, uAnello: { value: new THREE.Color(COLORI.anello) }, uAlone: { value: new THREE.Color(COLORI.alone) },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const punti = new THREE.Points(geo, mat);
  punti.frustumCulled = false;
  const gruppo = new THREE.Group();
  gruppo.add(punti);
  scene.add(gruppo);

  // ---------- Cielo stellato: stelle che brillano e scorrono piano, a profondità diverse ----------
  // position = posizione sullo schermo (-1..1) e profondità: dietro l'occhio (z < 0) o davanti (z > 0)
  const S = mobile ? 1100 : 2600;
  const sp = new Float32Array(S * 3), seme = new Float32Array(S * 4);
  for (let i = 0; i < S; i++) {
    const davanti = Math.random() < 0.07;                   // poche stelle tra l'occhio e chi guarda
    const vicina = davanti ? 1.15 + Math.random() * 0.45 : Math.pow(Math.random(), 2.2);
    sp[i * 3] = rnd(-1, 1); sp[i * 3 + 1] = rnd(-1, 1);
    sp[i * 3 + 2] = davanti ? 1.5 + (vicina - 1.15) * 6.5 : -20 + vicina * 16;
    seme[i * 4] = Math.random() * 6.283;                    // fase dello scintillio
    seme[i * 4 + 1] = 0.6 + Math.random() * 2.2;            // velocità dello scintillio
    seme[i * 4 + 2] = vicina;                               // 0 lontana · 1 vicina · oltre 1 davanti all'occhio
    seme[i * 4 + 3] = Math.random();                        // tinta: qualche stella più calda, qualche più fredda
  }
  const sgeo = new THREE.BufferGeometry();
  sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  sgeo.setAttribute('aSeme', new THREE.BufferAttribute(seme, 4));
  const suni = {
    uTime: { value: 0 }, uScroll: { value: 0 }, uPR: { value: pr }, uOpacita: { value: 0.9 },
    uParallasse: { value: new THREE.Vector2() }, uColore: { value: new THREE.Color(COLORI.stelle) },
    uAspect: { value: 1 }, uRis: { value: new THREE.Vector2(1, 1) },
    uOcchio: { value: new THREE.Vector4(0, 0, 0, 0) },      // centro e raggio dell'occhio in pixel, quanto è occhio
    uWarp: { value: 0 },                                     // 0 fermo · 1 scroll velocissimo: le stelle diventano strisce
  };
  const smat = new THREE.ShaderMaterial({
    uniforms: suni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uScroll, uPR, uAspect, uWarp;
      uniform vec2 uParallasse, uRis;
      uniform vec4 uOcchio;
      attribute vec4 aSeme;
      varying float vLuce, vTinta, vStira;
      void main(){
        float v = aSeme.z;
        // deriva lenta verso sinistra e salita con lo scroll: le stelle vicine si muovono di più (profondità)
        float u = fract(position.x * 0.5 + 0.5 - uTime * (0.002 + v * 0.008)) * 2.0 - 1.0;
        float w = fract(position.y * 0.5 + 0.5 + uScroll * (0.03 + v * 0.12)) * 2.0 - 1.0;
        // dallo schermo al cielo: a ogni profondità le stelle coprono tutta la finestra, qualunque sia la forma
        float meta = (7.0 - position.z) * 0.3153 * 1.04;
        vec3 p = vec3(u * meta * uAspect, w * meta, position.z);
        p.xy += uParallasse * (0.15 + v * 0.6);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        // scintillio: ognuna col suo ritmo
        float s = 0.5 + 0.5 * sin(uTime * aSeme.y + aSeme.x);
        bool davanti = v > 1.0;
        vLuce = (0.3 + 0.9 * s * s) * (davanti ? 0.55 : 0.7 + v * 0.9);
        // le stelle dietro l'occhio spariscono dietro la sfera: l'occhio sta nel mezzo del cielo
        if (!davanti && uOcchio.w > 0.0) {
          vec2 ndc = gl_Position.xy / gl_Position.w;
          vec2 px = vec2((ndc.x * 0.5 + 0.5) * uRis.x, (0.5 - ndc.y * 0.5) * uRis.y);
          vLuce *= mix(1.0, smoothstep(uOcchio.z * 0.9, uOcchio.z * 1.04, distance(px, uOcchio.xy)), uOcchio.w);
        }
        vTinta = aSeme.w;
        float base = (davanti ? 3.6 + (v - 1.15) * 5.0 : 1.5 + v * 3.2) * uPR * (0.85 + 0.35 * s);
        // velocità della luce: scorrendo forte la stella si allunga in verticale (più quelle vicine)
        vStira = 1.0 + uWarp * 6.0 * (0.25 + min(v, 1.3));
        vLuce *= 1.0 + uWarp * 0.6;
        gl_PointSize = base * vStira;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColore;
      uniform float uOpacita;
      varying float vLuce, vTinta, vStira;
      void main(){
        vec2 q = gl_PointCoord - 0.5;
        q.x *= vStira;                                   // la larghezza resta quella della stella, cresce solo l'altezza
        float d = length(q);
        if (d > 0.5) discard;
        float a = pow(smoothstep(0.5, 0.0, d), 1.8) * (vStira > 1.05 ? smoothstep(0.5, 0.15, abs(q.y)) : 1.0);
        vec3 c = uColore;
        if (vTinta > 0.86) c = mix(c, vec3(1.0, 0.85, 0.65), 0.6);      // stelle calde
        else if (vTinta < 0.2) c = mix(c, vec3(1.0), 0.55);              // stelle bianche
        gl_FragColor = vec4(c * vLuce, a * uOpacita);
      }`,
  });
  const stelle = new THREE.Points(sgeo, smat);
  stelle.frustumCulled = false;
  scene.add(stelle);

  // ---------- Stella cadente: rara e discreta, solo nella parte alta del cielo ----------
  const SC = 48;
  const scT = new Float32Array(SC), scPos = new Float32Array(SC * 3);
  for (let i = 0; i < SC; i++) scT[i] = i / (SC - 1);
  const scgeo = new THREE.BufferGeometry();
  scgeo.setAttribute('position', new THREE.BufferAttribute(scPos, 3));
  scgeo.setAttribute('aT', new THREE.BufferAttribute(scT, 1));
  const scuni = { uInizio: { value: new THREE.Vector3() }, uDir: { value: new THREE.Vector3(-1, -0.4, 0) }, uProg: { value: -1 }, uPR: { value: pr }, uColore: suni.uColore };
  const scmat = new THREE.ShaderMaterial({
    uniforms: scuni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
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
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColore;
      varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(mix(uColore, vec3(1.0), 0.6), smoothstep(0.5, 0.0, d) * vA);
      }`,
  });
  const cadente = new THREE.Points(scgeo, scmat);
  cadente.frustumCulled = false;
  scene.add(cadente);
  let prossimaCadente = 6 + Math.random() * 6, inizioCadente = -1;

  // ---------- Dimensioni ----------
  let W = 0, H = 0;
  // le misure vengono dalla tela stessa (fissa a tutto schermo): con lo zoom a due dita non cambiano,
  // così l'occhio non si allunga e non si sfoca quando si torna alla grandezza normale
  function ridimensiona() {
    const w = canvas.clientWidth || document.documentElement.clientWidth;
    const h = canvas.clientHeight || document.documentElement.clientHeight;
    if (w === W && h === H) return;
    W = w; H = h;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = W / H;
    suni.uAspect.value = W / H;
    suni.uRis.value.set(W, H);
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
    const quanto = Number(scelta.dataset.x) || 1; // data-x: quanto spingere la forma verso il bordo
    obiettivo.x = (lato === 'destra' ? spost : lato === 'sinistra' ? -spost : 0) * quanto;
    obiettivo.y = (mobile ? Number(scelta.dataset.yMobile) || 0 : Number(scelta.dataset.y) || 0) * altezzaMondo;
    obiettivo.luce = scelta.dataset.luce != null ? Number(scelta.dataset.luce) : 1;
    // su telefono la forma sta dietro al testo: più tenue, per lasciarlo leggibile
    if (mobile) obiettivo.luce *= scelta.dataset.luceMobile != null ? Number(scelta.dataset.luceMobile) : 0.4;
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

  // ---------- Dove va l'attenzione ----------
  // L'occhio non guarda chi visita: è l'attenzione del pubblico, e va dove c'è uno stimolo.
  // Il movimento la attira (segue il puntatore), ciò che spicca la cattura (bottoni, parole
  // colorate: lì si aggancia e la pupilla si allarga). A riposo torna sullo stimolo più forte
  // della pagina, il bottone del preventivo ([data-sguardo-meta]): chi guarda il sito segue
  // lo sguardo e arriva lì anche lui (gaze cueing).
  const STIMOLI = '[data-stimolo], .btn, .parola-iride, .em-firma, .link-freccia, summary, .pv-cat-card, .pv-livello';
  let catturato = null, catturatoFino = 0;
  const html = document.documentElement;
  const bersaglio = { x: W * 0.5, y: H * 0.5 };
  let ultimoInput = -1e9, toccoAttivo = false, dita = false;
  const ora = () => performance.now();
  // segnali dall'esterno (site.js): battito = interesse, sorpresa = sta per uscire, tinta = colore del servizio
  // occhiolino = per chi torna: la pupilla diventa un cuore
  const segnali = {
    battito: 0, sorpresa: false, tinta: null,
    occhiolino: () => { inizioCuore = orologio.elapsedTime; },
    // il nome appena scritto nel benvenuto prende forma dove c'è l'occhio, poi torna occhio
    scrivi: (nome) => {
      if (ridotto || !nome || obiettivo.forma !== 0) return;
      scritta(nome.slice(0, 18), N, p5, mobile ? 3.1 : 3.4, mobile ? 0.7 : 0.55);
      geo.attributes.aP5.needsUpdate = true;
      inizioScritta = orologio.elapsedTime;
    },
  };
  let inizioCuore = -1, inizioScritta = -1;
  let dilata = 0, restringi = 0;
  function guarda(x, y, touch) {
    bersaglio.x = x; bersaglio.y = y; ultimoInput = ora(); dita = touch;
    if (!html.classList.contains('sguardo-usato')) html.classList.add('sguardo-usato');
  }
  window.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') guarda(e.clientX, e.clientY, false); }, { passive: true });
  window.addEventListener('pointerover', (e) => { if (e.pointerType !== 'touch') catturato = e.target.closest?.(STIMOLI) || null; }, { passive: true });
  window.addEventListener('pointerdown', (e) => {
    guarda(e.clientX, e.clientY, e.pointerType === 'touch');
    if (e.pointerType === 'touch') { catturato = e.target.closest?.(STIMOLI) || null; catturatoFino = ora() + 2500; }
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

  // ---------- Il testo resta leggibile, senza contorni ----------
  // Per ogni blocco di testo misuro l'area che le righe occupano davvero (non tutta la colonna).
  // Dietro a quell'area le particelle si affievoliscono con una sfumatura ampia: nessun ritaglio
  // attorno alle lettere, solo una luce che cala dove si legge.
  const SEL_BLOCCHI = 'main :is(.hero-testo, .didascalia, .testa-sezione, .dolore, .svolta, .servizio, .stanotte, .metodo-fisso, .passo, .cliente-corpo, .sv-testo, .chi-testo, .percorso, .piano, .altri-prezzi, .prezzi-nota, .garanzia, .faq details, .finale-testo, .pv-testa, .pv-passi, .pv-passo:not([hidden]), .prosa)';
  const SEL_FISSO = '.site-header .header-bar, .uscita:not([hidden]) .uscita-box, .ritorno.visibile';
  let righe = [];
  const rng = document.createRange();
  function areaTesto(el) {
    let r = null;
    const aggiungi = (q) => { if (q.width > 1 && q.height > 1) r = r ? [Math.min(r[0], q.left), Math.min(r[1], q.top), Math.max(r[2], q.right), Math.max(r[3], q.bottom)] : [q.left, q.top, q.right, q.bottom]; };
    const giro = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = giro.nextNode(); n; n = giro.nextNode()) {
      if (!n.textContent.trim()) continue;
      rng.selectNodeContents(n);
      for (const q of rng.getClientRects()) aggiungi(q);
    }
    el.querySelectorAll('.btn, input, select, textarea').forEach((b) => aggiungi(b.getBoundingClientRect()));
    return r;
  }
  function misuraTesto() {
    righe = [];
    const sy = window.scrollY;
    for (const el of document.querySelectorAll(SEL_BLOCCHI)) {
      const q = el.getBoundingClientRect();
      if (!q.width || !q.height || q.bottom < -H || q.top > H * 2) continue;
      const r = areaTesto(el);
      if (r) righe.push([r[0], r[1] + sy, r[2], r[3] + sy]);
    }
  }
  function unisci(a, b) { return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]; }
  const area = (r) => (r[2] - r[0]) * (r[3] - r[1]);
  function rettangoliVisibili() {
    const sy = window.scrollY;
    let v = [];
    // con la finestra di uscita aperta la pagina è spenta: conta solo il testo in primo piano
    if (!html.classList.contains('uscita-aperta')) for (const r of righe) { const t = r[1] - sy, bt = r[3] - sy; if (bt > -20 && t < H + 20) v.push([r[0], t, r[2], bt]); }
    for (const el of document.querySelectorAll(SEL_FISSO)) {
      const q = el.matches('.header-bar') ? null : el.getBoundingClientRect();
      const r = q ? [q.left, q.top, q.right, q.bottom] : areaTesto(el);
      if (r && r[3] > 0 && r[1] < H) v.push(r);
    }
    v.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    const righeUnite = v;
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
  setTimeout(misuraTesto, 1600); // dopo le animazioni d'ingresso dei titoli
  window.addEventListener('resize', () => setTimeout(misuraTesto, 100));
  document.addEventListener('toggle', () => setTimeout(misuraTesto, 50), true); // domande che si aprono

  const centro = new THREE.Vector3();
  const bordoOcchio = new THREE.Vector3(), asseX = new THREE.Vector3(), centroSfera = new THREE.Vector3();
  const corona = { el: document.createElement('div'), k: 0 };
  corona.el.className = 'corona-eclisse';
  corona.el.setAttribute('aria-hidden', 'true');
  canvas.parentElement?.appendChild(corona.el);
  const colTinta = new THREE.Color();
  const sguardo = new THREE.Vector2();

  let ultimoScroll = window.scrollY, vel = 0;

  // ---------- Cambio di tema: i colori sfumano verso quelli nuovi ----------
  let temaObiettivo = null;
  function preparaTema(nome) {
    const t = TEMI[nome] || TEMI.blu;
    temaObiettivo = {
      A: t.A.map((c) => new THREE.Color(c)), B: t.B.map((c) => new THREE.Color(c)), iride: t.iride.map((c) => new THREE.Color(c)),
      pelle: new THREE.Color(t.pelle), anello: new THREE.Color(t.anello), alone: new THREE.Color(t.alone), stelle: new THREE.Color(t.stelle),
    };
  }
  window.addEventListener('gd-tema', (e) => preparaTema(e.detail));
  function sfumaTema(k) {
    if (!temaObiettivo) return;
    const o = temaObiettivo;
    uniforms.uColA.value.forEach((c, i) => c.lerp(o.A[i], k));
    uniforms.uColB.value.forEach((c, i) => c.lerp(o.B[i], k));
    uniforms.uIride.value.forEach((c, i) => c.lerp(o.iride[i], k));
    uniforms.uPelle.value.lerp(o.pelle, k); uniforms.uAnello.value.lerp(o.anello, k); uniforms.uAlone.value.lerp(o.alone, k);
    suni.uColore.value.lerp(o.stelle, k);
  }

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
    uniforms.uTime.value = t * 0.6; // movimenti più lenti: accompagnano senza distrarre
    uniforms.uForma.value = ridotto ? obiettivo.forma : morbido(uniforms.uForma.value, obiettivo.forma, segnali.sorpresa ? 7 : 2.2);
    uniforms.uOpacity.value = morbido(uniforms.uOpacity.value, obiettivo.luce, 2.5);
    uniforms.uVel.value = ridotto ? 0 : THREE.MathUtils.clamp(vel, -1.5, 1.5);
    uniforms.uBattito.value = morbido(uniforms.uBattito.value, segnali.battito, 6);
    uniforms.uMouse.value.lerp(mouse, 1 - Math.exp(-8 * dt));
    sfumaTema(1 - Math.exp(-4 * dt));

    // sguardo: dal punto sullo schermo alla rotazione del bulbo
    const fermo = !toccoAttivo && ora() - ultimoInput > (dita ? 2500 : 4500);
    centro.copy(gruppo.position).project(camera);
    const ex = (centro.x + 1) * 0.5 * W, ey = (1 - centro.y) * 0.5 * H;
    // su touch lo stimolo toccato resta "agganciato" qualche secondo
    if (catturato && dita && ora() > catturatoFino) catturato = null;
    const centroDi = (el) => { const r = el?.getBoundingClientRect?.(); return r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; };
    const offerta = segnali.sorpresa ? centroDi(document.querySelector('[data-uscita-si]')) : null;
    const b = segnali.sorpresa ? offerta || { x: ex, y: ey + 200 }
      : catturato && catturato.isConnected ? centroDi(catturato) || bersaglio
      : fermo ? bersaglioARiposo() : bersaglio;
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
    dilata = morbido(dilata, Math.max(segnali.battito, segnali.sorpresa ? 1 : 0, catturato ? 0.6 : 0), 4);
    restringi = morbido(restringi, 0, 3);
    uniforms.uPupilla.value = 0.3 + 0.1 * dilata + (segnali.sorpresa ? 0.07 : 0) - 0.08 * restringi + Math.sin(t * 0.8) * 0.01;
    // pupilla a cuore per chi torna: si forma, resta un attimo, torna rotonda
    let cuore = 0;
    if (inizioCuore >= 0) {
      const w = tReale - inizioCuore;
      cuore = w < 0.4 ? w / 0.4 : w < 2.2 ? 1 : w < 2.8 ? 1 - (w - 2.2) / 0.6 : 0;
      if (w > 2.8) inizioCuore = -1;
    }
    uniforms.uCuore.value = cuore * cuore * (3 - 2 * cuore);
    // scritta del nome: si compone in 1,4 s, resta 2,6 s, torna occhio in 1,6 s
    let sc0 = 0;
    if (inizioScritta >= 0) {
      const w = tReale - inizioScritta;
      sc0 = w < 1.4 ? w / 1.4 : w < 4 ? 1 : w < 5.6 ? 1 - (w - 4) / 1.6 : 0;
      if (w > 5.6) inizioScritta = -1;
    }
    uniforms.uScritta.value = sc0 * sc0 * (3 - 2 * sc0);
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
    // cielo stellato: scintillio, deriva, salita con lo scroll e un filo di parallasse col mouse
    suni.uTime.value = t;
    {
      // dove sta l'occhio sullo schermo, per nascondere le stelle che gli passano dietro
      // il centro vero della sfera è un po' dietro il centro del gruppo (vedi occhio() nello shader)
      const raggio = 1.25 * gruppo.scale.x;
      centroSfera.copy(gruppo.position); centroSfera.z -= 1.0 * gruppo.scale.x;
      bordoOcchio.copy(centroSfera).add(asseX.set(raggio, 0, 0)).project(camera);
      centroSfera.project(camera);
      const sx = (centroSfera.x + 1) * 0.5 * W, sy2 = (1 - centroSfera.y) * 0.5 * H;
      const r = Math.abs(bordoOcchio.x - centroSfera.x) * 0.5 * W;
      const quanto = Math.max(0, 1 - uniforms.uForma.value) * (1 - uniforms.uScritta.value) * Math.min(uniforms.uOpacity.value * 1.5, 1);
      suni.uOcchio.value.set(sx, sy2, r, quanto);
      // corona d'eclisse: si accende attorno all'occhio quando l'attenzione va sul bottone d'azione
      corona.k = morbido(corona.k, segnali.battito > 0.5 && quanto > 0.3 && !segnali.sorpresa ? 1 : 0, 4);
      if (corona.k > 0.01) {
        const lato = r * 2 * (1.16 + 0.05 * corona.k);
        corona.el.style.width = corona.el.style.height = `${lato}px`;
        // left/top e non transform: la corona ruota su se stessa e la rotazione non deve spostarla
        corona.el.style.left = `${sx - lato / 2}px`;
        corona.el.style.top = `${sy2 - lato / 2}px`;
      }
      corona.el.style.opacity = (corona.k * 0.7).toFixed(3);
    }
    // velocità della luce
    suni.uWarp.value = morbido(suni.uWarp.value, ridotto ? 0 : THREE.MathUtils.smoothstep(Math.abs(vel), 0.18, 1.3), 6);
    suni.uScroll.value = (sy / H) * 0.6;
    suni.uParallasse.value.set(mouse.x < 5 ? -mouse.x * 0.25 : 0, mouse.y < 5 ? -mouse.y * 0.15 : 0);
    // una stella cadente ogni 10-25 secondi (mai con «riduci movimento»)
    if (!ridotto) {
      if (inizioCadente < 0 && tReale > prossimaCadente) {
        inizioCadente = tReale;
        const verso = Math.random() < 0.5 ? -1 : 1;
        scuni.uInizio.value.set(verso * rnd(1, 9), rnd(3.5, 7), -10);
        scuni.uDir.value.set(-verso * rnd(0.8, 1), -rnd(0.3, 0.55), 0).normalize();
      }
      if (inizioCadente >= 0) {
        const pr0 = (tReale - inizioCadente) / 1.4;
        scuni.uProg.value = pr0;
        if (pr0 > 1) { inizioCadente = -1; scuni.uProg.value = -1; prossimaCadente = tReale + 10 + Math.random() * 15; }
      }
    }

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
