# 🪒 BarberBro - Sistema Completo Gestione Prenotazioni

Sistema completo per gestione prenotazioni barbiere con:
- **Apps Script Backend** - API REST + gestione slot dinamici + **OAuth Google Login** ✨  
- **PWA Frontend** - App web progressiva per clienti (Apple-style design)
- **Multi-tenant** - Configurabile per ogni negozio (50+ parametri)
- **Sicurezza** - Autenticazione OAuth, token sessione, verifica accessi

**Versione**: 2.2  
**Ultimo aggiornamento**: 10 Ottobre 2025

---

## 🎯 **NOVITÀ VERSIONE 2.2**

### ✨ **Sistema OAuth Completo**
- � Login Google OAuth (no password salvate)
- 🎫 Token sessione JWT con expiry configurabile
- 🛡️ Verifica accessi cliente (`cn_enablePWA`)
- 🔒 API protette con middleware auth

### 📋 **ConfigPWA Parametrizzato (50+ parametri)**
- 🎨 7 sezioni: Generale, OAuth, Colori, UI, Regole, Messaggi, Avanzate
- 🔧 Zero hardcode: tutto configurabile da foglio
- 📖 Guida integrata con documentazione completa
- 🌈 Personalizzazione colori, testi, funzionalità

### 👥 **Gestione Accessi PWA**
- ✅ Menu admin per abilitare/disabilitare clienti
- 📊 Monitoraggio ultimo login + contatore prenotazioni
- 🚨 Blocco emergenza (disabilita tutti)
- 📧 Ricerca clienti per email OAuth

---

## �📁 **STRUTTURA PROGETTO**

```
barberBro-Start/
├── apps-script/          ← Backend Apps Script + API REST + OAuth
│   ├── BarberBro_SlotManager_Complete.gs  (2200+ righe)
│   └── README.md
├── pwa/                  ← Frontend PWA React + Vite
│   ├── src/
│   │   ├── components/   (9 componenti Apple-style)
│   │   ├── store/        (Zustand + persistence)
│   │   └── services/     (apiService con OAuth)
│   ├── package.json
│   └── README.md
├── docs/                 ← Documentazione completa
│   ├── SETUP_APPS_SCRIPT.md       (400+ righe setup backend)
│   └── RIEPILOGO_MODIFICHE.md     (changelog dettagliato)
├── tools/                ← Tool Python gestione (opzionale)
├── credentials/          ← Credenziali (gitignored!)
└── README.md             ← Questo file
```

**📚 Ogni cartella ha il suo README dettagliato!**

---

## 🚀 **QUICK START**

### **Prerequisiti**
- Account Google (per Apps Script + Sheets)
- Google Cloud Console access (per OAuth Client ID)
- Node.js 18+ (per PWA)
- Python 3.8+ (per tool gestione, opzionale)

### **1. Setup Backend (15 minuti)**

#### A. Installa Apps Script
```bash
# 1. Crea nuovo Google Sheets
https://sheets.google.com → Nuovo → Rinomina "BarberBro [Nome Negozio]"

# 2. Apri Apps Script
Menu Estensioni → Apps Script

# 3. Copia codice
Copia tutto da: apps-script/BarberBro_SlotManager_Complete.gs
Incolla in editor → Salva

# 4. Esegui setup
Seleziona funzione: setup → Esegui ▶️ → Autorizza
Seleziona funzione: setupConfigPWA → Esegui ▶️
Seleziona funzione: setupGuidaConfigPWA → Esegui ▶️
```

#### B. Setup Google OAuth
```bash
# 1. Google Cloud Console
https://console.cloud.google.com → Nuovo progetto

# 2. Configura OAuth
API e Servizi → Schermata consenso OAuth
- Tipo: Esterno
- Nome app: BarberBro PWA
- Email: tua_email@gmail.com

# 3. Crea credenziali
Credenziali → Crea → ID client OAuth
- Tipo: Applicazione web
- Origini JavaScript: https://script.google.com
- Copia Client ID

# 4. Incolla in Sheets
Foglio ConfigPWA → google_client_id → Incolla Client ID
```

� **Guida completa**: `docs/SETUP_APPS_SCRIPT.md`

