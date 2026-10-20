// Testi dell'interfaccia in italiano e inglese. L'italiano è la lingua predefinita.
export const LINGUE = ['it', 'en'];

// Percorsi equivalenti nelle due lingue
const PERCORSI = {
  home: { it: '/', en: '/en' },
  preventivo: { it: '/preventivo', en: '/en/quote' },
  privacy: { it: '/privacy', en: '/en/privacy' },
  ai: { it: '/intelligenza-artificiale', en: '/en/ai' },
  demo: { it: '/demo', en: '/en/demo' },
};
export const url = (pagina, lang = 'it') => (PERCORSI[pagina] || PERCORSI.home)[lang];

// Una pagina per ogni servizio: /servizi/siti-web e /en/services/websites
export const SLUG_SERVIZI = {
  sito: { it: 'siti-web', en: 'websites' },
  ecommerce: { it: 'negozi-online', en: 'online-stores' },
  software: { it: 'automazioni-ai', en: 'ai-automation' },
  gestionale: { it: 'gestionale-su-misura', en: 'custom-software' },
  ads: { it: 'pubblicita-online', en: 'online-advertising' },
  cura: { it: 'cura-e-crescita', en: 'care-and-growth' },
};
export const urlServizio = (id, lang = 'it') => (lang === 'en' ? `/en/services/${SLUG_SERVIZI[id].en}` : `/servizi/${SLUG_SERVIZI[id].it}`);

// Unisce i campi tradotti di un oggetto dati ({ ..., en: { ... } })
export const tr = (o, lang) => (lang === 'en' && o && o.en ? { ...o, ...o.en } : o);

export const ui = {
  it: {
    lang: 'it', locale: 'it_IT', vaiContenuto: 'Vai al contenuto', menu: 'Menu',
    nav: [['servizi', 'Servizi'], ['@ai', 'AI per aziende'], ['metodo', 'Metodo'], ['lavori', 'Clienti'], ['chi-sono', 'Lo studio'], ['prezzi', 'Prezzi']],
    megaTitolo: 'Sei servizi, un solo studio', megaTutti: 'Tutti i servizi in home', megaAi: 'L’AI per aziende, spiegata semplice', megaAiTesto: 'Cosa può fare nella tua attività, con un esempio dal vivo.', megaVai: 'Scopri come funziona', da: 'da', mese: '/mese', menuServizi: 'I servizi',
    navEtichetta: 'Principale', home: 'Desideri & Code, home', tagline: 'Dal primo sguardo al sì', ruolo: 'Siti web · AI · Pubblicità',
    ctaPreventivo: 'Calcola il preventivo', whatsapp: 'Scrivici su WhatsApp', personalizza: 'Il tuo nome',
    zona: 'Milano, Italia e Svizzera',
    footerClaim: 'Desideri di nome, risultati di fatto.',
    footerServizi: 'Servizi', footerParliamone: 'Parliamone',
    footerAi: 'AI per aziende, spiegata semplice', footerDemo: 'Demo dal vivo', footerPreventivo: 'Preventivo automatico',
    privacy: 'Privacy e cookie', preferenzeCookie: 'Preferenze cookie',
    cookie: 'Usiamo cookie di statistica e pubblicità solo se ci dai il permesso: servono a capire cosa funziona e a non sprecare annunci. Il sito funziona benissimo anche senza.',
    dettagli: 'Dettagli', cookieNo: 'No, grazie', cookieSi: 'Va bene',
    bentornato: 'Rieccoti', bentornatoTesto: 'Riprendiamo da dove eravamo?', bentornatoProgetto: "Il tuo progetto è ancora qui, come l'avevi lasciato.",
    riprendi: 'Riprendi il preventivo', chiudi: 'Chiudi',
    altraLingua: 'English', altraLinguaBreve: 'EN', questaLinguaBreve: 'IT', cambiaLingua: 'Read this site in English',
    avvisoLingua: 'Prefer English?', avvisoLinguaLink: 'Switch to English',
    ptTitolo: 'Il tuo nome', ptNome: 'Come ti chiami?', ptNomeSegnaposto: 'Il tuo nome',
    ptNota: 'Lo usiamo solo per parlarti meglio. Resta sul tuo dispositivo.', ptInvito: '',
    cnTitolo: 'Prima di iniziare: come ti chiami?', cnTesto: 'Così ti parliamo come si deve. Il nome resta solo sul tuo dispositivo.', cnEntra: 'Entra', cnChiudi: 'Chiudi',
  },
  en: {
    lang: 'en', locale: 'en_GB', vaiContenuto: 'Skip to content', menu: 'Menu',
    nav: [['servizi', 'Services'], ['@ai', 'AI for business'], ['metodo', 'Method'], ['lavori', 'Clients'], ['chi-sono', 'The studio'], ['prezzi', 'Pricing']],
    megaTitolo: 'Six services, one studio', megaTutti: 'All services on the home page', megaAi: 'AI for business, in plain words', megaAiTesto: 'What it can do for your business, with a live example.', megaVai: 'See how it works', da: 'from', mese: '/month', menuServizi: 'Services',
    navEtichetta: 'Main', home: 'Desideri & Code, home', tagline: 'From first glance to yes', ruolo: 'Websites · AI · Advertising',
    ctaPreventivo: 'Get a quote', whatsapp: 'Message us on WhatsApp', personalizza: 'Your name',
    zona: 'Milan · Italy and Switzerland',
    footerClaim: 'Desideri by name, results by design.',
    footerServizi: 'Services', footerParliamone: "Let's talk",
    footerAi: 'AI for business, in plain words', footerDemo: 'Live demos', footerPreventivo: 'Instant quote',
    privacy: 'Privacy and cookies', preferenzeCookie: 'Cookie preferences',
    cookie: 'We only use analytics and advertising cookies if you allow it: they help us see what works and avoid wasting ad money. The site works perfectly without them.',
    dettagli: 'Details', cookieNo: 'No, thanks', cookieSi: 'OK',
    bentornato: 'Welcome back', bentornatoTesto: 'Shall we pick up where we left off?', bentornatoProgetto: 'Your project is still here, just as you left it.',
    riprendi: 'Resume your quote', chiudi: 'Close',
    altraLingua: 'Italiano', altraLinguaBreve: 'IT', questaLinguaBreve: 'EN', cambiaLingua: 'Leggi il sito in italiano',
    avvisoLingua: 'Preferisci l\'italiano?', avvisoLinguaLink: 'Passa all\'italiano',
    ptTitolo: 'Your name', ptNome: "What's your name?", ptNomeSegnaposto: 'Your first name',
    ptNota: 'We only use it to talk to you better. It stays on your device.', ptInvito: '',
    cnTitolo: 'Before we start: what’s your name?', cnTesto: 'So we can talk to you properly. Your name stays on your device only.', cnEntra: 'Enter', cnChiudi: 'Close',
  },
};
