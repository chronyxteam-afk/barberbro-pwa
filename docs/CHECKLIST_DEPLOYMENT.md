# ✅ CHECKLIST DEPLOYMENT CLIENTE - BarberBro PWA

Usa questa checklist per ogni nuovo cliente. Tempo stimato: **25-30 minuti**.

---

## 📋 FASE 1: SETUP GOOGLE SHEETS (5 min)

- [ ] **1.1** Crea nuovo Google Sheets
- [ ] **1.2** Rinomina: `BarberBro - [Nome Negozio]`
- [ ] **1.3** Condividi con email cliente (opzionale)

---

## 📋 FASE 2: INSTALLA APPS SCRIPT (3 min)

- [ ] **2.1** Menu `Estensioni` → `Apps Script`
- [ ] **2.2** Elimina codice default (`function myFunction() {...}`)
- [ ] **2.3** Copia TUTTO da `apps-script/BarberBro_SlotManager_Complete.gs`
- [ ] **2.4** Incolla in editor
- [ ] **2.5** Clicca `Salva` (icona floppy disk)
- [ ] **2.6** Rinomina progetto: `BarberBro API - [Nome Negozio]`

---

## 📋 FASE 3: AUTORIZZA SCRIPT (2 min)

- [ ] **3.1** Dropdown funzioni → Seleziona `setup`
- [ ] **3.2** Clicca `Esegui` ▶️
- [ ] **3.3** Popup "Autorizzazione richiesta" → Clicca `Esamina autorizzazioni`
- [ ] **3.4** Scegli tuo account Google
- [ ] **3.5** "Google non ha verificato l'app" → Clicca `Avanzate`
- [ ] **3.6** Clicca `Vai a BarberBro API (non sicuro)`
- [ ] **3.7** Clicca `Consenti`
- [ ] **3.8** Attendi conferma ✅ "Foglio Configurazione creato"

---

## 📋 FASE 4: CREA FOGLI CONFIG (2 min)

- [ ] **4.1** Dropdown funzioni → Seleziona `setupConfigPWA`
- [ ] **4.2** Clicca `Esegui` ▶️
- [ ] **4.3** Attendi conferma ✅ (vedi foglio ConfigPWA con 50+ parametri)
- [ ] **4.4** Dropdown funzioni → Seleziona `setupGuidaConfigPWA`
- [ ] **4.5** Clicca `Esegui` ▶️
- [ ] **4.6** Attendi conferma ✅ (vedi foglio Guida_ConfigPWA)
- [ ] **4.7** Dropdown funzioni → Seleziona `installaTriggerMenu`
- [ ] **4.8** Clicca `Esegui` ▶️
- [ ] **4.9** Ricarica Google Sheets (F5)
- [ ] **4.10** Verifica menu `🔧 BarberBro` visibile in alto

---

## 📋 FASE 5: SETUP GOOGLE OAUTH (8 min)

