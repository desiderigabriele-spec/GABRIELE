/**
 * Richieste dal preventivo automatico del sito  →  Google Fogli + Telegram (+ email di riserva).
 * Anche le candidature della pagina «Chi siamo» (tipo: 'candidatura') arrivano qui: foglio "Candidature",
 * CV in PDF in una cartella Drive "Candidature", avviso su Telegram. Dopo aver incollato questa versione
 * serve una NUOVA distribuzione (e l'autorizzazione a Drive, che Google chiede la prima volta).
 * Va incollato in Estensioni → Apps Script di un foglio Google chiamato "Preventivi".
 * Poi: Distribuisci → Nuova distribuzione → App web (Esegui come: me · Accesso: chiunque)
 * e copia l'URL in PUBLIC_PREVENTIVO_ENDPOINT (variabile d'ambiente su Vercel).
 *
 * Proprietà dello script (Impostazioni progetto → Proprietà script):
 *   BOT_TOKEN  token del bot Telegram (da @BotFather)
 *   CHAT_ID    id della tua chat con il bot
 *   EMAIL      (facoltativo) email per la copia di riserva
 */
var COLONNE = ['Data e ora', 'Nome', 'Azienda', 'Settore', 'Email', 'Telefono', 'Preferisce', 'Servizi', 'Tempi',
  'Una tantum (€)', 'Al mese (€)', 'Sito attuale', 'Obiettivo', 'Progetto completo', 'Pagina', 'Stato', 'Note'];

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.botcheck) return out_({ success: true }); // bot: finto ok
    if (d.tipo === 'candidatura') return candidatura_(d);
    var r = {
      nome: cut_(d.nome, 80), azienda: cut_(d.azienda, 100), settore: cut_(d.settore, 100), email: cut_(d.email, 120),
      tel: cut_(d.telefono, 30), canale: cut_(d.canale, 20), servizi: cut_(d.servizi, 400), tempi: cut_(d.tempi, 40),
      una: Number(d.una) || 0, mese: Number(d.mese) || 0, sito: cut_(d.sito_attuale, 200), msg: cut_(d.messaggio, 1500),
      progetto: cut_(d.progetto, 4000), pagina: cut_(d.pagina, 200)
    };
    // il modulo chiede un solo contatto (telefono o email): basta che ce ne sia uno valido
    var telOk = String(r.tel).replace(/\D/g, '').length >= 6, mailOk = r.email.indexOf('@') > 0;
    if (!r.nome || (!telOk && !mailOk)) return out_({ success: false, error: 'dati' });
    if (!rateOk_()) return out_({ success: false, error: 'limite' });

    var salvata = true, errore = '';
    try {
      sheet_().appendRow([new Date(), r.nome, r.azienda, r.settore, r.email, r.tel, r.canale, r.servizi, r.tempi,
        r.una, r.mese, r.sito, r.msg, r.progetto, r.pagina, 'Da ricontattare', '']);
    } catch (err) { salvata = false; errore = String(err); }

    var tg = telegram_(r, salvata ? '' : '⚠️ Non salvata nel foglio: ' + errore);
    if (!tg || !salvata) mail_(r, errore);
    return out_({ success: salvata || tg, saved: salvata, telegram: tg });
  } catch (err) {
    return out_({ success: false, error: String(err) });
  }
}

function doGet() { return out_({ ok: true }); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function cut_(s, n) { return String(s == null ? '' : s).trim().slice(0, n); }
function esc_(s) { return String(s || '').replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
function eur_(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }

// massimo 20 richieste ogni 10 minuti (anti-spam)
function rateOk_() {
  var c = CacheService.getScriptCache(), n = Number(c.get('n') || 0);
  if (n >= 20) return false;
  c.put('n', String(n + 1), 600);
  return true;
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Preventivi') || ss.getSheets()[0];
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLONNE);
    sh.getRange(1, 1, 1, COLONNE.length).setFontWeight('bold').setBackground('#07070C').setFontColor('#FFB547');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
    sh.getRange('F:F').setNumberFormat('@');
  }
  return sh;
}

function waNum_(tel) {
  var d = String(tel).replace(/[^\d+]/g, '');
  if (d.charAt(0) === '+') return d.slice(1);
  if (d.slice(0, 2) === '00') return d.slice(2);
  return d.slice(0, 2) === '39' ? d : '39' + d;
}

function telegram_(r, avviso) {
  var p = PropertiesService.getScriptProperties(), token = p.getProperty('BOT_TOKEN'), chat = p.getProperty('CHAT_ID');
  if (!token || !chat) return false;
  var t = [
    '✦ <b>Nuovo preventivo dal sito</b>', '',
    '👤 <b>' + esc_(r.nome) + '</b>' + (r.azienda ? ' · ' + esc_(r.azienda) : ''),
    r.settore ? '🏷️ ' + esc_(r.settore) : '',
    '📞 ' + esc_(r.tel) + ' · preferisce: <b>' + esc_(r.canale || '-') + '</b>',
    '✉️ ' + esc_(r.email), '',
    '🧩 ' + esc_(r.servizi),
    '⏱️ ' + esc_(r.tempi),
    '💶 <b>' + eur_(r.una) + '</b> una tantum' + (r.mese ? ' + <b>' + eur_(r.mese) + '</b>/mese' : '')
  ];
  if (r.sito) t.push('🌐 ' + esc_(r.sito));
  if (r.msg) t.push('', '🎯 ' + esc_(r.msg));
  if (avviso) t.push('', esc_(avviso));
  try {
    var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({
        chat_id: chat, text: t.filter(function (x) { return x !== ''; }).join('\n'), parse_mode: 'HTML', disable_web_page_preview: true,
        reply_markup: { inline_keyboard: [[{ text: '💬 Scrivigli su WhatsApp', url: 'https://wa.me/' + waNum_(r.tel) }]] }
      })
    });
    return res.getResponseCode() === 200;
  } catch (e) { return false; }
}

