// La vita del sito: gli effetti scelti dal canvas «Idee di animazione Desideri & Code» (01-17).
// Ognuno parte solo se nella pagina c'è il suo elemento, e nessuno parte con «riduci movimento»
// (tranne la tendina tra le pagine, che allora non c'è e basta).
const html = document.documentElement;
const ridotto = html.classList.contains('ridotto');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} }, via: (k) => { try { sessionStorage.removeItem(k); } catch (_) {} } };
const SEGNI = '01<>/{}[]#$%&*+=?;:_';
// i colori del sito: il rosso del logo e il bianco
const tinte = { accento: '#e30613', accentoRgb: '227, 6, 19', testo: '#ffffff' };

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

// ---------- 02 · Dietro all'hero: il logo gigante e la griglia di puntini ----------
// Con il mouse: puntini bianchi che si gonfiano sotto il puntatore, rossi i più vicini. Su telefono
// (niente puntatore) un'onda lenta in diagonale. In entrambi i casi i puntini non entrano nelle lettere del logo.
function grigliaMagnetica() {
  const box = document.querySelector('[data-griglia-magnetica]');
  if (!box) return;
  const hero = box.parentElement;
  const logo = hero.querySelector('[data-logo-gigante]');
  const lettere = logo && window.Path2D ? new Path2D(logo.querySelector('path').getAttribute('d')) : null;
  const tela = document.createElement('canvas');
  box.appendChild(tela);
  const ctx = tela.getContext('2d');
  let W = 0, H = 0, dpr = 1, punti = [];
  const P = finePointer ? 30 : 26;
  const misura = () => {
    const r = box.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    tela.width = W * dpr; tela.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // i puntini che cadono dentro le lettere (con un margine) non si disegnano mai
    const l = logo?.getBoundingClientRect(), k = l ? l.width / 512 : 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineWidth = 18;
    punti = [];
    for (let y = P / 2; y < H; y += P) for (let x = P / 2; x < W; x += P) {
      if (lettere && l) {
        const lx = (x + r.left - l.left) / k, ly = (y + r.top - l.top) / k;
        if (lx > -20 && ly > -20 && lx < 532 && ly < 532 && (ctx.isPointInPath(lettere, lx, ly) || ctx.isPointInStroke(lettere, lx, ly))) continue;
      }
      punti.push(x, y);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  misura();
  window.addEventListener('resize', misura);
  const p = { x: -999, y: -999 }, g = { x: -999, y: -999 };
  let mano = -1e9, forza = 0;
  if (finePointer) window.addEventListener('pointermove', (e) => { const r = box.getBoundingClientRect(); p.x = e.clientX - r.left; p.y = e.clientY - r.top; mano = performance.now(); }, { passive: true });
  mentreVisibile(box, (t) => {
    ctx.clearRect(0, 0, W, H);
    if (finePointer) {
      const fermo = t - mano > 1800;
      forza += ((fermo ? 0 : 1) - forza) * (fermo ? 0.03 : 0.2);
      g.x += (p.x - g.x) * 0.25; g.y += (p.y - g.y) * 0.25;
      const R = Math.min(190, W * 0.3);
      for (let i = 0; i < punti.length; i += 2) {
        const x = punti[i], y = punti[i + 1], d = Math.hypot(x - g.x, y - g.y);
        const k = Math.max(0, 1 - d / R) * forza, s = 1.6 + 6 * k * k;
        ctx.globalAlpha = 0.09 + 0.5 * k;
        ctx.fillStyle = d < 54 && forza > 0.3 ? tinte.accento : tinte.testo;
        ctx.beginPath(); ctx.arc(x, y, s / 2, 0, 6.283); ctx.fill();
      }
    } else {
      ctx.fillStyle = tinte.testo;
      const tt = t / 1000;
      for (let i = 0; i < punti.length; i += 2) {
        const x = punti[i], y = punti[i + 1];
        const o = Math.max(0, Math.sin((x + y) / W * 4 - tt * 0.7)), k = o * o * o;
        ctx.globalAlpha = 0.08 + 0.26 * k;
        const r = 0.9 + 1.6 * k;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
    ctx.globalAlpha = 1;
  });
}

// ---------- Il sito che si disegna: linee bianche, poi la bozza prende vita in 3D ----------
function bozza() {
  const el = document.querySelector('[data-bozza]');
  if (!el) return;
  const svg = el.querySelector('.bz-linee');
  const pezzi = [...el.querySelectorAll('[data-bz]')];
  pezzi.forEach((p, i) => p.style.setProperty('--i', i));
  const parti = () => {
    if (!el.offsetParent) return;
    // i rettangoli si prendono dalla bozza vera, così le linee combaciano con quello che comparirà
    const b = el.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
    svg.innerHTML = pezzi.map((p) => { const r = p.getBoundingClientRect(); return `<rect x="${(r.left - b.left).toFixed(1)}" y="${(r.top - b.top).toFixed(1)}" width="${r.width.toFixed(1)}" height="${r.height.toFixed(1)}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`; }).join('');
    const rett = [...svg.querySelectorAll('rect')];
    rett.forEach((r, i) => r.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 650, delay: i * 210, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' }));
    const fine = rett.length * 210 + 650;
    setTimeout(() => el.classList.add('viva'), fine);
    setTimeout(() => { el.classList.add('inclinata'); inclina(); }, fine + 500);
  };
  // la bozza segue il mouse (pochi gradi); su telefono ondeggia piano da sola
  function inclina() {
    const base = { x: -16, y: 8 };
    let tx = base.x, ty = base.y, x = base.x, y = base.y;
    if (finePointer) window.addEventListener('pointermove', (e) => { tx = base.x + (e.clientX / innerWidth - 0.5) * 16; ty = base.y - (e.clientY / innerHeight - 0.5) * 10; }, { passive: true });
    mentreVisibile(el, (t) => {
      if (!finePointer) { tx = base.x * 0.6 + Math.sin(t / 2600) * 7; ty = base.y * 0.6 + Math.cos(t / 3300) * 3; }
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      el.style.setProperty('--ry', `${x.toFixed(2)}deg`); el.style.setProperty('--rx', `${y.toFixed(2)}deg`);
    });
  }
  const parti2 = () => quandoVisibile(el, () => setTimeout(parti, 300), 0.3);
  if (html.classList.contains('intro-attiva')) window.addEventListener('gd-intro-fine', parti2, { once: true }); else parti2();
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

// ---------- 08 · Il punto che compare: il quadratino rosso chiude il titolo quando la sezione entra ----------
function puntoTitoli() {
  document.querySelectorAll('main .testa-sezione h2, main .sezione > .wrap > h2').forEach((h) => {
    const t = testi(h).pop();
    if (!t || !/\.\s*$/.test(t.textContent) || /\.\.\s*$/.test(t.textContent)) return;
    t.textContent = t.textContent.replace(/\.\s*$/, '');
    const q = document.createElement('span');
    q.className = 'punto-titolo';
    q.setAttribute('aria-hidden', 'true');
    t.after(q);
    // il punto resta per i lettori di schermo
    const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = '.';
    q.after(sr);
    quandoVisibile(h, () => q.classList.add('arrivato'), 0.6);
  });
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
  // la tendina ha il colore dello sfondo; diventa rossa solo quando è piccola (niente schermo rosso)
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

// ---------- 16 · Le schede dei servizi: salgono, le spunte si spuntano una alla volta, il prezzo conta ----------
function grigliaViva() {
  const lingua = html.lang === 'en' ? 'en-US' : 'it-IT';
  document.querySelectorAll('[data-griglia-viva]').forEach((g) => {
    const schede = [...g.children];
    schede.forEach((c, i) => {
      c.style.setProperty('--i', i);
      c.querySelectorAll('.lista-check li').forEach((li, k) => li.style.setProperty('--k', k));
    });
    // il numero del prezzo: si conta da zero mantenendo il resto del testo (valuta, «/mese»)
    const prezzi = schede.map((c) => {
      const n = c.querySelector('.prezzo-da strong')?.firstChild;
      const m = n?.nodeType === 3 && n.textContent.match(/\d[\d.,]*/);
      return m ? { n, prima: n.textContent.slice(0, m.index), dopo: n.textContent.slice(m.index + m[0].length), val: Number(m[0].replace(/[.,]/g, '')) } : null;
    });
    const scrivi = (p, v) => { p.n.textContent = p.prima + v.toLocaleString(lingua) + p.dopo; };
    prezzi.forEach((p) => p && scrivi(p, 0));
    quandoVisibile(g, () => {
      g.classList.add('atterra');
      const t0 = performance.now();
      const conta = (t) => {
        let finito = true;
        prezzi.forEach((p, i) => {
          if (!p) return;
          const k = Math.min(1, Math.max(0, (t - t0 - 600 - i * 120) / 1100));
          if (k < 1) finito = false;
          const e = 1 - Math.pow(1 - k, 3);
          scrivi(p, k < 1 ? Math.round((p.val * e) / (p.val >= 100 ? 10 : 1)) * (p.val >= 100 ? 10 : 1) : p.val);
        });
        if (!finito) requestAnimationFrame(conta);
      };
      requestAnimationFrame(conta);
      setTimeout(() => g.classList.add('atterrata'), 3600);
    }, 0.04);
  });
}

// ---------- 03 · Il percorso dello sguardo: quadratini numerati collegati da una linea, l'ultimo sul bottone ----------
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
    const fiss = [...box.querySelectorAll('[data-fissa]')];
    const tappe = fiss.map((f) => f.dataset.fissa.split(',').map(Number));
    const PASSO = 1300, CICLO = PASSO * tappe.length + 3200;
    let t0 = 0;
    mentreVisibile(box, (t) => {
      if (!t0) t0 = t;
      const c = (t - t0) % CICLO;
      const via = c > CICLO - 700 ? 1 - (c - (CICLO - 700)) / 700 : 1;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = via;
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1;
      tappe.forEach(([x, y], i) => {
        const k = Math.min(1, Math.max(0, (c - 300 - i * PASSO) / 500));
        fiss[i].classList.toggle('visto', k >= 1 && via > 0.5);
        if (!i || !k) return;
        const [px, py] = tappe[i - 1], e = 1 - Math.pow(1 - k, 3);
        ctx.beginPath(); ctx.moveTo(px / 100 * W, py / 100 * H);
        ctx.lineTo((px + (x - px) * e) / 100 * W, (py + (y - py) * e) / 100 * H); ctx.stroke();
      });
      ctx.globalAlpha = 1;
    });
  });
}

// ---------- 15 · Prima / dopo da trascinare: si muove da solo finché non lo tocchi ----------
function primaDopo() {
  document.querySelectorAll('[data-prima-dopo]').forEach((box) => {
    const r = box.querySelector('[data-pd-cursore]');
    let mano = false;
    const metti = (x) => box.style.setProperty('--x', `${x}%`);
    r.addEventListener('input', () => { mano = true; metti(r.value); });
    r.addEventListener('pointerdown', () => { mano = true; });
    let t0 = 0;
    mentreVisibile(box, (t) => {
      if (mano) return;
      if (!t0) t0 = t;
      const x = 50 - 36 * Math.sin((t - t0) / 1800);
      metti(x.toFixed(2)); r.value = Math.round(x);
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
  bozza();
  decodifica();
  raggiX();
  puntoTitoli();
  tabellone();
  cinetica();
  peso();
  grigliaViva();
  mappaAttenzione();
  primaDopo();
  righeCheSiScrivono();
}
