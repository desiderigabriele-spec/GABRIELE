// I servizi in home (Home.astro, [data-servizi-vivi]): le stesse anteprime animate delle pagine servizio (Anteprima.astro).
// Computer: l'indice a sinistra e l'anteprima a destra; le voci si alternano da sole, a ogni giro dell'animazione,
// finché non ci passi sopra. Telefono: i nomi in alto come bottoni e le schede da scorrere, che partono da Siti web.
// Ogni anteprima si muove solo quando si vede e riparte dall'inizio quando entra nello schermo.

const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const riparti = (el) => el.querySelectorAll('.ap *').forEach((e) => e.getAnimations().forEach((a) => { a.cancel(); a.play(); }));
const durata = (el) => (parseFloat(getComputedStyle(el.querySelector('.ap')).getPropertyValue('--ap-ciclo')) || 7) * 1000;

export function serviziVivi() {
  const box = document.querySelector('[data-servizi-vivi]');
  if (!box) return;

  const io = new IntersectionObserver((voci) => voci.forEach((v) => {
    const el = v.target, prima = el.classList.contains('in-vista');
    if (v.isIntersecting && !prima && !fermo) riparti(el);
    el.classList.toggle('in-vista', v.isIntersecting);
  }), { threshold: 0.15 });
  box.querySelectorAll('.sv-ap').forEach((el) => io.observe(el));

  // computer: indice + anteprima
  const voci = [...box.querySelectorAll('.sv-voce')];
  const ap = [...box.querySelectorAll('.sv-palco .sv-ap')];
  const titolo = box.querySelector('[data-sv-titolo]'), testo = box.querySelector('[data-sv-testo]'), scopri = box.querySelector('[data-sv-scopri]');
  let att = 0, inizio = performance.now(), fermoQui = false;
  const mostra = (i) => {
    att = i; inizio = performance.now();
    ap.forEach((el, j) => { el.hidden = j !== i; });
    if (!fermo) riparti(ap[i]);
    voci.forEach((v, j) => v.classList.toggle('attiva', j === i));
    titolo.textContent = voci[i].dataset.titolo; testo.textContent = voci[i].dataset.testo; scopri.href = voci[i].href;
  };
  voci.forEach((v, i) => {
    const su = () => { fermoQui = true; if (i !== att) mostra(i); };
    v.addEventListener('mouseenter', su); v.addEventListener('focus', su);
  });
  box.querySelector('.sv-lista').addEventListener('mouseleave', () => { fermoQui = false; inizio = performance.now(); });
  mostra(0);
  // la riga rossa sotto il nome: quanto manca al prossimo servizio
  const avanza = (now) => {
    const corrente = ap[att], vivo = !fermo && !fermoQui && corrente.classList.contains('in-vista');
    const p = vivo ? Math.min(1, (now - inizio) / durata(corrente)) : 0;
    if (!vivo) inizio = now;
    voci.forEach((v, j) => v.style.setProperty('--avanza', j === att ? p.toFixed(3) : 0));
    if (p >= 1) mostra((att + 1) % ap.length);
    requestAnimationFrame(avanza);
  };
  if (!fermo) requestAnimationFrame(avanza);

  // telefono: nomi sopra + schede da scorrere
  const fila = box.querySelector('[data-sv-fila]'), chips = [...box.querySelectorAll('.sv-chip')];
  const conta = box.querySelector('[data-sv-conta]'), linea = box.querySelector('[data-sv-linea]');
  const schede = [...fila.children];
  // la distanza tra due schede (0 quando la fila è nascosta, sul computer)
  const passo = () => (schede[1] ? schede[1].offsetLeft - schede[0].offsetLeft : 0) || 1;
  let ult = -1;
  const segna = () => {
    const i = Math.max(0, Math.min(schede.length - 1, Math.round(fila.scrollLeft / passo())));
    if (i === ult) return; ult = i;
    chips.forEach((c, j) => { c.classList.toggle('attiva', j === i); c.setAttribute('aria-pressed', String(j === i)); });
    const c = chips[i], riga = c.parentElement;
    riga.scrollTo({ left: c.offsetLeft - riga.offsetLeft - 16, behavior: fermo ? 'auto' : 'smooth' });
    conta.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> / ${String(schede.length).padStart(2, '0')}`;
    linea.style.setProperty('--i', i);
  };
  fila.addEventListener('scroll', () => { segna(); if (fila.scrollLeft > 8) box.classList.add('sv-toccato'); }, { passive: true });
  chips.forEach((c, i) => c.addEventListener('click', () => { box.classList.add('sv-toccato'); fila.scrollTo({ left: i * passo(), behavior: fermo ? 'auto' : 'smooth' }); }));
  segna();
}
