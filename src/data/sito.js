// Dati di contatto e contenuti condivisi. Quelli segnati "da confermare" sono in DA-CONFERMARE.md.
export const contatti = {
  nome: 'Gabriele Desideri',
  studio: 'Desideri & Code', // il nome commerciale: in fattura «Desideri & Code di Gabriele Desideri»
  ruolo: 'Siti web · AI · Gestionali · Pubblicità online',
  email: 'desiderigabriele@gmail.com',
  telefono: '+39 338 342 4098',
  whatsapp: '393383424098',
  linkedin: 'https://www.linkedin.com/in/gabrieledesideri',
  citta: 'Milano',
  zona: 'Milano, Italia e Svizzera',
  piva: '', // da confermare
};

// I sei servizi, con parole semplici. "da" = prezzo d'ingresso del listino (docs/01).
export const servizi = [
  {
    id: 'sito',
    numero: '01',
    titolo: 'Siti web',
    semplice: 'La tua casa online. Ti trovano su Google, capiscono subito cosa fai e ti scrivono.',
    esempio: 'Le richieste arrivano sul telefono in tempo reale, già ordinate in un foglio.',
    da: 1500,
    icona: 'finestra',
  },
  {
    id: 'ecommerce',
    numero: '02',
    titolo: 'Negozi online',
    semplice: 'Vendi i tuoi prodotti 24 ore su 24, anche mentre dormi.',
    esempio: 'Schede prodotto scritte per vendere ed email automatiche per chi lascia il carrello.',
    da: 3900,
    icona: 'borsa',
  },
  {
    id: 'software',
    numero: '03',
    titolo: 'Automazioni e AI',
    semplice: 'Il lavoro ripetitivo si fa da solo: l\'AI risponde, smista e prepara al posto tuo.',
    esempio: 'Un messaggio WhatsApp che si segna da solo in agenda, un preventivo preparato da una foto.',
    da: 1200,
    icona: 'chip',
  },
  {
    id: 'gestionale',
    numero: '04',
    titolo: 'Gestionale su misura',
    semplice: 'Il programma della tua azienda, fatto come lavori tu. Con l\'AI dentro, se vuoi.',
    esempio: 'Dal preventivo alla fattura senza fogli Excel, e l\'AI che prepara i documenti quando la vuoi.',
    da: 4900,
    icona: 'gestionale',
  },
  {
    id: 'ads',
    numero: '05',
    titolo: 'Pubblicità online',
    semplice: 'Annunci su Instagram, Facebook, Google e TikTok che portano clienti, non solo "mi piace".',
    esempio: 'Ogni mese sai quanto hai speso, quante richieste sono arrivate e quanto ti è costata ognuna.',
    da: 590,
    mese: true,
    icona: 'onda',
  },
  {
    id: 'cura',
    numero: '06',
    titolo: 'Cura e crescita',
    semplice: 'Il sito sempre aggiornato, sicuro e ogni mese un po\' più efficace.',
    esempio: 'Backup, controlli di sicurezza, piccole modifiche e un report chiaro.',
    da: 59,
    mese: true,
    icona: 'scudo',
  },
];

// Il metodo: i 5 passi dal primo sguardo al sì. "forma" = forma delle particelle (scena.js).
export const metodo = [
  {
    forma: 0,
    passo: 'Sguardo',
    titolo: 'Prima ti devono notare.',
    testa: '«Cos\'è questo?» In meno di un secondo il cervello decide se restare o andare via.',
    tecnica: 'Effetto Von Restorff',
    spiega: 'Ricordiamo ciò che è diverso. Per questo ogni progetto ha un elemento che non si dimentica: un colore, un movimento, una frase.',
  },
  {
    forma: 1,
    passo: 'Interesse',
    titolo: 'Poi ti devono capire.',
    testa: '«Fa al caso mio?» Se per capirlo serve fatica, la persona se ne va.',
    tecnica: 'Fluidità cognitiva',
    spiega: 'Ciò che si capisce facilmente sembra anche più vero e più affidabile. Frasi corte, una sola idea alla volta, niente paroloni.',
  },
  {
    forma: 2,
    passo: 'Fiducia',
    titolo: 'Poi si devono fidare.',
    testa: '«Posso fidarmi?» Guardiamo cosa hanno fatto gli altri prima di decidere.',
    tecnica: 'Riprova sociale e autorità',
    spiega: 'Recensioni vere, lavori veri, numeri veri, messi proprio dove la persona sta decidendo.',
  },
  {
    forma: 3,
    passo: 'Desiderio',
    titolo: 'Poi ti devono volere.',
    testa: '«Lo voglio.» Si decide con l\'emozione e si giustifica con la ragione.',
    tecnica: 'Ancoraggio e immaginazione del risultato',
    spiega: 'Mostriamo il risultato prima del prezzo e il prezzo nel contesto giusto. Chi immagina di avere già il risultato lo desidera di più.',
  },
  {
    forma: 4,
    passo: 'Azione',
    titolo: 'E infine ti scelgono.',
    testa: '«Ok, ti scrivo.» Il passo deve essere facile, chiaro e senza rischi.',
    tecnica: 'Riduzione dell\'attrito',
    spiega: 'Un bottone che si vede, un modulo a passi con la prima domanda facilissima e una garanzia accanto. Il «sì» diventa naturale.',
  },
];

