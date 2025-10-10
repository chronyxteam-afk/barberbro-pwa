# 🚀 CHECKLIST TEST COMPLETO - Sistema Online

## ✅ **STEP 1: Deploy Apps Script Backend (5 min)**

### 1.1 Apri Apps Script
```
https://script.google.com/d/1vl-oqCAIpXPZ5WB5HZatKV4lcOBbZaURwwEOK4QmDmRmJYeIDw4EMlfT/edit
```

### 1.2 Deploy Web App
1. Clicca **Deploy** → **Manage deployments**
2. Se già esiste deployment:
   - Clicca ⚙️ **Edit** su deployment attivo
   - **Version**: New version
3. Se NON esiste:
   - Clicca **+ New deployment**
   - Type: **Web app**
4. Configura:
   - Description: `v2.2 - OAuth complete`
   - Execute as: **Me (favata.d@gmail.com)**
   - Who has access: **Anyone** ← IMPORTANTE!
5. Clicca **Deploy**
6. **COPIA URL Web App** (es: `https://script.google.com/macros/s/AKfycby.../exec`)

---

## ✅ **STEP 2: Abilita Cliente Test (2 min)**

### 2.1 Apri Google Sheets
```
https://docs.google.com/spreadsheets/d/1O-3CmzjiS0eY8l-ITfNKMtaiN1RZn9xB4wlZFpvFaFw/edit
```

### 2.2 Abilita tua email
1. Vai al foglio **Clienti**
2. Trova riga con email: `favata.d@gmail.com`
3. Colonna **L** (`cn_enablePWA`) → Cambia da **NO** a **SI**
4. Salva (Ctrl+S)

### 2.3 Verifica altre colonne
- Colonna **M** (`cn_lastLogin`): deve essere vuota (verrà riempita dopo primo login)
- Colonna **N** (`cn_totalBookings`): deve essere 0

---

## ✅ **STEP 3: Setup Google OAuth (10 min)**

### 3.1 Crea Progetto Google Cloud
1. Vai su: https://console.cloud.google.com
2. Clicca **Select a project** → **NEW PROJECT**
3. Nome: `BarberBro PWA Test`
4. Clicca **CREATE**
5. Attendi creazione (30 sec)

### 3.2 Configura OAuth Consent Screen
1. Menu ☰ → **APIs & Services** → **OAuth consent screen**
2. User Type: **External** → CREATE
3. Compila:
   - App name: `BarberBro PWA`
   - User support email: `favata.d@gmail.com`
   - Developer contact: `favata.d@gmail.com`
4. **SAVE AND CONTINUE**
5. Scopes: **SAVE AND CONTINUE** (lascia vuoto)
6. Test users: **+ ADD USERS** → Inserisci `favata.d@gmail.com` → **SAVE AND CONTINUE**
7. Summary: **BACK TO DASHBOARD**

### 3.3 Crea OAuth Client ID
1. Menu → **Credentials**
2. **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `BarberBro PWA Client`
5. **Authorized JavaScript origins** → **+ ADD URI**:
   ```
   http://localhost:3002
   ```
6. **+ ADD URI** (secondo):
   ```
   https://script.google.com
   ```
7. **CREATE**
8. **COPIA Client ID** (formato: `123456-abc.apps.googleusercontent.com`)

### 3.4 Salva Client ID in ConfigPWA
1. Torna su Google Sheets
2. Vai al foglio **ConfigPWA**
3. Trova riga `google_client_id`
4. Colonna `config_value` → Incolla Client ID
5. Salva (Ctrl+S)

---

## ✅ **STEP 4: Configura PWA Frontend (3 min)**

### 4.1 Crea file .env
```bash
cd c:\Users\sixba\progetti\barberBro-Start\pwa
```

Crea file `.env` con contenuto:
```
VITE_API_URL=https://script.google.com/macros/s/TUO_DEPLOYMENT_ID/exec
```

⚠️ **Sostituisci `TUO_DEPLOYMENT_ID`** con URL copiato allo Step 1.2!

### 4.2 Verifica dipendenze installate
```bash
npm list @react-oauth/google jwt-decode
```

Se mancano:
```bash
npm install
```

---

## ✅ **STEP 5: Test Locale (5 min)**

### 5.1 Avvia Dev Server
```bash
cd c:\Users\sixba\progetti\barberBro-Start\pwa
npm run dev
```

### 5.2 Apri Browser
```
http://localhost:3002
```

### 5.3 Test Login
1. Vedi **LoginScreen** con logo + pulsante "Accedi con Google"
2. Clicca **Accedi con Google**
3. Popup Google → Scegli account `favata.d@gmail.com`
4. Autorizza accesso
5. ✅ **Dovresti vedere WelcomeScreen** con nome utente!

### 5.4 Verifica Console Browser
Apri DevTools (F12) → Console:
- ✅ `✅ Login riuscito: Davide Favata`
- ✅ `Token salvato in localStorage`
- ❌ Nessun errore 401/403

### 5.5 Verifica Google Sheets
1. Torna su foglio **Clienti**
2. Riga con `favata.d@gmail.com`:
   - Colonna **M** (`cn_lastLogin`): deve avere timestamp (es: `10/10/2025 15:30:00`)
   - Colonna **N** (`cn_totalBookings`): deve essere incrementato

---

## ✅ **STEP 6: Test API Endpoints (5 min)**

### 6.1 Test /config (pubblico)
Apri in browser:
```
https://script.google.com/macros/s/TUO_ID/exec?endpoint=config
```

