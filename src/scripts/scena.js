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
uniform vec2 uMouse, uSguardo;
uniform float uAspect;
uniform vec3 uColA[5];
uniform vec3 uColB[5];
attribute vec3 aP1, aP2, aP3, aP4;
attribute float aRand, aIride, aT;
varying vec3 vCol;
varying float vLuce;
${NOISE}

vec3 forma(int i){
  if (i == 0) return position;
  if (i == 1) return aP1;
  if (i == 2) return aP2;
  if (i == 3) return aP3;
  return aP4;
}
vec3 colore(int i){
  vec3 a = uColA[0], b = uColB[0];
  if (i == 1) { a = uColA[1]; b = uColB[1]; }
  else if (i == 2) { a = uColA[2]; b = uColB[2]; }
  else if (i == 3) { a = uColA[3]; b = uColB[3]; }
  else if (i == 4) { a = uColA[4]; b = uColB[4]; }
  return mix(a, b, aRand);
}
mat2 ruota(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// Animazioni proprie di ogni forma
vec3 vivi(vec3 p, int i){
  if (i == 0) {
    // l'iride (e la pupilla) guardano il mouse
    p.xy += uSguardo * 0.32 * aIride;
  } else if (i == 1) {
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
  float spinta = (1.0 - smoothstep(0.0, 0.28, dist)) * 0.09;
  ndc += normalize(d + 1e-5) * spinta * vec2(1.0 / uAspect, 1.0);
  // scorrendo veloce: scia verticale
  ndc.y += uVel * (aRand - 0.5) * 0.06;
  clip.xy = ndc * clip.w;
  gl_Position = clip;

  float pulse = 0.0;
  if (i0 == 1 || i1 == 1) pulse = pow(fract(aT - uTime * 0.35), 18.0) * (i0 == 1 ? 1.0 - t : t);
  vLuce = 0.55 + aRand * 0.45 + pulse * 2.0 + spinta * 6.0;
  vCol = mix(colore(i0), colore(i1), t);
  gl_PointSize = uSize * uPR * (0.45 + aRand * 0.9) * (1.0 + pulse * 1.4) / -mv.z;
}`;

const fragmentShader = /* glsl */ `
uniform float uOpacity;
varying vec3 vCol;
varying float vLuce;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  a = pow(a, 1.6);
  gl_FragColor = vec4(vCol * vLuce, a * uOpacity);
}`;

// ---------- Forme (coordinate in unità mondo, raggio ~1.5) ----------
const rnd = (a = -1, b = 1) => a + Math.random() * (b - a);
function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

function occhio(N, out, iride) {
  for (let i = 0; i < N; i++) {
    const r = Math.random();
    let x, y, z = rnd(-0.08, 0.08), ir = 0;
    if (r < 0.34) {
      // palpebre: due archi a mandorla con un po' di spessore
      const u = rnd(-1, 1), sopra = Math.random() < 0.5 ? 1 : -1;
      x = u * 1.75;
      y = sopra * 0.82 * Math.pow(1 - u * u, 0.9) + gauss() * 0.018;
    } else if (r < 0.78) {
      // iride: fibre radiali
      const ang = Math.random() * Math.PI * 2, rr = 0.26 + Math.pow(Math.random(), 0.8) * 0.4;
      x = Math.cos(ang) * rr; y = Math.sin(ang) * rr; z = rnd(-0.03, 0.03) + 0.05; ir = 1;
    } else if (r < 0.88) {
      // bordo della pupilla, luminoso
      const ang = Math.random() * Math.PI * 2, rr = 0.24 + gauss() * 0.012;
      x = Math.cos(ang) * rr; y = Math.sin(ang) * rr; z = 0.08; ir = 1;
    } else if (r < 0.9) {
      // riflesso
      x = 0.16 + gauss() * 0.03; y = 0.14 + gauss() * 0.03; z = 0.12; ir = 1;
    } else {
      // alone
      const ang = Math.random() * Math.PI * 2, rr = 1.9 + Math.random() * 0.9;
      x = Math.cos(ang) * rr * 1.1; y = Math.sin(ang) * rr * 0.55; z = rnd(-0.6, 0.6);
    }
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z; iride[i] = ir;
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

  // ---------- Particelle principali ----------
  const N = mobile ? (debole ? 4500 : 7000) : (debole ? 9000 : 15000);
  const p0 = new Float32Array(N * 3), p1 = new Float32Array(N * 3), p2 = new Float32Array(N * 3), p3 = new Float32Array(N * 3), p4 = new Float32Array(N * 3);
  const iride = new Float32Array(N), tt = new Float32Array(N), ra = new Float32Array(N);
  occhio(N, p0, iride); rete(N, p1, tt); spirale(N, p2); cuore(N, p3); stella(N, p4);
  for (let i = 0; i < N; i++) ra[i] = Math.random();

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(p0, 3));
  geo.setAttribute('aP1', new THREE.BufferAttribute(p1, 3));
  geo.setAttribute('aP2', new THREE.BufferAttribute(p2, 3));
  geo.setAttribute('aP3', new THREE.BufferAttribute(p3, 3));
  geo.setAttribute('aP4', new THREE.BufferAttribute(p4, 3));
  geo.setAttribute('aIride', new THREE.BufferAttribute(iride, 1));
  geo.setAttribute('aT', new THREE.BufferAttribute(tt, 1));
  geo.setAttribute('aRand', new THREE.BufferAttribute(ra, 1));

  const uniforms = {
    uTime: { value: 0 }, uForma: { value: 0 }, uSize: { value: mobile ? 30 : 34 }, uPR: { value: pr },
    uVel: { value: 0 }, uBattito: { value: 0 }, uOpacity: { value: 0 }, uAspect: { value: 1 },
    uMouse: { value: new THREE.Vector2(9, 9) }, uSguardo: { value: new THREE.Vector2() },
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
    if (!scelta) return;
    const altezzaMondo = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const larghezzaMondo = altezzaMondo * camera.aspect;
    const lato = scelta.dataset.lato || 'centro';
    const spost = mobile ? 0 : larghezzaMondo * 0.24;
    obiettivo.forma = Number(scelta.dataset.forma) || 0;
    obiettivo.x = lato === 'destra' ? spost : lato === 'sinistra' ? -spost : 0;
    obiettivo.y = mobile ? 0 : (Number(scelta.dataset.y) || 0) * altezzaMondo;
    obiettivo.luce = scelta.dataset.luce != null ? Number(scelta.dataset.luce) : 1;
    // su telefono la forma sta dietro al testo: più tenue, per lasciarlo leggibile
    if (mobile) obiettivo.luce *= scelta.dataset.luceMobile != null ? Number(scelta.dataset.luceMobile) : lato !== 'centro' ? 0.45 : 1;
    obiettivo.scala = (Number(scelta.dataset.scala) || 1) * (mobile ? 0.82 : 1);
  }

  // ---------- Interazione ----------
  const mouse = new THREE.Vector2(9, 9), sguardo = new THREE.Vector2();
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    mouse.set((e.clientX / W) * 2 - 1, -(e.clientY / H) * 2 + 1);
  }, { passive: true });
  document.addEventListener('pointerleave', () => mouse.set(9, 9));
  // su telefono l'occhio segue l'inclinazione (dove il browser lo permette senza chiedere)
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    sguardo.set(THREE.MathUtils.clamp(e.gamma / 30, -1, 1), THREE.MathUtils.clamp((e.beta - 45) / -30, -1, 1));
    mouse.set(9, 9);
  }, { passive: true });

  let ultimoScroll = window.scrollY, vel = 0;
  const segnali = { battito: 0 };

  // ---------- Ciclo ----------
  const orologio = new THREE.Clock();
  let attivo = true, frame = 0;
  document.addEventListener('visibilitychange', () => { attivo = !document.hidden; if (attivo) { orologio.getDelta(); loop(); } });

  function loop() {
    if (!attivo) return;
    requestAnimationFrame(loop);
    const dt = Math.min(orologio.getDelta(), 0.05);
    const t = ridotto ? 0 : orologio.elapsedTime;
    if (frame++ % 4 === 0) leggiStato();

    const sy = window.scrollY;
    vel += ((sy - ultimoScroll) / Math.max(dt, 0.001) / 4000 - vel) * 0.1;
    ultimoScroll = sy;

    const morbido = (a, b, k) => a + (b - a) * (1 - Math.exp(-k * dt));
    uniforms.uTime.value = t;
    uniforms.uForma.value = ridotto ? obiettivo.forma : morbido(uniforms.uForma.value, obiettivo.forma, 2.2);
    uniforms.uOpacity.value = morbido(uniforms.uOpacity.value, obiettivo.luce, 2.5);
    uniforms.uVel.value = ridotto ? 0 : THREE.MathUtils.clamp(vel, -1.5, 1.5);
    uniforms.uBattito.value = morbido(uniforms.uBattito.value, segnali.battito, 6);

    uniforms.uMouse.value.lerp(mouse, 1 - Math.exp(-8 * dt));
    if (mouse.x < 5) sguardo.set(mouse.x, mouse.y);
    uniforms.uSguardo.value.lerp(sguardo, 1 - Math.exp(-5 * dt));

    gruppo.position.x = morbido(gruppo.position.x, obiettivo.x, 2.2);
    gruppo.position.y = morbido(gruppo.position.y, obiettivo.y, 2.2);
    const sc = morbido(gruppo.scale.x, obiettivo.scala, 2.2);
    gruppo.scale.setScalar(sc);
    // leggera rotazione verso il mouse: profondità
    const mx = mouse.x < 5 ? mouse.x : 0, my = mouse.y < 5 ? mouse.y : 0;
    gruppo.rotation.y = morbido(gruppo.rotation.y, mx * 0.25, 3);
    gruppo.rotation.x = morbido(gruppo.rotation.x, -my * 0.15, 3);
    stelle.position.y = (sy / H) * 0.6;
    stelle.rotation.z = t * 0.005;

    renderer.render(scene, camera);
  }
  loop();

  return segnali;
}
