/**
 * BARBERBRO - Sistema Gestione Slot Dinamici V2
 * 
 * LOGICA UNIFICATA:
 * - Un unico foglio: AppunTamenti
 * - Slot LIBERI: status='Libero', cn_ID vuoto, sv_ID vuoto
 * - Slot NON DISPONIBILI: status='Non Disponibile', cn_ID vuoto, sv_ID vuoto, notes con motivo assenza
 * - Slot PRENOTATI: status='Prenotato', cn_ID presente, sv_ID presente
 * - Da AppSheet: entri nello slot libero e lo assegni!
 * 
 * STRUTTURA AppunTamenti:
 * - at_ID: ID univoco slot/appuntamento
 * - at_startDateTime: Data e ora inizio (formato: gg/mm/aaaa HH:MM:SS)
 * - cn_ID: ID cliente (vuoto se libero o non disponibile)
 * - sv_ID: ID servizio (vuoto se libero o non disponibile, determina durata)
 * - or_ID: ID operatore
 * - at_status: 'Libero' o 'Non Disponibile' o 'Prenotato' o 'Completato' o 'Cancellato'
 * - at_notes: Note appuntamento (es: motivo assenza per slot Non Disponibile)
 * 
 * NOTA: at_assEndDateTime NON serve! Si calcola da: at_startDateTime + durata sv_ID
 */

// ============================================================================
// CONFIGURAZIONE BASE
// ============================================================================

// Cache globale per ottimizzazione performance
let CONFIG_CACHE = null;
let ASSENZE_CACHE = null;
let SERVIZI_CACHE = null;
let OPERATORI_CACHE = null;
let CONFIG_PWA_CACHE = null;
let CLIENTI_CACHE = null;

function getFoglio() {
  // Apre il foglio specifico per ID invece di usare getActiveSpreadsheet()
  // Questo garantisce che il deployment acceda sempre al foglio corretto
  const SPREADSHEET_ID = '1O-3CmzjiS0eY8l-ITfNKMtaiN1RZn9xB4wlZFpvFaFw';
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Resetta tutte le cache
 */
function resetCache() {
  CONFIG_CACHE = null;
  ASSENZE_CACHE = null;
  SERVIZI_CACHE = null;
  OPERATORI_CACHE = null;
  CONFIG_PWA_CACHE = null;
  CLIENTI_CACHE = null;
}

/**
 * Formatta una data nel formato gg/mm/aaaa HH:MM:SS
 */
function formattaData(data) {
  if (!data) return '';
  if (typeof data === 'string') return data;
  
  const d = new Date(data);
  const giorno = String(d.getDate()).padStart(2, '0');
  const mese = String(d.getMonth() + 1).padStart(2, '0');
  const anno = d.getFullYear();
  const ore = String(d.getHours()).padStart(2, '0');
  const minuti = String(d.getMinutes()).padStart(2, '0');
  const secondi = String(d.getSeconds()).padStart(2, '0');
  
  return `${giorno}/${mese}/${anno} ${ore}:${minuti}:${secondi}`;
}

/**
 * Invalida cache (chiamare dopo modifiche)
 */
function invalidateCache() {
  resetCache();
  Logger.log('✓ Cache invalidata');
}

/**
 * Carica configurazione in cache (1 sola lettura!)
 */
function loadConfigCache() {
  if (CONFIG_CACHE !== null) return CONFIG_CACHE;
  
  const ss = getFoglio();
  const configSheet = ss.getSheetByName('Configurazione');
  
  if (!configSheet) {
    throw new Error('Foglio Configurazione non trovato!');
  }
  
  const data = configSheet.getDataRange().getValues();
  CONFIG_CACHE = {};
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] && !data[i][0].startsWith('=')) {
      CONFIG_CACHE[data[i][0]] = data[i][1];
    }
  }
  
  return CONFIG_CACHE;
}

/**
 * Carica assenze in cache (1 sola lettura!)
 */
function loadAssenzeCache() {
  if (ASSENZE_CACHE !== null) return ASSENZE_CACHE;
  
  const ss = getFoglio();
  const sheet = ss.getSheetByName('AssenZe');
  
  if (!sheet) {
    ASSENZE_CACHE = [];
    return ASSENZE_CACHE;
  }
  
  const data = sheet.getDataRange().getValues();
  ASSENZE_CACHE = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[1]) {
      ASSENZE_CACHE.push({
        az_ID: row[0],
        or_ID: row[1],
        az_startDateTime: parseDateTime(row[2]),
        az_endDateTime: parseDateTime(row[3]),
        az_reason: row[4]
      });
    }
  }
  
  return ASSENZE_CACHE;
}

/**
 * Carica servizi in cache (1 sola lettura!)
 */
function loadServiziCache() {
  if (SERVIZI_CACHE !== null) return SERVIZI_CACHE;
  
  const ss = getFoglio();
  const sheet = ss.getSheetByName('SerVizi');
  
  if (!sheet) {
    SERVIZI_CACHE = {};
    return SERVIZI_CACHE;
  }
  
  const data = sheet.getDataRange().getValues();
  SERVIZI_CACHE = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {
      SERVIZI_CACHE[row[0]] = {
        sv_ID: row[0],
        sv_name: row[1],
        sv_category: row[2] || '', // Colonna C: categoria (Capelli, Barba)
        sv_price: row[3] || 0, // Colonna D: prezzo
        sv_duration: parseInt(row[4]) || 15, // Colonna E: durata
        sv_info: row[5] || '' // Colonna F: note/descrizione servizio
      };
    }
  }
  
  return SERVIZI_CACHE;
}

/**
 * Carica operatori in cache (1 sola lettura!)
 */
function loadOperatoriCache() {
  if (OPERATORI_CACHE !== null) return OPERATORI_CACHE;
  
  const ss = getFoglio();
  const sheet = ss.getSheetByName('OpeRatori');
  
  if (!sheet) {
    OPERATORI_CACHE = [];
    return OPERATORI_CACHE;
  }
  
  const config = loadConfigCache();
  const data = sheet.getDataRange().getValues();
  OPERATORI_CACHE = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[1] && (row[9] !== 'FALSE' && row[9] !== false)) {
      OPERATORI_CACHE.push({
        or_ID: row[0],
        or_name: row[1],
        or_workStart: row[5] || config['negozio_apertura'],
        or_workEnd: row[6] || config['negozio_chiusura'],
        or_breakStart: row[7] || '',
        or_breakEnd: row[8] || '',
        or_image: row[10] || '' // Colonna 10: link immagine operatore
      });
    }
  }
  
  return OPERATORI_CACHE;
}

/**
 * Carica configurazione PWA in cache
 */
function loadConfigPWACache() {
  if (CONFIG_PWA_CACHE !== null) return CONFIG_PWA_CACHE;
  
  const ss = getFoglio();
  const sheet = ss.getSheetByName('ConfigPWA');
  
  if (!sheet) {
    CONFIG_PWA_CACHE = {
      shop_name: 'BarberBro',
      shop_logo_url: '',
      primary_color: '#007AFF',
      primary_color_dark: '#0051D5',
      secondary_color: '#34C759',
      accent_color: '#C19A6B',
      background_color: '#F5F5F7',
      text_color: '#1D1D1F',
      text_secondary_color: '#86868B',
      phone_contact: '',
      address: '',
      maps_url: '',
      booking_days: 30,
      min_notice_hours: 2,
      show_ratings: false,
      require_phone: true,
      welcome_message: 'Benvenuto!'
    };
    return CONFIG_PWA_CACHE;
  }
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  CONFIG_PWA_CACHE = {};
  
  for (let i = 0; i < data.length; i++) {
    const key = data[i][0];
    let value = data[i][1];
    
    if (!key) continue;
    
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (!isNaN(value) && value !== '') value = Number(value);
    
    CONFIG_PWA_CACHE[key] = value;
  }
  
  return CONFIG_PWA_CACHE;
}

/**
 * Carica clienti in cache
 */
function loadClientiCache() {
  if (CLIENTI_CACHE !== null) return CLIENTI_CACHE;
  
  const ss = getFoglio();
  const sheet = ss.getSheetByName('Clienti');
  
  if (!sheet) {
    CLIENTI_CACHE = {};
    return CLIENTI_CACHE;
  }
  
  const data = sheet.getDataRange().getValues();
  CLIENTI_CACHE = {};
  
  // Struttura foglio Clienti:
  // A=cn_ID, B=cn_fullname, C=cn_sex, D=cn_phone, E=cn_email, F=cn_address, G=cn_birthday, ...L=cn_enablePWA
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {
      CLIENTI_CACHE[row[0]] = {
        cn_ID: row[0],           // Colonna A
        cn_name: row[1] || '',   // Colonna B (cn_fullname)
        cn_sex: row[2] || '',    // Colonna C
        cn_phone: row[3] || '',  // Colonna D
        cn_email: row[4] || '',  // Colonna E ← CORRETTO!
        cn_address: row[5] || '', // Colonna F
        cn_birthday: row[6] || '', // Colonna G
        cn_enablePWA: row[11] === 'SI' || row[11] === true, // Colonna L
        cn_lastLogin: row[12] || null, // Colonna M
        cn_totalBookings: parseInt(row[13]) || 0 // Colonna N
      };
    }
  }
  
  return CLIENTI_CACHE;
}

/**
 * Crea o aggiorna cliente nel foglio Clienti
 */
function salvaCliente(nome, telefono, email = '', enablePWA = false) {
  const ss = getFoglio();
  let sheet = ss.getSheetByName('Clienti');
  
  if (!sheet) {
    // Crea foglio Clienti se non esiste
    sheet = ss.insertSheet('Clienti');
    sheet.getRange(1, 1, 1, 7).setValues([
      ['cn_ID', 'cn_name', 'cn_phone', 'cn_email', 'cn_enablePWA', 'cn_lastLogin', 'cn_totalBookings']
    ]);
    sheet.getRange('A1:G1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(3, 120);
    sheet.setColumnWidth(4, 180);
    sheet.setColumnWidth(5, 100);
    sheet.setColumnWidth(6, 130);
    sheet.setColumnWidth(7, 120);
  }
  
  const data = sheet.getDataRange().getValues();
  
  // Cerca cliente esistente per telefono
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === telefono) {
      // Cliente già esistente, aggiorna
      const cnId = data[i][0];
      sheet.getRange(i + 1, 2).setValue(nome);
      sheet.getRange(i + 1, 4).setValue(email);
      // Non sovrascrivere cn_enablePWA se non specificato
      if (enablePWA !== false) {
        sheet.getRange(i + 1, 5).setValue(enablePWA ? 'SI' : 'NO');
      }
      CLIENTI_CACHE = null; // Invalida cache
      return cnId;
    }
  }
  
  // Nuovo cliente
  const cnId = 'CN' + Date.now();
  sheet.appendRow([
    cnId, 
    nome, 
    telefono, 
    email, 
    enablePWA ? 'SI' : 'NO', 
    '', 
    0
  ]);
  CLIENTI_CACHE = null; // Invalida cache
  
  return cnId;
}

/**
 * Trova cliente per telefono
 */
function trovaClientePerTelefono(telefono) {
  const clienti = loadClientiCache();
  
  for (const id in clienti) {
    if (clienti[id].cn_phone === telefono) {
      return clienti[id];
    }
  }
  
  return null;
}

/**
 * Trova cliente per email (per OAuth login)
 */
function trovaClientePerEmail(email) {
  if (!email) return null;
  
  const clienti = loadClientiCache();
  
  for (const id in clienti) {
    if (clienti[id].cn_email && clienti[id].cn_email.toLowerCase() === email.toLowerCase()) {
      return clienti[id];
    }
  }
  
  return null;
}

/**
 * Aggiorna data ultimo login cliente
 */