- [ ] **5.1** Apri [Google Cloud Console](https://console.cloud.google.com)
- [ ] **5.2** Clicca "Seleziona progetto" → "Nuovo progetto"
- [ ] **5.3** Nome: `BarberBro PWA - [Nome Negozio]`
- [ ] **5.4** Clicca "Crea" (attendi 30 sec)

### Schermata Consenso OAuth
- [ ] **5.5** Menu ☰ → "API e Servizi" → "Schermata consenso OAuth"
- [ ] **5.6** Tipo utente: **Esterno** → Clicca "Crea"
- [ ] **5.7** Nome app: `BarberBro [Nome Negozio]`
- [ ] **5.8** Email assistenza: `[email_cliente@gmail.com]`
- [ ] **5.9** Email sviluppatore: `[tua_email@gmail.com]`
- [ ] **5.10** Clicca "Salva e continua" (×3 fino a fine)
- [ ] **5.11** Clicca "Torna alla dashboard"

### Crea Credenziali
- [ ] **5.12** Menu "Credenziali" (nel sidebar)
- [ ] **5.13** Clicca "+ CREA CREDENZIALI" → "ID client OAuth"
- [ ] **5.14** Tipo: **Applicazione web**
- [ ] **5.15** Nome: `BarberBro Web Client`
- [ ] **5.16** Origini JavaScript: Clicca "+ AGGIUNGI URI"
- [ ] **5.17** Inserisci: `https://script.google.com` (NO slash finale!)
- [ ] **5.18** URI reindirizzamento: (lascia vuoto)
- [ ] **5.19** Clicca "CREA"

### Salva Client ID
- [ ] **5.20** Popup mostra "ID cliente" → **COPIA** (Ctrl+C)
- [ ] **5.21** Clicca "OK"
- [ ] **5.22** Torna su Google Sheets
- [ ] **5.23** Apri foglio **ConfigPWA**
- [ ] **5.24** Trova riga `google_client_id`
- [ ] **5.25** Colonna B (config_value): **INCOLLA** Client ID
- [ ] **5.26** Verifica formato: `123456789-abc.apps.googleusercontent.com`
- [ ] **5.27** Salva (Ctrl+S)

✅ **OAuth configurato!**

---

## 📋 FASE 6: COMPILA CONFIG NEGOZIO (5 min)

Apri foglio **ConfigPWA** e compila questi parametri:

### GENERALE (obbligatorio)
- [ ] **6.1** `shop_name`: `[Nome Negozio]` (es: "BarberBro Milano")
- [ ] **6.2** `phone_contact`: `[+39 333 1234567]`
- [ ] **6.3** `email_contact`: `[info@negozio.it]`
- [ ] **6.4** `address`: `[Via Roma 123, 20100 Milano MI]`

### COLORI (opzionale, default già OK)
- [ ] **6.5** `primary_color`: `#007AFF` (iOS blue, cambia se vuoi)
- [ ] **6.6** `accent_color`: `#C19A6B` (oro barbiere, cambia se vuoi)

### REGOLE (opzionale, default già OK)
- [ ] **6.7** `booking_days_ahead`: `30` (giorni prenotabili)
- [ ] **6.8** `min_notice_hours`: `2` (ore preavviso minimo)

### MESSAGGI (opzionale, personalizza)
- [ ] **6.9** `welcome_message`: Cambia testo homepage

💡 **Altri parametri**: consulta foglio `Guida_ConfigPWA` per descrizione completa

---

## 📋 FASE 7: COMPILA FOGLI DATI (5 min)

### Foglio SerVizi
- [ ] **7.1** Aggiungi servizi (Taglio, Barba, etc)
  ```
  sv_ID | sv_name        | sv_price | sv_duration
  SV1   | Taglio Uomo    | 25       | 30
  SV2   | Taglio + Barba | 35       | 45
  ```

### Foglio OpeRatori
- [ ] **7.2** Aggiungi barbieri
  ```
  or_ID | or_name     | or_workStart | or_workEnd | or_isActive
  OP1   | Mario Rossi | 09:00        | 18:30      | TRUE
  ```

### Foglio Clienti (per test)
- [ ] **7.3** Aggiungi cliente test
  ```
  cn_ID      | cn_name      | cn_phone       | cn_email           | cn_enablePWA
  CN12345    | Test Cliente | +393331234567  | test@gmail.com     | SI
  ```

⚠️ **IMPORTANTE**: `cn_enablePWA` deve essere **SI** per permettere login!

---

## 📋 FASE 8: GENERA SLOT (1 min)

- [ ] **8.1** Google Sheets → Menu `🔧 BarberBro`
- [ ] **8.2** Clicca `🔄 Genera Slot`
- [ ] **8.3** Attendi conferma ✅ (X slot generati)
- [ ] **8.4** Apri foglio `AppunTamenti` → Verifica slot presenti

---

## 📋 FASE 9: DEPLOY WEB APP (2 min)

- [ ] **9.1** Torna su Apps Script
- [ ] **9.2** Clicca "Deploy" (in alto a destra) → "Nuova implementazione"
- [ ] **9.3** Icona ingranaggio ⚙️ → Seleziona **App web**
- [ ] **9.4** Descrizione: `BarberBro API v1.0`
- [ ] **9.5** Esegui come: **Me ([tua_email@gmail.com])**
- [ ] **9.6** Chi ha accesso: **Chiunque**
- [ ] **9.7** Clicca "Implementa"
- [ ] **9.8** Popup mostra URL Web App → **COPIA** (formato: `https://script.google.com/macros/s/AKfycby.../exec`)
- [ ] **9.9** Clicca "Fine"

✅ **API pubblicata!**

---

## 📋 FASE 10: TEST API (2 min)

Apri browser e testa questi URL (sostituisci `[TUO_URL]`):

### Test /config (pubblico)
- [ ] **10.1** Apri: `[TUO_URL]/exec?action=config`
- [ ] **10.2** Verifica JSON con `shop_name`, `primary_color`, etc

### Test /login (con email test)
- [ ] **10.3** Apri: `[TUO_URL]/exec?action=login&email=test@gmail.com`
- [ ] **10.4** Se email non in Clienti → Vedi errore `EMAIL_NOT_FOUND`
- [ ] **10.5** Se cn_enablePWA = NO → Vedi errore `PWA_DISABLED`
- [ ] **10.6** Se tutto OK → Vedi `{ "success": true, "token": "...", "user": {...} }`

✅ **API funzionante!**

---

## 📋 FASE 11: CONFIGURA PWA FRONTEND (5 min)

- [ ] **11.1** Apri progetto PWA in VS Code
- [ ] **11.2** Crea file `.env` nella cartella `pwa/`
- [ ] **11.3** Aggiungi linea:
  ```
  VITE_API_URL=[TUO_URL_WEB_APP]
  ```
  (senza `/exec` finale!)
- [ ] **11.4** Salva (Ctrl+S)
- [ ] **11.5** Terminale: `cd pwa`
- [ ] **11.6** Terminale: `npm install`
- [ ] **11.7** Terminale: `npm install @react-oauth/google`
- [ ] **11.8** Terminale: `npm run dev`
- [ ] **11.9** Apri browser: `http://localhost:3002`
- [ ] **11.10** Verifica app caricata (anche se ancora senza OAuth)

---

## 📋 FASE 12: CONSEGNA CLIENTE (2 min)

### Documenti da inviare:
- [ ] **12.1** Link Google Sheets: `[link_foglio]`
- [ ] **12.2** URL Web App API: `[tuo_url]/exec`
- [ ] **12.3** URL PWA (dopo deploy): `[url_vercel].vercel.app`
- [ ] **12.4** PDF guida: Esporta `docs/SETUP_APPS_SCRIPT.md` in PDF

### Credenziali:
- [ ] **12.5** Email proprietario foglio: `[email_cliente]`
- [ ] **12.6** Google Cloud Console progetto: `BarberBro PWA - [Nome Negozio]`

### Istruzioni cliente:
- [ ] **12.7** "Usa menu 🔧 BarberBro per gestire"
- [ ] **12.8** "Aggiungi clienti in foglio Clienti e abilita cn_enablePWA = SI"
- [ ] **12.9** "Usa 👥 Gestisci Accessi PWA per vedere chi può accedere"

---

## ✅ COMPLETATO!

- [ ] **13.1** Segna data completamento: `____/____/2025`
- [ ] **13.2** Cliente nome: `______________________________`
- [ ] **13.3** URL API salvato: ✅
- [ ] **13.4** URL PWA salvato: ✅
- [ ] **13.5** Backup foglio Config fatto: ✅

---

## 🆘 TROUBLESHOOTING RAPIDO

### ❌ "Autorizzazione negata"
→ Riesegui step 3.3-3.7 (autorizza script)

### ❌ "EMAIL_NOT_FOUND" al login
→ Aggiungi email in foglio Clienti (step 7.3)

### ❌ "PWA_DISABLED"
→ Foglio Clienti → colonna `cn_enablePWA` → scrivi `SI`

### ❌ "Token mancante" su API protette
→ Controlla che PWA invii header `Authorization: Bearer [token]`

### ❌ Menu BarberBro non appare
→ Riesegui step 4.7-4.9 (installaTriggerMenu + reload)

---

**🎉 Setup completato in ~30 minuti!**
