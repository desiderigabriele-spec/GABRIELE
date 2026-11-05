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
  };
  nomi.forEach((b, i) => b.addEventListener('click', () => mostra(i)));
  if (fermo) return;
  const giro = (now) => {
    const el = ap[att];
    if (!el.classList.contains('in-vista') || document.hidden) inizio = now - Math.min(now - inizio, 1000);
    else if (now - inizio >= durata(el)) mostra((att + 1) % ap.length);
    requestAnimationFrame(giro);
  };
  requestAnimationFrame(giro);
}
