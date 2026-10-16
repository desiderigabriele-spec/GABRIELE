// Listino del preventivo automatico. Prezzi IVA esclusa, allineati a docs/01-ricerca-mercato-prezzi.md.
// "una" = una tantum, "mese" = canone mensile. Gli extra con "max" si aggiungono con + / −.

export const categorie = [
  {
    id: 'sito',
    nome: 'Sito web',
    riga: 'Ti trovano, ti capiscono, ti scrivono.',
    livelli: [
      { id: 'impulso', nome: 'Impulso', una: 1500, spiega: 'Una sola pagina pensata per un obiettivo: farti arrivare richieste. Ideale per una promozione o per partire.', include: ['1 pagina', 'Testi che convincono', 'Modulo collegato al tuo telefono', 'Pronta in 7-10 giorni'] },
      { id: 'presenza', nome: 'Presenza', una: 2900, top: true, spiega: 'Il sito completo della tua attività, disegnato su misura. È quello che sceglie la maggior parte delle persone.', include: ['5-7 pagine su misura', 'Testi e SEO per farti trovare', 'Richieste su Fogli, Telegram o WhatsApp', 'Google Business Profile'] },
      { id: 'signature', nome: 'Signature', una: 7500, spiega: 'Un sito che non si dimentica: 3D, animazioni firma e un\'identità visiva tutta tua.', include: ['Tutto di Presenza', 'Scena 3D e animazioni firma', 'Identità visiva', 'Strategia scritta'] },
    ],
    extra: [
      { id: 'pagina', nome: 'Pagina in più', una: 290, max: 20, spiega: 'Una pagina aggiuntiva, per esempio un servizio o una zona.' },
      { id: 'lingua', nome: 'Lingua in più', una: 490, max: 5, spiega: 'Tutto il sito tradotto e adattato in un\'altra lingua.' },
      { id: 'seo', nome: 'Testo SEO per una pagina servizio', una: 190, max: 20, spiega: 'Un testo scritto per comparire su Google quando cercano proprio quel servizio.' },
      { id: 'logo', nome: 'Logo e identità visiva', una: 850, spiega: 'Logo, colori e caratteri che ti rendono riconoscibile ovunque.' },
      { id: 'media', nome: 'Foto e video creati con l\'AI', una: 390, spiega: 'Immagini e brevi video originali per il sito, quando non hai materiale tuo.' },
      { id: 'blog', nome: 'Blog o area notizie', una: 690, spiega: 'Una sezione dove pubblichi articoli da solo, senza chiamare nessuno.' },
    ],
  },
  {
    id: 'ecommerce',
    nome: 'Negozio online',
    riga: 'Vendi 24 ore su 24.',
    livelli: [
      { id: 'start', nome: 'Start', una: 3900, spiega: 'Un negozio Shopify bello e pronto a vendere, con fino a 50 prodotti.', include: ['Fino a 50 prodotti', 'Pagamenti e spedizioni', 'Email essenziali', 'Tracciamento delle vendite'] },
      { id: 'growth', nome: 'Growth', una: 7900, top: true, spiega: 'Il negozio disegnato su misura e pensato per far crescere le vendite ogni mese.', include: ['Design su misura', 'Fino a 300 prodotti', 'Schede prodotto che vendono', 'Email automatiche (carrello, benvenuto)'] },
      { id: 'signature', nome: 'Signature', una: 14000, spiega: 'Negozio su misura con esperienze speciali, come il prodotto in 3D o un configuratore.', include: ['Tutto di Growth', 'Prodotto in 3D o configuratore', 'Collegamento al gestionale', 'Massime prestazioni'] },
    ],
    extra: [
      { id: 'prodotti', nome: '+100 prodotti caricati', una: 390, max: 20, spiega: 'Carichiamo noi altri 100 prodotti con foto, testi e varianti.' },
      { id: 'email', nome: 'Flussi email avanzati', una: 690, spiega: 'Email che partono da sole: dopo l\'acquisto, per chi non torna da tempo, per i compleanni.' },
      { id: 'gestionale', nome: 'Collegamento al gestionale', una: 1500, spiega: 'Ordini, magazzino e fatture si aggiornano da soli nel tuo gestionale.' },
      { id: 'lingua', nome: 'Lingua in più', una: 590, max: 5, spiega: 'Il negozio tradotto per vendere anche all\'estero.' },
    ],
    nota: 'Abbonamento Shopify, app e commissioni di pagamento sono a parte e li paghi direttamente a loro.',
  },
  {
    id: 'software',
    nome: 'Software con AI',
    riga: 'In un minuto il lavoro di un\'ora.',
    ai: true,
    livelli: [
      { id: 'assistente', nome: 'Assistente AI', una: 2400, mese: 149, spiega: 'Un assistente che risponde ai clienti sul sito o su WhatsApp, conosce la tua attività e prende appuntamenti.', include: ['Impara dai tuoi documenti', 'Sito o WhatsApp', 'Prende appuntamenti', 'Passa a te quando serve'] },
      { id: 'processo', nome: 'AI su un processo', una: 4900, mese: 249, top: true, spiega: 'Un software che fa da solo un lavoro ripetitivo: preventivi, email, documenti, follow-up.', include: ['Un processo automatizzato', 'Collegato ai tuoi strumenti', 'Tu controlli e approvi', 'Cruscotto dei risultati'] },
      { id: 'misura', nome: 'Software su misura', una: 9900, mese: 390, spiega: 'Una piattaforma interna con più funzioni AI, utenti e ruoli. Per reparti interi.', include: ['Più funzioni AI', 'Utenti e ruoli', 'Cruscotto completo', 'Formazione del team'] },
    ],
    extra: [
      { id: 'diagnosi', nome: 'Diagnosi AI (si scala dal progetto)', una: 390, spiega: '90 minuti insieme per capire dove l\'AI ti fa risparmiare davvero. Se poi fai il progetto, è gratis.' },
      { id: 'copilota', nome: 'Copilota aziendale', una: 3900, mese: 199, spiega: 'Un assistente per il tuo team che conosce listini, procedure e schede tecniche e risponde in chat.' },
      { id: 'formazione', nome: 'Formazione AI per il team (mezza giornata)', una: 650, max: 6, spiega: 'Insegno al tuo team a usare Claude e ChatGPT nel lavoro di ogni giorno.' },
    ],
    nota: 'Il canone copre hosting, controlli e aggiornamenti. Il consumo dell\'AI oltre i 30 €/mese si paga a parte, al costo reale.',
  },
  {
    id: 'integrazioni',
    nome: 'Collegamenti AI',
    riga: 'L\'AI dentro gli strumenti che usi già.',
    ai: true,
    livelli: [
      { id: 'singola', nome: 'Un collegamento', una: 1200, spiega: 'Colleghiamo due strumenti con l\'AI in mezzo. Esempio: email → AI → gestionale.', include: ['2 strumenti collegati', 'AI che legge e smista', 'Test e istruzioni'] },
      { id: 'automazione', nome: 'Automazione completa', una: 2900, mese: 49, top: true, spiega: 'Un flusso di più passaggi che parte da solo. Esempio: richiesta dal sito → AI che la valuta → CRM → messaggio al cliente.', include: ['Flusso di più passaggi', 'Fino a 4 strumenti', 'Avvisi se qualcosa non va', 'Controllo mensile'] },
      { id: 'sistema', nome: 'Sistema integrato', una: 4900, mese: 149, spiega: 'Tutti i tuoi strumenti parlano tra loro: sito, pubblicità, CRM, preventivi e follow-up.', include: ['Tutto collegato', 'AI che qualifica i contatti', 'Follow-up automatico', 'Cruscotto unico'] },
    ],
    extra: [
      { id: 'collegamento', nome: 'Strumento in più da collegare', una: 900, max: 10, spiega: 'Un altro programma che entra nel flusso (es. Google Calendar, Fatture in Cloud, Shopify).' },
    ],
  },
  {
    id: 'ads',
    nome: 'Pubblicità online',
    riga: 'Clienti, non solo "mi piace".',
    livelli: [
      { id: 'start', nome: 'Start', una: 490, mese: 590, spiega: 'Un canale (per esempio Instagram e Facebook, oppure Google), con budget fino a 2.000 € al mese.', include: ['1 canale', 'Impostazione e tracciamento', 'Creatività iniziali', 'Report mensile'] },
      { id: 'growth', nome: 'Growth', una: 790, mese: 990, top: true, spiega: 'Due canali che lavorano insieme, con budget tra 2.000 e 6.000 € al mese.', include: ['2 canali', 'Test continui sulle creatività', 'Report e call ogni mese', 'Ottimizzazione settimanale'] },
      { id: 'scale', nome: 'Scale', una: 790, mese: 1490, spiega: 'Più canali e un percorso completo per chi investe oltre 6.000 € al mese (12% del budget, minimo 1.490 €).', include: ['Più canali', 'Percorso completo con retargeting', 'Landing dedicate', 'Priorità assoluta'] },
    ],
    extra: [
      { id: 'canale', nome: 'Canale in più (TikTok, LinkedIn…)', mese: 290, max: 3, spiega: 'Un\'altra piattaforma dove far comparire i tuoi annunci.' },
      { id: 'creativita', nome: 'Pacchetto 8 creatività', una: 390, max: 6, spiega: 'Otto nuove immagini o video brevi per gli annunci, per non stancare chi li vede.' },
      { id: 'landing', nome: 'Landing page per la campagna', una: 1200, spiega: 'Una pagina fatta apposta per chi arriva dall\'annuncio. Converte molto di più della home.' },
    ],
    nota: 'Il budget pubblicitario si paga direttamente a Meta, Google o TikTok. Durata minima: 3 mesi.',
  },
  {
    id: 'cura',
    nome: 'Cura e crescita',
    riga: 'Sempre aggiornato, sempre migliore.',
    livelli: [
      { id: 'cura', nome: 'Cura', mese: 59, spiega: 'Hosting, backup, sicurezza e aggiornamenti. Tu non pensi a niente.', include: ['Hosting veloce', 'Backup', 'Sicurezza e controlli'] },
      { id: 'curaplus', nome: 'Cura+', mese: 149, top: true, spiega: 'Tutto di Cura, più un\'ora di modifiche al mese e un report chiaro.', include: ['Tutto di Cura', '1 ora di modifiche al mese', 'Report mensile'] },
      { id: 'crescita', nome: 'Crescita', mese: 390, spiega: 'Ogni mese miglioriamo il sito per farti arrivare più richieste: test, SEO e nuovi contenuti.', include: ['Tutto di Cura+', 'Test per aumentare le richieste', 'SEO continua', '2 contenuti al mese'] },
    ],
    extra: [],
  },
];

export const tempi = [
  { id: 'normale', nome: 'Normale', riga: 'I tempi giusti per fare le cose bene', fattore: 1 },
  { id: 'veloce', nome: 'Veloce', riga: 'Corsia prioritaria · +20% sulla parte una tantum', fattore: 1.2 },
  { id: 'calma', nome: 'Senza fretta', riga: 'Mi organizzo quando ho spazio · −5%', fattore: 0.95 },
];

// Sconto pacchetto sulla parte una tantum, in base a quanti servizi (esclusa la Cura) si scelgono
export function scontoPacchetto(n) {
  if (n >= 3) return 0.1;
  if (n === 2) return 0.05;
  return 0;
}

export const voucher = { soglia: 4000, percentuale: 0.5, massimo: 10000 };
