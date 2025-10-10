# 🔐 Setup OAuth - BarberBro PWA

## ✅ Completato nel progetto pilot!

Questo file documenta l'implementazione OAuth Google completa nel progetto.

---

## 📦 **Pacchetti Installati**

```bash
npm install @react-oauth/google  # Google OAuth library ufficiale
npm install jwt-decode            # Decode JWT token
```

---

## 📂 **File Modificati/Creati**

### ✅ **1. LoginScreen.jsx** (NUOVO)
**Path**: `pwa/src/components/LoginScreen.jsx`

**Features**:
- GoogleLogin button integrato
- Gestione errori OAuth (email non trovata, PWA disabilitato)
- UI Apple-style con logo negozio
- Link contatti (telefono/email) per assistenza
- Loading state durante login

**Flow**:
1. Utente clicca "Accedi con Google"
2. Popup OAuth Google → utente autorizza
3. Google ritorna JWT credential
4. Decodifica JWT → ottiene `email` e `name`
5. Chiama `login(email, name)` da Zustand store
6. Se successo → redirect automatico a WelcomeScreen

---

### ✅ **2. useStore.js** (ESTESO)
**Path**: `pwa/src/store/useStore.js`

**Nuovo state `auth`**:
```javascript
auth: {
  isAuthenticated: false,
  token: null,
  user: null // { id, name, email, phone }
}
```

**Nuove actions**:
- `login(email, name)` → Chiama API /login, salva token
- `logout()` → Clear auth state, rimuove token da localStorage
- `checkAuth()` → Verifica token salvato all'avvio

**Persist**:
- Token salvato in `localStorage.barberbro_auth_token`
- Email salvata in `localStorage.barberbro_user_email`

---

### ✅ **3. apiService.js** (ESTESO)
**Path**: `pwa/src/services/apiService.js`

**Modifiche**:
- `fetchAPI()` ora include `Authorization: Bearer ${token}` header
- Auto-logout se riceve 401 (token scaduto)
- Nuovo metodo `login(email)` per chiamare `/login` endpoint

**Headers automatici**:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,  // Aggiunto automaticamente
  'Content-Type': 'application/json'
}
```

---

### ✅ **4. App.jsx** (REFACTORED)
**Path**: `pwa/src/App.jsx`

**Modifiche**:
- Wrapper `GoogleOAuthProvider` con `clientId` da config
- Check `auth.isAuthenticated` all'avvio
- Render condizionale: `LoginScreen` vs `BookingFlow`
- Verifica `config.google_client_id` presente (errore se mancante)

**Flow inizializzazione**:
```
1. loadConfig() → Carica ConfigPWA da API
2. checkAuth() → Verifica se token salvato
3. Se NO auth → Mostra LoginScreen
4. Se SI auth → Mostra WelcomeScreen
```

---

## 🔄 **Flow Completo**

### **Prima volta (nuovo utente)**:
```
1. App.jsx carica → loadConfig() + checkAuth()
2. checkAuth() → NO token salvato
3. Mostra LoginScreen
4. Utente clicca "Accedi con Google"
5. Google popup → autorizza
6. JWT decoded → email + name
7. Chiama API /login?email=xxx
8. Backend verifica:
   - Email in foglio Clienti?
   - cn_enablePWA = 'SI'?
