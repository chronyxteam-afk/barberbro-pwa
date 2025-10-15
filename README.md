# 🪒 BarberBro - Sistema Completo Gestione Prenotazioni

Sistema completo per gestione prenotazioni barbiere con:
- **Apps Script Backend** - API REST + gestione slot dinamici + OAuth Google Login ✨  
- **PWA Frontend** - App web progressiva per clienti (Apple-style design)
- **Multi-tenant** - Configurabile per ogni negozio (50+ parametri)
- **Sicurezza** - Autenticazione OAuth, token sessione, verifica accessi

**Versione**: 2.3  
**Ultimo aggiornamento**: 15 Ottobre 2025

---

## 🎯 **NOVITÀ VERSIONE 2.3**

### ✨ **Gestione Slot Avanzata**
- 🧹 Pulizia automatica slot passati (via `generaSlotCompleti`)
- ⏰ Parametro `min_notice_hours` per preavviso minimo prenotazione
- 🚫 Filtro API lato PWA: nasconde slot troppo vicini (mantenuti per AppSheet)
- 🔧 Fix boundary conditions: slot non più generati su fine prenotazione/assenza

### 🔄 **Deployment Automatizzato**
- ⚙️ GitHub Actions workflow per deploy PWA su GitHub Pages
- 📦 Build automatica su push a `main`
- 🔐 Gestione sicura credenziali OAuth via workflow

### 🧹 **Pulizia Codebase**
- 📁 Archiviazione script Python di test/debug in `archive/`
- 🗑️ Rimozione file ridondanti e documentazione obsoleta
- 📂 Struttura progetto semplificata e organizzata

---

## 📁 **STRUTTURA PROGETTO**

```
barberBro-Start/
├── scripts/              ← Backend Apps Script (sorgente unico)
│   ├── Code.gs           (2900+ righe - API + OAuth + Slot Manager)
│   ├── appsscript.json
│   └── README.md
├── pwa/                  ← Frontend PWA React + Vite
│   ├── src/
│   │   ├── components/   (13 componenti Apple-style)
│   │   ├── store/        (Zustand + persistence)
│   │   └── services/     (apiService con OAuth)
│   ├── dist/             (build per GitHub Pages)
│   ├── package.json
│   └── README_OAUTH.md
├── .github/
│   └── workflows/
│       └── deploy.yml    ← CI/CD automatico per PWA
├── docs/                 ← Documentazione completa
│   ├── SETUP_APPS_SCRIPT.md
│   ├── GUIDA_CREDENZIALI.md
│   ├── GUIDA_SLOT_MANAGER.md
│   └── RIEPILOGO_MODIFICHE.md
├── credentials/          ← Credenziali (gitignored!)
│   ├── service_account.json
│   └── token.pickle
├── .clasp.json           ← Configurazione clasp (deploy Apps Script)
├── package.json          ← Script npm per clasp
├── requirements.txt      ← Dipendenze Python (opzionali)
└── README.md             ← Questo file
```

**📚 Ogni cartella ha il suo README dettagliato!**

---

## 🚀 **QUICK START**

### **Prerequisiti**
- Account Google (per Apps Script + Sheets)
- Google Cloud Console access (per OAuth Client ID)
- Node.js 18+ (per PWA)
- Clasp CLI (`npm install -g @google/clasp`)

### **1. Setup Backend (15 minuti)**

#### A. Crea Google Sheets
```bash
# 1. Crea nuovo Google Sheets
https://sheets.google.com → Nuovo → Rinomina "BarberBro [Nome Negozio]"
```

#### B. Deploy Apps Script con Clasp
```bash
# 1. Login clasp
npm run clasp:login

# 2. Crea nuovo progetto Apps Script
clasp create --type sheets --title "BarberBro API"
# Annota lo SCRIPT_ID dal file .clasp.json

# 3. Push codice
npm run clasp:push

# 4. Apri editor online
clasp open

# 5. Esegui setup (nell'editor online)
# Seleziona funzione: setup → Esegui ▶️ → Autorizza
# Seleziona funzione: setupConfigPWA → Esegui ▶️
# Seleziona funzione: setupGuidaConfigPWA → Esegui ▶️
```

#### C. Setup Google OAuth
```bash
# 1. Google Cloud Console
https://console.cloud.google.com → Nuovo progetto "BarberBro"

# 2. Configura OAuth
API e Servizi → Schermata consenso OAuth
- Tipo: Esterno
- Nome app: BarberBro PWA
- Email: tua_email@gmail.com

# 3. Crea credenziali
Credenziali → Crea → ID client OAuth
- Tipo: Applicazione web
- Origini JavaScript: https://tuousername.github.io
- URI redirect: https://tuousername.github.io/barberbro-pwa/
- Copia Client ID

# 4. Incolla in Sheets
Foglio ConfigPWA → google_client_id → Incolla Client ID
```