✅ Dovresti vedere JSON con:
```json
{
  "success": true,
  "config": {
    "shop_name": "BarberBro Milano",
    "google_client_id": "123456-abc.apps.googleusercontent.com",
    ...
  }
}
```

### 6.2 Test /servizi (protetto)
Nella PWA loggato, apri Console (F12):
```javascript
fetch('TUO_API_URL?endpoint=servizi', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(console.log)
```

✅ Dovresti vedere lista servizi

### 6.3 Test /slot (protetto)
```javascript
fetch('TUO_API_URL?endpoint=slot', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
}).then(r => r.json()).then(console.log)
```

✅ Dovresti vedere slot disponibili

---

## ✅ **STEP 7: Test Booking Flow (10 min)**

### 7.1 Navigazione Completa
1. WelcomeScreen → Clicca preferenza (es: "Mattina")
2. Clicca **"Mi sento fortunato"**
3. Vedi **QuickSlots** con slot raggruppati per data
4. Clicca su uno slot
5. Vedi **ServiceSelector** con lista servizi
6. Seleziona servizio (es: "Taglio Uomo")
7. Vedi **OperatorList** con operatori
8. Seleziona operatore
9. Vedi **SlotCalendar** (grid 3x3)
10. Seleziona slot finale
11. Vedi **BookingForm**
12. Compila dati cliente
13. Clicca **Conferma Prenotazione**
14. ✅ Vedi **BookingConfirm** con riepilogo!

### 7.2 Verifica su Sheets
1. Foglio **AppunTamenti**:
   - Nuova riga con prenotazione
   - `at_status`: "Prenotato"
   - `cn_ID`: Il tuo ID cliente
   - `sv_ID`: Servizio scelto
   - `or_ID`: Operatore scelto

2. Foglio **Clienti**:
   - `cn_totalBookings`: incrementato di +1

---

## ✅ **STEP 8: Test Logout & Re-login (2 min)**

### 8.1 Logout
Console browser:
```javascript
useStore.getState().logout()
```

✅ Dovresti tornare a **LoginScreen**

### 8.2 Re-login
1. Clicca **Accedi con Google**
2. ✅ Login automatico (no popup, usa token salvato)
3. ✅ Torna a WelcomeScreen

---

## 🐛 **TROUBLESHOOTING**

### ❌ Errore: "Config undefined"
**Causa**: API URL sbagliato in `.env`
**Fix**: 
1. Verifica URL termina con `/exec`
2. Testa URL in browser direttamente

### ❌ Errore: "Invalid Client ID"
**Causa**: google_client_id errato in ConfigPWA
**Fix**:
1. Ricopia Client ID da Google Cloud Console
2. Verifica formato: `123456-abc.apps.googleusercontent.com`
3. Salva foglio ConfigPWA

### ❌ Errore: "EMAIL_NOT_FOUND"
**Causa**: Email non esiste in foglio Clienti
**Fix**:
1. Verifica email in colonna E (cn_email)
2. Controlla maiuscole/minuscole
3. Aggiungi riga se manca

### ❌ Errore: "PWA_DISABLED"
**Causa**: cn_enablePWA = "NO" o vuoto
**Fix**:
1. Foglio Clienti → Colonna L
2. Cambia in "SI"
3. Salva

### ❌ Errore 401: "Token invalid"
**Causa**: Token scaduto (24h) o invalido
**Fix**:
1. Console: `localStorage.clear()`
2. Ricarica pagina (F5)
3. Rifai login

### ❌ Nessuno slot visibile
**Causa**: Slot non generati o tutti prenotati
**Fix**:
1. Google Sheets → Menu 🔧 BarberBro
2. Clicca "🔄 Genera Slot"
3. Attendi conferma (X slot generati)

---

## 📊 **CHECKLIST COMPLETA**

- [ ] **Backend Deployed** (Web App URL copiato)
- [ ] **Cliente abilitato** (cn_enablePWA = SI)
- [ ] **OAuth configurato** (Client ID in ConfigPWA)
- [ ] **File .env creato** (VITE_API_URL corretto)
- [ ] **PWA running** (npm run dev)
- [ ] **Login funziona** (vedi WelcomeScreen)
- [ ] **Token salvato** (localStorage.getItem('auth_token'))
- [ ] **cn_lastLogin aggiornato** (timestamp in foglio)
- [ ] **/config API risponde** (JSON con parametri)
- [ ] **/servizi API risponde** (lista servizi)
- [ ] **Booking flow completo** (da Welcome a Confirm)
- [ ] **Prenotazione in foglio** (AppunTamenti + cn_totalBookings++)

---

## 🎉 **SE TUTTO FUNZIONA:**

### Prossimi Step:
1. ✅ Deploy PWA su Vercel/Netlify (produzione)
2. ✅ Configura dominio custom (opzionale)
3. ✅ Aggiungi altri clienti nel foglio
4. ✅ Personalizza colori/logo in ConfigPWA
5. ✅ Test con cliente reale

### File da Consegnare:
1. URL API: `https://script.google.com/macros/s/.../exec`
2. URL PWA: `https://barberbro-test.vercel.app`
3. Link Google Sheets (condividi con email cliente)
4. Guida setup PDF (esporta questo file)

---

## 📞 **SUPPORTO**

Se qualcosa non funziona:
1. 📋 Controlla **Console browser** (F12) per errori
2. 📊 Controlla **Apps Script Logs** (View → Logs)
3. 📧 Verifica **foglio Clienti** (colonne L, M, N)
4. 🔧 Testa **API direttamente** in browser

---

🚀 **INIZIA CON STEP 1!** Buon test! 🎊