9. Se OK → ritorna token + user data
10. Salva token in localStorage
11. Set auth.isAuthenticated = true
12. App.jsx rerender → mostra WelcomeScreen
```

### **Returning user**:
```
1. App.jsx carica → checkAuth()
2. checkAuth() → trova token in localStorage
3. Set auth.isAuthenticated = true
4. App.jsx → mostra WelcomeScreen (skip login)
```

### **Token scaduto**:
```
1. Utente fa azione (es: visualizza slot)
2. apiService.fetchAPI() invia Authorization header
3. Backend ritorna 401 (token scaduto)
4. apiService rileva 401 → logout automatico
5. App.jsx → mostra LoginScreen
```

---

## 🧪 **Testing**

### **Test 1: Login con email VALIDA e ABILITATA**
1. Apri app: http://localhost:3002
2. Clicca "Accedi con Google"
3. Scegli account con email in foglio Clienti + cn_enablePWA=SI
4. ✅ Vedi WelcomeScreen

### **Test 2: Login con email NON in anagrafica**
1. Accedi con email diversa
2. ❌ Vedi errore: "Email non registrata in anagrafica"
3. Mostra link contatti barbiere

### **Test 3: Login con cn_enablePWA = NO**
1. Accedi con email in Clienti ma cn_enablePWA=NO
2. ❌ Vedi errore: "Accesso PWA non abilitato"
3. Mostra istruzioni per contattare barbiere

### **Test 4: Logout + Rilogin**
1. Dopo login, apri console browser
2. Scrivi: `useStore.getState().logout()`
3. ✅ Vedi LoginScreen
4. Rilogin → funziona

### **Test 5: Persist (chiudi/riapri browser)**
1. Login con successo
2. Chiudi tab browser
3. Riapri http://localhost:3002
4. ✅ Vedi WelcomeScreen (ancora loggato)

---

## ⚠️ **Troubleshooting**

### ❌ "google_client_id mancante"
**Problema**: ConfigPWA non ha `google_client_id` compilato

**Soluzione**:
1. Google Cloud Console → Ottieni Client ID
2. Foglio ConfigPWA → Incolla in riga `google_client_id`
3. Ricarica app

### ❌ "Invalid clientId"
**Problema**: Client ID errato o non autorizzato

**Soluzione**:
1. Google Cloud Console → Credenziali
2. Verifica "Origini JavaScript autorizzate": `http://localhost:3002` E `https://script.google.com`
3. Salva modifiche (attendi 5 min propagazione)

### ❌ "Email non registrata"
**Problema**: Email non esiste in foglio Clienti

**Soluzione**:
1. Apri Google Sheets
2. Foglio Clienti → Aggiungi riga:
   - cn_ID: CN123456
   - cn_name: Test User
   - cn_phone: +393331234567
   - cn_email: **tua_email@gmail.com**
   - cn_enablePWA: **SI**

### ❌ Token scaduto loop infinito
**Problema**: Dopo 24h, app continua a richiedere login

**Soluzione**: Normale! Token expiry = 24h (configurabile in ConfigPWA → `token_expiry_hours`)

---

## 🚀 **Deploy Checklist**

### **Backend (Apps Script)**:
- [x] Foglio ConfigPWA creato
- [x] `google_client_id` compilato
- [x] Foglio Clienti con clienti test + cn_enablePWA=SI
- [x] Web App deployed (URL salvato)
- [x] Test endpoint `/login` funziona

### **Frontend (PWA)**:
- [x] `.env` creato con `VITE_API_URL`
- [x] `npm install @react-oauth/google jwt-decode`
- [x] LoginScreen.jsx creato
- [x] App.jsx con GoogleOAuthProvider
- [x] useStore.js con auth state
- [x] apiService.js con Authorization header
- [x] Test login locale funziona

### **Produzione (Vercel/Netlify)**:
- [ ] Build produzione: `npm run build`
- [ ] Deploy su Vercel
- [ ] Aggiungi env var `VITE_API_URL`
- [ ] Google Cloud Console → Aggiungi origine: `https://tuo-dominio.vercel.app`
- [ ] Test login su produzione

---

## 📚 **Documentazione**

- **Apps Script Setup**: `docs/SETUP_APPS_SCRIPT.md`
- **Checklist Deployment**: `docs/CHECKLIST_DEPLOYMENT.md`
- **Riepilogo Modifiche**: `docs/RIEPILOGO_MODIFICHE.md`

---

🎉 **OAuth implementato con successo!**
