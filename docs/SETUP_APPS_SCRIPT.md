# 📘 GUIDA SETUP APPS SCRIPT - BarberBro PWA

## 🎯 Panoramica

Questa guida ti aiuta a configurare il backend Google Apps Script per il sistema PWA di prenotazioni BarberBro.

**Cosa fa questo script:**
- ✅ Genera slot automatici per tutti gli operatori
- ✅ Gestisce prenotazioni e clienti
- ✅ Fornisce API REST per la PWA (login OAuth, slot, servizi, operatori)
- ✅ Sistema di autenticazione Google OAuth con verifica email
- ✅ Cache per performance ottimali

---

## 🚀 SETUP INIZIALE (10 minuti)

### 1️⃣ **Apri Google Sheets**
1. Vai su [Google Sheets](https://sheets.google.com)
2. Crea nuovo foglio o apri foglio esistente
3. Rinomina in `BarberBro - [Nome Negozio]`

### 2️⃣ **Installa Script**
1. Menu `Estensioni` → `Apps Script`
2. Elimina codice di default
3. Copia TUTTO il contenuto di `BarberBro_SlotManager_Complete.gs`
4. Incolla nell'editor Apps Script
5. Clicca `Salva` (icona floppy disk)
6. Rinomina progetto in `BarberBro API`

### 3️⃣ **Esegui Setup Iniziale**
1. Nella barra funzioni (in alto), seleziona `setup`
2. Clicca `Esegui` (▶️ play)
3. Autorizza script (prima volta):
   - Clicca "Autorizza"
   - Scegli tuo account Google
   - Clicca "Avanzate" → "Vai a BarberBro API (non sicuro)"
   - Clicca "Consenti"
4. Attendi conferma ✅

Questo crea il foglio **Configurazione** con parametri generazione slot.

### 4️⃣ **Setup ConfigPWA (Configurazione PWA)**
1. Torna su Apps Script
2. Seleziona funzione `setupConfigPWA`
3. Clicca `Esegui` ▶️
4. Torna su Google Sheets: vedi nuovo foglio **ConfigPWA** con 50+ parametri

### 5️⃣ **Crea Guida ConfigPWA**
1. Apps Script → funzione `setupGuidaConfigPWA`
2. Clicca `Esegui` ▶️
3. Torna su Sheets: vedi foglio **Guida_ConfigPWA** con documentazione completa

### 6️⃣ **Installa Menu Personalizzato**
1. Apps Script → funzione `installaTriggerMenu`
2. Clicca `Esegui` ▶️
3. Ricarica pagina Google Sheets
4. Vedi menu **🔧 BarberBro** in alto

---

## 🔐 SETUP GOOGLE OAUTH (15 minuti)

### Perché serve?
Il sistema PWA usa Google OAuth per login sicuro **senza salvare password**. I clienti fanno login con account Google.

### Passaggi Setup:

#### 1. **Vai su Google Cloud Console**
- Apri [https://console.cloud.google.com](https://console.cloud.google.com)
- Clicca "Seleziona progetto" (in alto) → "Nuovo progetto"
- Nome: `BarberBro PWA [Nome Negozio]`
- Clicca "Crea" (attendi 30 secondi)

#### 2. **Configura Schermata Consenso OAuth**
- Menu ☰ (hamburger) → "API e Servizi" → "Schermata consenso OAuth"
- Tipo utente: **Esterno**
- Clicca "Crea"

**Pagina 1 - Informazioni app:**
- Nome app: `BarberBro [Nome Negozio]`
- Email assistenza utenti: tua email
- Logo app: (opzionale, carica logo quadrato 120x120px)
- Email contatto sviluppatore: tua email
- Clicca "Salva e continua"

**Pagina 2 - Ambiti:** (non aggiungere nulla)
- Clicca "Salva e continua"

**Pagina 3 - Utenti test:** (opzionale per testing)
- Aggiungi tua email
- Clicca "Salva e continua"

**Pagina 4 - Riepilogo:**
- Clicca "Torna alla dashboard"

#### 3. **Crea Credenziali OAuth**
- Menu "API e Servizi" → "Credenziali"
- Clicca "+ CREA CREDENZIALI" → "ID client OAuth"
- Tipo applicazione: **Applicazione web**
- Nome: `BarberBro Web Client`

**Origini JavaScript autorizzate:**
- Clicca "+ AGGIUNGI URI"
- Inserisci: `https://script.google.com`
- (IMPORTANTE: esattamente questo URL, senza slash finale)

**URI reindirizzamento autorizzati:**
- Lascia vuoto

- Clicca "CREA"

#### 4. **Copia Client ID**
- Popup mostra "ID cliente" (formato: `123456789-abc.apps.googleusercontent.com`)
- **COPIA** questo ID (Ctrl+C)
- Clicca "OK"

#### 5. **Incolla in ConfigPWA**
- Torna su Google Sheets
- Apri foglio **ConfigPWA**
- Trova riga `google_client_id`
- Incolla Client ID nella colonna `config_value`
- Salva (Ctrl+S)

✅ **Setup OAuth completato!**

---

## 📋 CONFIGURAZIONE FOGLI

### 📄 **Foglio Configurazione**
Parametri generazione slot:
- `slot_periodo_settimane`: Quante settimane generare in avanti (default: 4)
- `slot_durata_minima`: Granularità slot in minuti (default: 15)
- `negozio_apertura` / `negozio_chiusura`: Orari default
- `lavora_lunedi` ... `lavora_domenica`: Giorni lavorativi (TRUE/FALSE)

### 🎨 **Foglio ConfigPWA**
**50+ parametri** organizzati in 7 sezioni:

**1. GENERALE** (Nome negozio, logo, contatti)
- `shop_name`: Nome visualizzato in app
- `shop_logo_url`: Link logo (opzionale)
- `phone_contact`: Telefono con prefisso (+39 ...)
- `address`: Indirizzo completo

**2. SICUREZZA & OAUTH**
- `google_client_id`: ⚠️ **OBBLIGATORIO** (vedi setup sopra)
- `token_expiry_hours`: Durata sessione (default: 24h)
- `enable_auto_login`: Ricorda utente loggato (true/false)

**3. COLORI & BRANDING**
- `primary_color`: Colore pulsanti (#007AFF iOS blue)
- `accent_color`: Colore accento (#C19A6B oro barbiere)
- `background_color`: Sfondo app (#F5F5F7 grigio chiaro)

**4. FUNZIONALITÀ UI**
- `show_quick_slots`: Mostra "Mi sento fortunato" (true/false)
- `show_prices`: Mostra prezzi servizi (true/false)
- `enable_operator_choice`: Permetti scelta barbiere (true/false)

**5. REGOLE PRENOTAZIONE**
- `booking_days_ahead`: Giorni prenotabili in avanti (default: 30)
- `min_notice_hours`: Ore minime preavviso (default: 2)
- `require_phone`: Telefono obbligatorio (true/false)

**6. MESSAGGI & TESTI**
- `welcome_message`: Testo homepage
- `success_booking_message`: Messaggio dopo prenotazione

**7. AVANZATE**
- `enable_pwa`: Sistema attivo/disattivo (true/false)
- `debug_mode`: Log dettagliati (solo sviluppo)

💡 **Consulta foglio Guida_ConfigPWA per descrizione completa ogni parametro!**

### 👥 **Foglio Clienti**
Struttura colonne:
- `cn_ID`: ID univoco (auto-generato)
- `cn_name`: Nome cliente
- `cn_phone`: Telefono
- `cn_email`: Email (usata per OAuth login)
- `cn_enablePWA`: **SI/NO** - Abilita accesso PWA
- `cn_lastLogin`: Data ultimo login (auto-aggiornato)
- `cn_totalBookings`: Contatore prenotazioni (auto-aggiornato)

⚠️ **IMPORTANTE**: Solo clienti con `cn_enablePWA = SI` possono fare login!

### 💈 **Foglio SerVizi**
- `sv_ID`: ID servizio
- `sv_name`: Nome (es: "Taglio Uomo")
- `sv_price`: Prezzo (es: 25)
- `sv_duration`: Durata in minuti (es: 30)

### 👨‍🔧 **Foglio OpeRatori**
- `or_ID`: ID operatore
- `or_name`: Nome barbiere
- `or_workStart`: Orario inizio (es: "09:00")
- `or_workEnd`: Orario fine (es: "18:30")
- `or_isActive`: TRUE/FALSE (solo attivi mostrati in PWA)

---

## 🔒 GESTIONE ACCESSI PWA

### Menu "🔐 Gestione Accessi PWA"

#### 👥 **Abilita/Disabilita Clienti**
1. Menu `🔧 BarberBro` → `🔐 Gestione Accessi PWA` → `👥 Abilita/Disabilita Clienti`
2. Vedi lista clienti con stato (✅ abilitato / ❌ disabilitato)
3. Per modificare:
   - Vai su foglio **Clienti**
   - Colonna `cn_enablePWA`: scrivi `SI` (abilita) o `NO` (disabilita)
   - Salva

#### ✅ **Abilita TUTTI i Clienti**
- Menu → `✅ Abilita TUTTI i Clienti`
- Conferma azione
- Tutti i clienti con email possono fare login

⚠️ **Usa solo se vuoi accesso globale!**

#### ❌ **Disabilita TUTTI i Clienti**
- Menu → `❌ Disabilita TUTTI i Clienti`
- Blocco emergenza: nessuno può fare login
- Utile durante manutenzione o problemi

---

## 🌐 DEPLOY WEB APP (API REST)

### 1. **Pubblica come Web App**
1. Apps Script → Clicca "Deploy" (in alto a destra) → "Nuova implementazione"
2. Tipo: Seleziona **App web**
3. Descrizione: `BarberBro API v1.0`
4. Esegui come: **Me (tuo_email@gmail.com)**
5. Chi ha accesso: **Chiunque** (per API pubblica)
6. Clicca "Implementa"
7. **COPIA URL Web App** (formato: `https://script.google.com/macros/s/AKfycby.../exec`)
8. Clicca "Fine"

### 2. **Salva URL API**
Questo URL serve per:
- Configurazione PWA (file `.env`)
- Testing API

**Formato URL:**
```
https://script.google.com/macros/s/AKfycby123abc.../exec
```

---

## 🧪 TEST API

### Test Endpoint /config (pubblico, no auth)
```
https://[TUO_URL_WEB_APP]/exec?action=config
```

Risposta attesa:
```json
{
  "success": true,
  "config": {
    "shop_name": "BarberBro Milano",
    "primary_color": "#007AFF",
    ...
  }
}
```

### Test Endpoint /login (pubblico)
```
https://[TUO_URL_WEB_APP]/exec?action=login&email=cliente@example.com
```

Risposta se email non in anagrafica:
```json
{
  "success": false,
  "error": "Email non registrata in anagrafica",
  "errorCode": "EMAIL_NOT_FOUND"
}
```

Risposta se cn_enablePWA = NO:
```json
{
  "success": false,
  "error": "Accesso PWA non abilitato",
  "errorCode": "PWA_DISABLED"
}
```

Risposta se login OK:
```json
{
  "success": true,
  "token": "a1b2c3d4-uuid-token",
  "user": {
    "id": "CN1234567890",
    "name": "Mario Rossi",
    "email": "mario@example.com",
    "phone": "+393331234567"
  }
}
```

### Test Endpoint /servizi (protetto, richiede token)
```
https://[TUO_URL_WEB_APP]/exec?action=servizi&authorization=Bearer%20[TOKEN]
```

Se token mancante/invalido:
```json
{
  "success": false,
  "error": "Token scaduto o invalido",
  "errorCode": "UNAUTHORIZED",
  "statusCode": 401
}
```

---

## 🎛️ MENU BARBER PRO

### 🔧 **Menu Principale**
- `⚙️ Setup Configurazione`: Crea foglio Configurazione
- `🎨 Setup ConfigPWA`: Crea foglio ConfigPWA (50+ parametri)
- `📖 Crea Guida ConfigPWA`: Genera documentazione parametri

### 🔐 **Gestione Accessi PWA**
- `👥 Abilita/Disabilita Clienti`: Vedi stato e modifica
- `✅ Abilita TUTTI`: Accesso globale
- `❌ Disabilita TUTTI`: Blocco emergenza

### 🔄 **Operazioni**
- `🔄 Genera Slot`: Crea slot per settimane configurate
- `🗑️ Reset Cache`: Invalida cache (forza reload dati)
- `📦 Archivia Appuntamenti`: Sposta vecchi appuntamenti in Storico

---

## 🆘 TROUBLESHOOTING

### ❌ "Token mancante"
**Problema**: PWA non invia Authorization header  
**Soluzione**: Verifica che `apiService.js` includa:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### ❌ "Email non registrata"
**Problema**: Cliente prova login ma email non in foglio Clienti  
**Soluzione**:
1. Apri foglio **Clienti**
2. Aggiungi riga: cn_ID (auto), nome, telefono, **email**, cn_enablePWA = **SI**
3. Salva

### ❌ "PWA_DISABLED"
**Problema**: Email esiste ma cn_enablePWA = NO  
**Soluzione**:
1. Foglio Clienti → trova cliente per email
2. Colonna `cn_enablePWA`: cambia in **SI**
3. Salva

### ❌ "CORS error"
**Problema**: Browser blocca richieste API  
**Causa**: Apps Script gestisce CORS automaticamente, ma...  
**Soluzione**: Verifica URL Web App:
- Deve essere `/exec` (non `/dev`)
- Implementazione deve essere "Chiunque"

### ❌ "Token scaduto"
**Problema**: Utente vede errore 401 dopo 24h  
**Soluzione**: Normale! Token ha scadenza (vedi `token_expiry_hours` in ConfigPWA)  
**Fix**: Utente fa logout → login di nuovo

---

## 📊 MONITORAGGIO

### Log Apps Script
1. Apps Script → Menu "Esecuzioni" (icona orologio)
2. Vedi storico chiamate API con timestamp
3. Clicca singola esecuzione → vedi log dettagliati

### Verifica Ultimo Login Clienti
1. Foglio **Clienti** → colonna `cn_lastLogin`
2. Vedi data/ora ultimo accesso
3. Utile per capire chi usa PWA

### Contatore Prenotazioni
1. Foglio **Clienti** → colonna `cn_totalBookings`
2. Numero prenotazioni per cliente
3. Auto-aggiornato dopo ogni prenotazione

---

## 🔄 AGGIORNAMENTO SCRIPT

### Quando Aggiornare
- ✅ Nuove funzionalità rilasciate
- ✅ Fix bug critici
- ✅ Miglioramenti sicurezza

### Come Aggiornare
1. Apps Script → Seleziona TUTTO il codice (Ctrl+A)
2. Elimina (Canc)
3. Copia nuovo codice da `BarberBro_SlotManager_Complete.gs`
4. Incolla (Ctrl+V)
5. Salva (Ctrl+S)
6. Menu "Deploy" → "Gestisci implementazioni"
7. Clicca icona ✏️ (modifica) sulla versione attiva
8. Clicca "Nuova versione"
9. Descrizione: `Update [data]`
10. Clicca "Implementa"

⚠️ **URL Web App rimane lo stesso!** (non serve aggiornare PWA)

---

## 📚 RISORSE UTILI

- **Guida ConfigPWA**: Foglio `Guida_ConfigPWA` con descrizione ogni parametro
- **Apps Script Docs**: [developers.google.com/apps-script](https://developers.google.com/apps-script)
- **Google OAuth Setup**: [console.cloud.google.com](https://console.cloud.google.com)

---

## ✅ CHECKLIST FINALE

Prima di andare in produzione:

- [ ] Foglio Configurazione creato e compilato
- [ ] Foglio ConfigPWA creato con 50+ parametri personalizzati
- [ ] `google_client_id` configurato in ConfigPWA
- [ ] Foglio Clienti con clienti e email
- [ ] Almeno 1 cliente con `cn_enablePWA = SI` per test
- [ ] Fogli SerVizi e OpeRatori compilati
- [ ] Script pubblicato come Web App (chiunque può accedere)
- [ ] URL Web App copiato
- [ ] Test endpoint `/config` riuscito
- [ ] Test login con email test riuscito
- [ ] Menu 🔧 BarberBro visibile in Google Sheets

---

🎉 **Setup completato! Ora puoi configurare la PWA frontend.**
