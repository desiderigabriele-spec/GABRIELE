// Testi dell'interfaccia in italiano e inglese. L'italiano è la lingua predefinita.
export const LINGUE = ['it', 'en'];

// Percorsi equivalenti nelle due lingue
const PERCORSI = {
  home: { it: '/', en: '/en' },
  preventivo: { it: '/preventivo', en: '/en/quote' },
  privacy: { it: '/privacy', en: '/en/privacy' },
};
export const url = (pagina, lang = 'it') => (PERCORSI[pagina] || PERCORSI.home)[lang];

// Unisce i campi tradotti di un oggetto dati ({ ..., en: { ... } })
export const tr = (o, lang) => (lang === 'en' && o && o.en ? { ...o, ...o.en } : o);

export const ui = {
  it: {
    lang: 'it', locale: 'it_IT', vaiContenuto: 'Vai al contenuto', menu: 'Menu',
    nav: [['servizi', 'Servizi'], ['metodo', 'Metodo'], ['lavori', 'Lavori'], ['prezzi', 'Prezzi'], ['chi-sono', 'Chi sono']],
    navEtichetta: 'Principale', home: 'Desideri Studio, home', tagline: 'Dal primo sguardo al sì', ruolo: 'Siti web · AI · Pubblicità',
    ctaPreventivo: 'Calcola il preventivo', whatsapp: 'Scrivimi su WhatsApp', personalizza: 'Personalizza',
    zona: 'Milano, Italia e Svizzera',
    footerClaim: 'Di cognome faccio Desideri. Di lavoro, li creo.',
    footerServizi: 'Servizi', footerParliamone: 'Parliamone',
    footerVoci: ['Siti web', 'Negozi online', 'Software e collegamenti AI', 'Pubblicità online', 'Preventivo automatico'],
    privacy: 'Privacy e cookie', preferenzeCookie: 'Preferenze cookie',
    cookie: 'Uso cookie di statistica e pubblicità solo se mi dai il permesso: servono a capire cosa funziona e a non sprecare annunci. Il sito funziona benissimo anche senza.',
    dettagli: 'Dettagli', cookieNo: 'No, grazie', cookieSi: 'Va bene',
    uscitaCapitolo: "Un'ultima cosa", uscitaTitolo: 'Prima di andare, ', uscitaTitoloEm: 'guarda qui.',
    uscitaTesto: "In 2 minuti vedi quanto costa il tuo progetto. Gratis, senza impegno, senza lasciare l'email per forza.",
    uscitaSi: 'Fammi vedere quanto costa', uscitaNo: 'No grazie, ci penso',
    bentornato: 'Rieccoti', bentornatoTesto: 'Riprendiamo da dove eravamo?', bentornatoProgetto: "Il tuo progetto è ancora qui, come l'avevi lasciato.",
    riprendi: 'Riprendi il preventivo', chiudi: 'Chiudi',
    altraLingua: 'English', altraLinguaBreve: 'EN', questaLinguaBreve: 'IT', cambiaLingua: 'Read this site in English',
    avvisoLingua: 'Prefer English?', avvisoLinguaLink: 'Switch to English',
  },
  en: {
    lang: 'en', locale: 'en_GB', vaiContenuto: 'Skip to content', menu: 'Menu',
    nav: [['servizi', 'Services'], ['metodo', 'Method'], ['lavori', 'Work'], ['prezzi', 'Pricing'], ['chi-sono', 'About']],
    navEtichetta: 'Main', home: 'Desideri Studio, home', tagline: 'From first glance to yes', ruolo: 'Websites · AI · Advertising',
    ctaPreventivo: 'Get a quote', whatsapp: 'Message me on WhatsApp', personalizza: 'Personalise',
    zona: 'Milan · Italy and Switzerland',
    footerClaim: 'My surname means "desires". Creating them is my job.',
    footerServizi: 'Services', footerParliamone: "Let's talk",
    footerVoci: ['Websites', 'Online stores', 'AI software and integrations', 'Online advertising', 'Instant quote'],
    privacy: 'Privacy and cookies', preferenzeCookie: 'Cookie preferences',
    cookie: 'I only use analytics and advertising cookies if you allow it: they help me see what works and avoid wasting ad money. The site works perfectly without them.',
    dettagli: 'Details', cookieNo: 'No, thanks', cookieSi: 'OK',
    uscitaCapitolo: 'One last thing', uscitaTitolo: 'Before you go, ', uscitaTitoloEm: 'look here.',
    uscitaTesto: 'In 2 minutes you can see what your project costs. Free, no commitment, no email required.',
    uscitaSi: 'Show me the price', uscitaNo: "No thanks, I'll think about it",
    bentornato: 'Welcome back', bentornatoTesto: 'Shall we pick up where we left off?', bentornatoProgetto: 'Your project is still here, just as you left it.',
    riprendi: 'Resume your quote', chiudi: 'Close',
    altraLingua: 'Italiano', altraLinguaBreve: 'IT', questaLinguaBreve: 'EN', cambiaLingua: 'Leggi il sito in italiano',
    avvisoLingua: 'Preferisci l\'italiano?', avvisoLinguaLink: 'Passa all\'italiano',
  },
};
