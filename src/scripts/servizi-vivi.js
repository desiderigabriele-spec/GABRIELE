// I servizi in home, con un piccolo film per ognuno (Home.astro, [data-servizi-vivi]).
// Computer: l'indice a sinistra e l'anteprima a destra; le voci si alternano da sole finché non ci passi sopra.
// Telefono: i nomi in alto come bottoni e le schede da scorrere, che partono da Siti web.
// Ogni film è disegnato in em su un palco di 32×20: draw(t) mette tutto al suo posto al secondo t.
// I film girano solo quando sono in vista; con «riduci movimento» resta il fotogramma finale.

const F = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const eo = (x) => 1 - Math.pow(1 - x, 3);
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = (x) => (x <= 0 ? 0 : 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2));
const L = (a, b, x) => a + (b - a) * x;
const A = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;

function S(e, o) {
  if (!e) return;
  let tr = '';
  if (o.x != null || o.y != null) tr += `translate(${(o.x || 0).toFixed(3)}em,${(o.y || 0).toFixed(3)}em) `;
  if (o.s != null) tr += `scale(${o.s.toFixed(3)}) `;
  if (tr) e.style.transform = tr;
  if (o.o != null) e.style.opacity = Math.max(0, Math.min(1, o.o)).toFixed(3);
  if (o.w != null) e.style.width = o.w.toFixed(3) + 'em';
  if (o.clip != null) e.style.clipPath = `inset(0 ${o.clip.toFixed(2)}% 0 0)`;
  if (o.txt != null && e.textContent !== String(o.txt)) e.textContent = o.txt;
}
// centro di un elemento nel palco, in em
function centro(el, st) {
  const r = el.getBoundingClientRect(), s = st.getBoundingClientRect(), fs = parseFloat(st.style.fontSize) || 10;
  return { x: (r.left + r.width / 2 - s.left) / fs, y: (r.top + r.height / 2 - s.top) / fs };
}
function cursore(c, da, a, t, t0, t1, click) {
  const m = eio(F(t, t0, t1)), p = F(t, click, click + 0.3);
  S(c, { x: L(da.x, a.x, m), y: L(da.y, a.y, m), s: 1 - 0.2 * Math.sin(Math.PI * p), o: F(t, t0 - 0.4, t0) });
}
const onda = (e, t, a, b) => { const r = F(t, a, b); S(e, { s: 0.3 + 2.3 * eo(r), o: r > 0 && r < 1 ? 1 - r : 0 }); };

const CUR = '<div class="sv-cur" data-k="cur"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 1.5 18.5 11l-6.8 1.6 3.6 7.5-3 1.4-3.5-7.6L3 18.6z" fill="#fff" stroke="#0a0a0a" stroke-width="1.3" stroke-linejoin="round"/></svg></div>';
const SP = '<span class="sv-sp"></span>';
const barra = (testo) => `<div class="sv-bar"><b></b><b></b><b></b>${testo ? `<span>${testo}</span>` : ''}</div>`;
const nt = (k, st, small, testo) => `<div class="sv-nt" data-k="${k}" style="${st}"><small>${small}</small><span>${testo}</span></div>`;

