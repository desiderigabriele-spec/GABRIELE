// La luce del mattino: lo sfondo della versione chiara al posto del cielo stellato.
// Raggi di sole obliqui, come da una finestra in alto a destra, e il pulviscolo dorato che fluttua dentro la luce.
// Il mouse o il dito sposta i granelli. Gira solo con lo sfondo chiaro e solo quando la pagina è visibile.
const html = document.documentElement;
const ridotto = html.classList.contains('ridotto');
const rand = (a, b) => a + Math.random() * (b - a);

export function avviaLuce() {
  const box = document.createElement('div');
  box.className = 'luce';
  box.setAttribute('aria-hidden', 'true');
  const cv = document.createElement('canvas');
  box.appendChild(cv);
  document.body.prepend(box);
  const c = cv.getContext('2d');
  let w = 0, h = 0, granelli = [], mx = null, my = null, id = 0, t0 = performance.now();

  const misura = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    // tanti granelli quanto è grande lo schermo, più fitti dentro i raggi
    const n = Math.round(Math.min(220, (w * h) / 6500));
    granelli = Array.from({ length: n }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(.6, 2.1), v: rand(.04, .22), f: rand(0, 6.28) }));
  };

  const disegna = (t) => {
    const s = (t - t0) / 1000;
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
      const a = .22 + .32 * (.5 + .5 * Math.sin(s * 2 + p.f));
      c.fillStyle = `rgba(170, 122, 55, ${a})`;
      c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.28); c.fill();
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