function mail_(r, errore) {
  var to = PropertiesService.getScriptProperties().getProperty('EMAIL');
  if (!to) return;
  MailApp.sendEmail(to, 'Preventivo dal sito: ' + r.nome + (r.azienda ? ' (' + r.azienda + ')' : ''),
    r.progetto + (errore ? '\n\nErrore foglio: ' + errore : ''));
}

// ---------- candidature (pagina «Chi siamo») ----------
var COLONNE_CAND = ['Data e ora', 'Nome', 'Email', 'Ruolo', 'Link', 'Messaggio', 'CV', 'Pagina', 'Stato', 'Note'];

function candidatura_(d) {
  var r = { nome: cut_(d.nome, 80), email: cut_(d.email, 120), ruolo: cut_(d.ruolo, 80), link: cut_(d.link, 300),
    msg: cut_(d.messaggio, 2000), pagina: cut_(d.pagina, 200) };
  if (!r.nome || r.email.indexOf('@') < 1) return out_({ success: false, error: 'dati' });
  if (!rateOk_()) return out_({ success: false, error: 'limite' });

  var cv = '', errore = '';
  // il sito accetta solo PDF fino a 5 MB: qui si ricontrolla (in base64 5 MB sono circa 7 milioni di caratteri)
  if (d.cv && String(d.cv).length < 7200000) {
    try {
      var nomeFile = (r.nome + ' - ' + r.ruolo + ' - ' + cut_(d.cvNome, 80)).replace(/[\\/:*?"<>|]/g, ' ');
      var file = cartella_('Candidature').createFile(Utilities.newBlob(Utilities.base64Decode(d.cv), 'application/pdf', nomeFile));
      cv = file.getUrl();
    } catch (err) { errore = 'CV non salvato: ' + err; }
  }

  var salvata = true;
  try {
    foglio_('Candidature', COLONNE_CAND).appendRow([new Date(), r.nome, r.email, r.ruolo, r.link, r.msg, cv, r.pagina, 'Da leggere', '']);
  } catch (err) { salvata = false; errore += (errore ? ' · ' : '') + 'Non salvata nel foglio: ' + err; }

  var t = ['✦ <b>Nuova candidatura dal sito</b>', '', '👤 <b>' + esc_(r.nome) + '</b> · ' + esc_(r.ruolo), '✉️ ' + esc_(r.email)];
  if (r.link) t.push('🔗 ' + esc_(r.link));
  if (cv) t.push('📄 <a href="' + cv + '">CV su Drive</a>');
  if (r.msg) t.push('', esc_(r.msg));
  if (errore) t.push('', '⚠️ ' + esc_(errore));
  var tg = invia_(t.join('\n'));
  if (!tg || !salvata) {
    var to = PropertiesService.getScriptProperties().getProperty('EMAIL');
    if (to) MailApp.sendEmail(to, 'Candidatura dal sito: ' + r.ruolo + ' · ' + r.nome,
      [r.nome, r.email, r.ruolo, r.link, cv, '', r.msg, errore].filter(String).join('\n'));
  }
  return out_({ success: salvata || tg, saved: salvata, telegram: tg });
}

function foglio_(nome, colonne) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(nome) || ss.insertSheet(nome);
  if (sh.getLastRow() === 0) {
    sh.appendRow(colonne);
    sh.getRange(1, 1, 1, colonne.length).setFontWeight('bold').setBackground('#07070C').setFontColor('#FFB547');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  }
  return sh;
}

function cartella_(nome) {
  var it = DriveApp.getFoldersByName(nome);
  return it.hasNext() ? it.next() : DriveApp.createFolder(nome);
}

function invia_(testo) {
  var p = PropertiesService.getScriptProperties(), token = p.getProperty('BOT_TOKEN'), chat = p.getProperty('CHAT_ID');
  if (!token || !chat) return false;
  try {
    var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ chat_id: chat, text: testo, parse_mode: 'HTML', disable_web_page_preview: true })
    });
    return res.getResponseCode() === 200;
  } catch (e) { return false; }
}

// Prova completa (foglio + Telegram) senza passare dal sito: scegli la funzione e premi Esegui.
function provaCompleta() {
  var r = doPost({ postData: { contents: JSON.stringify({
    nome: 'Prova Completa', azienda: 'Test srl', settore: 'Azienda / PMI', email: 'prova@example.com', telefono: '333 0000000',
    canale: 'WhatsApp', servizi: 'Sito web (Presenza), Software con AI (AI su un processo)', tempi: 'Normale',
    una: 7380, mese: 249, messaggio: 'Prova automatica', progetto: 'Prova', pagina: 'test'
  }) } });
  Logger.log(r.getContent());
}

// Prova di una candidatura (foglio "Candidature" + Telegram, senza CV)
function provaCandidatura() {
  var r = doPost({ postData: { contents: JSON.stringify({
    tipo: 'candidatura', nome: 'Prova Candidatura', email: 'prova@example.com', ruolo: 'Social media manager',
    link: 'https://instagram.com/prova', messaggio: 'Prova automatica', pagina: 'test'
  }) } });
  Logger.log(r.getContent());
}