// i sei film scelti: Siti web 1, Negozi online 2, Automazioni 1, Gestionale 1, Pubblicità 1, Cura 1
const FILM = {
  // il sito si disegna, il cursore preme «Prenota» e arriva la prima richiesta
  sito: (T) => ({
    L: 7,
    html: `<div class="sv-fin" style="left:2em;top:1.5em;width:24.5em;height:16.6em">${barra(T('iltuosito.it', 'yoursite.com'))}<div style="position:absolute;left:1.4em;right:1.4em;top:2.7em">
      <div data-k="cap" class="sv-lab sv-lab-chiara"><i class="sv-q"></i>${T('01 · Benvenuti', '01 · Welcome')}</div>
      <div data-k="h" class="sv-tit" style="font-size:2.05em;margin-top:.35em">${T('Il tuo lavoro,<br><span>trovato su Google</span>', 'Your business,<br><span>found on Google</span>')}</div>
      <div data-k="r1" class="sv-rg" style="margin-top:.8em;width:0"></div><div data-k="r2" class="sv-rg" style="margin-top:.45em;width:0"></div>
      <div style="margin-top:.85em"><span data-k="btn" class="sv-btn">${T('Prenota ora →', 'Book now →')}<span class="sv-onda" data-k="rip"></span></span></div>
      <div style="display:flex;gap:.6em;margin-top:.9em">${'<div data-k="c" class="sv-mini"><i></i><i class="sv-rg"></i></div>'.repeat(3)}</div></div></div>`
      + nt('nt', 'right:1em;bottom:1.3em;width:12.4em', T('Nuova richiesta · adesso', 'New enquiry · now'), SP + T('Marco R. ti ha scritto', 'Mark R. wrote to you')) + CUR,
    draw(t, k, st) {
      S(k.cap, { o: F(t, 0.2, 0.6) }); S(k.r1, { w: 13.5 * eo(F(t, 0.3, 1)) }); S(k.r2, { w: 9 * eo(F(t, 0.45, 1.15)) });
      S(k.h, { clip: 100 - 100 * eio(F(t, 0.9, 2)) });
      S(k.btn, { s: back(F(t, 2, 2.45)), o: F(t, 2, 2.1) });
      A(k.c).forEach((c, i) => { const p = eo(F(t, 2.4 + i * 0.15, 2.9 + i * 0.15)); S(c, { o: p, y: (1 - p) * 0.8 }); });
      const b = centro(k.btn, st); cursore(k.cur, { x: 29, y: 18 }, { x: b.x - 0.3, y: b.y - 0.2 }, t, 3, 4.1, 4.2);
      onda(k.rip, t, 4.3, 5.1);
      const n = eo(F(t, 4.8, 5.4)); S(k.nt, { x: (1 - n) * 6, o: n });
    },
  }),

  // l'orologio corre dalle 23 alle 7 e gli ordini arrivano da soli
  ecommerce: (T) => ({
    L: 7.5,
    html: `<div data-k="alba" class="sv-alba"></div><div data-k="luna" class="sv-luna" style="left:3.2em;top:3em"></div>
      <div style="left:3em;top:7.2em"><b data-k="ora" class="sv-ora">23:00</b></div>
      <div style="left:3.2em;top:13.4em;display:grid;gap:.9em"><span class="sv-lab sv-lab-chiara">${T('Il tuo negozio è aperto', 'Your store is open')}</span><span data-k="cont" class="sv-lab sv-lab-verde"></span></div>
      ${[['01:12', '1043'], ['02:47', '1044'], ['04:05', '1045'], ['06:31', '1046']].map(([h, n], i) => nt('o', `left:16.6em;top:${1.4 + i * 4.4}em;width:14em;white-space:nowrap`, `${T('Nuovo ordine', 'New order')} · ${h}`, SP + T(`Ordine n. ${n} · pagato`, `Order #${n} · paid`))).join('')}`,
    draw(t, k) {
      const m = 23 * 60 + 8 * 60 * eio(F(t, 0.3, 5.6)), hh = Math.floor(m / 60) % 24, mm = Math.floor(m % 60);
      S(k.ora, { txt: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}` });
      const tempi = [1.2, 2.3, 3.4, 4.6]; let n = 0;
      A(k.o).forEach((o, i) => { const p = eo(F(t, tempi[i], tempi[i] + 0.45)); if (t > tempi[i]) n++; S(o, { o: p, x: (1 - p) * 3, s: 0.96 + 0.04 * p }); });
      S(k.cont, { txt: `${T('Ordini stanotte', 'Orders tonight')} · ${n}` });
      S(k.alba, { o: F(t, 5, 6.2) }); S(k.luna, { o: 1 - F(t, 5.2, 6.2), y: F(t, 5, 6.4) * 1.5 });
    },
  }),

  // arriva il messaggio, l'AI risponde e l'appuntamento si segna da solo in agenda
  software: (T) => ({
    L: 7.5,
    html: `<div class="sv-telefono" style="left:1.8em;top:.9em;width:11.2em;height:18.2em"><div class="sv-chat-testa"><i></i><b>Laura B.</b></div>
        <div style="position:absolute;left:.6em;right:.6em;top:4.6em;display:grid;gap:.5em">
          <div data-k="b1" class="sv-bolla">${T('Ciao! Posso venire giovedì alle 18?', 'Hi! Can I come on Thursday at 6pm?')}</div>
          <div data-k="dots" class="sv-bolla sv-mia sv-dots"><i></i><i></i><i></i></div>
          <div data-k="b2" class="sv-bolla sv-mia"><span class="sv-lab sv-lab-verde" style="display:block;font-size:.7em;margin-bottom:.2em">${T('Risposta automatica', 'Automatic reply')}</span>${T('Certo, giovedì alle 18 è libero. Ti segno?', 'Sure, Thursday 6pm is free. Shall I book you in?')}</div>
          <div data-k="b3" class="sv-bolla">${T('Sì, grazie!', 'Yes, thanks!')}</div></div></div>
      <div class="sv-fin" style="left:15.6em;top:2em;width:14.8em;height:14.6em">${barra(T('agenda · settimana', 'calendar · this week'))}
        <div class="sv-agenda"><span></span>${(T('Lun Mar Mer Gio Ven', 'Mon Tue Wed Thu Fri')).split(' ').map((d) => `<span class="sv-lab">${d}</span>`).join('')}
          ${['9', '11', '14', '16', '18'].map((h, r) => `<span class="sv-lab">${h}</span>` + [0, 1, 2, 3, 4].map((c) => (r === 4 && c === 3 ? '<span data-k="slot" class="sv-slot"></span>' : `<span class="${(r * 5 + c) % 3 === 0 ? 'pieno' : ''}"></span>`)).join('')).join('')}</div></div>
      <svg style="left:0;top:0;width:32em;height:20em;overflow:visible" viewBox="0 0 320 200" aria-hidden="true"><path data-k="linea" d="M120 128 C 160 128, 190 175, 252 162" fill="none" stroke="#e30613" stroke-width="1.6" stroke-dasharray="200" stroke-dashoffset="200"/></svg>`
      + nt('rem', 'left:16.2em;top:17.1em;width:14em', T('Promemoria', 'Reminder'), SP + T('Inviato a Laura mercoledì', 'Sent to Laura on Wednesday')),
    draw(t, k) {
      const ap = (e, a) => { const p = eo(F(t, a, a + 0.4)); S(e, { o: p, y: (1 - p) * 0.8 }); };
      ap(k.b1, 0.3);
      k.dots.style.display = t > 1 && t < 1.9 ? 'flex' : 'none';
      [...k.dots.children].forEach((d, i) => S(d, { y: Math.sin(t * 12 - i) * 0.12 }));
      k.b2.style.display = t >= 1.9 ? 'block' : 'none'; k.b3.style.display = t >= 2.9 ? 'block' : 'none';
      ap(k.b2, 1.9); ap(k.b3, 2.9);
      k.linea.setAttribute('stroke-dashoffset', (200 * (1 - eio(F(t, 3.3, 4.1)))).toFixed(1));
      const s1 = F(t, 4, 4.3), s2 = F(t, 4.5, 4.8);
      k.slot.style.borderColor = s2 > 0 ? 'transparent' : s1 > 0 ? `rgba(227,6,19,${0.5 + 0.5 * Math.sin(t * 14)})` : '';
      k.slot.style.background = s2 > 0 ? `rgba(16,185,129,${0.85 * s2})` : '';
      S(k.slot, { txt: s2 > 0 ? 'Laura B.' : '', s: s2 > 0 ? back(s2) * 0.1 + 0.9 : 1 });
      const r = eo(F(t, 5.1, 5.6)); S(k.rem, { o: r, y: (1 - r) * 1.5 });
    },
  }),

  // i numeri contano da soli, le barre crescono e una nuova pratica entra in lista
  gestionale: (T) => ({
    L: 7,
    html: `<div class="sv-fin" style="left:1.4em;top:1.2em;width:29.2em;height:17.6em">${barra(T('gestionale · studio bianchi', 'your software · bianchi studio'))}<div class="sv-gest">
        <div class="sv-gest-lato"><i></i>${T('Clienti Preventivi Ordini Fatture', 'Clients Quotes Orders Invoices').split(' ').map((n, i) => `<span class="${i === 1 ? 'on' : ''}">${n}</span>`).join('')}</div>
        <div class="sv-gest-dati">
          <div class="sv-kpi">${T('Preventivi Accettati Fatture', 'Quotes Accepted Invoices').split(' ').map((n) => `<div><span class="sv-lab">${n}</span><b data-k="num">0</b></div>`).join('')}</div>
          <div class="sv-barre">${[40, 55, 46, 68, 60, 84, 100].map((h, i) => `<i data-k="bar" data-h="${h}" class="${i === 6 ? 'r' : ''}"></i>`).join('')}</div>
          <div class="sv-righe">
            <div data-k="nuova" class="sv-riga sv-riga-nuova"><span>${T('Preventivo n. 25 · Studio Bianchi', 'Quote #25 · Bianchi Studio')}</span><b>${T('Accettato', 'Accepted')}</b></div>
            ${T('n. 24 · Ferri Costruzioni|n. 23 · Bar Centrale|n. 22 · Dott.ssa Neri', '#24 · Ferri Builders|#23 · Central Bar|#22 · Dr Neri').split('|').map((n) => `<div class="sv-riga"><span>${T('Preventivo', 'Quote')} ${n}</span><span>${T('Inviato', 'Sent')}</span></div>`).join('')}</div></div></div></div>`,
    draw(t, k) {
      const fine = [24, 17, 12], c = eo(F(t, 0.4, 2)), dopo = t > 3.3 ? 1 : 0;
      A(k.num).forEach((n, i) => S(n, { txt: Math.round(fine[i] * c) + (i < 2 ? dopo : 0) }));
      S(A(k.num)[1], { s: 1 + 0.2 * Math.sin(Math.PI * F(t, 3.3, 3.7)) });
      A(k.bar).forEach((b, i) => { b.style.height = (+b.dataset.h * eo(F(t, 0.6 + i * 0.12, 1.3 + i * 0.12))).toFixed(1) + '%'; });
      const n = eo(F(t, 3, 3.5)); k.nuova.style.height = (2.2 * n).toFixed(2) + 'em'; S(k.nuova, { o: n });
    },
  }),

  // la linea delle richieste sale, il costo di ogni richiesta scende
  ads: (T) => ({
    L: 7,
    html: `<div class="sv-fin" style="left:1.4em;top:1.2em;width:29.2em;height:17.6em">${barra(T('report · ottobre', 'report · october'))}<div class="sv-report">
        <div><svg viewBox="0 0 200 110" preserveAspectRatio="none" style="width:100%;height:11.6em;overflow:visible" aria-hidden="true">
          ${[20, 45, 70, 95].map((y) => `<line x1="0" x2="200" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.07)"/>`).join('')}
          <path data-k="area" d="M0 92 L28 86 L56 88 L84 70 L112 62 L140 48 L168 30 L200 14 L200 110 L0 110Z" fill="rgba(227,6,19,.14)" opacity="0"/>
          <path data-k="ln" d="M0 92 L28 86 L56 88 L84 70 L112 62 L140 48 L168 30 L200 14" fill="none" stroke="#e30613" stroke-width="2.4" stroke-dasharray="260" stroke-dashoffset="260" vector-effect="non-scaling-stroke"/>
          <circle data-k="dot" cx="200" cy="14" r="4" fill="#e30613" opacity="0"/></svg>
          <div class="sv-assex">${T('1 ott|8|15|22|31', 'Oct 1|8|15|22|31').split('|').map((d) => `<span class="sv-lab">${d}</span>`).join('')}</div></div>
        <div class="sv-kpi sv-kpi-col">
          <div><span class="sv-lab">${T('Richieste', 'Enquiries')}</span><b data-k="req">0</b></div>
          <div><span class="sv-lab">${T('Costo per richiesta', 'Cost per enquiry')}</span><b data-k="cpr" class="verde">↓ 0%</b></div>
          <div><span class="sv-lab">${T('Annunci attivi', 'Live ads')}</span><b class="piccolo">${T('Meta e Google', 'Meta and Google')}</b></div></div></div></div>`,
    draw(t, k) {
      k.ln.setAttribute('stroke-dashoffset', (260 * (1 - eio(F(t, 0.4, 2.8)))).toFixed(1));
      k.area.setAttribute('opacity', F(t, 1.6, 3).toFixed(2));
      k.dot.setAttribute('opacity', t > 2.8 ? 1 : 0); k.dot.setAttribute('r', (4 + 2 * Math.max(0, Math.sin(t * 6))).toFixed(1));
      S(k.req, { txt: Math.round(48 * eo(F(t, 0.6, 3))) }); S(k.cpr, { txt: `↓ ${Math.round(32 * eo(F(t, 1.2, 3.4)))}%` });
    },
  }),

  // il punteggio sale a 98 e i controlli si spuntano uno alla volta
  cura: (T) => ({
    L: 7,
    html: `<div style="left:2.4em;top:3em;width:12em;height:12em"><svg viewBox="0 0 100 100" style="width:100%;height:100%;transform:rotate(-90deg)" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="7"/><circle data-k="ring" cx="50" cy="50" r="42" fill="none" stroke="#10b981" stroke-width="7" stroke-dasharray="264" stroke-dashoffset="264"/></svg>
        <div class="sv-punteggio"><b data-k="num">0</b><span class="sv-lab">${T('Salute del sito', 'Site health')}</span></div></div>
      <div style="left:16.6em;top:3.4em;display:grid;gap:.9em">${T('Aggiornamenti installati|Backup di stanotte|Sicurezza controllata|Velocità 98 su 100|Report del mese inviato', 'Updates installed|Last night’s backup|Security checked|Speed 98 out of 100|Monthly report sent').split('|').map((x) => `<span data-k="ck" class="sv-ck">${SP}${x}</span>`).join('')}</div>
      <div style="left:16.6em;top:15.6em"><span data-k="mese" class="sv-lab sv-lab-chiara">${T('Controllo del mese · fatto', 'Monthly check · done')}</span></div>`,
    draw(t, k) {
      const v = 98 * eio(F(t, 0.4, 2.8)); k.ring.setAttribute('stroke-dashoffset', (264 * (1 - v / 100)).toFixed(1)); S(k.num, { txt: Math.round(v) });
      A(k.ck).forEach((c, i) => { const a = 1 + i * 0.5, p = eo(F(t, a, a + 0.4)); S(c, { o: 0.25 + 0.75 * p }); S(c.firstElementChild, { s: p > 0 ? back(F(t, a, a + 0.35)) : 0.001 }); });
      S(k.mese, { o: F(t, 3.8, 4.3) });
    },
  }),
};

/* ---------- il motore ---------- */
const palchi = new Set();
let giroAttivo = false;
const osserva = new IntersectionObserver((voci) => voci.forEach((v) => {
  const p = v.target._sv; if (!p) return;
  if (v.isIntersecting && !p.vis) p.t0 = performance.now(); // ogni film riparte dall'inizio quando entra nello schermo
  p.vis = v.isIntersecting;
  if (p.vis) avvia();
}), { threshold: 0.05 });
const misura = new ResizeObserver((voci) => voci.forEach((v) => { v.target.style.fontSize = (v.contentRect.width / 32).toFixed(3) + 'px'; }));

function metti(p, id) {
  p.id = id; p.sc = FILM[id](p.T); p.t0 = performance.now(); p.fatto = false;
  p.el.innerHTML = `<div class="sv-in">${p.sc.html}</div>`; p.in = p.el.firstElementChild;
  p.k = {}; p.in.querySelectorAll('[data-k]').forEach((e) => { const n = e.dataset.k; p.k[n] = p.k[n] ? [].concat(p.k[n], e) : e; });
}
function palco(el, id, T) {
  const p = { el, vis: false, T }; el._sv = p; metti(p, id);
  palchi.add(p); osserva.observe(el); misura.observe(el);
  return p;
}
function disegna(p, t) {
  const fine = p.sc.L;
  p.in.style.opacity = fermo ? 1 : Math.min(F(t, 0, 0.3), 1 - F(t, fine - 0.45, fine)).toFixed(3);
  p.sc.draw(t, p.k, p.el);
}
function giro(now) {
  let qualcuno = false;
  palchi.forEach((p) => {
    if (!p.vis) return;
    qualcuno = true;
    if (fermo) { if (!p.fatto) { disegna(p, p.sc.L - 1.4); p.fatto = true; } return; }
    disegna(p, ((now - p.t0) / 1000) % p.sc.L);
  });
  giroAttivo = qualcuno && !fermo;
  if (giroAttivo) requestAnimationFrame(giro);
}
function avvia() { if (fermo) { giro(performance.now()); return; } if (!giroAttivo) { giroAttivo = true; requestAnimationFrame(giro); } }

/* ---------- la sezione ---------- */
export function serviziVivi() {
  const box = document.querySelector('[data-servizi-vivi]');
  if (!box) return;
  const it = (box.dataset.lang || 'it') === 'it';
  const T = (a, b) => (it ? a : b);
  const ids = [...box.querySelectorAll('.sv-voce')].map((v) => v.dataset.id);
  const pc = matchMedia('(min-width: 901px)');

  // computer: indice + anteprima
  const anteprima = box.querySelector('[data-sv-palco]');
  const voci = [...box.querySelectorAll('.sv-voce')];
  const titolo = box.querySelector('[data-sv-titolo]'), testo = box.querySelector('[data-sv-testo]'), scopri = box.querySelector('[data-sv-scopri]');
  let ant = null, att = ids[0], fermoQui = false;
  const mostra = (id) => {
    att = id;
    if (ant) metti(ant, id);
    const v = voci.find((x) => x.dataset.id === id);
    voci.forEach((x) => x.classList.toggle('attiva', x === v));
    titolo.textContent = v.dataset.titolo; testo.textContent = v.dataset.testo; scopri.href = v.href;
  };
  const accendiPc = () => {
    if (ant || !pc.matches) return;
    ant = palco(anteprima, att, T);
    voci.forEach((v) => {
      v.addEventListener('mouseenter', () => { fermoQui = true; if (v.dataset.id !== att) mostra(v.dataset.id); });
      v.addEventListener('focus', () => { fermoQui = true; if (v.dataset.id !== att) mostra(v.dataset.id); });
    });
    box.querySelector('.sv-lista').addEventListener('mouseleave', () => { fermoQui = false; ant.t0 = performance.now(); });
    // la riga rossa sotto il nome: quanto manca al prossimo servizio
    const avanza = (now) => {
      const p = Math.min(1, (now - ant.t0) / (ant.sc.L * 1000));
      voci.forEach((v) => { v.style.setProperty('--avanza', v.dataset.id === att && !fermoQui && !fermo ? p.toFixed(3) : 0); });
      if (!fermoQui && !fermo && ant.vis && p >= 1) mostra(ids[(ids.indexOf(att) + 1) % ids.length]);
      requestAnimationFrame(avanza);
    };
    requestAnimationFrame(avanza);
  };
  mostra(att);

  // telefono: nomi sopra + schede da scorrere
  const fila = box.querySelector('[data-sv-fila]'), chips = [...box.querySelectorAll('.sv-chip')];
  const conta = box.querySelector('[data-sv-conta]'), linea = box.querySelector('[data-sv-linea]');
  let accesoTel = false;
  const accendiTel = () => {
    if (accesoTel || pc.matches) return; accesoTel = true;
    fila.querySelectorAll('[data-sv-scena]').forEach((el) => palco(el, el.dataset.svScena, T));
    const schede = [...fila.children];
    const passo = () => (schede[1] ? schede[1].offsetLeft - schede[0].offsetLeft : 1);
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
  };

  accendiPc(); accendiTel();
  pc.addEventListener('change', () => { accendiPc(); accendiTel(); });
}