// Casi studio. Le recensioni arriveranno dai clienti: finché non ci sono, non si inventano.
export const lavori = [
  {
    id: 'lorenzo',
    cliente: 'Dott. Lorenzo Baldassarri',
    settore: 'Psicologo e psicoterapeuta · Montecatini Terme e online',
    pacchetto: 'Progetto Signature',
    url: 'https://www.lorenzobaldassarri.it',
    img: '/img/lavoro-lorenzo.webp',
    sfida: 'Un professionista con una carriera straordinaria, dalla Formula 1 allo sport di alto livello, che online sembrava uno psicologo come tanti.',
    fatto: [
      'Strategia e posizionamento: cinque "porte" per cinque tipi di persone',
      'Identità visiva, logo e monogramma',
      'Scena 3D a particelle che racconta il metodo',
      'Guida interattiva e chat che porta a WhatsApp',
    ],
    tag: ['Astro', 'three.js', 'GSAP', 'Copy', 'Brand'],
    recensione: null,
  },
  {
    id: 'montini',
    cliente: 'Montini Luigino',
    settore: 'Idraulico · Sesto San Giovanni e Nord Milano',
    pacchetto: 'Progetto Presenza',
    url: 'https://luigi-idraulico.it',
    img: '/img/lavoro-montini.webp',
    sfida: '40 anni di esperienza e clienti contentissimi, ma le richieste arrivavano solo col passaparola.',
    fatto: [
      'Sito veloce pensato per chi ha un guasto e cerca dal telefono',
      'Richieste che arrivano su Google Fogli e Telegram in tempo reale',
      'Chiama, WhatsApp e preventivo sempre a portata di pollice',
      'SEO locale sulle zone servite',
    ],
    tag: ['Lead generation', 'SEO locale', 'Automazione', 'Copy'],
    recensione: null,
  },
];

export const faq = [
  {
    d: 'Quanto tempo serve per avere il sito?',
    r: 'Una landing page è pronta in 7-10 giorni. Un sito su misura in 3-5 settimane. Un sito immersivo con il 3D in 6-8 settimane. Il calendario preciso lo trovi nel preventivo.',
  },
  {
    d: 'Devo pagare tutto subito?',
    r: 'No. Metà alla firma e metà quando il sito va online. Per i progetti più grandi si divide in tre parti. Se ti serve, possiamo fare anche delle rate.',
  },
  {
    d: 'Il sito sarà mio?',
    r: 'Sì, al 100%. Una volta saldato, codice, dominio e contenuti sono tuoi. Niente vincoli, niente ostaggi.',
  },
  {
    d: 'Cosa vuol dire in pratica "software con intelligenza artificiale"?',
    r: 'Vuol dire togliere alle persone il lavoro noioso e ripetitivo. Esempio: un cliente ti manda una mail con una richiesta e il software ti prepara il preventivo da controllare. Tu approvi con un clic. Il software te lo consegniamo pronto, resta tuo e i dati restano tuoi. Partiamo sempre da un\'analisi: se l\'AI non ti fa risparmiare tempo o soldi, te lo diciamo.',
  },
  {
    d: 'Usate l\'AI per fare i siti? Allora sono tutti uguali?',
    r: 'Usiamo Claude e ChatGPT come un artigiano usa gli attrezzi migliori: per lavorare più veloce e con più precisione. Strategia, design, testi e scelte sono nostri e sono su misura per te. Il risultato è unico, e arriva prima.',
  },
  {
    d: 'Esistono contributi per pagare meno?',
    r: 'In Lombardia c\'è il Voucher Doppia Transizione della Camera di Commercio: copre fino al 50% della spesa (massimo 10.000 €) per progetti con intelligenza artificiale da almeno 4.000 €. Lo sportello apre e chiude in fretta: prima di contarci verifichiamo insieme che sia ancora disponibile.',
  },
  {
    d: 'Lavorate solo a Milano?',
    r: 'Lo studio è a Milano, ma lavoriamo con clienti in tutta Italia e in Svizzera, Ticino compreso. Le videochiamate sono sempre incluse e a Milano città ci vediamo di persona gratis. Fuori Milano un incontro costa 190 € entro 100 km (per esempio Como, Bergamo o Lugano) e 490 € oltre. I prezzi sono uguali per tutti: chi è in Svizzera può vederli anche in franchi nel preventivo.',
  },
];
