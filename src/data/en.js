// Testi in inglese dei dati condivisi, per id. Prezzi, icone e struttura restano in sito.js e listino.js.
import { enContatti, enCategorie, enIncontri, enTempi } from './en-listino.js';

export const en = {
  contatti: enContatti,

  servizi: {
    sito: {
      titolo: 'Websites',
      semplice: 'Your home online. People find you on Google, get what you do straight away, and get in touch.',
      esempio: 'Enquiries land on your phone in real time, already sorted into a spreadsheet.',
    },
    ecommerce: {
      titolo: 'Online stores',
      semplice: 'Sell your products 24 hours a day, even while you sleep.',
      esempio: 'Product pages written to sell and automatic emails for anyone who leaves their cart.',
    },
    software: {
      titolo: 'AI & automation',
      semplice: 'Repetitive work does itself: AI answers, sorts and drafts for you.',
      esempio: 'A WhatsApp message that books itself into the calendar, a quote drafted from a photo.',
    },
    gestionale: {
      titolo: 'Custom software',
      semplice: 'Your company\'s own program, built the way you work. With AI inside, if you want.',
      esempio: 'From quote to invoice without spreadsheets, and AI that drafts documents when you want it.',
    },
    ads: {
      titolo: 'Online advertising',
      semplice: 'Ads on Instagram, Facebook, Google and TikTok that bring customers, not just likes.',
      esempio: 'Every month you know what you spent, how many enquiries came in and what each one cost.',
    },
    cura: {
      titolo: 'Care and growth',
      semplice: 'Your site always up to date, secure and a little more effective every month.',
      esempio: 'Backups, security checks, small changes and a clear report.',
    },
  },

  // per indice, nello stesso ordine di sito.js
  metodo: [
    {
      passo: 'Attention',
      titolo: 'First, they have to notice you.', verbo: 'notice',
      testa: '"What\'s this?" In under a second the brain decides whether to stay or leave.',
      tecnica: 'Von Restorff effect',
      spiega: 'We remember what stands out. That\'s why every project has one thing you don\'t forget: a colour, a movement, a sentence.',
    },
    {
      passo: 'Interest',
      titolo: 'Then they have to understand you.', verbo: 'understand',
      testa: '"Is this for me?" If understanding takes effort, people leave.',
      tecnica: 'Cognitive fluency',
      spiega: 'What is easy to understand also feels truer and more trustworthy. Short sentences, one idea at a time, no jargon.',
    },
    {
      passo: 'Trust',
      titolo: 'Then they have to trust you.', verbo: 'trust',
      testa: '"Can I trust this?" We look at what others did before we decide.',
      tecnica: 'Social proof and authority',
      spiega: 'Real reviews, real work, real numbers, placed exactly where people are making up their minds.',
    },
    {
      passo: 'Desire',
      titolo: 'Then they have to want you.', verbo: 'want',
      testa: '"I want it." We decide with emotion and justify with reason.',
      tecnica: 'Anchoring and imagined outcomes',
      spiega: 'We show the result before the price, and the price in the right context. Whoever pictures the result already wants it more.',
    },
    {
      passo: 'Action',
      titolo: 'And finally, they choose you.', verbo: 'choose',
      testa: '"OK, I\'ll get in touch." The step has to be easy, clear and risk-free.',
      tecnica: 'Friction reduction',
      spiega: 'A button you can see, a step-by-step form with a very easy first question and a guarantee right next to it. Saying yes feels natural.',
    },
  ],

  lavori: {
    lorenzo: {
      cliente: 'Dr Lorenzo Baldassarri',
      settore: 'Psychologist and psychotherapist · Montecatini Terme and online',
      pacchetto: 'Signature project',
      sfida: 'A professional with an extraordinary career, from Formula 1 to elite sport, who looked like any other psychologist online.',
      fatto: [
        'Strategy and positioning: five "doors" for five kinds of people',
        'Visual identity, logo and monogram',
        'A 3D particle scene that tells the story of the method',
        'Interactive guide and chat that leads to WhatsApp',
      ],
    },
    montini: {
      cliente: 'Montini Luigino',
      settore: 'Plumber · Sesto San Giovanni and North Milan',
      pacchetto: 'Presence project',
      sfida: '40 years of experience and very happy customers, but enquiries only came by word of mouth.',
      fatto: [
        'A fast site built for people with a leak searching on their phone',
        'Enquiries arrive in Google Sheets and on Telegram in real time',
        'Call, WhatsApp and quote always within thumb\'s reach',
        'Local SEO for the areas served',
      ],
    },
  },

  faq: [
    {
      d: 'How long does it take to get my site?',
      r: 'A landing page is ready in 7-10 days. A custom site in 3-5 weeks. An immersive 3D site in 6-8 weeks. You\'ll find the exact timeline in the quote.',
    },
    {
      d: 'Do I have to pay everything up front?',
      r: 'No. Half when we sign and half when the site goes live. Larger projects are split into three parts. If you need it, we can also arrange instalments.',
    },
    {
      d: 'Will the site be mine?',
      r: 'Yes, 100%. Once paid, the code, domain and content are yours. No lock-in, no hostages.',
    },
    {
      d: 'What does "AI software" actually mean?',
      r: 'It means taking boring, repetitive work off people\'s plates. For example: a customer emails a request and the software drafts the quote for you to check. You approve it with one click. We always start with an analysis: if AI won\'t save you time or money, we\'ll tell you. The software is handed over ready, it stays yours and so does your data.',
    },
    {
      d: 'Are there grants to help with the cost?',
      r: 'In Lombardy the Chamber of Commerce runs the "Doppia Transizione" voucher: it covers up to 50% of the cost (max €10,000) for AI projects of at least €4,000. The window opens and closes quickly, so we check together that it\'s still available before counting on it.',
    },
    {
      d: 'Do you only work in Milan?',
      r: 'The studio is in Milan, but we work with clients all over Italy, in Switzerland (Ticino included) and abroad. Video calls are always included and meetings in Milan city are free. Outside Milan an in-person meeting costs €190 within 100 km (for example Como, Bergamo or Lugano) and €490 beyond. Prices are the same for everyone: if you\'re in Switzerland you can also see them in Swiss francs in the quote.',
    },
  ],

  categorie: enCategorie,
  incontri: enIncontri,
  tempi: enTempi,
};
