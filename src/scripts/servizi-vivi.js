// I servizi nell'hero della home (Home.astro): le stesse anteprime animate delle pagine servizio (Anteprima.astro).
// Girano da sole, una per giro d'animazione; sotto il titolo il nome del servizio si accende insieme e, sotto
// l'anteprima, il nome, una riga e «Scopri» portano alla sua pagina. Toccando un nome si va a quel servizio.
// Ogni anteprima si muove solo quando si vede e riparte dall'inizio quando entra nello schermo.

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

  let att = 0, inizio = performance.now();
  const mostra = (i) => {
    att = i; inizio = performance.now();
    ap.forEach((el, j) => { el.hidden = j !== i; });
    if (!fermo) riparti(ap[i]);
    nomi.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', String(j === i)); });
    const b = nomi[i];
    if (b) { titolo.textContent = b.dataset.titolo; testo.textContent = b.dataset.testo; link.href = b.dataset.link; }
    num.textContent = `${String(i + 1).padStart(2, '0')} / ${tot}`;
  };
  // chi tocca una linguetta o una freccia ha scelto: il giro si ferma finché il mouse resta sull'anteprima
  const scegli = (i) => { box.classList.add('scelto'); mostra((i + ap.length) % ap.length); };
  nomi.forEach((b, i) => b.addEventListener('click', () => scegli(i)));
  box.querySelector('[data-hc-prec]').addEventListener('click', () => scegli(att - 1));
  box.querySelector('[data-hc-succ]').addEventListener('click', () => scegli(att + 1));
  let sopra = false;
  box.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') sopra = true; });
  box.addEventListener('pointerleave', () => { sopra = false; });
  if (fermo) return;
  const giro = (now) => {
    const el = ap[att];
    if (!el.classList.contains('in-vista') || document.hidden || sopra) inizio = now - Math.min(now - inizio, durata(el) * .98);
    else if (now - inizio >= durata(el)) mostra((att + 1) % ap.length);
    // la riga rossa sotto la linguetta accesa: quanto manca al prossimo servizio
    const p = Math.min(1, (now - inizio) / durata(el));
    nomi.forEach((b, j) => b.style.setProperty('--avanza', j === att ? p.toFixed(3) : 0));
    requestAnimationFrame(giro);
  };
  requestAnimationFrame(giro);
}