📖 **Guida completa**: `docs/SETUP_APPS_SCRIPT.md`

#### D. Deploy Web App
```bash
# Metodo 1: Clasp (consigliato)
npm run clasp:deploy

# Metodo 2: Editor online
# Apps Script → Deploy → Nuova implementazione
# - Tipo: App web
# - Esegui come: Me
# - Chi ha accesso: Chiunque
# - Implementa → COPIA URL
```

Salva URL (formato: `https://script.google.com/macros/s/AKfycby.../exec`)

---

### **2. Setup PWA (10 minuti)**

```bash
# 1. Installa dipendenze
cd pwa
npm install

# 2. Configura API URL
# Crea file .env
echo "VITE_API_URL=https://script.google.com/macros/s/TUO_SCRIPT_ID/exec" > .env

# 3. Test in locale
npm run dev
# Apri: http://localhost:5173
```

#### Deploy su GitHub Pages

```bash
# 1. Crea repo GitHub
git remote add origin https://github.com/tuousername/barberbro-pwa.git

# 2. Aggiorna workflow
# Edita .github/workflows/deploy.yml riga 39:
# VITE_API_URL: https://script.google.com/macros/s/TUO_SCRIPT_ID/exec

# 3. Push
git push -u origin main

# 4. Attiva GitHub Pages
# Repo Settings → Pages → Source: GitHub Actions

# 5. Attendi deploy (2-3 min)
# URL: https://tuousername.github.io/barberbro-pwa/
```

---

## 📊 **FUNZIONALITÀ**

### ✅ **Backend Apps Script**

#### **Sistema Slot Dinamici**
- ✨ Generazione automatica slot per N settimane
- 🧹 Pulizia automatica slot liberi passati
- 🚫 Controllo boundary: non genera slot su fine prenotazione/assenza
- ⏰ Gestione assenze operatori con overlap check
- 🕐 Buffer tempo (preparazione + pulizia) configurabile
- 📦 Archiviazione automatica appuntamenti vecchi

#### **API REST Completa**
- **GET** `/config` - Configurazione PWA multi-tenant (pubblico)
- **GET** `/login?email=X` - Login OAuth + token JWT (pubblico)
- **GET** `/servizi` - Lista servizi (prezzo, durata)
- **GET** `/operatori` - Lista operatori attivi
- **GET** `/slot` - Slot disponibili con filtro `min_notice_hours` per PWA
- **GET** `/cliente?phone=X` - Dati cliente + preferenze
- **GET** `/prenotazioni` - Prenotazioni cliente (email/phone)
- **POST** `/prenota` - Crea prenotazione + salva cliente
- **POST** `/cancella` - Cancella prenotazione

#### **Performance**
- generaSlotCompleti: ~300-500ms (include pulizia)
- getSlotDisponibili: ~80-120ms  
- Cache hit rate: ~95%
- API response: <200ms

### ✅ **PWA React**

#### **Features Implementate**
- 🔐 Login Google OAuth con JWT token
- 🏠 Welcome screen con returning customer detection
- ✂️ Selezione servizi categorizzata
- 🍀 "Mi sento fortunato" - primi slot disponibili
- 👤 Selezione barbiere (o "Qualsiasi operatore")
- 📅 Calendario slot interattivo raggruppato per giorni
- ⏰ Filtro fasce orarie (mattina/pomeriggio/sera)
- 📱 Prenotazione guidata step-by-step
- ✅ Schermata conferma con Google Calendar export
- 📋 Le mie prenotazioni con possibilità cancellazione
- 💾 Memorizzazione preferenze cliente (Zustand persist)
- 🎨 Apple-style design con animazioni fluide
- 📴 Service Worker con cache strategie

---

## 🏗️ **ARCHITETTURA**

```
┌─────────────┐
│   Clienti   │ Prenotazioni via PWA
│  (Browser)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌──────────────────┐
│ GitHub Pages PWA │ Frontend (React + Vite)
│ (pwa/dist/)      │
└──────┬───────────┘
       │ fetch() + OAuth token
       ▼
┌─────────────────┐
│ Apps Script API │ Backend REST + JWT
│ (scripts/Code)  │
└──────┬──────────┘
       │ Direct Access
       ▼
┌─────────────────┐
│ Google Sheets   │ Database
│ (10 fogli)      │
└─────────────────┘
```

### **Fogli Google Sheets**

- **Configurazione** - Parametri sistema (orari, buffer, slot, `min_notice_hours`)
- **ConfigPWA** - Parametri PWA multi-tenant (50+ parametri)
- **GuidaConfigPWA** - Documentazione inline parametri
- **Clienti** - Anagrafica clienti con OAuth + flag `cn_enablePWA`
- **SerVizi** - Lista servizi (prezzo, durata, categoria)
- **OpeRatori** - Lista operatori (orari, pause, immagine)
- **AppunTamenti** - Slot + prenotazioni unificati
- **Storico** - Appuntamenti archiviati (4 stati)
- **Assenze** - Periodi di assenza operatori

