// La vita del sito: gli effetti scelti dal canvas «Idee di animazione Desideri&Code» (01-17).
// Ognuno parte solo se nella pagina c'è il suo elemento, e nessuno parte con «riduci movimento»
// (tranne il salto tra le pagine, che allora non c'è e basta).
const html = document.documentElement;
const ridotto = html.classList.contains('ridotto');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const ss = { set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} }, via: (k) => { try { sessionStorage.removeItem(k); } catch (_) {} } };
const SEGNI = '01<>/{}[]#$%&*+=?;:_';
// i colori del sito: il rosso del logo e il bianco
const tinte = { accento: '#e30613', testo: '#ffffff' };

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
// Con il mouse: puntini bianchi che si gonfiano sotto il puntatore, rossi i più vicini.
// I puntini non entrano nelle lettere del logo. Su telefono niente puntini.
function grigliaMagnetica() {
  const box = document.querySelector('[data-griglia-magnetica]');
  // su telefono niente puntini: distraggono dal testo
  if (!box || !finePointer) return;
  const hero = box.parentElement;
  const logo = hero.querySelector('[data-logo-gigante]');
  const lettere = logo && window.Path2D ? new Path2D(logo.querySelector('path').getAttribute('d')) : null;
  const tela = document.createElement('canvas');
  box.appendChild(tela);
  const ctx = tela.getContext('2d');
  let W = 0, H = 0, dpr = 1, punti = [];
  const P = 30;
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
  // ridimensionando la finestra si rimisura una volta per fotogramma, non a ogni evento
  let rimisura = 0;
  window.addEventListener('resize', () => { if (!rimisura) rimisura = requestAnimationFrame(() => { rimisura = 0; misura(); }); });
  const p = { x: -999, y: -999 }, g = { x: -999, y: -999 };
  let mano = -1e9, forza = 0, pulito = false;
  window.addEventListener('pointermove', (e) => { const r = box.getBoundingClientRect(); p.x = e.clientX - r.left; p.y = e.clientY - r.top; mano = performance.now(); }, { passive: true });
  mentreVisibile(box, (t) => {
    const fermo = t - mano > 1800;
    forza += ((fermo ? 0 : 1) - forza) * (fermo ? 0.03 : 0.2);
    g.x += (p.x - g.x) * 0.25; g.y += (p.y - g.y) * 0.25;
    // mouse fermo da un po': nessun puntino è abbastanza acceso da vedersi, basta pulire una volta
    if (forza < 0.02) { if (!pulito) { ctx.clearRect(0, 0, W, H); pulito = true; } return; }
    pulito = false;
    ctx.clearRect(0, 0, W, H);
    const R = Math.min(190, W * 0.3);
    for (let i = 0; i < punti.length; i += 2) {
      const x = punti[i], y = punti[i + 1], d = Math.hypot(x - g.x, y - g.y);
      const k = Math.max(0, 1 - d / R) * forza, s = 1.6 + 6 * k * k;
      if (k < 0.02) continue;
      ctx.globalAlpha = 0.6 * k;
      ctx.fillStyle = d < 54 && forza > 0.3 ? tinte.accento : tinte.testo;
      ctx.beginPath(); ctx.arc(x, y, s / 2, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

// ---------- Il sito che nasce dal codice: pioggia di codice, poi i blocchi, poi la bozza prende vita in 3D ----------
function bozza() {
  const el = document.querySelector('[data-bozza]');
  if (!el) return;
  const svg = el.querySelector('.bz-linee');
  const pezzi = [...el.querySelectorAll('[data-bz]')];
  pezzi.forEach((p, i) => p.style.setProperty('--i', i));
  // i pezzi di codice che piovono nella finestra: sono quelli che servono davvero a questo sito
  const pioggia = el.querySelector('.bz-pioggia');
  const CODICE = ['<span class="k">&lt;header&gt;</span>', '<span class="k">&lt;h1&gt;</span>', '<span class="s">"Il tuo tavolo"</span>', 'display:grid;', '<span class="k">&lt;button&gt;</span>', 'prenota(4, "20:00")', 'color:<span class="r">#e30613</span>;', '<span class="k">&lt;img</span> src=<span class="s">"risotto.webp"</span>', 'gap:2rem;', 'wa.me/39…', '<span class="k">&lt;/section&gt;</span>', 'font-weight:800;', 'recensioni.media()', 'const posti = 4;', '<span class="k">&lt;nav&gt;</span>', 'aspect-ratio:3/2;'];
  const piovi = () => {
    let s = '';
    for (let r = 0; r < 22; r++) { let riga = ''; for (let c = 0; c < 5; c++) riga += CODICE[(Math.random() * CODICE.length) | 0] + '   '; s += riga + '\n'; }
    pioggia.innerHTML = s;
  };
  const parti = () => {
    if (!el.offsetParent) return;
    piovi();
    const id = setInterval(piovi, 85);
    // dopo un attimo il codice si spegne e restano i blocchi, disegnati dalle linee
    setTimeout(() => { clearInterval(id); pioggia.classList.add('spenta'); disegna(); }, 1700);
  };
  const disegna = () => {
    // i rettangoli si prendono dalla bozza vera, così le linee combaciano con quello che comparirà
    // in percentuale della bozza: le linee restano al loro posto anche se lo schermo cambia misura
    const b = el.getBoundingClientRect();
    const px = (v, l) => ((v / l) * 100).toFixed(2);
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML = pezzi.map((p) => { const r = p.getBoundingClientRect(); return `<rect x="${px(r.left - b.left, b.width)}" y="${px(r.top - b.top, b.height)}" width="${px(r.width, b.width)}" height="${px(r.height, b.height)}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`; }).join('');
    const rett = [...svg.querySelectorAll('rect')];
    rett.forEach((r, i) => r.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 550, delay: i * 140, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' }));
    const fine = rett.length * 140 + 550;
    setTimeout(() => el.classList.add('viva'), fine);
    setTimeout(() => pioggia.remove(), fine + 1400);
    // il 3D solo con il mouse: su telefono la bozza resta piatta e nitida
    if (finePointer) setTimeout(() => { el.classList.add('inclinata'); inclina(); }, fine + 500);
    else setTimeout(() => el.classList.add('animata'), fine + 500);
  };
  // la bozza segue il mouse (pochi gradi)
  function inclina() {
    const base = { x: -16, y: 8 };
    let tx = base.x, ty = base.y, x = base.x, y = base.y, ultima = '';
    const scena = el.querySelector('.bz-scena') || el; // l'inclinazione la usa solo lei
    window.addEventListener('pointermove', (e) => { tx = base.x + (e.clientX / innerWidth - 0.5) * 16; ty = base.y - (e.clientY / innerHeight - 0.5) * 10; }, { passive: true });
    mentreVisibile(el, () => {
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      // si riscrive solo quando l'inclinazione cambia davvero (a mouse fermo resta uguale)
      const ry = x.toFixed(2), rx = y.toFixed(2);
      if (ry + rx === ultima) return;
      ultima = ry + rx;
      scena.style.setProperty('--ry', `${ry}deg`); scena.style.setProperty('--rx', `${rx}deg`);
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


// ---------- I pacchetti sul telefono: si scorrono di lato, si apre sul più scelto ----------
function pacchettiSlider() {
  const box = document.querySelector('[data-pacchetti]');
  if (!box) return;
  const carte = [...box.children], seg = [...document.querySelectorAll('.prezzi-guida .segmenti i')], conta = document.querySelector('[data-pacchetti-conta]');
  const telefono = () => matchMedia('(max-width: 820px)').matches;
  const segna = () => {
    const c = box.scrollLeft + box.clientWidth / 2;
    let i = 0, d = Infinity;
    carte.forEach((el, k) => { const m = Math.abs(el.offsetLeft + el.offsetWidth / 2 - c); if (m < d) { d = m; i = k; } });
    carte.forEach((el, k) => el.classList.toggle('on', k === i));
    seg.forEach((s, k) => s.classList.toggle('on', k === i));
    if (conta) conta.textContent = `${i + 1} / ${carte.length}`;
  };
  let inCoda = false;
  box.addEventListener('scroll', () => { if (!inCoda) { inCoda = true; requestAnimationFrame(() => { inCoda = false; segna(); }); } }, { passive: true });
  const parti = () => {
    if (!telefono()) return;
    const top = carte.findIndex((c) => c.classList.contains('top'));
    const c = carte[top < 0 ? 0 : top];
    box.scrollLeft = c.offsetLeft - (box.clientWidth - c.offsetWidth) / 2;
    segna();
    box.classList.add('pronto');
  };
  requestAnimationFrame(parti);
  addEventListener('resize', segna);
}

// ---------- I servizi sul telefono: un indice, toccando una riga si apre (le altre si chiudono) ----------
function indiceServizi() {
  const schede = [...document.querySelectorAll('[data-servizio]')];
  if (!schede.length) return;
  const metti = (aperta) => schede.forEach((s) => {
    s.classList.toggle('aperta', s === aperta);
    s.querySelector('.servizio-apri')?.setAttribute('aria-expanded', String(s === aperta));
  });
  schede.forEach((s) => {
    const b = s.querySelector('.servizio-apri');
    if (!b) return;
    b.hidden = false;
    b.addEventListener('click', () => metti(s.classList.contains('aperta') ? null : s));
  });
  metti(schede[0]); // la prima arriva aperta: si capisce subito come funziona
}

// ---------- I tre problemi: la giornata «Oggi» e «Con noi», si scambia da sola finché non tocchi l'interruttore ----------
function giornata() {
  document.querySelectorAll('[data-giornata]').forEach((box) => {
    const bt = [...box.querySelectorAll('.gi-interruttore button')];
    const oggi = box.querySelectorAll('.gi-oggi'), noi = box.querySelectorAll('.gi-noi');
    let conNoi = false, mano = false, id = 0;
    const metti = (v) => {
      conNoi = v;
      box.classList.toggle('noi', v);
      bt.forEach((b) => { const si = (b.dataset.lato === 'noi') === v; b.classList.toggle('on', si); b.setAttribute('aria-pressed', String(si)); });
      // chi usa un lettore di schermo sente solo la giornata scelta
      oggi.forEach((e) => e.setAttribute('aria-hidden', String(v)));
      noi.forEach((e) => e.setAttribute('aria-hidden', String(!v)));
    };
    metti(false);
    bt.forEach((b) => b.addEventListener('click', () => { mano = true; clearInterval(id); metti(b.dataset.lato === 'noi'); }));
    if (ridotto) return;
    new IntersectionObserver(([v]) => {
      clearInterval(id);
      if (v.isIntersecting && !mano) id = setInterval(() => metti(!conNoi), 3600);
    }, { threshold: 0.4 }).observe(box);
  });
}

// ---------- «Stanotte»: le notifiche arrivano una dopo l'altra sul telefono delle 6 ----------
function notifiche() {
  document.querySelectorAll('[data-stanotte]').forEach((box) => {
    const fold = box.querySelector('.st-fold');
    const esterna = box.querySelector('[data-sf-esterna]');
    const voci = [...box.querySelectorAll('.sf-destra .st-notifiche li')];
    const passi = [...box.querySelectorAll('[data-sf-passo]')];
    const chat = box.querySelector('[data-sf-chat]');
    quandoVisibile(box, () => {
      // 1 · chiuso: sullo schermo esterno arriva la prima notifica
      setTimeout(() => { esterna?.classList.add('su'); voci[0]?.classList.add('su'); }, 300);
      // 2 · subito dopo si apre: l'anta gira sulla cerniera
      const apre = 1500;
      setTimeout(() => fold?.classList.add('aperto'), apre);
      // quando l'anta è distesa la cerniera torna dritta (finché gira, gli angoli restano tondi)
      setTimeout(() => fold?.classList.add('piatto'), apre + 1650);
      // 3 · dentro arrivano le altre notifiche, e sul sito riparte la chat di stanotte
      voci.slice(1).forEach((v, i) => setTimeout(() => v.classList.add('su'), apre + 1900 + i * 650));
      const via = apre + 1900;
      if (chat) { setTimeout(() => chat.classList.add('bussa'), via); setTimeout(() => chat.classList.add('aperta'), via + 500); setTimeout(() => chat.classList.add('chiusa'), via + 5600); }
      passi.forEach((p) => {
        setTimeout(() => p.classList.add('su'), via + Number(p.dataset.sfPasso));
        if (p.dataset.sfVia) setTimeout(() => p.classList.remove('su'), via + Number(p.dataset.sfVia));
      });
    }, 0.4);
  });
}

// ---------- Il metodo: scorrendo si accende un numero alla volta e a destra entra il suo passo ----------
function metodoNumeri() {
  const pista = document.querySelector('[data-metodo]');
  if (!pista) return;
  const numeri = [...pista.querySelectorAll('.metodo-numeri li')], passi = [...pista.querySelectorAll('.metodo-passi .passo')];
  let attivo = 0, in_coda = false;
  // si riscrive solo quello che cambia (da lontano lo stato resta giusto, ma senza toccare la pagina)
  const sotto = passi.map(() => '');
  const leggi = () => {
    in_coda = false;
    const r = pista.getBoundingClientRect(), corsa = r.height - innerHeight;
    const p = Math.max(0, Math.min(0.999, -r.top / Math.max(1, corsa)));
    const i = Math.floor(p * passi.length);
    // la sottolineatura del verbo segue lo scorrimento dentro il passo: arriva piena a metà, poi resta
    const f = Math.min(1, (p * passi.length - i) / 0.5);
    passi.forEach((s, k) => {
      const v = String(k < i ? 1 : k === i ? f.toFixed(3) : 0);
      if (v !== sotto[k]) { sotto[k] = v; s.style.setProperty('--sotto', v); }
    });
    if (i === attivo) return;
    attivo = i;
    numeri.forEach((n, k) => { n.classList.toggle('on', k === i); n.classList.toggle('fatto', k < i); });
    passi.forEach((s, k) => s.classList.toggle('on', k === i));
  };
  addEventListener('scroll', () => { if (!in_coda) { in_coda = true; requestAnimationFrame(leggi); } }, { passive: true });
  leggi();
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
  document.querySelectorAll('.piano-prezzo, .altri-prezzi strong, .prezzo-da strong, .servizio-da-breve').forEach((el) => {
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

// ---------- Le file di servizi ([data-fila]): scorrono da destra a sinistra all'infinito ----------
// La seconda copia delle etichette serve solo al giro senza fine (nascosta ai lettori di schermo e al tasto Tab).
// Toccandola, trascinandola o con la rotella si ferma; riparte da sola dopo qualche secondo.
function filaInfinita() {
  document.querySelectorAll('[data-fila]').forEach(fila1);
}
function fila1(fila) {
  if (fila.children.length < 2) return;
  [...fila.children].forEach((li) => {
    const c = li.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    c.querySelectorAll('a').forEach((a) => { a.tabIndex = -1; });
    fila.appendChild(c);
  });
  fila.classList.add('infinita');
  const meta = () => fila.scrollWidth / 2;
  let x = 0, fermo = false, riparti = 0;
  const ferma = () => {
    fermo = true;
    clearTimeout(riparti);
    riparti = setTimeout(() => { fermo = false; x = fila.scrollLeft; }, 3500);
  };
  ['touchstart', 'wheel', 'focusin'].forEach((ev) => fila.addEventListener(ev, ferma, { passive: true }));
  // il giro: arrivati a metà si torna all'inizio, che è identico
  fila.addEventListener('scroll', () => {
    if (fila.scrollLeft >= meta()) { fila.scrollLeft -= meta(); x = fila.scrollLeft; }
    else if (fila.scrollLeft <= 0 && fermo) { fila.scrollLeft += meta(); x = fila.scrollLeft; }
  }, { passive: true });
  // col mouse si trascina; un trascinamento non vale come clic
  let giu = null, mosso = false;
  fila.addEventListener('pointerdown', (e) => {
    ferma();
    if (e.pointerType !== 'mouse') return;
    giu = { x: e.clientX, s: fila.scrollLeft };
    mosso = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (!giu) return;
    const dx = e.clientX - giu.x;
    if (Math.abs(dx) > 4) { mosso = true; fila.classList.add('trascino'); }
    if (mosso) { fila.scrollLeft = giu.s - dx; ferma(); }
  });
  window.addEventListener('pointerup', () => { giu = null; fila.classList.remove('trascino'); });
  fila.addEventListener('click', (e) => { if (mosso) { e.preventDefault(); mosso = false; } }, true);
  if (ridotto) return;
  let t0 = 0;
  mentreVisibile(fila, (t) => {
    const dt = t0 ? Math.min(48, t - t0) : 16;
    t0 = t;
    if (fermo || giu) return;
    x += dt * 0.034;
    if (x >= meta()) x -= meta();
    fila.scrollLeft = x;
  });
}

// ---------- 11 · Il salto tra le stelle: cambiare pagina è un altro pezzo del viaggio ----------
function salto() {
  // arrivo: la pagina è nascosta (classe messa nel <head>) e appare mentre le stelle rallentano
  if (html.classList.contains('salto-arrivo')) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      html.classList.add('salto-entra'); html.classList.remove('salto-arrivo');
      setTimeout(() => html.classList.remove('salto-entra'), 700);
    }));
  }
  ss.via('gd-salto');
  // tornando indietro col browser la pagina dev'essere di nuovo visibile
  window.addEventListener('pageshow', (e) => { if (e.persisted) html.classList.remove('salto-via', 'salto-arrivo', 'salto-entra'); });
  if (ridotto) return;
  // partenza: ascolto sulla finestra, così ogni altro gestore dei clic ha già deciso
  window.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href]');
    // il cambio lingua è immediato: niente salto
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-lingua')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('gd-salto'));
    setTimeout(() => html.classList.add('salto-via'), 0);
    setTimeout(() => { ss.set('gd-salto', '1'); location.assign(u.href); }, 440);
  });
}

// ---------- 12 · Tipografia cinetica: le righe giganti si inclinano quando scorri veloce ----------
function cinetica() {
  const el = document.querySelector('[data-cinetica]');
  if (!el) return;
  let ultimo = scrollY, inclina = 0, scritta = '';
  // l'inclinazione va solo alle righe che la usano
  const righe = el.querySelectorAll('.cinetica-riga');
  mentreVisibile(el, () => {
    const v = scrollY - ultimo; ultimo = scrollY;
    inclina += (Math.max(-14, Math.min(14, -v * 0.35)) - inclina) * 0.12;
    // si riscrive solo se cambia: da fermi resta uguale e il browser non ricalcola le due righe giganti
    const s = inclina.toFixed(2);
    if (s !== scritta) { scritta = s; righe.forEach((r) => r.style.setProperty('--inclina', `${s}deg`)); }
  });
}

// ---------- 16 · Le schede dei servizi: salgono e le spunte si spuntano una alla volta (il prezzo gira col tabellone) ----------
function grigliaViva() {
  document.querySelectorAll('[data-griglia-viva]').forEach((g) => {
    const schede = [...g.children];
    schede.forEach((c, i) => {
      c.style.setProperty('--i', i);
      c.querySelectorAll('.lista-check li').forEach((li, k) => li.style.setProperty('--k', k));
    });
    quandoVisibile(g, () => {
      g.classList.add('atterra');
      setTimeout(() => g.classList.add('atterrata'), 3600);
    }, 0.04);
  });
}

// ---------- 03 · Trova l'intruso: un anello va sul riquadro rosso; a ogni giro il rosso cambia posto ----------
function intruso() {
  document.querySelectorAll('[data-intruso]').forEach((box) => {
    const celle = [...box.querySelectorAll('.in-griglia span')], anello = box.querySelector('.in-anello'), fig = box.closest('.intruso-box');
    const aspetta = (ms) => new Promise((r) => setTimeout(r, ms));
    let dove = celle.findIndex((c) => c.classList.contains('r')), vivo = false, inCorso = false;
    const giro = async () => {
      if (inCorso) return; inCorso = true;
      while (vivo) {
        box.classList.remove('cerca', 'trovato');
        anello.style.left = '50%'; anello.style.top = '50%';
        await aspetta(900);
        const b = box.getBoundingClientRect(), c = celle[dove].getBoundingClientRect();
        box.classList.add('cerca');
        await aspetta(120);
        anello.style.left = `${((c.left + c.width / 2 - b.left) / b.width) * 100}%`;
        anello.style.top = `${((c.top + c.height / 2 - b.top) / b.height) * 100}%`;
        await aspetta(520);
        box.classList.add('trovato'); fig?.classList.add('visto');
        await aspetta(3600);
        if (!vivo) break;
        // il rosso si sposta in un altro riquadro, così il giro dopo si rifà la prova
        box.classList.remove('cerca', 'trovato');
        await aspetta(500);
        celle[dove].classList.remove('r');
        let nuovo = dove; while (nuovo === dove) nuovo = (Math.random() * celle.length) | 0;
        dove = nuovo; celle[dove].classList.add('r');
      }
      inCorso = false;
    };
    new IntersectionObserver(([v]) => { vivo = v.isIntersecting; if (vivo) giro(); }, { threshold: 0.5 }).observe(box);
  });
}

// ---------- La barra di ricerca del finale: scrive da sola le ricerche delle persone, una dopo l'altra ----------
function ricercaViva() {
  document.querySelectorAll('[data-cerca-viva]').forEach((box) => {
    const q = box.querySelector('.cv-q');
    let ricerche = [];
    try { ricerche = JSON.parse(box.dataset.ricerche || '[]'); } catch (_) {}
    if (!ricerche.length) return;
    const aspetta = (ms) => new Promise((r) => setTimeout(r, ms));
    let vivo = false, inCorso = false, i = 0;
    const giro = async () => {
      if (inCorso) return; inCorso = true;
      while (vivo) {
        const f = ricerche[i % ricerche.length]; i++;
        box.classList.remove('trovata');
        for (let n = q.textContent.length; n >= 0; n--) { q.textContent = q.textContent.slice(0, n); await aspetta(16); }
        for (let n = 1; n <= f.length; n++) { q.textContent = f.slice(0, n); await aspetta(55 + Math.random() * 45); }
        box.classList.add('trovata');
        await aspetta(2200);
      }
      inCorso = false;
    };
    new IntersectionObserver(([v]) => { vivo = v.isIntersecting; if (vivo) giro(); }, { threshold: 0.3 }).observe(box);
  });
}

// ---------- 15 · Prima / dopo da trascinare: si muove da solo finché non lo tocchi ----------
function primaDopo() {
  document.querySelectorAll('[data-prima-dopo]').forEach((box) => {
    const r = box.querySelector('[data-pd-cursore]');
    let mano = false;
    // il «dopo» entra in scena (titolo, arco, cartellino) quando il riquadro arriva sullo schermo
    quandoVisibile(box, () => box.classList.add('visto'), 0.35);
    // la posizione della lama va solo ai due pezzi che la usano: il «dopo» ritagliato e la lama
    // (sul riquadro intero farebbe ricalcolare a ogni fotogramma tutto il sito finto che c'è dentro)
    const pezzi = [box.querySelector('.pd-dopo'), box.querySelector('.pd-lama')].filter(Boolean);
    const metti = (x) => pezzi.forEach((p) => p.style.setProperty('--x', `${x}%`));
    let valore = r.value;
    const cursore = (v) => { if (v !== valore) { valore = v; r.value = v; } };
    r.addEventListener('input', () => { mano = true; valore = r.value; metti(r.value); });
    // col dito o col mouse: tocchi un punto e trascini, la lama segue (lo scorrimento in verticale resta libero)
    let giu = false;
    const segui = (e) => { const b = box.getBoundingClientRect(); const x = Math.max(0, Math.min(100, ((e.clientX - b.left) / b.width) * 100)); metti(x.toFixed(2)); cursore(String(Math.round(x))); };
    box.addEventListener('pointerdown', (e) => { mano = true; giu = true; box.setPointerCapture?.(e.pointerId); segui(e); });
    box.addEventListener('pointermove', (e) => { if (giu) segui(e); });
    const su = () => { giu = false; };
    box.addEventListener('pointerup', su); box.addEventListener('pointercancel', su);
    let t0 = 0;
    mentreVisibile(box, (t) => {
      if (mano) return;
      if (!t0) t0 = t;
      const x = 50 - 36 * Math.sin((t - t0) / 1800);
      metti(x.toFixed(2)); cursore(String(Math.round(x)));
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
    // gira solo mentre si vede: uscito dallo schermo finisce il giro e si ferma, rientrando riparte
    let vivo = false, inCorso = false;
    async function giro() {
      if (inCorso) return; inCorso = true;
      while (vivo) {
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
      inCorso = false;
    }
    if (!('IntersectionObserver' in window)) { vivo = true; giro(); return; }
    new IntersectionObserver(([v]) => { vivo = v.isIntersecting; if (vivo) giro(); }, { threshold: 0.3 }).observe(box);
  });
}

// il confronto prima/dopo scarica caratteri e foto solo quando si avvicina (vita.css, .vicino)
function vicini() {
  document.querySelectorAll('[data-prima-dopo]').forEach((b) => {
    if (!('IntersectionObserver' in window)) { b.classList.add('vicino'); return; }
    const io = new IntersectionObserver((v) => { if (v.some((x) => x.isIntersecting)) { io.disconnect(); b.classList.add('vicino'); } }, { rootMargin: '150% 0px' });
    io.observe(b);
  });
}

export function avviaVita() {
  vicini(); // anche con «riduci movimento»
  salto();
  giornata(); // l'interruttore funziona anche con «riduci movimento»
  indiceServizi();
  pacchettiSlider();
  filaInfinita(); // si trascina anche con «riduci movimento», ma non scorre da sola
  if (ridotto) return;
  html.classList.add('vita-on');
  cursoreCheScrive();
  grigliaMagnetica();
  bozza();
  decodifica();
  puntoTitoli();
  notifiche();
  metodoNumeri();
  tabellone();
  cinetica();
  grigliaViva();
  intruso();
  ricercaViva();
  primaDopo();
  righeCheSiScrivono();
}
