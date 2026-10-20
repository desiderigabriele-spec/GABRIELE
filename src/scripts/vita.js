// La vita del sito: gli effetti scelti dal canvas «Idee di animazione Desideri & Code» (01-17).
// Ognuno parte solo se nella pagina c'è il suo elemento, e nessuno parte con «riduci movimento»
// (tranne la tendina tra le pagine, che allora non c'è e basta).
const html = document.documentElement;
const ridotto = html.classList.contains('ridotto');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} }, via: (k) => { try { sessionStorage.removeItem(k); } catch (_) {} } };
const SEGNI = '01<>/{}[]#$%&*+=?;:_';
// i colori del tema in uso (cambiano dal pannello «Il tuo sito»)
const tinte = { accento: '#e30613', accentoRgb: '227, 6, 19', testo: '#ffffff' };
function leggiTinte() {
  const cs = getComputedStyle(html);
  tinte.accento = cs.getPropertyValue('--rosso').trim() || '#e30613';
  tinte.accentoRgb = cs.getPropertyValue('--rosso-rgb').trim() || '227, 6, 19';
  tinte.testo = cs.getPropertyValue('--latte').trim() || '#ffffff';
}
leggiTinte();
window.addEventListener('gd-aspetto', leggiTinte);

// chiama fn la prima volta che el entra nello schermo
function quandoVisibile(el, fn, soglia = 0.25) {
  if (!('IntersectionObserver' in window)) { fn(); return; }
  const io = new IntersectionObserver((voci) => { if (voci.some((v) => v.isIntersecting)) { io.disconnect(); fn(); } }, { threshold: soglia });
  io.observe(el);
}
// tiene acceso un ciclo solo mentre el è nello schermo
function mentreVisibile(el, passo) {
  let attivo = false, id = 0;
  const giro = (t) => { if (!attivo) return; passo(t); id = requestAnimationFrame(giro); };
  const io = new IntersectionObserver(([v]) => {
    const prima = attivo;
    attivo = v.isIntersecting;
    if (attivo && !prima) id = requestAnimationFrame(giro);
    if (!attivo) cancelAnimationFrame(id);
  });
  io.observe(el);
}
function testi(el, salta) {
  const out = [];
  const giro = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (salta && n.parentElement?.closest(salta) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  for (let n = giro.nextNode(); n; n = giro.nextNode()) if (n.textContent.trim()) out.push(n);
  return out;
}

// ---------- 01 · Il cursore che scrive: l'ultima parola del titolo si scrive e si riscrive ----------
function cursoreCheScrive() {
  const el = document.querySelector('[data-scrive]');
  if (!el) return;
  const testo = el.querySelector('.scrive-testo');
  const parole = el.dataset.scrive.split(',');
  let i = 0;
  const aspetta = (ms) => new Promise((r) => setTimeout(r, ms));
  // fa un solo giro delle parole e torna alla prima, poi il cursore resta fermo e acceso
  async function giro() {
    await aspetta(3200);
    for (let k = 0; k < parole.length; k++) {
      el.classList.add('scrive-attivo');
      for (let n = testo.textContent.length; n > 0; n--) { testo.textContent = testo.textContent.slice(0, -1); await aspetta(45); }
      i = (i + 1) % parole.length;
      await aspetta(260);
      for (const ch of parole[i]) { testo.textContent += ch; await aspetta(85); }
      el.classList.remove('scrive-attivo');
      if (k < parole.length - 1) await aspetta(2400);
    }
    el.classList.add('scrive-fermo');
  }
  giro();
}

// ---------- 02 · Griglia magnetica: lo sfondo dell'hero è la griglia del logo, che si accende dove guardi ----------
function grigliaMagnetica() {
  const box = document.querySelector('[data-griglia-magnetica]');
  if (!box) return;
  const tela = document.createElement('canvas');
  box.appendChild(tela);
  const ctx = tela.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  const P = 30;
  const misura = () => {
    const r = box.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    tela.width = W * dpr; tela.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  misura();
  window.addEventListener('resize', misura);
  const p = { x: -999, y: -999 }, g = { x: -999, y: -999 };
  let mano = 0;
  const segui = (cx, cy) => { const r = box.getBoundingClientRect(); p.x = cx - r.left; p.y = cy - r.top; mano = performance.now(); };
  window.addEventListener('pointermove', (e) => segui(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) segui(t.clientX, t.clientY); }, { passive: true });
  mentreVisibile(box, (t) => {
    // senza mouse un «visitatore finto» gira sulla griglia
    const fermo = t - mano > 1800;
    const tx = fermo ? W * (0.5 + 0.38 * Math.cos(t / 2600)) : p.x;
    const ty = fermo ? H * (0.55 + 0.3 * Math.sin(t / 1300)) : p.y;
    g.x += (tx - g.x) * (fermo ? 0.04 : 0.25); g.y += (ty - g.y) * (fermo ? 0.04 : 0.25);
    ctx.clearRect(0, 0, W, H);
    const R = Math.min(190, W * 0.3);
    for (let y = P / 2; y < H; y += P) for (let x = P / 2; x < W; x += P) {
      const d = Math.hypot(x - g.x, y - g.y);
      const k = Math.max(0, 1 - d / R);
      const s = 1.6 + 6 * k * k;
      ctx.globalAlpha = 0.09 + 0.5 * k;
      ctx.fillStyle = d < 54 ? tinte.accento : tinte.testo;
      ctx.beginPath(); ctx.arc(x, y, s / 2, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

// ---------- 04 · Testo che si decodifica: le etichette dei capitoli entrano come codice ----------
function decodifica() {
  document.querySelectorAll('main .capitolo').forEach((el) => {
    if (el.children.length || !el.textContent.trim()) return;
    // il testo vero resta per i lettori di schermo; quello cifrato è solo da vedere
    const t = el.textContent;
    const vero = document.createElement('span'); vero.className = 'sr-only'; vero.textContent = t;
    const vista = document.createElement('span'); vista.setAttribute('aria-hidden', 'true');
    el.textContent = ''; el.append(vero, vista);
    const cifra = (f) => {
      vista.textContent = t.split('').map((ch, k) => (ch === ' ' || ch === '·' || f >= k * 1.4 + 6 ? ch : SEGNI[(k * 7 + f * 3) % SEGNI.length])).join('');
    };
    cifra(0);
    quandoVisibile(el, () => {
      let f = 0;
      const id = setInterval(() => { f++; cifra(f); if (f > t.length * 1.4 + 8) clearInterval(id); }, 38);
    }, 0.6);
  });
}

// ---------- 06 · Raggi X: sotto l'anteprima dei lavori c'è il codice ----------
function raggiX() {
  document.querySelectorAll('[data-raggi]').forEach((a) => {
    const x = (v) => a.style.setProperty('--raggi', `${v}%`);
    x(100);
    if (finePointer) {
      a.addEventListener('pointermove', (e) => { const r = a.getBoundingClientRect(); x(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))); a.classList.add('raggi-su'); });
      a.addEventListener('pointerleave', () => { a.classList.remove('raggi-su'); x(100); });
    }
    // entrando nello schermo la lama passa una volta da sola
    quandoVisibile(a, () => {
      const t0 = performance.now();
      a.classList.add('raggi-su');
      const giro = (t) => {
        const k = Math.min(1, (t - t0) / 2600);
        if (a.matches(':hover')) return;
        x(100 - Math.sin(k * Math.PI) * 62);
        if (k < 1) requestAnimationFrame(giro); else { a.classList.remove('raggi-su'); x(100); }
      };
      requestAnimationFrame(giro);
    }, 0.6);
  });
}

// ---------- 08 · Il filo rosso: un solo quadratino accompagna da un capitolo all'altro ----------
function filoRosso() {
  const capitoli = [...document.querySelectorAll('main .capitolo')];
  if (capitoli.length < 2) return;
  const filo = document.createElement('span');
  filo.className = 'filo-rosso';
  filo.setAttribute('aria-hidden', 'true');
  document.body.appendChild(filo);
  const pos = { x: -50, y: -50, vx: 0, vy: 0, a: 0 };
  let qui = null, primo = true;
  function giro() {
    requestAnimationFrame(giro);
    if (html.classList.contains('menu-aperto') || html.classList.contains('uscita-aperta')) { filo.style.opacity = '0'; return; }
    const h = innerHeight;
    let migliore = null, dist = Infinity;
    for (const c of capitoli) {
      if (!c.offsetParent) continue;
      const r = c.getBoundingClientRect();
      if (r.bottom < h * 0.05 || r.top > h * 0.8) continue;
      const d = Math.abs(r.top - h * 0.35);
      if (d < dist) { dist = d; migliore = c; }
    }
    if (!migliore) { filo.style.opacity = '0'; if (qui) { qui.classList.remove('filo-qui'); qui = null; } return; }
    const r = migliore.getBoundingClientRect();
    const op = parseFloat(getComputedStyle(migliore).opacity) || 0;
    const tx = r.left, ty = r.top + r.height / 2 - 5;
    if (primo) { pos.x = tx; pos.y = ty; primo = false; }
    const nx = pos.x + (tx - pos.x) * 0.16, ny = pos.y + (ty - pos.y) * 0.16;
    pos.vx = nx - pos.x; pos.vy = ny - pos.y; pos.x = nx; pos.y = ny;
    // in viaggio si allunga nel verso in cui va
    const sx = 1 + Math.min(7, Math.abs(pos.vx) / 3), sy = 1 + Math.min(9, Math.abs(pos.vy) / 3);
    filo.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${sx}, ${sy})`;
    filo.style.transformOrigin = `${pos.vx < 0 ? 0 : 100}% ${pos.vy < 0 ? 0 : 100}%`;
    filo.style.opacity = String(op);
    const arrivato = Math.abs(tx - pos.x) < 1.5 && Math.abs(ty - pos.y) < 1.5;
    if (qui !== migliore) { qui?.classList.remove('filo-qui'); qui = null; }
    if (arrivato && !qui) { qui = migliore; qui.classList.add('filo-qui'); }
  }
  requestAnimationFrame(giro);
  html.classList.add('filo-attivo');
}

// ---------- 09 · Il tabellone: i prezzi girano come le palette delle stazioni ----------
function tabellone() {
  document.querySelectorAll('.piano-prezzo, .altri-prezzi strong, .prezzo-da strong, [data-tabellone]').forEach((el) => {
    const cifre = [];
    testi(el, 'small').forEach((n) => {
      if (!/\d/.test(n.textContent)) return;
      const frag = document.createDocumentFragment();
      for (const ch of n.textContent) {
        if (/\d/.test(ch)) { const s = document.createElement('span'); s.className = 'flap'; s.textContent = ch; s.dataset.vero = ch; frag.appendChild(s); cifre.push(s); }
        else frag.appendChild(document.createTextNode(ch));
      }
      n.replaceWith(frag);
    });
    if (!cifre.length) return;
    quandoVisibile(el, () => {
      let tick = 0;
      cifre.forEach((s) => s.classList.add('gira'));
      const id = setInterval(() => {
        tick++;
        cifre.forEach((s, k) => {
          if (tick >= 5 + k * 2) { s.textContent = s.dataset.vero; s.classList.remove('gira'); }
          else s.textContent = String((Number(s.dataset.vero) + tick + k) % 10);
        });
        if (tick > 5 + cifre.length * 2) clearInterval(id);
      }, 70);
    }, 0.7);
  });
}

// ---------- 11 · Tendina rossa: tra una pagina e l'altra il quadratino copre tutto e si richiude ----------
function tendina() {
  // arrivo: la pagina nasce coperta di rosso (classe messa nel <head>), il rosso si richiude sul logo
  // la tendina ha il colore dello sfondo; diventa del colore d'accento solo quando è piccola (niente schermo rosso)
  if (html.classList.contains('tendina-arrivo')) {
    const velo = document.createElement('span');
    velo.className = 'tendina';
    velo.setAttribute('aria-hidden', 'true');
    document.body.appendChild(velo);
    html.classList.remove('tendina-arrivo');
    const logo = document.querySelector('.site-header .brand-icona')?.getBoundingClientRect();
    const fx = logo ? logo.right - logo.width * 0.25 : 40, fy = logo ? logo.bottom - logo.height * 0.25 : 40;
    const cs = getComputedStyle(html);
    const anim = velo.animate([
      { left: '0px', top: '0px', width: `${innerWidth}px`, height: `${innerHeight}px`, backgroundColor: cs.getPropertyValue('--notte').trim() },
      { offset: 0.7, backgroundColor: cs.getPropertyValue('--notte-2').trim() },
      { left: `${fx - 3}px`, top: `${fy - 3}px`, width: '6px', height: '6px', backgroundColor: cs.getPropertyValue('--rosso').trim() },
    ], { duration: 650, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
    anim.onfinish = () => velo.remove();
  }
  ss.via('gd-tendina');
  window.addEventListener('pageshow', (e) => { if (e.persisted) document.querySelectorAll('.tendina').forEach((v) => v.remove()); });
  if (ridotto) return;
  // partenza: ascolto sulla finestra, così ogni altro gestore dei clic ha già deciso
  window.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
    e.preventDefault();
    const velo = document.createElement('span');
    velo.className = 'tendina';
    velo.setAttribute('aria-hidden', 'true');
    document.body.appendChild(velo);
    const x = e.clientX || innerWidth / 2, y = e.clientY || innerHeight / 2;
    const cs = getComputedStyle(html);
    velo.animate([
      { left: `${x - 5}px`, top: `${y - 5}px`, width: '10px', height: '10px', backgroundColor: cs.getPropertyValue('--rosso').trim() },
      { offset: 0.35, backgroundColor: cs.getPropertyValue('--notte-2').trim() },
      { left: '0px', top: '0px', width: `${innerWidth}px`, height: `${innerHeight}px`, backgroundColor: cs.getPropertyValue('--notte').trim() },
    ], { duration: 520, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }).onfinish = () => { ss.set('gd-tendina', '1'); location.assign(u.href); };
  });
}

// ---------- 12 · Tipografia cinetica: le righe giganti si inclinano quando scorri veloce ----------
function cinetica() {
  const el = document.querySelector('[data-cinetica]');
  if (!el) return;
  let ultimo = scrollY, inclina = 0;
  mentreVisibile(el, () => {
    const v = scrollY - ultimo; ultimo = scrollY;
    inclina += (Math.max(-14, Math.min(14, -v * 0.35)) - inclina) * 0.12;
    el.style.setProperty('--inclina', `${inclina.toFixed(2)}deg`);
  });
}

// ---------- 13 · Lettere che prendono peso: vicino al dito o al mouse diventano più spesse ----------
function peso() {
  document.querySelectorAll('[data-peso]').forEach((el) => {
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const lettere = [];
    testi(el, '[data-nome], [data-saluto]').forEach((n) => {
      const frag = document.createDocumentFragment();
      for (const ch of n.textContent) {
        if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
        const s = document.createElement('span'); s.className = 'lettera'; s.textContent = ch; s.setAttribute('aria-hidden', 'true');
        frag.appendChild(s); lettere.push(s);
      }
      n.replaceWith(frag);
    });
    const sezione = el.closest('section') || el;
    const pesa = (px, py) => {
      for (const s of lettere) {
        const r = s.getBoundingClientRect();
        const k = Math.max(0, 1 - Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py) / 260);
        s.style.fontWeight = String(Math.round(260 + 640 * k * k));
      }
    };
    const riposo = () => lettere.forEach((s) => { s.style.fontWeight = ''; });
    if (finePointer) {
      sezione.addEventListener('pointermove', (e) => pesa(e.clientX, e.clientY));
      sezione.addEventListener('pointerleave', riposo);
    } else {
      // su telefono un'onda passa da sola quando il titolo entra nello schermo
      quandoVisibile(el, () => {
        const r = el.getBoundingClientRect(), t0 = performance.now();
        const giro = (t) => {
          const k = (t - t0) / 1800;
          if (k > 1) { riposo(); return; }
          const b = el.getBoundingClientRect();
          pesa(b.left - 150 + (b.width + 300) * k, b.top + b.height / 2);
          requestAnimationFrame(giro);
        };
        if (r.width) requestAnimationFrame(giro);
      }, 0.6);
    }
  });
}

// ---------- 16 · La griglia viva: compaiono le colonne e le schede atterrano al loro posto ----------
function grigliaViva() {
  document.querySelectorAll('[data-griglia-viva]').forEach((g) => {
    const guide = document.createElement('div');
    guide.className = 'guide-viva';
    guide.setAttribute('aria-hidden', 'true');
    guide.innerHTML = '<i></i>'.repeat(12) + '<b class="guide-misura"></b>';
    g.appendChild(guide);
    [...g.children].forEach((c, i) => c.style.setProperty('--i', i));
    quandoVisibile(g, () => {
      const card = g.querySelector('.card');
      guide.querySelector('.guide-misura').textContent = `${getComputedStyle(g).gridTemplateColumns.split(' ').length} col · ${Math.round(card?.getBoundingClientRect().width || 0)} px · gap ${parseInt(getComputedStyle(g).columnGap, 10) || 0}`;
      g.classList.add('atterra');
      setTimeout(() => g.classList.add('atterrata'), 2600);
    }, 0.04);
  });
}

// ---------- 03 · Mappa dell'attenzione: dove si posa lo sguardo, con l'ordine 1, 2, 3 ----------
function mappaAttenzione() {
  document.querySelectorAll('[data-mappa]').forEach((box) => {
    const tela = document.createElement('canvas');
    tela.className = 'mappa-tela';
    box.appendChild(tela);
    const ctx = tela.getContext('2d');
    let W = 0, H = 0;
    const misura = () => { const r = box.getBoundingClientRect(); W = r.width; H = r.height; const d = Math.min(devicePixelRatio || 1, 2); tela.width = W * d; tela.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    misura();
    window.addEventListener('resize', misura);
    const punti = [];
    const fiss = [...box.querySelectorAll('[data-fissa]')];
    const tappe = fiss.map((f) => f.dataset.fissa.split(',').map(Number));
    let mano = 0, t0 = 0, gx = W * 0.2, gy = H * 0.3;
    if (finePointer) box.addEventListener('pointermove', (e) => {
      const r = box.getBoundingClientRect(); mano = performance.now();
      punti.push([e.clientX - r.left, e.clientY - r.top, mano]);
      fiss.forEach((f) => f.classList.remove('visto'));
    });
    mentreVisibile(box, (t) => {
      if (!t0) t0 = t;
      if (t - mano > 2000) {
        // percorso tipico dello sguardo: titolo, immagine, titolo, bottone (6 s, poi ricomincia)
        const ciclo = ((t - t0) % 7000) / 7000;
        const i = Math.min(tappe.length - 1, Math.floor(ciclo * (tappe.length + 1)));
        const [tx, ty] = tappe[i] || [50, 50];
        gx += ((tx / 100) * W - gx) * 0.06; gy += ((ty / 100) * H - gy) * 0.06;
        if (ciclo < 0.02) { punti.length = 0; fiss.forEach((f) => f.classList.remove('visto')); }
        if (ciclo < 0.92) punti.push([gx + (Math.random() - 0.5) * 14, gy + (Math.random() - 0.5) * 14, t]);
        fiss.forEach((f, j) => f.classList.toggle('visto', j < i || (j === i && ciclo * (tappe.length + 1) - i > 0.5)));
      }
      while (punti.length > 160) punti.shift();
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (const [x, y, nato] of punti) {
        const vita = Math.max(0, 1 - (t - nato) / 9000);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 46);
        g.addColorStop(0, `rgba(${tinte.accentoRgb},${0.22 * vita})`); g.addColorStop(1, `rgba(${tinte.accentoRgb},0)`);
        ctx.fillStyle = g; ctx.fillRect(x - 46, y - 46, 92, 92);
      }
      ctx.globalCompositeOperation = 'source-over';
    });
  });
}

// ---------- 05 · Il sito si compila e 07 · il terminale: righe che si scrivono da sole ----------
function righeCheSiScrivono() {
  document.querySelectorAll('[data-scrittura]').forEach((box) => {
    const righe = [...box.querySelectorAll('[data-riga]')];
    const pezzi = [...box.querySelectorAll('[data-pezzo]')];
    const fine = box.querySelector('[data-fine]');
    const testo = righe.map((r) => r.textContent);
    const vel = Number(box.dataset.scrittura) || 28;
    righe.forEach((r) => { r.textContent = ''; });
    const aspetta = (ms) => new Promise((ok) => setTimeout(ok, ms));
    async function giro() {
      for (;;) {
        righe.forEach((r) => { r.textContent = ''; r.classList.remove('scrivo'); });
        pezzi.forEach((p) => p.classList.remove('acceso'));
        fine?.classList.remove('acceso');
        await aspetta(500);
        for (let i = 0; i < righe.length; i++) {
          const r = righe[i];
          r.classList.add('scrivo');
          const istante = r.dataset.riga === 'subito';
          for (let n = 1; n <= testo[i].length; n++) { r.textContent = testo[i].slice(0, n); if (!istante) await aspetta(vel); }
          r.classList.remove('scrivo');
          pezzi.filter((p) => p.dataset.pezzo === String(i)).forEach((p) => p.classList.add('acceso'));
          await aspetta(istante ? 380 : 220);
        }
        fine?.classList.add('acceso');
        await aspetta(4200);
      }
    }
    quandoVisibile(box, giro, 0.3);
  });
}

export function avviaVita() {
  tendina();
  if (ridotto) return;
  html.classList.add('vita-on');
  cursoreCheScrive();
  grigliaMagnetica();
  decodifica();
  raggiX();
  filoRosso();
  tabellone();
  cinetica();
  peso();
  grigliaViva();
  mappaAttenzione();
  righeCheSiScrivono();
}