---

## 🔧 **MANUTENZIONE**

### **Aggiornare Backend Apps Script**

```bash
# 1. Modifica scripts/Code.gs

# 2. Push con clasp
npm run clasp:push

# 3. Deploy nuova versione
npm run clasp:deploy
```

### **Aggiornare PWA**

```bash
# Metodo 1: Automatico (GitHub Actions)
git add pwa/
git commit -m "feat: nuova funzionalità"
git push origin main
# → Deploy automatico su GitHub Pages (2-3 min)

# Metodo 2: Build locale
cd pwa
npm run build
# Verifica build in pwa/dist/
git add pwa/dist
git commit -m "build: rebuild PWA"
git push
```

### **Backup Database**

```bash
# Google Sheets → File → Scarica → Foglio di lavoro Google (.xlsx)
# Oppure usa Google Sheets API per backup automatico
```

---

## 🎨 **MULTI-TENANT**

Ogni barbiere può avere:
- ✅ Google Sheets separato (stesso template)
- ✅ Apps Script deployment separato (stesso codice)
- ✅ PWA deployment separato (stesso codice, diverso .env)
- ✅ ConfigPWA personalizzato (nome, colori, logo, testi)

### **Setup Nuovo Negozio**

1. Duplica Google Sheets template
2. Deploy Apps Script con clasp → Ottieni URL API
3. Fork repo PWA → Configura `.github/workflows/deploy.yml` con nuovo API URL
4. Push su GitHub → Attiva GitHub Pages
5. Configura foglio ConfigPWA (nome, colori, OAuth Client ID)

---

## 🐛 **TROUBLESHOOTING**

### **PWA mostra slot che dovrebbero essere nascosti**
- Verifica parametro `min_notice_hours` in foglio Configurazione
- Controlla che il deploy sia avvenuto (GitHub Actions)
- Hard refresh PWA (DevTools → Application → Clear storage + Unregister SW)

### **CORS error dalla PWA**
- Verifica che il Web App sia deployato come "Anyone" (non "Anyone with Google account")
- Usa il deployment URL più recente (non il "Test deployment")

### **API ritorna 401 Unauthorized**
- Token JWT scaduto → Logout e login di nuovo
- Verifica che `cn_enablePWA = TRUE` per il cliente nel foglio Clienti

### **Slot duplicati o sovrapposti**
- Esegui `generaSlotCompleti()` manualmente → pulisce e rigenera
- Verifica che non ci siano prenotazioni "Libero" sovrapposte manualmente

---

## 📞 **SUPPORTO & RISORSE**

- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Apps Script Reference](https://developers.google.com/apps-script/reference)  
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Clasp CLI Docs](https://github.com/google/clasp)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## 📝 **CHANGELOG**

### **v2.3** (15 Ottobre 2025)
- ✅ Pulizia automatica slot passati in `generaSlotCompleti()`
- ✅ Filtro `min_notice_hours` in `apiGetSlot()` (PWA only)
- ✅ Fix boundary conditions: slot non generati su fine prenotazione/assenza
- ✅ GitHub Actions workflow per deploy automatico PWA
- ✅ Cleanup codebase: archiviazione script test in `archive/`
- ✅ Migrazione da `apps-script/` a `scripts/` come sorgente unico

### **v2.2** (10 Ottobre 2025)
- ✅ Sistema OAuth completo con JWT token
- ✅ ConfigPWA parametrizzato (50+ parametri)
- ✅ Gestione accessi PWA (`cn_enablePWA`)
- ✅ Menu admin abilitazione clienti

### **v2.1** (8 Ottobre 2025)
- ✅ API REST completa per PWA
- ✅ Integrazione foglio Clienti con cache
- ✅ Endpoint cliente + preferenze (returning customer)
- ✅ ConfigPWA multi-tenant

### **v2.0**
- ✅ Sistema buffer tempo (prep + pulizia)
- ✅ Architettura unificata AppunTamenti
- ✅ Cache 4-tier (CONFIG, ASSENZE, SERVIZI, OPERATORI)
- ✅ Archiviazione 4 stati

---

## 📄 **LICENSE**

Proprietario: BarberBro Project  
Versione: 2.3  
Ultimo aggiornamento: 15 Ottobre 2025

---

**🚀 Ready to launch!** Segui le guide per iniziare:
1. `docs/SETUP_APPS_SCRIPT.md` - Setup backend completo
2. `pwa/README_OAUTH.md` - Configurazione OAuth PWA
3. `.github/workflows/deploy.yml` - CI/CD automatico
