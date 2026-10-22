// Il motore delle animazioni d'ingresso: scrive lo stile a ogni fotogramma, con le stesse curve
// e gli stessi tempi di prima (erano di GSAP), così le transizioni CSS delle card lavorano come sempre.
export const espoOut = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
export const cubicaOut = (p) => 1 - Math.pow(1 - p, 3);

// muove da 0 a 1 in «durata» secondi dopo «ritardo» secondi; passo(k) a ogni fotogramma, fine() alla fine
export function anima({ durata, ritardo = 0, curva = espoOut, passo, fine }) {
  let t0 = -1, id = 0;
  const giro = (ora) => {
    if (t0 < 0) t0 = ora + ritardo * 1000;
    const p = (ora - t0) / (durata * 1000);
    if (p >= 0) passo(curva(Math.min(1, p)), p >= 1);
    if (p < 1) id = requestAnimationFrame(giro); else fine?.();
  };
  id = requestAnimationFrame(giro);
  return () => cancelAnimationFrame(id);
}

// parte una volta sola, quando l'elemento arriva a «linea» (0,88 = all'88% dell'altezza dello schermo);
// se è già più su (pagina aperta a metà) parte subito
export function quandoArriva(el, linea, fai) {
  if (!('IntersectionObserver' in window)) { fai(); return; }
  const io = new IntersectionObserver(([v]) => {
    if (!v.isIntersecting && v.boundingClientRect.top > 0) return;
    io.disconnect();
    fai();
  }, { rootMargin: `0px 0px ${-Math.round((1 - linea) * 100)}% 0px` });
  io.observe(el);
}
