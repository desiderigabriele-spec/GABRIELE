// Testi dell'interfaccia in italiano e inglese. L'italiano è la lingua predefinita.
export const LINGUE = ['it', 'en'];

// Percorsi equivalenti nelle due lingue
const PERCORSI = {
  home: { it: '/', en: '/en' },
  preventivo: { it: '/preventivo', en: '/en/quote' },
  privacy: { it: '/privacy', en: '/en/privacy' },
  ai: { it: '/intelligenza-artificiale', en: '/en/ai' },
};
export const url = (pagina, lang = 'it') => (PERCORSI[pagina] || PERCORSI.home)[lang];

// Una pagina per ogni servizio: /servizi/siti-web e /en/services/websites
export const SLUG_SERVIZI = {
  sito: { it: 'siti-web', en: 'websites' },
  ecommerce: { it: 'negozi-online', en: 'online-stores' },
  software: { it: 'software-ai', en: 'ai-software' },
  integrazioni: { it: 'collegamenti-ai', en: 'ai-integrations' },
  ads: { it: 'pubblicita-online', en: 'online-advertising' },
  cura: { it: 'cura-e-crescita', en: 'care-and-growth' },
};
export const urlServizio = (id, lang = 'it') => (lang === 'en' ? `/en/services/${SLUG_SERVIZI[id].en}` : `/servizi/${SLUG_SERVIZI[id].it}`);

// Unisce i campi tradotti di un oggetto dati ({ ..., en: { ... } })
export const tr = (o, lang) => (lang === 'en' && o && o.en ? { ...o, ...o.en } : o);

export const ui = {
  it: {
    lang: 'it', locale: 'it_IT', vaiContenuto: 'Vai al contenuto', menu: 'Menu',
    nav: [['servizi', 'Servizi'], ['@ai', 'AI per aziende'], ['metodo', 'Metodo'], ['lavori', 'Clienti'], ['prezzi', 'Prezzi'], ['chi-sono', 'Lo studio']],
    navEtichetta: 'Principale', home: 'Studio Desideri, home', tagline: 'Dal primo sguardo al sì', ruolo: 'Siti web · AI · Pubblicità',
    ctaPreventivo: 'Calcola il preventivo', whatsapp: 'Scrivici su WhatsApp', personalizza: 'Personalizza',
    zona: 'Milano, Italia e Svizzera',
    footerClaim: 'Ci chiamiamo Desideri. Di lavoro, li creiamo.',
    footerServizi: 'Servizi', footerParliamone: 'Parliamone',
    footerAi: 'AI per aziende, spiegata semplice', footerPreventivo: 'Preventivo automatico',
    privacy: 'Privacy e cookie', preferenzeCookie: 'Preferenze cookie',
    cookie: 'Usiamo cookie di statistica e pubblicità solo se ci dai il permesso: servono a capire cosa funziona e a non sprecare annunci. Il sito funziona benissimo anche senza.',
    dettagli: 'Dettagli', cookieNo: 'No, grazie', cookieSi: 'Va bene',
    uscitaCapitolo: "Un'ultima cosa", uscitaTitolo: 'Prima di andare, ', uscitaTitoloEm: 'guarda qui.',
    uscitaTesto: "In 2 minuti vedi quanto costa il tuo progetto. Gratis, senza impegno, senza lasciare l'email per forza.",
    uscitaSi: 'Fammi vedere quanto costa', uscitaNo: 'No grazie, ci penso',
    bentornato: 'Rieccoti', bentornatoTesto: 'Riprendiamo da dove eravamo?', bentornatoProgetto: "Il tuo progetto è ancora qui, come l'avevi lasciato.",
    riprendi: 'Riprendi il preventivo', chiudi: 'Chiudi',
    altraLingua: 'English', altraLinguaBreve: 'EN', questaLinguaBreve: 'IT', cambiaLingua: 'Read this site in English',
    avvisoLingua: 'Prefer English?', avvisoLinguaLink: 'Switch to English',
    ptTitolo: 'Rendi tuo il sito', ptNome: 'Come ti chiami?', ptNomeSegnaposto: 'Il tuo nome', ptColore: 'Il tuo colore',
    ptNota: 'Cambia subito. Resta solo sul tuo dispositivo.', ptInvito: 'Vuoi il sito con il tuo nome e il tuo colore? Tocca qui.',
    colori: ['Blu', 'Rosso', 'Viola', 'Verde'],
  },
  en: {
    lang: 'en', locale: 'en_GB', vaiContenuto: 'Skip to content', menu: 'Menu',
    nav: [['servizi', 'Services'], ['@ai', 'AI for business'], ['metodo', 'Method'], ['lavori', 'Clients'], ['prezzi', 'Pricing'], ['chi-sono', 'The studio']],
    navEtichetta: 'Main', home: 'Studio Desideri, home', tagline: 'From first glance to yes', ruolo: 'Websites · AI · Advertising',
    ctaPreventivo: 'Get a quote', whatsapp: 'Message us on WhatsApp', personalizza: 'Personalise',
    zona: 'Milan · Italy and Switzerland',
    footerClaim: 'Our name means “desires”. Creating them is our job.',
    footerServizi: 'Services', footerParliamone: "Let's talk",
    footerAi: 'AI for business, in plain words', footerPreventivo: 'Instant quote',
    privacy: 'Privacy and cookies', preferenzeCookie: 'Cookie preferences',
    cookie: 'We only use analytics and advertising cookies if you allow it: they help us see what works and avoid wasting ad money. The site works perfectly without them.',
    dettagli: 'Details', cookieNo: 'No, thanks', cookieSi: 'OK',
    uscitaCapitolo: 'One last thing', uscitaTitolo: 'Before you go, ', uscitaTitoloEm: 'look here.',
    uscitaTesto: 'In 2 minutes you can see what your project costs. Free, no commitment, no email required.',
    uscitaSi: 'Show me the price', uscitaNo: "No thanks, I'll think about it",
    bentornato: 'Welcome back', bentornatoTesto: 'Shall we pick up where we left off?', bentornatoProgetto: 'Your project is still here, just as you left it.',
    riprendi: 'Resume your quote', chiudi: 'Close',
    altraLingua: 'Italiano', altraLinguaBreve: 'IT', questaLinguaBreve: 'EN', cambiaLingua: 'Leggi il sito in italiano',
    avvisoLingua: 'Preferisci l\'italiano?', avvisoLinguaLink: 'Passa all\'italiano',
    ptTitolo: 'Make this site yours', ptNome: "What's your name?", ptNomeSegnaposto: 'Your first name', ptColore: 'Your colour',
    ptNota: 'Changes right away. Stays on your device only.', ptInvito: 'Want the site with your name and your colour? Tap here.',
    colori: ['Blue', 'Red', 'Purple', 'Green'],
  },
};
