// La luce del mattino: lo sfondo della versione chiara al posto del cielo stellato.
// Raggi di sole obliqui, come da una finestra in alto a destra, e il pulviscolo dorato che fluttua dentro la luce.
// Il mouse o il dito sposta i granelli. Gira solo con lo sfondo chiaro e solo quando la pagina è visibile.
// Il viaggio nella luce: come di notte tra le stelle, dal secondo capitolo il pulviscolo ti viene incontro,
// sempre più veloce a ogni capitolo ([data-forma] della sezione al centro); all'ultimo diventa scie d'oro.
const html = document.documentElement;
const ridotto = html.classList.contains('ridotto');
const rand = (a, b) => a + Math.random() * (b - a);
// strada al secondo per capitolo: fermi, piano, sicuri, si accelera, scie
const VIAGGIO = [0, 0.035, 0.07, 0.13, 0.24];

export function avviaLuce() {
  const box = document.createElement('div');
  box.className = 'luce';
  box.setAttribute('aria-hidden', 'true');
  const cv = document.createElement('canvas');
  box.appendChild(cv);
  document.body.prepend(box);
  const c = cv.getContext('2d');
  let w = 0, h = 0, granelli = [], mx = null, my = null, id = 0, t0 = performance.now();
  let capitolo = 0, viaggio = 0, strada = 0, scia = 0, prima = 0, ultimoScroll = scrollY, vel = 0, conta = 0;
  const sezioni = [...document.querySelectorAll('[data-forma]')];
  const leggiCapitolo = () => { const c = innerHeight / 2; for (const el of sezioni) { const r = el.getBoundingClientRect(); if (r.top <= c && r.bottom >= c) { capitolo = Number(el.dataset.forma) || 0; return; } } };

  const misura = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    // tanti granelli quanto è grande lo schermo, più fitti dentro i raggi
    const n = Math.round(Math.min(220, (w * h) / 6500));
    granelli = Array.from({ length: n }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(.6, 2.1), v: rand(.04, .22), f: rand(0, 6.28), wx: rand(-1, 1), wy: rand(-1, 1), z: Math.random() }));
  };

  const disegna = (t) => {
    const s = (t - t0) / 1000;
    const dt = Math.min(0.05, prima ? (t - prima) / 1000 : 0); prima = t;
    if (conta++ % 12 === 0) leggiCapitolo();
    vel += (Math.abs(scrollY - ultimoScroll) / Math.max(dt, 0.001) / 4000 - vel) * 0.1; ultimoScroll = scrollY;
    const veloce = ridotto ? 0 : VIAGGIO[capitolo] + (capitolo > 0 ? Math.min(vel, 1.5) * 0.12 : 0);
    viaggio += ((ridotto || !capitolo ? 0 : 1) - viaggio) * Math.min(1, dt * 1.4);
    strada += veloce * dt * viaggio;
    scia += ((veloce > 0.1 ? Math.min(1, (veloce - 0.1) / 0.16) : 0) - scia) * Math.min(1, dt * 3);
    c.clearRect(0, 0, w, h);
    // i raggi: quattro fasce oblique che respirano piano
    for (let k = 0; k < 4; k++) {
      const x0 = w * (.42 + k * .16) + Math.sin(s * .18 + k) * 18;
      const largo = 60 + k * 18, cala = h * .75;
      const g = c.createLinearGradient(x0, 0, x0 - cala, h);
      g.addColorStop(0, `rgba(255, 210, 140, ${.22 + .06 * Math.sin(s * .45 + k)})`);
      g.addColorStop(1, 'rgba(255, 210, 140, 0)');
      c.fillStyle = g;
      c.beginPath(); c.moveTo(x0, -10); c.lineTo(x0 + largo, -10); c.lineTo(x0 + largo - cala, h + 10); c.lineTo(x0 - cala, h + 10); c.fill();
    }
    // il pulviscolo: sale piano, ondeggia, si scansa dal dito
    for (const p of granelli) {
      if (!ridotto) {
        p.y -= p.v; p.x += Math.sin(s + p.f) * .15;
        if (mx != null) { const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy) || 1; if (d < 110) { p.x += (dx / d) * 1.5; p.y += (dy / d) * 1.5; } }
        if (p.y < -6) { p.y = h + 6; p.x = rand(0, w); }
      }
      let a = .22 + .32 * (.5 + .5 * Math.sin(s * 2 + p.f)), x = p.x, y = p.y, r = p.r;
      if (viaggio > 0.01) {
        // in viaggio: ogni granello ha la sua profondità, che avanza verso di te e ricomincia da lontano
        const f = (p.z + strada) % 1, zz = .08 + (1 - f) * .92;
        const X = w / 2 + p.wx * w * .32 / zz, Y = h / 2 + p.wy * h * .32 / zz;
        const vita = Math.min(1, f / .3) * (1 - Math.max(0, (f - .86) / .14));
        x += (X - x) * viaggio; y += (Y - y) * viaggio;
        a += ((.25 + f * .7) * vita - a) * viaggio;
        r += ((.5 + p.r * .7) * (.6 + f * 1.4) - r) * viaggio;
        if (scia > .02 && viaggio > .5) {
          const dx = X - w / 2, dy = Y - h / 2, d = Math.hypot(dx, dy) || 1, L = scia * 30 * f * f;
          c.strokeStyle = `rgba(170, 122, 55, ${a * .8})`; c.lineWidth = r; c.lineCap = 'round';
          c.beginPath(); c.moveTo(x, y); c.lineTo(x - (dx / d) * L, y - (dy / d) * L); c.stroke();
        }
      }
      if (x < -30 || x > w + 30 || y < -30 || y > h + 30) continue;
      c.fillStyle = `rgba(170, 122, 55, ${a})`;
      c.beginPath(); c.arc(x, y, r, 0, 6.28); c.fill();
    }
  };
  const giro = (t) => { disegna(t); id = ridotto ? 0 : requestAnimationFrame(giro); };
  const accendi = () => {
    const chiaro = html.dataset.tema === 'chiaro';
    box.classList.toggle('su', chiaro);
    cancelAnimationFrame(id); id = 0;
    if (chiaro && !document.hidden) { if (!w) misura(); id = requestAnimationFrame(giro); }
  };
  addEventListener('resize', () => { if (w) { misura(); if (ridotto) disegna(performance.now()); } });
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  addEventListener('pointerdown', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', () => { mx = my = null; });
  document.addEventListener('visibilitychange', accendi);
  addEventListener('gd-tema', accendi);
  accendi();
}