#### C. Deploy Web App
```bash
# Apps Script → Deploy → Nuova implementazione
- Tipo: App web
- Esegui come: Me
- Chi ha accesso: Chiunque
- Implementa → COPIA URL
```

Salva URL (formato: `https://script.google.com/macros/s/AKfycby.../exec`)

---

### **2. Setup PWA (10 minuti)**

```bash
# 1. Installa dipendenze
cd pwa
npm install

# 2. Configura API
# Crea file .env
echo "VITE_API_URL=https://script.google.com/macros/s/TUO_ID/exec" > .env

# 3. Installa OAuth Google
npm install @react-oauth/google

# 4. Run dev
npm run dev
```

Apri: http://localhost:3002

---

## 📖 **DOCUMENTAZIONE**

### 📄 **Guide Complete**
- **[SETUP_APPS_SCRIPT.md](docs/SETUP_APPS_SCRIPT.md)** - Setup backend passo-passo (400+ righe)
  - Setup iniziale Apps Script
  - Configurazione Google OAuth (16 step)
  - Gestione fogli (ConfigPWA, Clienti, etc)
  - Deploy Web App
  - Test API
  - Troubleshooting

- **[RIEPILOGO_MODIFICHE.md](docs/RIEPILOGO_MODIFICHE.md)** - Changelog v2.2
  - Tutte le modifiche OAuth
  - Parametri ConfigPWA aggiunti
  - Nuove funzioni API
  - Cosa manca lato PWA

### 📂 **README Specifici**
- `apps-script/README.md` - Dettagli backend API
- `pwa/README.md` - Dettagli frontend React
- `tools/README.md` - Tool Python gestione
- Copia URL API
```

**📖 Guida completa**: [`apps-script/README.md`](apps-script/README.md)

### **2. Setup PWA** (Coming soon)

```bash
cd pwa
npm install
npm run dev
```

**📖 Guida completa**: [`pwa/README.md`](pwa/README.md)

---

## 📊 **FUNZIONALITÀ**

### ✅ **Backend Apps Script**

#### **Sistema Slot Dinamici**
- Generazione automatica slot per N settimane
- Gestione assenze operatori
- Buffer tempo (preparazione + pulizia) configurabile
- Archiviazione automatica appuntamenti vecchi

#### **API REST Completa**
- **GET** `/config` - Configurazione PWA multi-tenant
- **GET** `/servizi` - Lista servizi (prezzo, durata)
- **GET** `/operatori` - Lista operatori attivi
- **GET** `/slot` - Slot disponibili (con filtri avanzati)
- **GET** `/cliente?phone=X` - Dati cliente + preferenze
- **GET** `/prenotazioni?phone=X` - Prenotazioni cliente
- **POST** `/prenota` - Crea prenotazione + salva cliente
- **POST** `/cancella` - Cancella prenotazione

#### **Performance**
- generaSlotCompleti: ~300-500ms
- getSlotDisponibili: ~80-120ms  
- Cache hit rate: ~95%
- API response: <200ms

### 🚧 **PWA React** (In sviluppo)

#### **Planned Features**
- 🏠 Welcome screen con returning customer
- ✂️ Selezione servizi intuitiva
- 🍀 "Mi sento fortunato" - primi slot disponibili
- 👤 Selezione barbiere preferito
- 📅 Calendario slot interattivo
- 📱 Prenotazione 1-tap
- 💾 Memorizzazione preferenze cliente
- 📴 Offline-first con service worker
- 🎨 Multi-tenant (colori/logo/testi configurabili)

---

## 📚 **DOCUMENTAZIONE**

### **Guide Dettagliate**

- 📜 [`apps-script/README.md`](apps-script/README.md) - Backend API completo
- 📱 [`pwa/README.md`](pwa/README.md) - Frontend PWA (TBD)
- 🛠️ [`tools/README.md`](tools/README.md) - Tool Python gestione
- 🔐 [`docs/GUIDA_CREDENZIALI.md`](docs/GUIDA_CREDENZIALI.md) - Setup Google Cloud
- 📤 [`docs/GUIDA_PUSH_PULL.md`](docs/GUIDA_PUSH_PULL.md) - Gestione script
- 🎓 [`docs/GUIDA_SLOT_MANAGER.md`](docs/GUIDA_SLOT_MANAGER.md) - Sistema slot

### **API Reference**

Vedi [`apps-script/README.md#api-rest-endpoints`](apps-script/README.md#-api-rest-endpoints) per documentazione completa API.

