// I servizi nell'hero della home (Home.astro): le stesse anteprime animate delle pagine servizio (Anteprima.astro).
// Girano da sole, una per giro d'animazione; sotto il titolo il nome del servizio si accende insieme e, sotto
// l'anteprima, il nome, una riga e «Scopri» portano alla sua pagina. Toccando un nome si va a quel servizio.
// Ogni anteprima si muove solo quando si vede e riparte dall'inizio quando entra nello schermo.
// Toccando l'anteprima si apre in grande in una finestra, con il servizio spiegato e i bottoni; lì il giro si ferma.

const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const riparti = (el) => el.querySelectorAll('.ap *').forEach((e) => e.getAnimations().forEach((a) => { a.cancel(); a.play(); }));
const durata = (el) => (parseFloat(getComputedStyle(el.querySelector('.ap')).getPropertyValue('--ap-ciclo')) || 7) * 1000;

export function serviziVivi() {
  const box = document.querySelector('[data-hero-vetrina]');
  if (!box) return;
  const ap = [...box.querySelectorAll('.sv-ap')], nomi = [...document.querySelectorAll('[data-hc]')];
  const titolo = box.querySelector('[data-hc-titolo]'), testo = box.querySelector('[data-hc-testo]'), link = box.querySelector('[data-hc-link]');
  const num = box.querySelector('[data-hc-num]'), tot = String(ap.length).padStart(2, '0');
  const io = new IntersectionObserver((voci) => voci.forEach((v) => {
    const el = v.target, prima = el.classList.contains('in-vista');
    if (v.isIntersecting && !prima && !fermo) riparti(el);
    el.classList.toggle('in-vista', v.isIntersecting);
  }), { threshold: 0.15 });
  ap.forEach((el) => io.observe(el));

  let att = 0, inizio = performance.now(), aperto = false;
  const palco = box.querySelector('.hc-palco');
  const dlg = document.querySelector('[data-hc-dialogo]'), dPalco = dlg && dlg.querySelector('[data-hc-d-palco]');
  const q = (s) => dlg.querySelector(s);
  // l'anteprima accesa va nella finestra grande quando è aperta, e torna al suo posto quando si chiude
  const posa = () => ap.forEach((el, j) => {
    const dove = aperto && j === att ? dPalco : palco;
    if (el.parentNode !== dove) dove.prepend(el);
  });
  const mostra = (i) => {
    att = i; inizio = performance.now();
    ap.forEach((el, j) => { el.hidden = j !== i; });
    if (dlg) posa();
    if (!fermo) riparti(ap[i]);
    nomi.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', String(j === i)); });
    const b = nomi[i];
    if (b) { titolo.textContent = b.dataset.titolo; testo.textContent = b.dataset.testo; link.href = b.dataset.link; }
    num.textContent = `${String(i + 1).padStart(2, '0')} / ${tot}`;
    if (dlg && b) {
      q('[data-hc-d-num]').textContent = num.textContent;
      dlg.querySelectorAll('[data-hc-d-vai]').forEach((t, j) => { t.classList.toggle('on', j === i); t.setAttribute('aria-pressed', String(j === i)); });
      q('[data-hc-d-titolo]').textContent = b.dataset.titolo;
      q('[data-hc-d-testo]').textContent = b.dataset.semplice;
      q('[data-hc-d-link]').href = b.dataset.link;
      const prev = q('[data-hc-d-prev]'); prev.href = `${prev.href.split('?')[0]}?s=${b.dataset.id}`;
    }
  };
  // chi tocca una linguetta o una freccia ha scelto: il giro si ferma finché il mouse resta sull'anteprima
  const scegli = (i) => { box.classList.add('scelto'); mostra((i + ap.length) % ap.length); };
  nomi.forEach((b, i) => b.addEventListener('click', () => scegli(i)));
  box.querySelector('[data-hc-prec]').addEventListener('click', () => scegli(att - 1));
  box.querySelector('[data-hc-succ]').addEventListener('click', () => scegli(att + 1));
  if (dlg) {
    box.querySelector('[data-hc-apri]').addEventListener('click', () => {
      aperto = true; box.classList.add('scelto'); mostra(att); dlg.showModal();
      window.gdLenis?.stop(); document.documentElement.classList.add('hc-aperto');
    });
    dlg.addEventListener('close', () => {
      aperto = false; posa(); if (!fermo) riparti(ap[att]); inizio = performance.now();
      window.gdLenis?.start(); document.documentElement.classList.remove('hc-aperto');
    });
    q('[data-hc-chiudi]').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll('[data-hc-d-vai]').forEach((t) => t.addEventListener('click', () => mostra(+t.dataset.hcDVai)));
    q('[data-hc-d-prec]').addEventListener('click', () => mostra((att - 1 + ap.length) % ap.length));
    q('[data-hc-d-succ]').addEventListener('click', () => mostra((att + 1) % ap.length));
  }
  let sopra = false;
  box.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') sopra = true; });
  box.addEventListener('pointerleave', () => { sopra = false; });
  if (fermo) return;
  const giro = (now) => {
    const el = ap[att];
    if (!el.classList.contains('in-vista') || document.hidden || sopra || aperto) inizio = now - Math.min(now - inizio, durata(el) * .98);
    else if (now - inizio >= durata(el)) mostra((att + 1) % ap.length);
    // la riga rossa sotto la linguetta accesa: quanto manca al prossimo servizio
    const p = Math.min(1, (now - inizio) / durata(el));
    nomi.forEach((b, j) => b.style.setProperty('--avanza', j === att ? p.toFixed(3) : 0));
    requestAnimationFrame(giro);
  };
  requestAnimationFrame(giro);
}
