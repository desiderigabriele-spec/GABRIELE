// Testi in inglese di contatti e listino, per id: li usa anche il preventivo, che così non si porta dietro gli altri testi.

export const enContatti = {
  zona: 'Milan · Italy and Switzerland',
};

export const enCategorie = {
  sito: {
    nome: 'Website',
    riga: 'They find you, understand you, contact you.',
    livelli: {
      impulso: { nome: 'Impulse', spiega: 'A single page built for one goal: bringing you enquiries. Ideal for a promotion or to get started.', include: ['1 page built for a single goal', 'Strategy and persuasive copy, written by us', 'Polished animations', 'Form connected to your phone, Sheets or WhatsApp', 'Perfect on phones', 'Google analytics and Meta Pixel', 'Ready in 7-10 days'] },
      presenza: { nome: 'Presence', spiega: 'The complete site for your business, designed from scratch. It\'s what most people choose.', include: ['5-7 custom-designed pages, no ready-made templates', 'Copy written by us', 'SEO to be found on Google, locally too', 'Enquiries on Sheets, Telegram or WhatsApp in real time', 'Google Business Profile', 'Cookies and privacy in order', 'We show you how to manage it', 'Ready in 3-5 weeks'] },
      signature: { nome: 'Signature', spiega: 'A site people don\'t forget: 3D, signature animations and a visual identity all your own.', include: ['Everything in Presence', 'Visual identity: colours, typefaces and style all your own', '3D scene and signature animations', 'Micro-interactions people remember', 'Guided chat that leads to WhatsApp', 'Written strategy for your brand', 'Top speed (Google score above 90)', 'Ready in 6-8 weeks'] },
    },
    extra: {
      pagina: { nome: 'Extra page', spiega: 'One more page, for example a service or an area.' },
      lingua: { nome: 'Extra language', spiega: 'The whole site translated and adapted into another language (for example German or French for Switzerland).' },
      seoch: { nome: 'Local SEO for Switzerland', spiega: 'To be found in Switzerland too: Swiss Google Business Profile, listings on local.ch and search.ch, pages for Ticino and cities, and the words Swiss people actually search for.' },
      seo: { nome: 'SEO copy for a service page', spiega: 'Copy written to show up on Google when people search for exactly that service.' },
      logo: { nome: 'Logo and visual identity', spiega: 'Logo, colours and typefaces that make you recognisable everywhere.' },
      media: { nome: 'Custom photos and videos', spiega: 'Original images and short videos for the site, when you don\'t have your own.' },
      blog: { nome: 'Blog or news section', spiega: 'A section where you publish articles yourself, without calling anyone.' },
    },
  },
  ecommerce: {
    nome: 'Online store',
    riga: 'Sell 24 hours a day.',
    livelli: {
      start: { nome: 'Start', spiega: 'A beautiful Shopify store ready to sell, with up to 50 products.', include: ['Shopify store with a customised theme', 'Up to 50 products uploaded', 'Payments and shipping set up', 'Essential emails: order and shipping', 'Sales tracked with analytics and Pixel'] },
      growth: { nome: 'Growth', spiega: 'A custom-designed store built to grow sales every month.', include: ['Custom design', 'Up to 300 products uploaded', 'Product pages written to sell', 'Automatic emails: welcome, abandoned basket, after purchase', 'Customer reviews', 'Precise sales tracking', 'SEO to be found'] },
      signature: { nome: 'Signature', spiega: 'A custom store with special experiences, like 3D products or a configurator.', include: ['Everything in Growth', '3D product or configurator', 'Connection to your management software', 'Top speed even with many products'] },
    },
    extra: {
      prodotti: { nome: '+100 products uploaded', spiega: 'We upload another 100 products with photos, copy and variants.' },
      email: { nome: 'Advanced email flows', spiega: 'Emails that send themselves: after a purchase, for customers who haven\'t been back in a while, on birthdays.' },
      gestionale: { nome: 'Connection to your management software', spiega: 'Orders, stock and invoices update themselves in your system.' },
      lingua: { nome: 'Extra language', spiega: 'The store translated so you can sell abroad too.' },
    },
    nota: 'Shopify subscription, apps and payment fees are separate and paid directly to them.',
  },
  software: {
    nome: 'AI & automation',
    riga: 'Repetitive work that does itself.',
    livelli: {
      automazione: { nome: 'Automation', spiega: 'Your programs talk to each other on their own, with AI in the middle. Example: WhatsApp → AI → calendar.', include: ['2 programs connected, for example WhatsApp and calendar', 'AI reads, understands and sorts', 'Alerts if something gets stuck', 'Testing and written instructions', 'No programs to change', 'Ready in 1-2 weeks'] },
      assistente: { nome: 'AI assistant', spiega: 'An assistant that answers customers on your site or on WhatsApp, knows your business and books appointments.', include: ['Learns from your documents: price lists, FAQs, procedures', 'Answers on your site or on WhatsApp, day and night', 'Understands what the client wants', 'Books appointments in your calendar', 'Hands over to you when needed', 'Installed in your name, with your data', 'The monthly fee covers hosting, checks and updates'] },
      processo: { nome: 'AI on one process', spiega: 'Software that does a repetitive job on its own: quotes, emails, documents, follow-ups.', include: ['A repetitive job done on its own: quotes, emails or documents', 'Connected to your management software or CRM', 'You check and approve with one click', 'Results dashboard', 'Testing and instructions', 'Installed in your name, with your data', 'The monthly fee covers ongoing support'] },
    },
    extra: {
      diagnosi: { nome: 'AI diagnosis (deducted from the project)', spiega: '90 minutes together to find where AI really saves you money. If you go ahead with the project, it\'s free.' },
      collegamento: { nome: 'Extra program', spiega: 'Another app joins the flow (e.g. Google Calendar, Fatture in Cloud, Shopify).' },
      controllo: { nome: 'Monthly check', spiega: 'Every month we check everything runs and fix whatever changes in the connected programs.' },
      copilota: { nome: 'Company copilot', spiega: 'An assistant for your team that knows price lists, procedures and spec sheets and answers in chat.' },
      formazione: { nome: 'AI training (half day)', spiega: 'We teach your team to use Claude and ChatGPT in their everyday work.' },
    },
    nota: 'The software and your data are yours. The fee is the support: hosting, monitoring, updates and fixes. AI usage is billed separately, at cost.',
  },
  gestionale: {
    nome: 'Custom software',
    riga: 'Your company\'s own program, built the way you work.',
    livelli: {
      essenziale: { nome: 'Essential', spiega: 'Simple management software for one part of the work: clients and quotes, orders or stock.', include: ['1 custom area: e.g. clients and quotes, or stock', 'Up to 5 users', 'Works on computer, tablet and phone', 'We import your data from Excel', 'PDF documents with your logo', 'Installed in your name, with your data', 'Ready in 4-6 weeks'] },
      completo: { nome: 'Complete', spiega: 'All your work in one place, with every part connected: from first contact to invoice.', include: ['Up to 4 connected areas: clients, quotes, orders, stock, deadlines', 'Different users and permissions: owner, office, warehouse', 'Dashboard with the numbers that matter', 'Connected to e-invoicing, your website or online store', 'Automatic reminders and deadlines', 'Team training', 'Ready in 8-10 weeks'] },
      conai: { nome: 'Complete + AI', spiega: 'The complete system with artificial intelligence built in: it drafts documents, reads emails and answers your questions.', include: ['Everything in Complete', 'Quotes and documents drafted by AI, you approve', 'Emails, invoices and PDFs read and filed on their own', 'Ask in chat: "how much did we invoice in March?"', 'Smart alerts: clients to call back, stock running low', 'Unlimited users', 'Ready in 10-12 weeks'] },
    },
    extra: {
      area: { nome: 'Extra area', spiega: 'Another part of the work inside the system, for example shifts, vehicles or customer support.' },
      funzioneai: { nome: 'Extra AI feature', spiega: 'One more smart feature, for example reading delivery notes or writing payment reminders.' },
      migrazione: { nome: 'Move from your old software', spiega: 'We bring in clients, products and history from the program you use today.' },
      app: { nome: 'Phone app', spiega: 'The system as an installable app, also for people working out of the office: sites, deliveries, visits.' },
    },
    nota: 'The software and the data are yours. The fee is the support: hosting, backups, updates and fixes. AI usage is billed separately, at cost.',
  },
  ads: {
    nome: 'Online advertising',
    riga: 'Customers, not just likes.',
    livelli: {
      start: { nome: 'Start', spiega: 'One channel (for example Instagram and Facebook, or Google), with a budget of up to €2,000 a month.', include: ['1 channel: Meta (Instagram and Facebook) or Google', 'Account, Pixel and analytics set-up', 'The right audience and first creatives', 'Ongoing optimisation', 'Clear monthly report'] },
      growth: { nome: 'Growth', spiega: 'Two channels working together, with a budget between €2,000 and €6,000 a month.', include: ['2 channels working together', 'Full set-up, with server-side tracking', 'Constant creative testing', 'Weekly optimisation', 'Monthly report and call'] },
      scale: { nome: 'Scale', spiega: 'More channels and a full funnel for anyone investing over €6,000 a month.', include: ['Several channels together', 'Full funnel, including people who already visited you', 'Dedicated campaign pages', 'Ongoing optimisation', 'Monthly report and call', 'Top priority'] },
    },
    extra: {
      canale: { nome: 'Extra channel (TikTok, LinkedIn…)', spiega: 'Another platform where your ads appear.' },
      creativita: { nome: 'Pack of 8 creatives', spiega: 'Eight new images or short videos for your ads, so people don\'t get tired of seeing them.' },
      landing: { nome: 'Campaign landing page', spiega: 'A page made specifically for people coming from the ad. It converts far better than the home page.' },
    },
    nota: 'The ad budget is paid directly to Meta, Google or TikTok. Minimum term: 3 months.',
  },
  cura: {
    nome: 'Care and growth',
    riga: 'Always up to date, always better.',
    livelli: {
      cura: { nome: 'Care', spiega: 'Hosting, backups, security and updates. You don\'t have to think about anything.', include: ['Fast hosting', 'Backups', 'Security and checks', 'Updates', 'If the site goes down, we know straight away'] },
      curaplus: { nome: 'Care+', spiega: 'Everything in Care, plus one hour of changes a month and a clear report.', include: ['Everything in Care', '1 hour of changes a month', 'Clear monthly report'] },
      crescita: { nome: 'Growth', spiega: 'Every month we improve the site to bring you more enquiries: testing, SEO and new content.', include: ['Everything in Care+', 'Tests to bring you more enquiries', 'Ongoing SEO', '2 new pieces of content a month'] },
    },
  },
};

export const enIncontri = {
  vicino: { nome: 'In-person meeting within 100 km of Milan', spiega: 'For example Monza, Como, Bergamo, Varese, Lugano, Mendrisio, Chiasso. Travel included, up to 2 hours together.' },
  lontano: { nome: 'In-person meeting over 100 km from Milan', spiega: 'For example Turin, Bologna, Verona, Bellinzona, Zurich, Bern, Geneva. A full day, travel included.' },
};

export const enTempi = {
  normale: { nome: 'Standard', riga: 'The right amount of time to do things well' },
  veloce: { nome: 'Fast', riga: 'Priority lane · +20% on the one-off part' },
  calma: { nome: 'No rush', riga: 'We fit it in when we have space · −5%' },
};
