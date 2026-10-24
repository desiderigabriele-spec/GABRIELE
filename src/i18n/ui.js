// Testi dell'interfaccia in italiano e inglese. L'italiano è la lingua predefinita.
// Percorsi equivalenti nelle due lingue
const PERCORSI = {
  home: { it: '/', en: '/en' },
  preventivo: { it: '/preventivo', en: '/en/quote' },
  privacy: { it: '/privacy', en: '/en/privacy' },
  ai: { it: '/intelligenza-artificiale', en: '/en/ai' },
  demo: { it: '/demo', en: '/en/demo' },
  chi: { it: '/chi-siamo', en: '/en/about' },
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

export const ui = {
  it: {
    locale: 'it_IT', vaiContenuto: 'Vai al contenuto', menu: 'Menu',
    nav: [['servizi', 'Servizi'], ['@ai', 'AI per aziende'], ['metodo', 'Metodo'], ['lavori', 'Clienti'], ['chi-sono', 'Chi siamo']],
    megaTitolo: 'Sei servizi, un solo studio', megaAi: 'L’AI per aziende, spiegata semplice', megaAiTesto: 'Cosa può fare nella tua attività, con un esempio dal vivo.', megaVai: 'Scopri come funziona', da: 'da', mese: '/mese', menuServizi: 'I servizi',
    navEtichetta: 'Principale', home: 'Desideri&Code, home', ruolo: 'Siti web · AI · Pubblicità',
    ctaPreventivo: 'Richiedi un preventivo', whatsapp: 'Scrivici su WhatsApp',
    footerClaim: 'Prima studiamo. Poi costruiamo.',
    footerServizi: 'Servizi', footerParliamone: 'Parliamone',
    footerAi: 'AI per aziende, spiegata semplice', footerDemo: 'Demo dal vivo', footerChi: 'Chi siamo · Lavora con noi', footerPreventivo: 'Richiedi un preventivo',
    privacy: 'Privacy e cookie', preferenzeCookie: 'Preferenze cookie',
    dettagli: 'Dettagli',
    chiudi: 'Chiudi',
    altraLingua: 'English', altraLinguaBreve: 'EN', temaChiaro: 'Passa allo sfondo chiaro', temaScuro: 'Passa allo sfondo scuro', cambiaLingua: 'Read this site in English',
    avvisoLingua: 'Prefer English?', avvisoLinguaLink: 'Switch to English',
    nomeBtn: 'Il tuo nome', nomeSalva: 'Salva', bvPrima: 'Prima di iniziare', bvTitolo: 'Come ti chiami?', bvPerche: 'Serve solo per chiamarti per nome.', bvSegnaposto: 'Il tuo nome (se ti va)',
    bvCookieTitolo: 'I cookie, in breve',
    bvCookie: 'Con il tuo ok vediamo quali pagine ti servono davvero e miglioriamo il sito per te.', bvNomeResta: 'Il nome resta sul tuo dispositivo.',
    bvSi: 'Accetta ed entra', bvNo: 'Personalizza', bvSenza: 'Chiudi: continua senza accettare', bvSfondo: 'Sfondo', bvScuro: 'Scuro', bvChiaro: 'Chiaro', bvScelte: 'Le tue scelte', bvSalva: 'Salva le mie scelte', bvTutti: 'Accetta tutti',
    bvCat: [['necessari', 'Necessari', 'Fanno funzionare il sito e il preventivo. Sempre attivi.'], ['statistica', 'Statistica', 'Ci dicono quali pagine ti servono, così le miglioriamo.'], ['pubblicita', 'Pubblicità', 'Ti mostriamo solo offerte che ti interessano, non a caso.']], bvAccetta: 'Accetta', bvEntra: 'Entra',
  },
  en: {
    locale: 'en_GB', vaiContenuto: 'Skip to content', menu: 'Menu',
    nav: [['servizi', 'Services'], ['@ai', 'AI for business'], ['metodo', 'Method'], ['lavori', 'Clients'], ['chi-sono', 'About us']],
    megaTitolo: 'Six services, one studio', megaAi: 'AI for business, in plain words', megaAiTesto: 'What it can do for your business, with a live example.', megaVai: 'See how it works', da: 'from', mese: '/month', menuServizi: 'Services',
    navEtichetta: 'Main', home: 'Desideri&Code, home', ruolo: 'Websites · AI · Advertising',
    ctaPreventivo: 'Request a quote', whatsapp: 'Message us on WhatsApp',
    footerClaim: 'First we study. Then we build.',
    footerServizi: 'Services', footerParliamone: "Let's talk",
    footerAi: 'AI for business, in plain words', footerDemo: 'Live demos', footerChi: 'About us · Careers', footerPreventivo: 'Request a quote',
    privacy: 'Privacy and cookies', preferenzeCookie: 'Cookie preferences',
    dettagli: 'Details',
    chiudi: 'Close',
    altraLingua: 'Italiano', altraLinguaBreve: 'IT', temaChiaro: 'Switch to light background', temaScuro: 'Switch to dark background', cambiaLingua: 'Leggi il sito in italiano',
    avvisoLingua: 'Preferisci l\'italiano?', avvisoLinguaLink: 'Passa all\'italiano',
    nomeBtn: 'Your name', nomeSalva: 'Save', bvPrima: 'Before we start', bvTitolo: 'What’s your name?', bvPerche: 'Only so we can call you by name.', bvSegnaposto: 'Your name (if you like)',
    bvCookieTitolo: 'Cookies, in short',
    bvCookie: 'With your OK we see which pages really help you and improve the site for you.', bvNomeResta: 'Your name stays on your device.',
    bvSi: 'Accept and enter', bvNo: 'Customise', bvSenza: 'Close: continue without accepting', bvSfondo: 'Background', bvScuro: 'Dark', bvChiaro: 'Light', bvScelte: 'Your choices', bvSalva: 'Save my choices', bvTutti: 'Accept all',
    bvCat: [['necessari', 'Necessary', 'They make the site and the quote work. Always on.'], ['statistica', 'Analytics', 'They tell us which pages help you, so we can improve them.'], ['pubblicita', 'Advertising', 'We only show you offers you care about, not random ones.']], bvAccetta: 'Accept', bvEntra: 'Enter',
  },
};
