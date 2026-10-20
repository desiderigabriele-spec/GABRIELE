// Listino del preventivo automatico. Prezzi IVA esclusa, allineati a docs/01-ricerca-mercato-prezzi.md.
// "una" = una tantum, "mese" = canone mensile. Gli extra con "max" si aggiungono con + / −.

export const categorie = [
  {
    id: 'sito',
    nome: 'Sito web',
    riga: 'Ti trovano, ti capiscono, ti scrivono.',
    livelli: [
      { id: 'impulso', nome: 'Impulso', una: 1500, spiega: 'Una sola pagina pensata per un obiettivo: farti arrivare richieste. Ideale per una promozione o per partire.', include: ['1 pagina pensata per un solo obiettivo', 'Strategia e testi che convincono, scritti da noi', 'Animazioni curate', 'Modulo collegato al telefono, a Fogli o a WhatsApp', 'Perfetta sul telefono', 'Statistiche di Google e Pixel di Meta', 'Pronta in 7-10 giorni'] },
      { id: 'presenza', nome: 'Presenza', una: 2900, top: true, spiega: 'Il sito completo della tua attività, disegnato su misura. È quello che sceglie la maggior parte delle persone.', include: ['5-7 pagine disegnate su misura, niente modelli già fatti', 'Testi scritti da noi', 'SEO per farti trovare su Google, anche nella tua zona', 'Richieste su Fogli, Telegram o WhatsApp in tempo reale', 'Scheda Google Business Profile', 'Cookie e privacy in regola', 'Ti spieghiamo come gestirlo', 'Pronto in 3-5 settimane'] },
      { id: 'signature', nome: 'Signature', una: 7500, spiega: 'Un sito che non si dimentica: 3D, animazioni firma e un\'identità visiva tutta tua.', include: ['Tutto di Presenza', 'Identità visiva: colori, caratteri e stile tutti tuoi', 'Scena 3D e animazioni firma', 'Micro-interazioni che si fanno ricordare', 'Chat guidata che porta a WhatsApp', 'Strategia scritta per il tuo marchio', 'Velocità al top (punteggio Google oltre 90)', 'Pronto in 6-8 settimane'] },
    ],
    extra: [
      { id: 'pagina', nome: 'Pagina in più', una: 290, max: 20, spiega: 'Una pagina aggiuntiva, per esempio un servizio o una zona.' },
      { id: 'lingua', nome: 'Lingua in più', una: 490, max: 5, spiega: 'Tutto il sito tradotto e adattato in un\'altra lingua (per esempio inglese, oppure tedesco o francese per la Svizzera).' },
      { id: 'seoch', nome: 'SEO locale per la Svizzera', una: 590, spiega: 'Per farti trovare anche in Svizzera: Google Business Profile svizzero, iscrizione a local.ch e search.ch, pagine per Ticino e città e le parole che usano gli svizzeri quando cercano.' },
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
      { id: 'start', nome: 'Start', una: 3900, spiega: 'Un negozio Shopify bello e pronto a vendere, con fino a 50 prodotti.', include: ['Negozio Shopify con tema personalizzato', 'Fino a 50 prodotti caricati', 'Pagamenti e spedizioni impostati', 'Email essenziali: ordine e spedizione', 'Vendite tracciate con statistiche e Pixel'] },
      { id: 'growth', nome: 'Growth', una: 7900, top: true, spiega: 'Il negozio disegnato su misura e pensato per far crescere le vendite ogni mese.', include: ['Design su misura', 'Fino a 300 prodotti caricati', 'Schede prodotto scritte per vendere', 'Email automatiche: benvenuto, carrello abbandonato, dopo l\'acquisto', 'Recensioni dei clienti', 'Vendite tracciate con precisione', 'SEO per farti trovare'] },
      { id: 'signature', nome: 'Signature', una: 14000, spiega: 'Negozio su misura con esperienze speciali, come il prodotto in 3D o un configuratore.', include: ['Tutto di Growth', 'Prodotto in 3D o configuratore', 'Collegamento al gestionale', 'Massima velocità anche con tanti prodotti'] },
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
    nome: 'Automazioni e AI',
    riga: 'Il lavoro ripetitivo lo fa da solo.',
    ai: true,
    livelli: [
      { id: 'automazione', nome: 'Automazione', una: 1200, spiega: 'I tuoi programmi si parlano da soli, con l\'AI in mezzo. Esempio: WhatsApp → AI → agenda.', include: ['2 programmi collegati, per esempio WhatsApp e agenda', 'L\'AI legge, capisce e smista', 'Avvisi se qualcosa si blocca', 'Test e istruzioni scritte', 'Nessun programma da cambiare', 'Pronta in 1-2 settimane'] },
      { id: 'assistente', nome: 'Assistente AI', una: 2400, mese: 149, spiega: 'Un assistente che risponde ai clienti sul sito o su WhatsApp, conosce la tua attività e prende appuntamenti.', include: ['Impara dai tuoi documenti: listini, domande frequenti, procedure', 'Risponde sul sito o su WhatsApp, giorno e notte', 'Capisce cosa vuole il cliente', 'Prende appuntamenti in agenda', 'Passa a te quando serve', 'Installato a nome tuo, con i tuoi dati', 'Nel canone: hosting, controlli e aggiornamenti'] },
      { id: 'processo', nome: 'AI su un processo', una: 4900, mese: 249, top: true, spiega: 'Un software che fa da solo un lavoro ripetitivo: preventivi, email, documenti, follow-up.', include: ['Un lavoro ripetitivo fatto da solo: preventivi, email o documenti', 'Collegato al gestionale o al CRM', 'Tu controlli e approvi con un clic', 'Cruscotto con i risultati', 'Test e istruzioni', 'Installato a nome tuo, con i tuoi dati', 'Nel canone: assistenza continua'] },
    ],
    extra: [
      { id: 'diagnosi', nome: 'Diagnosi AI (si scala dal progetto)', una: 390, spiega: '90 minuti insieme per capire dove l\'AI ti fa risparmiare davvero. Se poi fai il progetto, è gratis.' },
      { id: 'collegamento', nome: 'Programma in più', una: 900, max: 10, spiega: 'Un altro programma che entra nel flusso (es. Google Calendar, Fatture in Cloud, Shopify).' },
      { id: 'controllo', nome: 'Controllo mensile', mese: 49, spiega: 'Ogni mese controlliamo che tutto giri e sistemiamo noi quello che cambia nei programmi collegati.' },
      { id: 'copilota', nome: 'Copilota aziendale', una: 3900, mese: 199, spiega: 'Un assistente per il tuo team che conosce listini, procedure e schede tecniche e risponde in chat.' },
      { id: 'formazione', nome: 'Formazione AI (mezza giornata)', una: 650, max: 6, spiega: 'Insegniamo al tuo team a usare Claude e ChatGPT nel lavoro di ogni giorno.' },
    ],
    nota: 'Il software e i tuoi dati sono tuoi. Il canone è l\'assistenza: hosting, controlli, aggiornamenti e sistemazioni. Il consumo dell\'AI oltre i 30 €/mese si paga a parte, al costo reale.',
  },
  {
    id: 'gestionale',
    nome: 'Gestionale su misura',
    riga: 'Il programma della tua azienda, fatto come lavori tu.',
    livelli: [
      { id: 'essenziale', nome: 'Essenziale', una: 4900, mese: 79, spiega: 'Un gestionale semplice per una parte del lavoro: clienti e preventivi, ordini oppure magazzino.', include: ['1 area su misura: per esempio clienti e preventivi, ordini o magazzino', 'Fino a 5 utenti', 'Funziona su computer, tablet e telefono', 'Importiamo i tuoi dati da Excel', 'Documenti PDF con il tuo logo', 'Installato a nome tuo, con i tuoi dati', 'Pronto in 4-6 settimane'] },
      { id: 'completo', nome: 'Completo', una: 8900, mese: 149, top: true, spiega: 'Tutto il lavoro in un posto solo, con le parti collegate tra loro: dal primo contatto alla fattura.', include: ['Fino a 4 aree collegate: clienti, preventivi, ordini, magazzino, scadenze', 'Utenti e permessi diversi: titolare, ufficio, magazzino', 'Cruscotto con i numeri che contano', 'Collegato a fatturazione elettronica, sito o negozio online', 'Promemoria e scadenze automatiche', 'Formazione del team', 'Pronto in 8-10 settimane'] },
      { id: 'conai', nome: 'Completo + AI', una: 13900, mese: 249, spiega: 'Il gestionale completo con l\'intelligenza artificiale dentro: prepara documenti, legge le email e risponde alle tue domande.', include: ['Tutto di Completo', 'Preventivi e documenti preparati dall\'AI, tu approvi', 'Email, fatture e PDF letti e inseriti da soli', 'Chiedi in chat: «quanto abbiamo fatturato a marzo?»', 'Avvisi intelligenti: clienti da richiamare, scorte che finiscono', 'Utenti senza limiti', 'Pronto in 10-12 settimane'] },
    ],
    extra: [
      { id: 'area', nome: 'Area in più', una: 1500, max: 6, spiega: 'Un\'altra parte del lavoro dentro il gestionale, per esempio turni, mezzi o assistenza clienti.' },
      { id: 'funzioneai', nome: 'Funzione AI in più', una: 1900, max: 5, spiega: 'Una funzione intelligente in più, per esempio leggere i documenti di trasporto o scrivere i solleciti di pagamento.' },
      { id: 'migrazione', nome: 'Passaggio dal vecchio gestionale', una: 900, spiega: 'Portiamo dentro clienti, articoli e storico dal programma che usi oggi.' },
      { id: 'app', nome: 'App sul telefono', una: 1200, spiega: 'Il gestionale come app da installare, anche per chi lavora fuori: cantieri, consegne, visite.' },
    ],
    nota: 'Il gestionale e i dati sono tuoi. Il canone è l\'assistenza: hosting, backup, aggiornamenti e sistemazioni. Il consumo dell\'AI oltre i 30 €/mese si paga a parte, al costo reale.',
  },
  {
    id: 'ads',
    nome: 'Pubblicità online',
    riga: 'Clienti, non solo "mi piace".',
    livelli: [
      { id: 'start', nome: 'Start', una: 490, mese: 590, spiega: 'Un canale (per esempio Instagram e Facebook, oppure Google), con budget fino a 2.000 € al mese.', include: ['1 canale: Meta (Instagram e Facebook) oppure Google', 'Impostazione di account, Pixel e statistiche', 'Il pubblico giusto e le prime creatività', 'Ottimizzazione continua', 'Report chiaro ogni mese'] },
      { id: 'growth', nome: 'Growth', una: 790, mese: 990, top: true, spiega: 'Due canali che lavorano insieme, con budget tra 2.000 e 6.000 € al mese.', include: ['2 canali che lavorano insieme', 'Impostazione completa, con tracciamento lato server', 'Prove continue sulle creatività', 'Ottimizzazione ogni settimana', 'Report e chiamata ogni mese'] },
      { id: 'scale', nome: 'Scale', una: 790, mese: 1490, spiega: 'Più canali e un percorso completo per chi investe oltre 6.000 € al mese (12% del budget, minimo 1.490 €).', include: ['Più canali insieme', 'Percorso completo, con chi ti ha già visitato', 'Pagine dedicate alle campagne', 'Ottimizzazione continua', 'Report e chiamata ogni mese', 'Priorità assoluta'] },
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
      { id: 'cura', nome: 'Cura', mese: 59, spiega: 'Hosting, backup, sicurezza e aggiornamenti. Tu non pensi a niente.', include: ['Hosting veloce', 'Backup', 'Sicurezza e controlli', 'Aggiornamenti', 'Se il sito si ferma, lo sappiamo subito'] },
      { id: 'curaplus', nome: 'Cura+', mese: 149, top: true, spiega: 'Tutto di Cura, più un\'ora di modifiche al mese e un report chiaro.', include: ['Tutto di Cura', '1 ora di modifiche al mese', 'Report chiaro ogni mese'] },
      { id: 'crescita', nome: 'Crescita', mese: 390, spiega: 'Ogni mese miglioriamo il sito per farti arrivare più richieste: test, SEO e nuovi contenuti.', include: ['Tutto di Cura+', 'Prove per farti arrivare più richieste', 'SEO continua', '2 contenuti nuovi al mese'] },
    ],
    extra: [],
  },
];

// Incontri di persona: il prezzo dipende solo dalla distanza da Milano, uguale per Italia e Svizzera.
// Videochiamate sempre incluse; a Milano città gli incontri sono inclusi.
export const incontri = [
  { id: 'vicino', nome: 'Incontro di persona entro 100 km da Milano', una: 190, max: 10, spiega: 'Per esempio Monza, Como, Bergamo, Varese, Lugano, Mendrisio, Chiasso. Viaggio incluso, fino a 2 ore insieme.' },
  { id: 'lontano', nome: 'Incontro di persona oltre 100 km da Milano', una: 490, max: 10, spiega: 'Per esempio Torino, Bologna, Verona, Bellinzona, Zurigo, Berna, Ginevra. Una giornata: viaggio incluso.' },
];

// Cambio indicativo per mostrare i prezzi anche in franchi (stessi prezzi, solo convertiti). Da aggiornare ogni tanto.
export const cambio = { CHF: 0.92, aggiornato: '2026-10' };

export const tempi = [
  { id: 'normale', nome: 'Normale', riga: 'I tempi giusti per fare le cose bene', fattore: 1 },
  { id: 'veloce', nome: 'Veloce', riga: 'Corsia prioritaria · +20% sulla parte una tantum', fattore: 1.2 },
  { id: 'calma', nome: 'Senza fretta', riga: 'Ci organizziamo quando abbiamo spazio · −5%', fattore: 0.95 },
];

// Sconto pacchetto sulla parte una tantum, in base a quanti servizi (esclusa la Cura) si scelgono
export function scontoPacchetto(n) {
  if (n >= 3) return 0.1;
  if (n === 2) return 0.05;
  return 0;
}

export const voucher = { soglia: 4000, percentuale: 0.5, massimo: 10000 };