function aggiornaLastLogin(clienteId) {
  const ss = getFoglio();
  const sheet = ss.getSheetByName('Clienti');
  
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === clienteId) {
      const now = new Date();
      const formatted = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
      sheet.getRange(i + 1, 6).setValue(formatted); // Colonna F (cn_lastLogin)
      
      // Incrementa contatore prenotazioni
      const currentCount = parseInt(data[i][6]) || 0;
      sheet.getRange(i + 1, 7).setValue(currentCount + 1); // Colonna G (cn_totalBookings)
      
      CLIENTI_CACHE = null;
      return;
    }
  }
}

/**
 * Crea il foglio Configurazione se non esiste
 */
function setup() {
  const ss = getFoglio();
  let configSheet = ss.getSheetByName('Configurazione');
  
  if (!configSheet) {
    Logger.log('Creazione foglio Configurazione...');
    configSheet = ss.insertSheet('Configurazione');
    
    const config = [
      ['PARAMETRO', 'VALORE', 'DESCRIZIONE'],
      ['', '', ''],
      ['=== GENERAZIONE SLOT ===', '', ''],
      ['slot_periodo_settimane', '4', 'Numero di settimane in avanti per generare slot'],
      ['slot_durata_minima', '15', 'Durata slot minima in minuti (granularità)'],
      ['', '', ''],
      ['=== BUFFER TEMPO ===', '', ''],
      ['buffer_abilita', 'TRUE', 'Abilita buffer prima/dopo servizio (TRUE/FALSE)'],
      ['buffer_prima_default', '5', 'Minuti buffer PRIMA servizio (preparazione postazione)'],
      ['buffer_dopo_default', '10', 'Minuti buffer DOPO servizio (pulizia/sanificazione)'],
      ['', '', ''],
      ['=== ORARI NEGOZIO (DEFAULT) ===', '', ''],
      ['negozio_apertura', '08:00', 'Orario apertura negozio (default se operatore non specificato)'],
      ['negozio_chiusura', '19:30', 'Orario chiusura negozio (default se operatore non specificato)'],
      ['', '', ''],
      ['=== GIORNI LAVORATIVI (DEFAULT) ===', '', ''],
      ['lavora_lunedi', 'TRUE', ''],
      ['lavora_martedi', 'TRUE', ''],
      ['lavora_mercoledi', 'TRUE', ''],
      ['lavora_giovedi', 'TRUE', ''],
      ['lavora_venerdi', 'TRUE', ''],
      ['lavora_sabato', 'TRUE', ''],
      ['lavora_domenica', 'FALSE', ''],
      ['', '', ''],
      ['=== ALTRO ===', '', ''],
      ['ultima_generazione', '', 'Data ultima generazione slot (automatico)'],
      ['versione_script', '2.1', 'Versione script - Con buffer tempo']
    ];
    
    configSheet.getRange(1, 1, config.length, 3).setValues(config);
    
    // Formattazione
    configSheet.getRange('A1:C1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
    configSheet.setColumnWidth(1, 250);
    configSheet.setColumnWidth(2, 150);
    configSheet.setColumnWidth(3, 400);
    
    Logger.log('✅ Foglio Configurazione creato!');
    SpreadsheetApp.getUi().alert('✅ Foglio Configurazione creato!\n\nConfigura i parametri e poi esegui generaSlotCompleti()');
  } else {
    Logger.log('ℹ️ Foglio Configurazione già esistente');
    SpreadsheetApp.getUi().alert('ℹ️ Foglio Configurazione già esistente');
  }
}

/**
 * Crea il foglio ConfigPWA per la PWA multi-tenant
 * TUTTI I PARAMETRI CONFIGURABILI IN UN UNICO POSTO
 */
function setupConfigPWA() {
  const ss = getFoglio();
  let sheet = ss.getSheetByName('ConfigPWA');
  
  if (!sheet) {
    Logger.log('Creazione foglio ConfigPWA...');
    sheet = ss.insertSheet('ConfigPWA');
    
    const config = [
      // Header
      ['config_key', 'config_value', 'config_description'],
      ['', '', ''],
      
      // ========== SEZIONE 1: GENERALE ==========
      ['=== GENERALE ===', '', ''],
      ['shop_name', 'BarberBro Milano', 'Nome del negozio (mostrato in app)'],
      ['shop_logo_url', '', 'URL logo quadrato (500x500px, opzionale)'],
      ['shop_tagline', 'Il tuo stile, la nostra passione', 'Slogan/sottotitolo (max 60 caratteri)'],
      ['phone_contact', '+39 333 1234567', 'Telefono negozio con prefisso +39'],
      ['email_contact', 'info@barberbro.it', 'Email contatto negozio'],
      ['address', 'Via Roma 123, 20100 Milano MI', 'Indirizzo completo negozio'],
      ['maps_url', 'https://maps.google.com/?q=Via+Roma+123+Milano', 'Link Google Maps (copia da app Google Maps)'],
      ['instagram_url', 'https://instagram.com/barberbro', 'Link profilo Instagram (opzionale)'],
      ['facebook_url', '', 'Link pagina Facebook (opzionale)'],
      ['', '', ''],
      
      // ========== SEZIONE 2: SICUREZZA & OAUTH ==========
      ['=== SICUREZZA & OAUTH ===', '', ''],
      ['google_client_id', '', 'Google OAuth Client ID (da Google Cloud Console)'],
      ['token_expiry_hours', '24', 'Durata sessione utente in ore (default 24h)'],
      ['enable_auto_login', 'true', 'Ricorda utente loggato (true/false)'],
      ['require_email_verification', 'false', 'Richiedi verifica email OAuth (true/false)'],
      ['', '', ''],
      
      // ========== SEZIONE 3: COLORI & BRANDING ==========
      ['=== COLORI & BRANDING ===', '', ''],
      ['primary_color', '#007AFF', 'Colore primario UI (es: #007AFF iOS blue)'],
      ['secondary_color', '#34C759', 'Colore secondario (es: #34C759 green)'],
      ['accent_color', '#C19A6B', 'Colore accento (es: #C19A6B oro barbiere)'],
      ['background_color', '#F5F5F7', 'Colore sfondo app (es: #F5F5F7 grigio chiaro)'],
      ['text_color', '#1D1D1F', 'Colore testo principale (es: #1D1D1F quasi nero)'],
      ['', '', ''],
      
      // ========== SEZIONE 4: FUNZIONALITÀ UI ==========
      ['=== FUNZIONALITÀ UI ===', '', ''],
      ['show_quick_slots', 'true', 'Mostra pulsante "Mi sento fortunato" (true/false)'],
      ['show_prices', 'true', 'Mostra prezzi servizi in lista (true/false)'],
      ['show_operator_photos', 'false', 'Mostra foto operatori (richiede URL in OpeRatori)'],
      ['enable_operator_choice', 'true', 'Permetti scelta operatore (false = assegna automaticamente)'],
      ['show_ratings', 'false', 'Mostra valutazioni operatori (richiede campo rating)'],
      ['show_service_duration', 'true', 'Mostra durata servizi (es: "30 min")'],
      ['enable_my_bookings', 'true', 'Mostra sezione "Le Mie Prenotazioni" (true/false)'],
      ['', '', ''],
      
      // ========== SEZIONE 5: REGOLE PRENOTAZIONE ==========
      ['=== REGOLE PRENOTAZIONE ===', '', ''],
      ['booking_days_ahead', '30', 'Giorni prenotabili in avanti (numero, es: 30)'],
      ['min_notice_hours', '2', 'Ore minime preavviso prenotazione (es: 2 = blocca slot tra meno di 2h)'],
      ['max_bookings_per_day', '0', 'Max prenotazioni/giorno per cliente (0 = illimitato)'],
      ['require_phone', 'true', 'Telefono obbligatorio in form (true/false)'],
      ['require_email', 'false', 'Email obbligatoria in form (true/false)'],
      ['allow_notes', 'true', 'Permetti note cliente in prenotazione (true/false)'],
      ['', '', ''],
      
      // ========== SEZIONE 6: MESSAGGI & TESTI ==========
      ['=== MESSAGGI & TESTI ===', '', ''],
      ['welcome_message', 'Benvenuto! Prenota il tuo appuntamento in pochi tap 💈', 'Messaggio homepage (max 100 caratteri)'],
      ['success_booking_message', 'Prenotazione confermata! Ti aspettiamo 🎉', 'Messaggio dopo prenotazione'],
      ['login_required_message', 'Accedi con Google per prenotare', 'Testo pulsante login'],
      ['no_slots_message', 'Nessuno slot disponibile in questo periodo', 'Messaggio se no slot trovati'],
      ['booking_closed_message', 'Prenotazioni chiuse per manutenzione', 'Messaggio se sistema disabilitato'],
      ['', '', ''],
      
      // ========== SEZIONE 7: AVANZATE ==========
      ['=== AVANZATE ===', '', ''],
      ['enable_pwa', 'true', 'Sistema PWA attivo (false = mostra solo messaggio manutenzione)'],
      ['force_https', 'true', 'Forza redirect HTTPS (sicurezza)'],
      ['cache_config_minutes', '60', 'Durata cache configurazione in minuti (performance)'],
      ['debug_mode', 'false', 'Modalità debug (mostra log dettagliati, solo sviluppo)'],
      ['api_version', '2.0', 'Versione API (automatico, non modificare)']
    ];
    
    sheet.getRange(1, 1, config.length, 3).setValues(config);
    
    // Formattazione header
    sheet.getRange('A1:C1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
    
    // Formattazione sezioni (titoli in grassetto e sfondo grigio)
    const sectionRows = [3, 14, 20, 28, 36, 45, 52];
    sectionRows.forEach(row => {
      sheet.getRange(row, 1, 1, 3).setFontWeight('bold').setBackground('#E8EAED');
    });
    
    // Larghezza colonne
    sheet.setColumnWidth(1, 250);
    sheet.setColumnWidth(2, 350);
    sheet.setColumnWidth(3, 450);
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    Logger.log('✅ Foglio ConfigPWA creato con 50+ parametri!');
    SpreadsheetApp.getUi().alert('✅ Foglio ConfigPWA creato!\n\n📝 50+ parametri configurabili\n🎨 7 sezioni: Generale, OAuth, Colori, UI, Regole, Messaggi, Avanzate\n\n➡️ Personalizza i valori e salva.');
  } else {
    Logger.log('ℹ️ Foglio ConfigPWA già esistente');
    SpreadsheetApp.getUi().alert('ℹ️ Foglio ConfigPWA già esistente\n\nSe vuoi aggiornare alla nuova versione:\n1. Rinomina il foglio esistente in "ConfigPWA_OLD"\n2. Riesegui setupConfigPWA()\n3. Copia i valori personalizzati');
  }
}

/**
 * Crea foglio Guida_ConfigPWA con documentazione completa
 */
function setupGuidaConfigPWA() {
  const ss = getFoglio();
  let sheet = ss.getSheetByName('Guida_ConfigPWA');
  
  if (!sheet) {
    Logger.log('Creazione foglio Guida_ConfigPWA...');
    sheet = ss.insertSheet('Guida_ConfigPWA');
    
    const guida = [
      // Header
      ['PARAMETRO', 'TIPO', 'DESCRIZIONE COMPLETA', 'ESEMPIO', 'OBBLIGATORIO'],
      ['', '', '', '', ''],
      
      // ========== SEZIONE 1: GENERALE ==========
      ['=== GENERALE ===', '', '', '', ''],
      ['shop_name', 'Testo', 'Nome del negozio visualizzato nell\'app. Appare nella homepage, header e conferme prenotazione.', 'BarberBro Milano', 'SI'],
      ['shop_logo_url', 'URL', 'Link diretto a immagine logo (500x500px consigliato, formato PNG/JPG). Lascia vuoto per usare logo di default.', 'https://i.imgur.com/abc123.png', 'NO'],
      ['shop_tagline', 'Testo', 'Slogan o sottotitolo del negozio (max 60 caratteri). Mostrato sotto nome negozio nella homepage.', 'Il tuo stile, la nostra passione', 'NO'],
      ['phone_contact', 'Telefono', 'Numero telefono negozio con prefisso internazionale. Usato per link "Chiamaci" in app.', '+39 333 1234567', 'SI'],
      ['email_contact', 'Email', 'Email contatto negozio. Usata per assistenza clienti e footer app.', 'info@barberbro.it', 'SI'],
      ['address', 'Testo', 'Indirizzo completo: Via, CAP, Città, Provincia. Mostrato in pagina contatti.', 'Via Roma 123, 20100 Milano MI', 'SI'],
      ['maps_url', 'URL', 'Link Google Maps per navigazione. Ottieni da app Google Maps > Condividi > Copia link.', 'https://maps.google.com/?q=Via+Roma+123+Milano', 'NO'],
      ['instagram_url', 'URL', 'Link profilo Instagram (completo con https://). Icona cliccabile in footer app.', 'https://instagram.com/barberbro', 'NO'],
      ['facebook_url', 'URL', 'Link pagina Facebook (completo con https://). Icona cliccabile in footer app.', 'https://facebook.com/barberbro', 'NO'],
      ['', '', '', '', ''],
      
      // ========== SEZIONE 2: SICUREZZA & OAUTH ==========
      ['=== SICUREZZA & OAUTH ===', '', '', '', ''],
      ['google_client_id', 'OAuth', 'Google OAuth 2.0 Client ID. GUIDA SETUP:\n1. Vai su console.cloud.google.com\n2. Crea nuovo progetto\n3. API e Servizi > Credenziali\n4. Crea OAuth 2.0 Client ID\n5. Tipo: Applicazione web\n6. Origini JavaScript: https://script.google.com\n7. Copia Client ID (formato: xxx.apps.googleusercontent.com)', '123456789-abc.apps.googleusercontent.com', 'SI'],
      ['token_expiry_hours', 'Numero', 'Durata sessione utente in ore. Dopo questo tempo, l\'utente deve rifare login. Valori consigliati: 24 (1 giorno), 168 (1 settimana).', '24', 'SI'],
      ['enable_auto_login', 'Boolean', 'Se TRUE, l\'utente resta loggato anche chiudendo app. Se FALSE, deve rifare login ogni volta.', 'true', 'SI'],
      ['require_email_verification', 'Boolean', 'Se TRUE, accetta solo email verificate da Google OAuth. Se FALSE, accetta qualsiasi email OAuth.', 'false', 'NO'],
      ['', '', '', '', ''],
      
      // ========== SEZIONE 3: COLORI & BRANDING ==========
      ['=== COLORI & BRANDING ===', '', '', '', ''],
      ['primary_color', 'Colore HEX', 'Colore primario UI: pulsanti, header, link. Formato esadecimale con #. Usa https://htmlcolorcodes.com per scegliere.', '#007AFF', 'SI'],
      ['primary_color_dark', 'Colore HEX', 'Versione scura del colore primario per hover/gradienti. Consigliato: 20-30% più scuro di primary_color.', '#0051D5', 'NO'],
      ['secondary_color', 'Colore HEX', 'Colore secondario: badge, notifiche, stati attivi. Complementare a primary_color.', '#34C759', 'NO'],
      ['accent_color', 'Colore HEX', 'Colore accento: dettagli, highlight, icone speciali. Tipico: oro/bronzo per barbieri.', '#C19A6B', 'NO'],
      ['background_color', 'Colore HEX', 'Colore sfondo app. Consigliato: grigio molto chiaro (#F5F5F7) o bianco (#FFFFFF).', '#F5F5F7', 'NO'],
      ['text_color', 'Colore HEX', 'Colore testo principale. Consigliato: quasi nero (#1D1D1F) per leggibilità.', '#1D1D1F', 'NO'],
      ['text_secondary_color', 'Colore HEX', 'Colore testo secondario/sottotitoli. Consigliato: grigio medio (#86868B).', '#86868B', 'NO'],
      ['', '', '', '', ''],
      
      // ========== SEZIONE 4: FUNZIONALITÀ UI ==========
      ['=== FUNZIONALITÀ UI ===', '', '', '', ''],
      ['show_quick_slots', 'Boolean', 'Mostra pulsante "Mi sento fortunato" nella homepage. Mostra primi 10 slot disponibili senza filtri.', 'true', 'NO'],
      ['show_prices', 'Boolean', 'Mostra prezzi servizi nella lista. Se FALSE, prezzi nascosti (utile se prezzi variabili).', 'true', 'SI'],
      ['show_operator_photos', 'Boolean', 'Mostra foto operatori. RICHIEDE campo op_photo_url nel foglio OpeRatori.', 'false', 'NO'],
      ['enable_operator_choice', 'Boolean', 'Permetti scelta operatore. Se FALSE, sistema assegna automaticamente in base a disponibilità.', 'true', 'SI'],
      ['show_ratings', 'Boolean', 'Mostra valutazioni operatori (stelle). RICHIEDE campo op_rating nel foglio OpeRatori.', 'false', 'NO'],
      ['show_service_duration', 'Boolean', 'Mostra durata servizi (es: "30 min"). Se FALSE, durata nascosta.', 'true', 'NO'],
      ['enable_my_bookings', 'Boolean', 'Mostra sezione "Le Mie Prenotazioni" dove cliente vede storico. Se FALSE, nascosta.', 'true', 'NO'],
      ['', '', '', '', ''],
      
      // ========== SEZIONE 5: REGOLE PRENOTAZIONE ==========
      ['=== REGOLE PRENOTAZIONE ===', '', '', '', ''],
      ['booking_days_ahead', 'Numero', 'Quanti giorni in avanti può prenotare cliente. Es: 30 = può prenotare fino a 1 mese avanti.', '30', 'SI'],
      ['min_notice_hours', 'Numero', 'Ore minime preavviso. Es: 2 = blocca slot tra meno di 2h (evita prenotazioni last minute).', '2', 'SI'],
      ['max_bookings_per_day', 'Numero', 'Max prenotazioni al giorno per cliente. 0 = illimitato. Utile per evitare abusi.', '0', 'NO'],
      ['require_phone', 'Boolean', 'Telefono obbligatorio in form prenotazione. Consigliato: TRUE per conferme SMS future.', 'true', 'SI'],
      ['require_email', 'Boolean', 'Email obbligatoria in form. Se TRUE, cliente deve inserire email oltre a OAuth login.', 'false', 'NO'],
      ['allow_notes', 'Boolean', 'Permetti campo note cliente in prenotazione. Es: "Taglio corto", "Prima volta".', 'true', 'NO'],
      ['', '', '', '', ''],
      
      // ========== SEZIONE 6: MESSAGGI & TESTI ==========
      ['=== MESSAGGI & TESTI ===', '', '', '', ''],
      ['welcome_message', 'Testo', 'Messaggio homepage sotto logo (max 100 caratteri). Usa emoji per personalità!', 'Benvenuto! Prenota il tuo appuntamento 💈', 'SI'],
      ['success_booking_message', 'Testo', 'Messaggio dopo prenotazione confermata. Breve e positivo!', 'Prenotazione confermata! Ti aspettiamo 🎉', 'SI'],
      ['login_required_message', 'Testo', 'Testo pulsante login. Chiaro e rassicurante.', 'Accedi con Google per prenotare', 'SI'],
      ['no_slots_message', 'Testo', 'Messaggio se nessuno slot trovato. Suggerisci alternative o contatto.', 'Nessuno slot disponibile. Riprova domani!', 'NO'],
      ['booking_closed_message', 'Testo', 'Messaggio se sistema PWA disabilitato (enable_pwa=false). Es: per manutenzione.', 'Prenotazioni temporaneamente chiuse', 'NO'],
      ['', '', '', '', ''],
      
      // ========== SEZIONE 7: AVANZATE ==========
      ['=== AVANZATE ===', '', '', '', ''],
      ['enable_pwa', 'Boolean', 'Abilita/disabilita intero sistema PWA. Se FALSE, mostra solo booking_closed_message.', 'true', 'SI'],
      ['force_https', 'Boolean', 'Forza redirect HTTPS. Consigliato: TRUE per sicurezza OAuth.', 'true', 'SI'],
      ['cache_config_minutes', 'Numero', 'Durata cache configurazione in minuti. Valori alti = più veloce, ma modifiche ritardate.', '60', 'NO'],
      ['debug_mode', 'Boolean', 'Modalità debug: mostra log dettagliati in console. SOLO per sviluppo, mai in produzione!', 'false', 'NO'],
      ['api_version', 'Testo', 'Versione API (automatico). NON MODIFICARE MANUALMENTE.', '2.0', 'NO'],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      
      // ========== GUIDA SETUP GOOGLE OAUTH ==========
      ['=== 📖 GUIDA SETUP GOOGLE OAUTH ===', '', '', '', ''],
      ['PASSO 1', '', 'Vai su https://console.cloud.google.com', '', ''],
      ['PASSO 2', '', 'Clicca "Seleziona progetto" > "Nuovo progetto"', '', ''],
      ['PASSO 3', '', 'Nome progetto: "BarberBro PWA" (o nome negozio)', '', ''],
      ['PASSO 4', '', 'Clicca "Crea" e attendi 30 secondi', '', ''],
      ['PASSO 5', '', 'Menu hamburger (☰) > API e Servizi > Credenziali', '', ''],
      ['PASSO 6', '', 'Clicca "+ CREA CREDENZIALI" > ID client OAuth', '', ''],
      ['PASSO 7', '', 'Se chiesto, configura schermata consenso OAuth:', '', ''],
      ['', '', '  - Tipo utente: Esterno', '', ''],
      ['', '', '  - Nome app: "BarberBro PWA"', '', ''],
      ['', '', '  - Email assistenza: tua email', '', ''],
      ['', '', '  - Clicca "Salva e continua" fino a fine', '', ''],
      ['PASSO 8', '', 'Torna a "Credenziali" > "+ CREA CREDENZIALI" > ID client OAuth', '', ''],
      ['PASSO 9', '', 'Tipo applicazione: Applicazione web', '', ''],
      ['PASSO 10', '', 'Nome: "BarberBro Web Client"', '', ''],
      ['PASSO 11', '', 'Origini JavaScript autorizzate: Clicca "+ AGGIUNGI URI"', '', ''],
      ['', '', '  Aggiungi: https://script.google.com', '', ''],
      ['PASSO 12', '', 'URI reindirizzamento autorizzati: (lascia vuoto)', '', ''],
      ['PASSO 13', '', 'Clicca "CREA"', '', ''],
      ['PASSO 14', '', 'COPIA il "ID cliente" (formato: xxxxx.apps.googleusercontent.com)', '', ''],
      ['PASSO 15', '', 'Incolla in ConfigPWA > google_client_id', '', ''],
      ['PASSO 16', '', '✅ Setup completato! Testa login con email di prova.', '', '']
    ];
    
    sheet.getRange(1, 1, guida.length, 5).setValues(guida);
    
    // Formattazione header
    sheet.getRange('A1:E1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white').setFontSize(11);
    
    // Formattazione sezioni (titoli in grassetto e sfondo colorato)
    const sectionStyles = [
      { row: 3, color: '#FFF9C4' },   // Generale
      { row: 15, color: '#FFCCBC' },  // OAuth
      { row: 21, color: '#C5E1A5' },  // Colori
      { row: 28, color: '#B3E5FC' },  // UI
      { row: 37, color: '#F8BBD0' },  // Regole
      { row: 46, color: '#E1BEE7' },  // Messaggi
      { row: 53, color: '#FFCCBC' },  // Avanzate
      { row: 62, color: '#FFE082' }   // Guida OAuth
    ];
    
    sectionStyles.forEach(style => {
      sheet.getRange(style.row, 1, 1, 5)
        .setFontWeight('bold')
        .setBackground(style.color)
        .setFontSize(12);
    });
    
    // Larghezza colonne
    sheet.setColumnWidth(1, 220);
    sheet.setColumnWidth(2, 100);
    sheet.setColumnWidth(3, 500);
    sheet.setColumnWidth(4, 280);
    sheet.setColumnWidth(5, 100);
    
    // Freeze header
    sheet.setFrozenRows(1);
    
    // Wrap text colonna descrizione
    sheet.getRange('C:C').setWrap(true);
    
    // Allineamento
    sheet.getRange('E:E').setHorizontalAlignment('center');
    
    Logger.log('✅ Foglio Guida_ConfigPWA creato!');
    SpreadsheetApp.getUi().alert('✅ Guida_ConfigPWA creata!\n\n📖 Documentazione completa 50+ parametri\n🎨 Sezioni colorate per facile navigazione\n🔧 Guida step-by-step Google OAuth\n\n➡️ Leggi prima di configurare ConfigPWA!');
  } else {
    Logger.log('ℹ️ Foglio Guida_ConfigPWA già esistente');
    SpreadsheetApp.getUi().alert('ℹ️ Foglio Guida_ConfigPWA già esistente');
  }
}

/**
 * Legge un parametro dal foglio Configurazione (CACHED!)
 */
function getConfigParam(param) {
  const config = loadConfigCache(); // Usa cache!
  
  if (config.hasOwnProperty(param)) {
    return config[param];
  }
  
  Logger.log(`⚠️ Parametro ${param} non trovato`);
  return null;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Genera un ID univoco per slot/appuntamenti
 */
function generateId() {
  return Utilities.getUuid().substring(0, 8);
}

/**
 * Converte stringa HH:MM in minuti dall'inizio giornata
 */
function timeToMinutes(timeStr) {
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

/**
 * Formatta data in formato italiano gg/mm/aaaa HH:MM:SS
 */
function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Formatta solo la data: gg/mm/aaaa
 */
function formatDateOnly(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Verifica se un'assenza copre l'intera giornata lavorativa
 */
function isAssenzaGiornoIntero(assenza, orarioInizio, orarioFine) {
  // Estrae ore di inizio e fine assenza
  const assenzaOreInizio = assenza.az_startDateTime.getHours() * 60 + assenza.az_startDateTime.getMinutes();
  const assenzaOreFine = assenza.az_endDateTime.getHours() * 60 + assenza.az_endDateTime.getMinutes();
  
  // Confronta con orario lavorativo (es: 08:00-19:30)
  const lavoroInizio = timeToMinutes(orarioInizio);
  const lavoroFine = timeToMinutes(orarioFine);
  
  // Se copre almeno dall'inizio alla fine del turno → giorno intero
  return assenzaOreInizio <= lavoroInizio && assenzaOreFine >= lavoroFine;
}

/**
 * Parse data dal formato italiano gg/mm/aaaa HH:MM:SS
 */
function parseDateTime(dateStr) {
  const parts = dateStr.split(' ');
  const dateParts = parts[0].split('/');
  const timeParts = parts[1].split(':');
  
  return new Date(
    parseInt(dateParts[2]), // anno
    parseInt(dateParts[1]) - 1, // mese (0-based)
    parseInt(dateParts[0]), // giorno
    parseInt(timeParts[0]), // ore
    parseInt(timeParts[1]), // minuti
    parseInt(timeParts[2]) // secondi
  );
}

// ============================================================================
// LETTURA DATI
// ============================================================================

/**
 * Ottiene le assenze di un operatore (CACHED!)
 */
function getAssenzeOperatore(operatoreId, dataInizio, dataFine) {
  const assenze = loadAssenzeCache(); // Usa cache!
  const risultato = [];
  
  for (let i = 0; i < assenze.length; i++) {
    if (assenze[i].or_ID === operatoreId) {
      // Controlla sovrapposizione
      if (assenze[i].az_endDateTime >= dataInizio && assenze[i].az_startDateTime <= dataFine) {
        risultato.push(assenze[i]);
      }
    }
  }
  
  return risultato;
}

/**
 * Verifica se operatore è in assenza (CACHED!)
 */
function isOperatoreInAssenza(operatoreId, data) {
  const assenze = loadAssenzeCache(); // Usa cache!
  
  for (let i = 0; i < assenze.length; i++) {
    if (assenze[i].or_ID === operatoreId) {
      if (data >= assenze[i].az_startDateTime && data <= assenze[i].az_endDateTime) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Verifica se operatore è in assenza e restituisce l'oggetto assenza con motivo (CACHED!)
 */
function isOperatoreInAssenzaConMotivo(operatoreId, data) {
  const assenze = loadAssenzeCache(); // Usa cache!
  
  for (let i = 0; i < assenze.length; i++) {
    if (assenze[i].or_ID === operatoreId) {
      if (data >= assenze[i].az_startDateTime && data <= assenze[i].az_endDateTime) {
        return assenze[i]; // Restituisce oggetto completo con az_reason
      }
    }
  }
  
  return null; // Nessuna assenza
}

/**
 * Verifica se un giorno è lavorativo (CACHED!)
 */
function isGiornoLavorativo(data) {
  const config = loadConfigCache(); // Usa cache!
  const giorni = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'];
  const giornoSettimana = giorni[data.getDay()];
  const paramName = `lavora_${giornoSettimana}`;
  const valore = config[paramName];
  
  return valore === 'TRUE' || valore === true;
}

// ============================================================================
// GENERAZIONE SLOT
// ============================================================================

/**
 * Genera tutti gli slot liberi per il periodo configurato
 * LOGICA: Crea slot con status='Libero' in AppunTamenti
 * OTTIMIZZATO: Usa cache per configurazione e assenze (1 sola lettura foglio!)
 */
function generaSlotCompleti() {
  const startTime = new Date();
  
  const ss = getFoglio();
  const sheetAppuntamenti = ss.getSheetByName('AppunTamenti');
  
  if (!sheetAppuntamenti) {
    throw new Error('Foglio AppunTamenti non trovato!');
  }
  
  Logger.log('=== INIZIO GENERAZIONE SLOT ===');
  
  // STEP 1: Cancella slot LIBERI e NON DISPONIBILI esistenti
  const appuntamentiData = sheetAppuntamenti.getDataRange().getValues();
  const header = appuntamentiData[0];
  const righeDaMantenere = [header];
  let slotCancellati = 0;
  
  for (let i = 1; i < appuntamentiData.length; i++) {
    const status = appuntamentiData[i][5];
    if (status !== 'Libero' && status !== 'Non Disponibile') {
      righeDaMantenere.push(appuntamentiData[i]);
    } else {
      slotCancellati++;
    }
  }
  
  if (slotCancellati > 0) {
    sheetAppuntamenti.clear();
    if (righeDaMantenere.length > 0) {
      sheetAppuntamenti.getRange(1, 1, righeDaMantenere.length, righeDaMantenere[0].length).setValues(righeDaMantenere);
    }
  }
  
  // STEP 2: PRECARICA CACHE (ottimizzazione!)
  resetCache();
  loadConfigCache();
  loadAssenzeCache();
  loadServiziCache();
  loadOperatoriCache();
  
  const settimane = parseInt(getConfigParam('slot_periodo_settimane') || 4);
  const durataSlot = parseInt(getConfigParam('slot_durata_minima') || 15);
  
  const dataInizio = new Date();
  dataInizio.setHours(0, 0, 0, 0);
  
  const dataFine = new Date(dataInizio);
  dataFine.setDate(dataFine.getDate() + (settimane * 7));
  
  const operatori = loadOperatoriCache();
  
  if (operatori.length === 0) {
    throw new Error('Nessun operatore attivo trovato!');
  }
  
  // Prepara array per nuovi slot
  const nuoviSlot = [];
  let slotGenerati = 0;
  let giorniProcessati = 0;
  
  // PRIMA: Genera slot di ASSENZA (1 slot unico per periodo)
  Logger.log('\n>> STEP A: Generazione slot assenze (1 per periodo)...');
  const assenzeCache = loadAssenzeCache();
  let assenzeGenerate = 0;
  
  assenzeCache.forEach(assenza => {
    // Controlla se l'assenza è nel periodo di generazione
    if (assenza.az_endDateTime >= dataInizio && assenza.az_startDateTime <= dataFine) {
      // Trova operatore per verificare se è giorno intero
      const operatore = operatori.find(op => op.or_ID === assenza.or_ID);
      let noteAssenza;
      
      // Controlla se stessa data (giorno singolo) o più giorni
      const stessaData = assenza.az_startDateTime.toDateString() === assenza.az_endDateTime.toDateString();
      
      if (stessaData && operatore && isAssenzaGiornoIntero(assenza, operatore.or_workStart, operatore.or_workEnd)) {
        // Assenza a giornata intera singola: "Motivo - Il gg/mm/aaaa"
        noteAssenza = `${assenza.az_reason || 'Non disponibile'} - Il ${formatDateOnly(assenza.az_startDateTime)}`;
      } else if (!stessaData) {
        // Assenza su più giorni: "Motivo - Dal gg/mm/aaaa al gg/mm/aaaa"
        noteAssenza = `${assenza.az_reason || 'Non disponibile'} - Dal ${formatDateOnly(assenza.az_startDateTime)} al ${formatDateOnly(assenza.az_endDateTime)}`;
      } else {
        // Assenza parziale: "Motivo - Dal gg/mm/aaaa HH:MM al gg/mm/aaaa HH:MM" (inline format)
        const formatShort = (d) => {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${day}/${month}/${year} ${hours}:${minutes}`;
        };
        noteAssenza = `${assenza.az_reason || 'Non disponibile'} - Dal ${formatShort(assenza.az_startDateTime)} al ${formatShort(assenza.az_endDateTime)}`;
      }
      
      nuoviSlot.push([
        generateId(), // at_ID
        formatDateTime(assenza.az_startDateTime), // at_startDateTime (inizio assenza)
        '', // cn_ID (vuoto)
        '', // sv_ID (vuoto)
        assenza.or_ID, // or_ID
        'Non Disponibile', // at_status
        noteAssenza // at_notes con periodo e motivo
      ]);
      
      assenzeGenerate++;
    }
  });
  
  // POI: Genera slot LIBERI normali
  operatori.forEach(operatore => {
    let currentDate = new Date(dataInizio);
    let giorniOperatore = 0;
    
    while (currentDate <= dataFine) {
      if (!isGiornoLavorativo(currentDate)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      // Genera slot per il giorno
      const minutiInizio = timeToMinutes(operatore.or_workStart);
      const minutiFine = timeToMinutes(operatore.or_workEnd);
      const minutiPausaInizio = operatore.or_breakStart ? timeToMinutes(operatore.or_breakStart) : null;
      const minutiPausaFine = operatore.or_breakEnd ? timeToMinutes(operatore.or_breakEnd) : null;
      
      let minutiCurrent = minutiInizio;
      let slotGiorno = 0;
      
      while (minutiCurrent < minutiFine) {
        // Salta pausa
        if (minutiPausaInizio && minutiCurrent >= minutiPausaInizio && minutiCurrent < minutiPausaFine) {
          minutiCurrent = minutiPausaFine;
          continue;
        }
        
        // Crea slot LIBERO
        const slotStart = new Date(currentDate);
        slotStart.setHours(0, minutiCurrent, 0, 0);
        
        // SALTA questo slot se coperto da assenza (già creato nello STEP A)
        if (!isOperatoreInAssenza(operatore.or_ID, slotStart)) {
          nuoviSlot.push([
            generateId(), // at_ID
            formatDateTime(slotStart), // at_startDateTime
            '', // cn_ID (vuoto per slot libero)
            '', // sv_ID (vuoto per slot libero)
            operatore.or_ID, // or_ID
            'Libero', // at_status
            '' // at_notes
          ]);
          slotGiorno++;
          slotGenerati++;
        }
        
        minutiCurrent += durataSlot;
      }
      
      Logger.log(`   ${currentDate.toLocaleDateString()}: ${slotGiorno} slot generati`);
      giorniOperatore++;
      giorniProcessati++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });
  
  // Scrivi slot in AppunTamenti
  if (nuoviSlot.length > 0) {
    const ultimaRiga = sheetAppuntamenti.getLastRow();
    sheetAppuntamenti.getRange(ultimaRiga + 1, 1, nuoviSlot.length, 7).setValues(nuoviSlot);
    
    // Aggiorna data ultima generazione
    const configSheet = ss.getSheetByName('Configurazione');
    const configData = configSheet.getDataRange().getValues();
    for (let i = 0; i < configData.length; i++) {
      if (configData[i][0] === 'ultima_generazione') {
        configSheet.getRange(i + 1, 2).setValue(formatDateTime(new Date()));
        break;
      }
    }
  }
  
  // STEP 4: Archiviazione automatica
  const archiviati = archiviaAppuntamentiVecchi(1);
  
  // Tempo esecuzione
  const endTime = new Date();
  const tempoEsecuzione = ((endTime - startTime) / 1000).toFixed(2);
  
  Logger.log(`✅ Completato in ${tempoEsecuzione}s: ${nuoviSlot.length} slot, ${archiviati} archiviati`);
  
  SpreadsheetApp.getUi().alert(`✅ Generazione completata in ${tempoEsecuzione}s!\n\nSlot cancellati: ${slotCancellati}\nSlot generati: ${nuoviSlot.length}\nAppuntamenti archiviati: ${archiviati}`);
  
  return nuoviSlot.length;
}

// ============================================================================
// ARCHIVIAZIONE AUTOMATICA
// ============================================================================

/**
 * Archivia appuntamenti completati/cancellati passati
 * Mantiene AppunTamenti leggero per performance ottimali
 * 
 * @param {number} giorniStorico - Appuntamenti più vecchi di N giorni (default: 1 = ieri)
 */
function archiviaAppuntamentiVecchi(giorniStorico = 1) {
  const ss = getFoglio();
  const sheetAppuntamenti = ss.getSheetByName('AppunTamenti');
  let sheetStorico = ss.getSheetByName('Storico');
  
  if (!sheetAppuntamenti) {
    throw new Error('Foglio AppunTamenti non trovato!');
  }
  
  // Crea foglio Storico se non esiste
  if (!sheetStorico) {
    Logger.log('Creazione foglio Storico...');
    sheetStorico = ss.insertSheet('Storico');
    
    // Copia header da AppunTamenti
    const header = sheetAppuntamenti.getRange(1, 1, 1, 7).getValues();
    sheetStorico.getRange(1, 1, 1, 7).setValues(header);
    sheetStorico.getRange('A1:G1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  }
  
  // Calcola data limite (N giorni fa, inizio giornata)
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0); // Inizio di oggi (8 ottobre 00:00)
  
  // dataLimite = inizio di oggi (include tutto ieri)
  // Se oggi è 8 ottobre, archivia < 8 ottobre 00:00 (tutto il 7 incluso)
  const dataLimite = new Date(oggi);
  
  Logger.log(`📅 Data limite archiviazione: ${formatDateTime(dataLimite)} (appuntamenti prima di questa data)`);
  
  // Leggi appuntamenti
  const ultimaRiga = sheetAppuntamenti.getLastRow();
  const ultimaColonna = sheetAppuntamenti.getLastColumn();
  
  if (ultimaRiga < 2) {
    Logger.log('ℹ️ Nessun appuntamento presente in AppunTamenti');
    return 0;
  }
  
  Logger.log(`📊 Analisi ${ultimaRiga - 1} appuntamenti...`);
  
  const appuntamentiData = sheetAppuntamenti.getRange(2, 1, ultimaRiga - 1, ultimaColonna).getValues();
  const righeStorico = [];
  const righeDaMantenere = [sheetAppuntamenti.getRange(1, 1, 1, ultimaColonna).getValues()[0]];
  
  let archiviati = 0;
  let completatiTrovati = 0;
  let vecchiTrovati = 0;
  
  for (let i = 0; i < appuntamentiData.length; i++) {
    const row = appuntamentiData[i];
    
    if (!row[0] || !row[1]) continue;
    
    let atStart;
    try {
      atStart = parseDateTime(row[1]);
    } catch (e) {
      Logger.log(`⚠️ Errore parsing data riga ${i + 2}: ${row[1]}`);
      righeDaMantenere.push(row); // Mantieni in caso di errore
      continue;
    }
    
    const atStatus = row[5];
    
    // Stati da archiviare: Completato, Cancellato, Non Presentato, Annullato
    const daArchiviare = ['Completato', 'Cancellato', 'Non Presentato', 'Annullato'];
    const isArchiviabile = daArchiviare.includes(atStatus);
    
    if (isArchiviabile) {
      completatiTrovati++;
      if (atStart < dataLimite) {
        vecchiTrovati++;
      }
    }
    
    // Archivia se vecchio E con stato archiviabile
    if (atStart < dataLimite && isArchiviabile) {
      righeStorico.push(row);
      archiviati++;
    } else {
      righeDaMantenere.push(row);
    }
  }
  
  if (archiviati === 0) {
    Logger.log(`ℹ️ Nessun appuntamento da archiviare. Completati trovati: ${completatiTrovati}, Vecchi: ${vecchiTrovati}`);
    return 0;
  }
  
  // Scrivi nello Storico
  const ultimaRigaStorico = sheetStorico.getLastRow();
  sheetStorico.getRange(ultimaRigaStorico + 1, 1, righeStorico.length, 7).setValues(righeStorico);
  
  // Riscrivi AppunTamenti senza le righe archiviate
  sheetAppuntamenti.clear();
  sheetAppuntamenti.getRange(1, 1, righeDaMantenere.length, righeDaMantenere[0].length).setValues(righeDaMantenere);
  
  Logger.log(`✅ Archiviati ${archiviati} appuntamenti su Storico (Completati: ${completatiTrovati}, Vecchi: ${vecchiTrovati})`);
  return archiviati;
}

/**
 * Archiviazione automatica con conferma utente
 * Da usare manualmente o con trigger periodico
 */
/**
 * Menu: Gestione accessi PWA clienti
 */
function menuGestisciAccessiPWA() {
  const ss = getFoglio();
  const sheet = ss.getSheetByName('Clienti');
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('❌ Foglio Clienti non trovato!\n\nCrea prima il foglio Clienti.');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    SpreadsheetApp.getUi().alert('ℹ️ Nessun cliente in anagrafica!\n\nAggiungi clienti prima di gestire accessi PWA.');
    return;
  }
  
  // Prepara lista clienti
  let messaggio = '📋 GESTIONE ACCESSI PWA\n\n';
  messaggio += 'Clienti in anagrafica:\n\n';
  
  let clientiCount = 0;
  let abilitatiCount = 0;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const nome = row[1] || 'Nome mancante';
    const email = row[3] || 'Email mancante';
    const enablePWA = row[4] === 'SI' || row[4] === true;
    const status = enablePWA ? '✅ ABILITATO' : '❌ DISABILITATO';
    
    messaggio += `${i}. ${nome} (${email}) - ${status}\n`;
    clientiCount++;
    if (enablePWA) abilitatiCount++;
  }
  
  messaggio += `\n📊 TOTALE: ${clientiCount} clienti\n`;
  messaggio += `✅ Abilitati PWA: ${abilitatiCount}\n`;
  messaggio += `❌ Disabilitati: ${clientiCount - abilitatiCount}\n\n`;
  messaggio += '⚠️ Per modificare lo stato:\n';
  messaggio += '1. Vai sul foglio "Clienti"\n';
  messaggio += '2. Modifica colonna "cn_enablePWA" (SI/NO)\n';
  messaggio += '3. Salva\n\n';
  messaggio += 'Oppure usa menu:\n';
  messaggio += '- "Abilita TUTTI" per accesso globale\n';
  messaggio += '- "Disabilita TUTTI" per blocco emergenza';
  
  SpreadsheetApp.getUi().alert(messaggio);
}

/**
 * Menu: Abilita TUTTI i clienti per PWA
 */
function menuAbilitaTuttiClienti() {
  const ui = SpreadsheetApp.getUi();
  const risposta = ui.alert(
    '✅ Abilita TUTTI i Clienti PWA',
    'Sei sicuro di voler ABILITARE l\'accesso PWA per TUTTI i clienti in anagrafica?\n\n' +
    'Tutti i clienti con email potranno fare login e prenotare online.',
    ui.ButtonSet.YES_NO
  );
  
  if (risposta === ui.Button.YES) {
    const count = toggleTuttiClientiPWA(true);
    ui.alert(`✅ ${count} clienti abilitati PWA!\n\nPossono ora fare login con Google e prenotare online.`);
    CLIENTI_CACHE = null; // Invalida cache
  }
}

/**
 * Menu: Disabilita TUTTI i clienti per PWA
 */
function menuDisabilitaTuttiClienti() {
  const ui = SpreadsheetApp.getUi();
  const risposta = ui.alert(
    '❌ Disabilita TUTTI i Clienti PWA',
    '⚠️ ATTENZIONE! Questa azione disabiliterà l\'accesso PWA per TUTTI i clienti.\n\n' +
    'Usala SOLO in caso di emergenza (es: manutenzione sistema).\n\n' +
    'Sei sicuro di voler procedere?',
    ui.ButtonSet.YES_NO
  );
  
  if (risposta === ui.Button.YES) {
    const count = toggleTuttiClientiPWA(false);
    ui.alert(`❌ ${count} clienti disabilitati PWA.\n\nNessuno potrà più fare login o prenotare online.`);
    CLIENTI_CACHE = null; // Invalida cache
  }
}

/**
 * Helper: Abilita/Disabilita tutti clienti PWA
 */
function toggleTuttiClientiPWA(enable) {
  const ss = getFoglio();
  const sheet = ss.getSheetByName('Clienti');
  
  if (!sheet) return 0;
  
  const data = sheet.getDataRange().getValues();
  let count = 0;
  
  for (let i = 1; i < data.length; i++) {
    const email = data[i][3];
    if (email) { // Solo clienti con email
      sheet.getRange(i + 1, 5).setValue(enable ? 'SI' : 'NO'); // Colonna E (cn_enablePWA)
      count++;
    }
  }
  
  return count;
}

function menuArchiviaAppuntamenti() {
  const ui = SpreadsheetApp.getUi();
  const risposta = ui.alert(
    '📦 Archiviazione Appuntamenti',
    'Vuoi archiviare gli appuntamenti completati/cancellati di IERI e precedenti?\n\n' +
    'Questo migliora le performance mantenendo AppunTamenti leggero.\n\n' +
    'Gli appuntamenti verranno spostati nel foglio "Storico".',
    ui.ButtonSet.YES_NO
  );
  
  if (risposta === ui.Button.YES) {
    const archiviati = archiviaAppuntamentiVecchi(1); // 1 giorno = ieri
    ui.alert(`✅ Archiviazione completata!\n\n${archiviati} appuntamenti spostati in Storico.`);
  }
}

// ============================================================================
// QUERY SLOT DISPONIBILI
// ============================================================================

/**
 * Ottiene TUTTI gli slot liberi nel range di date specificato
 * Usato quando servizioId non è specificato (caricamento iniziale PWA)
 * 
 * @param {Date} dataInizio - Data inizio range
 * @param {Date} dataFine - Data fine range
 * @param {string} operatoreId - ID operatore (opzionale, filtra per operatore)
 * @return {Array} Array di tutti gli slot con status='Libero'
 */
function getAllFreeSlots(dataInizio, dataFine, operatoreId = null) {
  const ss = getFoglio();
  const sheetAppuntamenti = ss.getSheetByName('AppunTamenti');
  
  if (!sheetAppuntamenti) {
    throw new Error('Foglio AppunTamenti non trovato!');
  }
  
  const ultimaRiga = sheetAppuntamenti.getLastRow();
  if (ultimaRiga < 2) return [];
  
  // Leggi TUTTE le righe del foglio (max 7 colonne)
  const range = sheetAppuntamenti.getRange(2, 1, ultimaRiga - 1, 7);
  const data = range.getValues();
  
  Logger.log(`📊 getAllFreeSlots: Righe totali nel foglio: ${data.length}`);
  
  const slotsLiberi = [];
  let countStatus = { Libero: 0, Prenotato: 0, NonDisponibile: 0, Altro: 0 };
  let countFuoriRange = 0;
  
  // Parse date inizio e fine per confronto
  const dataInizioMs = dataInizio.getTime();
  const dataFineMs = dataFine.getTime();
  
  Logger.log(`📅 Range richiesto: ${formattaData(dataInizio)} - ${formattaData(dataFine)}`);
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    const at_ID = row[0];
    const at_startDateTime = row[1];
    const cn_ID = row[2];
    const sv_ID = row[3];
    const or_ID = row[4];
    const at_status = row[5];
    const at_notes = row[6];
    
    // Conta status
    if (at_status === 'Libero') countStatus.Libero++;
    else if (at_status === 'Prenotato') countStatus.Prenotato++;
    else if (at_status === 'Non Disponibile') countStatus.NonDisponibile++;
    else countStatus.Altro++;
    
    // Salta slot non liberi
    if (at_status !== 'Libero') continue;
    
    // Filtra per operatore se specificato
    if (operatoreId && or_ID !== operatoreId) continue;
    
    // Parse data dello slot
    let slotDate;
    if (at_startDateTime instanceof Date) {
      slotDate = at_startDateTime;
    } else if (typeof at_startDateTime === 'string') {
      slotDate = parseDateTime(at_startDateTime);
    } else {
      continue; // Salta se data non valida
    }
    
    // Filtra per range di date
    const slotMs = slotDate.getTime();
    if (slotMs < dataInizioMs || slotMs > dataFineMs) {
      countFuoriRange++;
      continue;
    }
    
    // Aggiungi slot all'array
    slotsLiberi.push({
      at_ID: at_ID,
      at_startDateTime: formattaData(slotDate),
      cn_ID: cn_ID || '',
      sv_ID: sv_ID || '',
      or_ID: or_ID,
      at_status: at_status,
      at_notes: at_notes || ''
    });
  }
  
  Logger.log(`📊 Status: Libero=${countStatus.Libero}, Prenotato=${countStatus.Prenotato}, NonDisp=${countStatus.NonDisponibile}, Altro=${countStatus.Altro}`);
  Logger.log(`📅 Slot Liberi fuori range: ${countFuoriRange}`);
  Logger.log(`✅ Slot Liberi nel range: ${slotsLiberi.length}`);
  
  return slotsLiberi;
}

/**
 * Ottiene slot disponibili per un servizio in una specifica data
 * OTTIMIZZATO: Pre-parsing date, raggruppamento operatori, O(n log n), cache servizi
 * Considera buffer prima/dopo se abilitato
 * 
 * @param {string} servizioId - ID del servizio
 * @param {Date|string} data - Data target
 * @param {string} operatoreId - ID operatore (opzionale)
 * @return {Array} Array di slot disponibili
 */
function getSlotDisponibili(servizioId, data, operatoreId = null) {
  const ss = getFoglio();
  const sheetAppuntamenti = ss.getSheetByName('AppunTamenti');
  
  if (!sheetAppuntamenti) {
    throw new Error('Foglio AppunTamenti non trovato!');
  }
  
  // 1. Ottieni durata servizio (DA CACHE!)
  const servizi = loadServiziCache();
  const servizio = servizi[servizioId];
  
  if (!servizio) {
    throw new Error(`Servizio ${servizioId} non trovato!`);
  }
  
  const durataServizio = servizio.sv_duration;
  
  // 2. Controlla se buffer abilitato e calcola durata totale
  const config = loadConfigCache();
  const bufferAbilitato = config['buffer_abilita'] === 'TRUE' || config['buffer_abilita'] === true;
  const bufferPrima = bufferAbilitato ? (parseInt(config['buffer_prima_default']) || 0) : 0;
  const bufferDopo = bufferAbilitato ? (parseInt(config['buffer_dopo_default']) || 0) : 0;
  const durataTotale = durataServizio + bufferPrima + bufferDopo;
  const durataSlotMin = parseInt(config['slot_durata_minima']) || 15;
  
  // 3. Parse data target
  const dataTarget = typeof data === 'string' ? parseDateTime(data) : data;
  const dataInizio = new Date(dataTarget);
  dataInizio.setHours(0, 0, 0, 0);
  const dataFine = new Date(dataTarget);
  dataFine.setHours(23, 59, 59, 999);
  
  // 4. Leggi appuntamenti (OTTIMIZZATO: solo righe con dati)
  const ultimaRiga = sheetAppuntamenti.getLastRow();
  if (ultimaRiga < 2) return []; // Solo header
  
  const appuntamentiData = sheetAppuntamenti.getRange(2, 1, ultimaRiga - 1, 7).getValues();
  
  // 5. PRE-PARSING: Parse tutte le date UNA VOLTA (OTTIMIZZAZIONE CRITICA!)
  const slotsParsed = [];
  for (let i = 0; i < appuntamentiData.length; i++) {
    const row = appuntamentiData[i];
    const atStart = parseDateTime(row[1]);
    
    // Filtra subito per data target
    if (atStart >= dataInizio && atStart <= dataFine) {
      slotsParsed.push({
        id: row[0],
        datetime: row[1],
        start: atStart,
        orId: row[4],
        status: row[5]
      });
    }
  }
  
  // 6. RAGGRUPPA per operatore (OTTIMIZZAZIONE!)
  const slotPerOperatore = {};
  for (let i = 0; i < slotsParsed.length; i++) {
    const slot = slotsParsed[i];
    
    // Filtra operatore se specificato
    if (operatoreId && slot.orId !== operatoreId) continue;
    
    if (!slotPerOperatore[slot.orId]) {
      slotPerOperatore[slot.orId] = [];
    }
    slotPerOperatore[slot.orId].push(slot);
  }
  
  // 7. Per ogni operatore, ordina e cerca slot consecutivi
  const slotLiberi = [];
  
  Object.keys(slotPerOperatore).forEach(opId => {
    const slotsOp = slotPerOperatore[opId];
    
    // ORDINA UNA VOLTA (O(n log n))
    slotsOp.sort((a, b) => a.start - b.start);
    
    // Scansione lineare O(n)
    for (let i = 0; i < slotsOp.length; i++) {
      const slot = slotsOp[i];
      
      if (slot.status !== 'Libero') continue;
      
      // Conta slot consecutivi liberi
      let minutiDisponibili = durataSlotMin;
      
      for (let j = i + 1; j < slotsOp.length; j++) {
        const next = slotsOp[j];
        
        // Calcola differenza in minuti
        const diffMin = (next.start - slot.start) / 60000;
        
        // Verifica consecutività: differenza deve essere esattamente = minutiDisponibili
        if (next.status === 'Libero' && diffMin === minutiDisponibili) {
          minutiDisponibili += durataSlotMin;
          
          if (minutiDisponibili >= durataTotale) {
            break; // Abbastanza spazio trovato
          }
        } else {
          break; // Interrotto da slot occupato o gap temporale
        }
      }
      
      // Se c'è abbastanza tempo (servizio + buffer), aggiungi
      if (minutiDisponibili >= durataTotale) {
        slotLiberi.push({
          at_ID: slot.id,
          at_startDateTime: slot.datetime,
          or_ID: opId,
          minutiDisponibili: minutiDisponibili,
          minutiNecessari: durataTotale
        });
      }
    }
  });
  
  return slotLiberi;
}

/**
 * Ottiene servizi compatibili con uno slot (hanno durata che ci sta)
 * OTTIMIZZATO: Pre-parsing date, scansione lineare
 * Considera buffer se abilitato
 * 
 * @param {string} slotId - ID dello slot
 * @param {string} operatoreId - ID operatore (opzionale)
 * @return {Array} Array di servizi compatibili
 */
function getServiziCompatibili(slotId, operatoreId = null) {
  const ss = getFoglio();
  const sheetAppuntamenti = ss.getSheetByName('AppunTamenti');
  const sheetServizi = ss.getSheetByName('SerVizi');
  
  if (!sheetAppuntamenti || !sheetServizi) {
    throw new Error('Fogli AppunTamenti o SerVizi non trovati!');
  }
  
  // 1. Leggi configurazione buffer
  const config = loadConfigCache();
  const bufferAbilitato = config['buffer_abilita'] === 'TRUE' || config['buffer_abilita'] === true;
  const bufferPrima = bufferAbilitato ? (parseInt(config['buffer_prima_default']) || 0) : 0;
  const bufferDopo = bufferAbilitato ? (parseInt(config['buffer_dopo_default']) || 0) : 0;
  const durataSlotMin = parseInt(config['slot_durata_minima']) || 15;
  
  // 2. Trova lo slot e calcola minuti disponibili (OTTIMIZZATO: solo righe necessarie)
  const ultimaRiga = sheetAppuntamenti.getLastRow();
  if (ultimaRiga < 2) return [];
  
  const appuntamentiData = sheetAppuntamenti.getRange(2, 1, ultimaRiga - 1, 7).getValues();
  let slotStart = null;
  let slotOperatore = null;
  let minutiDisponibili = 0;
  let slotIndex = -1;
  
  // Trova lo slot target
  for (let i = 0; i < appuntamentiData.length; i++) {
    if (appuntamentiData[i][0] === slotId) {
      slotStart = parseDateTime(appuntamentiData[i][1]);
      slotOperatore = appuntamentiData[i][4];
      slotIndex = i;
      break;
    }
  }
  
  if (slotIndex === -1) {
    return [];
  }
  
  // Conta slot consecutivi liberi (OTTIMIZZATO: pre-parse date)
  const slotsParsed = [];
  for (let i = slotIndex; i < appuntamentiData.length; i++) {
    const row = appuntamentiData[i];
    const atStart = parseDateTime(row[1]);
    
    // Solo stesso operatore e stesso giorno
    if (row[4] === slotOperatore && atStart.toDateString() === slotStart.toDateString()) {
      slotsParsed.push({
        start: atStart,
        status: row[5]
      });
    } else if (atStart.toDateString() !== slotStart.toDateString()) {
      break; // Cambiato giorno
    }
  }
  
  // Ordina e calcola consecutività
  slotsParsed.sort((a, b) => a.start - b.start);
  minutiDisponibili = durataSlotMin;
  
  for (let i = 1; i < slotsParsed.length; i++) {
    const prev = slotsParsed[i - 1];
    const curr = slotsParsed[i];
    const diffMin = (curr.start - prev.start) / 60000;
    
    if (curr.status === 'Libero' && diffMin === durataSlotMin) {
      minutiDisponibili += durataSlotMin;
    } else {
      break;
    }
  }
  
  // 3. Filtra servizi che ci stanno (DA CACHE!)
  const servizi = loadServiziCache();
  const serviziCompatibili = [];
  
  for (const svId in servizi) {
    const servizio = servizi[svId];
    const durataTotale = servizio.sv_duration + bufferPrima + bufferDopo;
    
    if (durataTotale <= minutiDisponibili) {
      serviziCompatibili.push({
        sv_ID: servizio.sv_ID,
        sv_name: servizio.sv_name,
        sv_price: servizio.sv_price,
        sv_duration: servizio.sv_duration,
        durata_con_buffer: durataTotale
      });
    }
  }
  
  return serviziCompatibili;
}

/**
 * API wrapper per getServiziCompatibili
 */
function apiGetServiziCompatibili(slotId, operatoreId = null) {
  try {
    const servizi = getServiziCompatibili(slotId, operatoreId);
    return {
      success: true,
      servizi: servizi
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// MENU E UI
// ============================================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 BarberBro')
    .addItem('⚙️ Setup Configurazione', 'setup')
    .addItem('🎨 Setup ConfigPWA', 'setupConfigPWA')
    .addItem('� Crea Guida ConfigPWA', 'setupGuidaConfigPWA')
    .addSeparator()
    .addSubMenu(ui.createMenu('🔐 Gestione Accessi PWA')
      .addItem('👥 Abilita/Disabilita Clienti', 'menuGestisciAccessiPWA')
      .addItem('✅ Abilita TUTTI i Clienti', 'menuAbilitaTuttiClienti')
      .addItem('❌ Disabilita TUTTI i Clienti', 'menuDisabilitaTuttiClienti'))
    .addSeparator()
    .addItem('�🔄 Genera Slot', 'generaSlotCompleti')
    .addItem('🗑️ Reset Cache', 'invalidateCache')
    .addSeparator()
    .addItem('📦 Archivia Appuntamenti Vecchi', 'menuArchiviaAppuntamenti')
    .addToUi();
}

/**
 * Installa trigger per caricare menu automaticamente all'apertura
 * ESEGUI QUESTA FUNZIONE UNA VOLTA dal menu Run (tasto Play)
 */
function installaTriggerMenu() {
  // Rimuovi trigger esistenti per evitare duplicati
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onOpen') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Crea nuovo trigger onOpen
  ScriptApp.newTrigger('onOpen')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();
  
  SpreadsheetApp.getUi().alert('✅ Trigger installato!\n\nIl menu "🔧 BarberBro" apparirà automaticamente ogni volta che apri il foglio.\n\nRicarica la pagina per vederlo subito.');
  
  // Carica menu immediatamente
  onOpen();
}

/**
 * Installa trigger automatico per archiviazione giornaliera
 * ESEGUI QUESTA FUNZIONE UNA VOLTA dal menu Run (tasto Play)
 * Archivia automaticamente ogni notte alle 02:00
 */
function installaTriggerArchiviazione() {
  // Rimuovi trigger esistenti per evitare duplicati
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'archiviazioneAutomatica') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Crea trigger giornaliero alle 02:00
  ScriptApp.newTrigger('archiviazioneAutomatica')
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .create();
  
  SpreadsheetApp.getUi().alert('✅ Trigger archiviazione installato!\n\nGli appuntamenti completati/cancellati verranno archiviati automaticamente ogni notte alle 02:00.\n\nPuoi anche usare il menu "📦 Archivia Appuntamenti Vecchi" per archiviare manualmente.');
  
  Logger.log('✅ Trigger archiviazione giornaliera installato (ore 02:00)');
}

/**
 * Funzione chiamata dal trigger automatico
 */
function archiviazioneAutomatica() {
  Logger.log('🕒 Avvio archiviazione automatica...');
  try {
    const archiviati = archiviaAppuntamentiVecchi(1); // Archivia appuntamenti di ieri
    Logger.log(`✅ Archiviazione automatica completata: ${archiviati} appuntamenti archiviati`);
  } catch (error) {
    Logger.log(`❌ Errore archiviazione automatica: ${error.message}`);
  }
}

// ============================================================================
// API WEB APP REST (per PWA e AppSheet)
// ============================================================================

// ============================================================================
// OAUTH & SICUREZZA
// ============================================================================

/**
 * Genera sessionToken per cliente autenticato
 */
function generaSessionToken(clienteId, email) {
  const token = Utilities.getUuid();
  const config = loadConfigPWACache();
  const expiryHours = parseInt(config.token_expiry_hours) || 24;
  const expirySeconds = expiryHours * 60 * 60;
  
  const tokenData = {
    clienteId: clienteId,
    email: email,
    createdAt: new Date().getTime()
  };
  
  const cache = CacheService.getScriptCache();
  cache.put('token_' + token, JSON.stringify(tokenData), expirySeconds);
  
  Logger.log(`✅ Token generato per ${email}, valido ${expiryHours}h`);
  
  return token;
}

/**
 * Verifica validità sessionToken (middleware)
 * Lancia errore se token invalido/scaduto
 */
function verificaToken(authHeader) {
  if (!authHeader) {
    throw new Error('UNAUTHORIZED:Token mancante');
  }
  
  // Estrai token da "Bearer TOKEN" o token diretto
  let token = authHeader;
  
  // Se ha formato "Bearer TOKEN", estrai solo il token
  if (authHeader.includes(' ')) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    } else {
      throw new Error('UNAUTHORIZED:Formato token invalido');
    }
  }
  
  // Verifica che il token non sia vuoto
  if (!token || token.trim() === '') {
    throw new Error('UNAUTHORIZED:Token vuoto');
  }
  
  const cache = CacheService.getScriptCache();
  const tokenDataStr = cache.get('token_' + token);
  
  if (!tokenDataStr) {
    throw new Error('UNAUTHORIZED:Token scaduto o invalido');
  }
  
  const tokenData = JSON.parse(tokenDataStr);
  
  // Verifica che il cliente sia ancora abilitato
  const cliente = trovaClientePerEmail(tokenData.email);
  if (!cliente || !cliente.cn_enablePWA) {
    throw new Error('FORBIDDEN:Accesso PWA disabilitato');
  }
  
  return tokenData; // Ritorna dati utente
}

/**
 * API: Login con Google OAuth (riceve email verificata)
 */
function apiLogin(email) {
  try {
    if (!email) {
      return {
        success: false,
        error: 'Email obbligatoria',
        errorCode: 'MISSING_EMAIL'
      };
    }
    
    // Cerca cliente per email
    const cliente = trovaClientePerEmail(email);
    
    if (!cliente) {
      return {
        success: false,
        error: 'Email non registrata in anagrafica. Contatta il barbiere per registrarti.',
        errorCode: 'EMAIL_NOT_FOUND'
      };
    }
    
    // Verifica abilitazione PWA
    if (!cliente.cn_enablePWA) {
      return {
        success: false,
        error: 'Accesso PWA non abilitato. Contatta il barbiere per abilitare il tuo account.',
        errorCode: 'PWA_DISABLED'
      };
    }
    
    // Genera token sessione
    const token = generaSessionToken(cliente.cn_ID, email);
    
    // Aggiorna ultimo login
    aggiornaLastLogin(cliente.cn_ID);
    
    Logger.log(`✅ Login riuscito: ${email}`);
    
    return {
      success: true,
      token: token,
      user: {
        id: cliente.cn_ID,
        name: cliente.cn_name,
        email: cliente.cn_email,
        phone: cliente.cn_phone
      }
    };
    
  } catch (error) {
    Logger.log(`❌ Login error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      errorCode: 'LOGIN_ERROR'
    };
  }
}

/**
 * Endpoint GET per Web App - API REST completa per PWA
 */
function doGet(e) {
  // Supporta sia 'endpoint' (PWA) che 'action' (AppSheet legacy)
  const action = e.parameter.endpoint || e.parameter.action;
  
  // CORS Headers per accesso pubblico
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    let result = {};
    
    // Endpoint pubblici (non richiedono autenticazione)
    const publicEndpoints = ['config', 'login'];
    const requiresAuth = !publicEndpoints.includes(action);
    
    // Verifica token per endpoint protetti
    let userData = null;
    if (requiresAuth) {
      try {
        const authHeader = e.parameter.authorization || e.parameter.Authorization;
        userData = verificaToken(authHeader);
      } catch (authError) {
        const errorMsg = authError.message;
        
        if (errorMsg.startsWith('UNAUTHORIZED')) {
          return output.setContent(JSON.stringify({
            success: false,
            error: errorMsg.replace('UNAUTHORIZED:', ''),
            errorCode: 'UNAUTHORIZED',
            statusCode: 401
          }));
        }
        
        if (errorMsg.startsWith('FORBIDDEN')) {
          return output.setContent(JSON.stringify({
            success: false,
            error: errorMsg.replace('FORBIDDEN:', ''),
            errorCode: 'FORBIDDEN',
            statusCode: 403
          }));
        }
        
        throw authError;
      }
    }
    
    switch(action) {
      // ========== ENDPOINT PUBBLICI ==========
      
      // Configurazione PWA multi-tenant
      case 'config':
        result = apiGetConfig();
        break;
      
      // Login con Google OAuth
      case 'login':
        result = apiLogin(e.parameter.email);
        break;
      
      // ========== ENDPOINT PROTETTI (richiedono token) ==========
      
      // Lista servizi disponibili
      case 'servizi':
        result = apiGetServizi();
        break;
      
      // Lista operatori attivi
      case 'operatori':
        result = apiGetOperatori();
        break;
      
      // Slot disponibili con filtri
      case 'slot':
        result = apiGetSlot(e.parameter);
        break;
      
      // Prenotazioni per telefono cliente
      case 'prenotazioni':
        result = apiGetPrenotazioni(e.parameter.phone || userData.email);
        break;
      
      // Dati cliente per telefono (returning customer)
      case 'cliente':
        result = apiGetCliente(e.parameter.phone || userData.email);
        break;
      
      // Servizi compatibili per slot
      case 'servizi-compatibili':
        result = apiGetServiziCompatibili(e.parameter.slotId, e.parameter.operatoreId);
        break;
      
      // Prenotazione (supporto anche GET per evitare CORS preflight)
      case 'prenota':
        result = apiCreaPrenotazione(e.parameter, userData);
        break;
      
      // Cancellazione (supporto anche GET per evitare CORS preflight)
      case 'cancella':
        result = apiCancellaPrenotazione(e.parameter.appointmentId, e.parameter.phone);
        break;
      
      // Legacy support (compatibilità AppSheet)
      case 'getSlotDisponibili':
        const slots = getSlotDisponibili(e.parameter.servizioId, e.parameter.data, e.parameter.operatoreId || null);
        result = { success: true, slots: slots };
        break;
      
      case 'getServiziCompatibili':
        result = apiGetServiziCompatibili(e.parameter.slotId, e.parameter.operatoreId);
        break;
      
      default:
        result = {
          success: false,
          error: 'Action non valida',
          available_actions: ['config', 'login', 'servizi', 'operatori', 'slot', 'prenotazioni', 'cliente', 'servizi-compatibili', 'prenota', 'cancella']
        };
    }
    
    return output.setContent(JSON.stringify(result));
    
  } catch (error) {
    return output.setContent(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }));
  }
}

/**
 * Endpoint POST per creare prenotazioni
 */
function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // Verifica token per autenticazione
    let userData = null;
    try {
      const authHeader = data.authorization || e.parameter?.authorization;
      userData = verificaToken(authHeader);
    } catch (authError) {
      // Se fallisce auth, continua senza userData (gestito dalle funzioni API)
      Logger.log('⚠️ POST senza auth valida:', authError.message);
    }
    
    let result = {};
    
    switch(action) {
      case 'prenota':
        result = apiCreaPrenotazione(data, userData);
        break;
      
      case 'cancella':
        result = apiCancellaPrenotazione(data.appointmentId, data.phone);
        break;
      
      default:
        result = {
          success: false,
          error: 'Action non valida',
          available_actions: ['prenota', 'cancella']
        };
    }
    
    return output.setContent(JSON.stringify(result));
    
  } catch (error) {
    return output.setContent(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }));
  }
}

// ============================================================================
// FUNZIONI API REST
// ============================================================================

/**
 * API: Restituisce configurazione PWA
 */
function apiGetConfig() {
  try {
    const config = loadConfigPWACache();
    return {
      success: true,
      config: config
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Restituisce dati cliente per telefono
 */
function apiGetCliente(phone) {
  try {
    if (!phone) {
      throw new Error('Telefono obbligatorio');
    }
    
    const cliente = trovaClientePerTelefono(phone);
    
    if (!cliente) {
      return {
        success: true,
        found: false,
        message: 'Cliente non trovato'
      };
    }
    
    // Trova ultima prenotazione
    const ss = getFoglio();
    const sheet = ss.getSheetByName('AppunTamenti');
    
    let ultimaPrenotazione = null;
    let operatoreFrequente = null;
    let servizioFrequente = null;
    
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      const prenotazioni = [];
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[2] === cliente.cn_ID && row[5] === 'Completato') {
          prenotazioni.push({
            dateTime: row[1],
            serviceId: row[3],
            operatorId: row[4]
          });
        }
      }
      
      if (prenotazioni.length > 0) {
        // Ordina per data (più recente prima)
        prenotazioni.sort((a, b) => {
          const dateA = parseDataOra(a.dateTime);
          const dateB = parseDataOra(b.dateTime);
          return dateB - dateA;
        });
        
        ultimaPrenotazione = prenotazioni[0];
        
        // Calcola operatore e servizio più frequenti
        const operatori = {};
        const servizi = {};
        
        prenotazioni.forEach(p => {
          operatori[p.operatorId] = (operatori[p.operatorId] || 0) + 1;
          servizi[p.serviceId] = (servizi[p.serviceId] || 0) + 1;
        });
        
        operatoreFrequente = Object.keys(operatori).reduce((a, b) => operatori[a] > operatori[b] ? a : b);
        servizioFrequente = Object.keys(servizi).reduce((a, b) => servizi[a] > servizi[b] ? a : b);
      }
    }
    
    return {
      success: true,
      found: true,
      customer: {
        id: cliente.cn_ID,
        name: cliente.cn_name,
        phone: cliente.cn_phone,
        email: cliente.cn_email
      },
      preferences: {
        lastBooking: ultimaPrenotazione,
        favoriteOperator: operatoreFrequente,
        favoriteService: servizioFrequente
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Restituisce lista servizi
 */
function apiGetServizi() {
  try {
    const servizi = loadServiziCache();
    const serviziArray = [];
    
    for (const id in servizi) {
      serviziArray.push({
        id: id,
        name: servizi[id].sv_name,
        category: servizi[id].sv_category || '',
        duration: servizi[id].sv_duration,
        price: servizi[id].sv_price,
        info: servizi[id].sv_info || '' // Nuovo campo note/descrizione
      });
    }
    
    return {
      success: true,
      servizi: serviziArray
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Restituisce lista operatori attivi
 */
function apiGetOperatori() {
  try {
    const operatori = loadOperatoriCache();
    const operatoriArray = operatori.map(op => ({
      id: op.or_ID,
      name: op.or_name,
      workStart: op.or_workStart,
      workEnd: op.or_workEnd,
      breakStart: op.or_breakStart,
      breakEnd: op.or_breakEnd,
      image: op.or_image || '' // Nuovo campo immagine operatore
    }));
    
    return {
      success: true,
      operatori: operatoriArray
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Restituisce slot disponibili con filtri avanzati
 * Parametri: servizioId (opzionale), dataInizio, dataFine, operatoreId (opzionale), fascia (opzionale)
 * Se servizioId non è specificato, restituisce TUTTI gli slot liberi
 */
function apiGetSlot(params) {
  try {
    const servizioId = params.servizioId || null;
    const operatoreId = params.operatoreId || null;
    const fascia = params.fascia; // 'morning', 'afternoon', 'evening'
    
    // Parse date di inizio e fine
    let dataInizioDate = new Date();
    let dataFineDate = new Date();
    dataFineDate.setDate(dataFineDate.getDate() + 365); // Default 365 giorni (1 anno)
    
    if (params.dataInizio) {
      dataInizioDate = parseDateTime(params.dataInizio);
    }
    if (params.dataFine) {
      dataFineDate = parseDateTime(params.dataFine);
    }
    
    // Se NON c'è servizioId, carica TUTTI gli slot liberi dal foglio
    if (!servizioId) {
      const tuttiSlots = getAllFreeSlots(dataInizioDate, dataFineDate, operatoreId);
      
      // Filtra per fascia oraria se richiesto
      let slotsFiltrati = tuttiSlots;
      if (fascia && tuttiSlots.length > 0) {
        slotsFiltrati = tuttiSlots.filter(slot => {
          if (!slot.at_startDateTime || typeof slot.at_startDateTime !== 'string') {
            return false;
          }
          
          const parts = slot.at_startDateTime.split(' ');
          if (parts.length < 2) return false;
          
          const timeParts = parts[1].split(':');
          if (timeParts.length < 1) return false;
          
          const ora = parseInt(timeParts[0]);
          if (fascia === 'morning') return ora >= 8 && ora < 12;
          if (fascia === 'afternoon') return ora >= 12 && ora < 18;
          if (fascia === 'evening') return ora >= 18 && ora < 21;
          return true;
        });
      }
      
      return {
        success: true,
        slots: slotsFiltrati,
        total: slotsFiltrati.length,
        filters: { 
          servizioId: 'all', 
          dataInizio: formattaData(dataInizioDate), 
          dataFine: formattaData(dataFineDate), 
          operatoreId 
        }
      };
    }
    
    // Se c'è servizioId, usa il metodo originale
    // Raccogli tutti gli slot nel range di date
    const tuttiSlots = [];
    const giorniRange = Math.ceil((dataFineDate - dataInizioDate) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= giorniRange; i++) {
      const dataCorrente = new Date(dataInizioDate);
      dataCorrente.setDate(dataCorrente.getDate() + i);
      
      // getSlotDisponibili accetta (servizioId, data, operatoreId)
      const slotsGiorno = getSlotDisponibili(servizioId, dataCorrente, operatoreId);
      tuttiSlots.push(...slotsGiorno);
    }
    
    // Filtra per fascia oraria se richiesto
    let slotsFiltrati = tuttiSlots;
    if (fascia && tuttiSlots.length > 0) {
      slotsFiltrati = tuttiSlots.filter(slot => {
        // Verifica che at_startDateTime esista e sia una stringa
        if (!slot.at_startDateTime || typeof slot.at_startDateTime !== 'string') {
          return false;
        }
        
        const parts = slot.at_startDateTime.split(' ');
        if (parts.length < 2) return false;
        
        const timeParts = parts[1].split(':');
        if (timeParts.length < 1) return false;
        
        const ora = parseInt(timeParts[0]);
        if (fascia === 'morning') return ora >= 8 && ora < 12;
        if (fascia === 'afternoon') return ora >= 12 && ora < 18;
        if (fascia === 'evening') return ora >= 18 && ora < 21;
        return true;
      });
    }
    
    return {
      success: true,
      slots: slotsFiltrati,  // Usa 'slots' (plurale) come da frontend
      total: slotsFiltrati.length,
      filters: { 
        servizioId, 
        dataInizio: formattaData(dataInizioDate), 
        dataFine: formattaData(dataFineDate), 
        operatoreId, 
        fascia 
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Restituisce prenotazioni cliente per telefono
 */
function apiGetPrenotazioni(phone) {
  try {
    if (!phone) {
      throw new Error('Telefono obbligatorio');
    }
    
    // Trova cliente per telefono
    const cliente = trovaClientePerTelefono(phone);
    
    if (!cliente) {
      return {
        success: true,
        prenotazioni: [],
        total: 0,
        message: 'Nessun cliente trovato con questo telefono'
      };
    }
    
    const ss = getFoglio();
    const sheet = ss.getSheetByName('AppunTamenti');
    
    if (!sheet) {
      throw new Error('Foglio AppunTamenti non trovato');
    }
    
    const data = sheet.getDataRange().getValues();
    const prenotazioni = [];
    const servizi = loadServiziCache();
    const operatori = loadOperatoriCache();
    
    // Colonne: at_ID | at_startDateTime | cn_ID | sv_ID | or_ID | at_status | at_notes
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const cnId = row[2];
      
      // Cerca prenotazioni del cliente
      if (cnId === cliente.cn_ID) {
        const status = row[5];
        // Solo prenotazioni attive e future
        if (status === 'Prenotato' || status === 'Confermato') {
          const svId = row[3];
          const orId = row[4];
          
          prenotazioni.push({
            id: row[0],
            dateTime: row[1],
            serviceId: svId,
            serviceName: servizi[svId] ? servizi[svId].sv_name : 'N/A',
            operatorId: orId,
            operatorName: operatori.find(o => o.or_ID === orId)?.or_name || 'N/A',
            status: status,
            notes: row[6] || ''
          });
        }
      }
    }
    
    // Ordina per data (più vicine prima)
    prenotazioni.sort((a, b) => {
      const dateA = parseDataOra(a.dateTime);
      const dateB = parseDataOra(b.dateTime);
      return dateA - dateB;
    });
    
    return {
      success: true,
      customer: {
        id: cliente.cn_ID,
        name: cliente.cn_name,
        phone: cliente.cn_phone,
        email: cliente.cn_email
      },
      prenotazioni: prenotazioni,
      total: prenotazioni.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Crea nuova prenotazione
 * Data: { slotId, servizioId, operatoreId, customerName, customerPhone, customerEmail (opt) }
 * userData: Dati utente autenticato dal token (contiene clienteId)
 */
function apiCreaPrenotazione(data, userData = null) {
  try {
    const { slotId, servizioId, operatoreId, customerName, customerPhone, customerEmail } = data;
    
    if (!slotId || !servizioId || !customerName || !customerPhone) {
      throw new Error('Campi obbligatori: slotId, servizioId, customerName, customerPhone');
    }
    
    // Usa il cliente autenticato se disponibile, altrimenti cerca/crea
    let cnId;
    if (userData && userData.clienteId) {
      // Cliente autenticato via PWA - usa il suo ID
      cnId = userData.clienteId;
      Logger.log(`✅ Usa cliente autenticato: ${cnId} (${userData.email})`);
      
      // Aggiorna eventualmente telefono se diverso
      const cliente = trovaClientePerEmail(userData.email);
      if (cliente && cliente.cn_phone !== customerPhone) {
        Logger.log(`📝 Aggiorno telefono cliente: ${cliente.cn_phone} → ${customerPhone}`);
        salvaCliente(customerName, customerPhone, customerEmail || userData.email);
      }
    } else {
      // Cliente da form (no auth) - cerca/crea per telefono
      cnId = salvaCliente(customerName, customerPhone, customerEmail || '');
      Logger.log(`📝 Cliente salvato/aggiornato: ${cnId}`);
    }
    
    const ss = getFoglio();
    const sheet = ss.getSheetByName('AppunTamenti');
    
    if (!sheet) {
      throw new Error('Foglio AppunTamenti non trovato');
    }
    
    const dataSheet = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    // Trova lo slot
    for (let i = 1; i < dataSheet.length; i++) {
      if (dataSheet[i][0] === slotId) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error('Slot non trovato');
    }
    
    // Verifica che sia libero
    const status = dataSheet[rowIndex - 1][5];
    if (status !== 'Libero') {
      throw new Error('Slot non disponibile (status: ' + status + ')');
    }
    
    // Aggiorna lo slot con riferimento al cliente reale
    sheet.getRange(rowIndex, 3).setValue(cnId); // cn_ID dal foglio Clienti
    sheet.getRange(rowIndex, 4).setValue(servizioId);
    sheet.getRange(rowIndex, 6).setValue('Prenotato');
    sheet.getRange(rowIndex, 7).setValue('Prenotato da PWA il ' + formattaData(new Date()));
    
    return {
      success: true,
      message: 'Prenotazione creata con successo',
      appointment: {
        id: slotId,
        customerId: cnId,
        customerName: customerName,
        customerPhone: customerPhone,
        serviceId: servizioId,
        operatorId: operatoreId
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Cancella prenotazione
 */
function apiCancellaPrenotazione(appointmentId, phone) {
  try {
    if (!appointmentId || !phone) {
      throw new Error('appointmentId e phone obbligatori');
    }
    
    // Trova cliente per telefono
    const cliente = trovaClientePerTelefono(phone);
    
    if (!cliente) {
      throw new Error('Cliente non trovato con questo telefono');
    }
    
    const ss = getFoglio();
    const sheet = ss.getSheetByName('AppunTamenti');
    
    if (!sheet) {
      throw new Error('Foglio AppunTamenti non trovato');
    }
    
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    // Cerca prenotazione del cliente
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === appointmentId && row[2] === cliente.cn_ID) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error('Prenotazione non trovata o non appartiene a questo cliente');
    }
    
    // Cancella prenotazione (torna slot libero)
    sheet.getRange(rowIndex, 3).setValue(''); // cn_ID vuoto
    sheet.getRange(rowIndex, 4).setValue(''); // sv_ID vuoto
    sheet.getRange(rowIndex, 6).setValue('Cancellato');
    sheet.getRange(rowIndex, 7).setValue('Cancellato da cliente il ' + formattaData(new Date()));
    
    return {
      success: true,
      message: 'Prenotazione cancellata con successo'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