---

## 🏗️ **ARCHITETTURA**

```
┌─────────────┐
│   Clienti   │ Prenotazioni via PWA
│  (Browser)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────┐
│   PWA React     │ Frontend (Vercel/Netlify)
│  (pwa/)         │
└──────┬──────────┘
       │ fetch()
       ▼
┌─────────────────┐
│ Apps Script API │ Backend REST (Google)
│ (apps-script/)  │
└──────┬──────────┘
       │ Direct Access
       ▼
┌─────────────────┐
│ Google Sheets   │ Database
│ (Fogli)         │
└─────────────────┘
```

### **Fogli Google Sheets**

- **Configurazione** - Parametri sistema (orari, buffer, slot)
- **ConfigPWA** - Parametri PWA multi-tenant (nome, colori, logo)
- **Clienti** - Anagrafica clienti (gestito auto da PWA)
- **SerVizi** - Lista servizi (prezzo, durata)
- **OpeRatori** - Lista operatori (orari, pause)
- **AppunTamenti** - Slot + prenotazioni unificati
- **Storico** - Appuntamenti archiviati

---

## 🔧 **MANUTENZIONE**

### **Aggiornare Backend**

```bash
cd tools
python apps_script_manager.py push-complete SCRIPT_ID
```

### **Deploy PWA**

```bash
cd pwa
npm run build
vercel --prod
```

### **Backup Database**

Esporta Google Sheets manualmente o usa API.

---

## 🎨 **MULTI-TENANT**

Ogni barbiere ha:
- ✅ Google Sheets separato
- ✅ Apps Script deployment separato
- ✅ PWA deployment separato (stesso codice)
- ✅ ConfigPWA personalizzato (nome, colori, logo)

### **Setup Nuovo Negozio**

1. Crea nuovo Google Sheets (copia template)
2. Deploy Apps Script → Ottieni URL API
3. Deploy PWA con `.env`:
   ```bash
   VITE_API_URL=https://script.google.com/macros/s/.../exec
   VITE_SHOP_NAME="BarberBro Milano"
   ```
4. Configura foglio ConfigPWA

---

## 🐛 **TROUBLESHOOTING**

### **Menu non appare su Sheets**
Esegui `installaTriggerMenu()` una volta da Apps Script editor.

### **API ritorna errore 403**
Deploy Web App con "Who has access: **Anyone**".

### **Slot non generati**
Verifica foglio Configurazione compilato, operatori attivi presenti.

### **PWA non connette API**
Controlla URL in `.env`, verifica CORS attivo su Apps Script.

---

## 📞 **SUPPORTO**

- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Apps Script Reference](https://developers.google.com/apps-script/reference)  
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

---

## 📝 **CHANGELOG**

### **v2.1** (8 Ottobre 2025)
- ✅ API REST completa per PWA
- ✅ Integrazione foglio Clienti con cache
- ✅ Endpoint cliente + preferenze (returning customer)
- ✅ ConfigPWA multi-tenant
- ✅ Riorganizzazione progetto (apps-script/, pwa/, tools/)

### **v2.0**
- ✅ Sistema buffer tempo (prep + pulizia)
- ✅ Architettura unificata AppunTamenti
- ✅ Cache 4-tier (CONFIG, ASSENZE, SERVIZI, OPERATORI)
- ✅ Archiviazione 4 stati (Completato, Cancellato, Non Presentato, Annullato)
- ✅ Ottimizzazione codice -21%

### **v1.0**
- ✅ Generazione slot base
- ✅ Gestione assenze operatori
- ✅ Integrazione Google Sheets

---

## 📄 **LICENSE**

Proprietario: BarberBro Project  
Versione: 2.1  
Ultimo aggiornamento: 8 Ottobre 2025

---

**🚀 Ready to launch!** Segui le guide nelle sottocartelle per iniziare.
