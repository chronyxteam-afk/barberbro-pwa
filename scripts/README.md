# 🚀 BarberBro Apps Script Manager - Alternative senza Python

Sistema di push/pull per Google Apps Script **senza dipendere da Python**!

## 🎯 **OPZIONI DISPONIBILI**

### **Opzione 1: Node.js (Raccomandato) ⭐**

**Vantaggi:**
- ✅ Stesso linguaggio della PWA
- ✅ Gestione OAuth2 completa
- ✅ Error handling avanzato
- ✅ Integrazione con package.json

**Setup:**
```bash
# Installa dipendenze
cd scripts
npm install

# Prima volta: setup
node apps-script-manager.js setup

# Push script
node apps-script-manager.js push <SCRIPT_ID>

# Pull script
node apps-script-manager.js pull <SCRIPT_ID>
```

**Integrazione PWA:**
```bash
# Dalla cartella pwa/
npm run apps-script:push <SCRIPT_ID>
npm run apps-script:pull <SCRIPT_ID>
npm run apps-script:setup
```

---

### **Opzione 2: Bash Script (Cross-platform)**

**Vantaggi:**
- ✅ Nessuna dipendenza Node.js
- ✅ Funziona su Linux/macOS/Windows (Git Bash/WSL)
- ✅ Script leggero e veloce

**Setup:**
```bash
# Installa dipendenze (Ubuntu/Debian)
sudo apt install curl jq

# Installa dipendenze (macOS)
brew install curl jq

# Prima volta: setup
./scripts/apps-script-manager.sh setup

# Push script
./scripts/apps-script-manager.sh push <SCRIPT_ID>

# Pull script
./scripts/apps-script-manager.sh pull <SCRIPT_ID>
```

---

## 🔧 **CONFIGURAZIONE COMUNE**

### **1. Credenziali OAuth2**

Entrambe le opzioni richiedono `credentials.json`:

1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Seleziona progetto **"barberappsheetscript"**
3. **APIs & Services** → **Credentials**
4. **+ CREATE CREDENTIALS** → **OAuth client ID**
5. **Application type**: Desktop app
6. **Name**: BarberBro Desktop OAuth
7. **DOWNLOAD JSON** → rinomina in `credentials.json`
8. Metti il file nella **root del progetto**

### **2. Abilita Google Apps Script API**

1. **APIs & Services** → **Library**
2. Cerca **"Google Apps Script API"**
3. Clicca **ENABLE**

### **3. Script ID**

1. Apri Google Sheets
2. **Estensioni** → **Apps Script**
3. Copia ID dalla URL:
   ```
   https://script.google.com/d/ABC123XYZ/edit
                              ^^^^^^^^^
   ```

---

## 🚀 **WORKFLOW COMPLETO**

### **Prima volta:**
```bash
# Setup (scegli una opzione)

# Node.js
cd scripts && npm install
node apps-script-manager.js setup

# Bash
./scripts/apps-script-manager.sh setup
```

### **Sviluppo quotidiano:**
```bash
# 1. Modifica codice locale
vim apps-script/BarberBro_SlotManager_Complete.gs

# 2. Push su Google (scegli una opzione)

# Node.js
node scripts/apps-script-manager.js push ABC123XYZ

# Bash
./scripts/apps-script-manager.sh push ABC123XYZ

# PWA integration
cd pwa && npm run apps-script:push ABC123XYZ

# 3. ✅ Fatto! Script aggiornato su Google in 2 secondi!
```

---

## 📊 **CONFRONTO OPZIONI**

| Caratteristica | Node.js | Bash | Python (attuale) |
|----------------|---------|------|------------------|
| **Dipendenze** | googleapis | curl, jq | google-api-python-client |
| **Setup** | npm install | apt/brew install | pip install |
| **Cross-platform** | ✅ | ✅ (con Git Bash) | ✅ |
| **Error handling** | ✅ Avanzato | ✅ Base | ✅ Avanzato |
| **OAuth2** | ✅ Completo | ✅ Completo | ✅ Completo |
| **Integrazione PWA** | ✅ Nativa | ❌ | ❌ |
| **Manutenzione** | ✅ Facile | ✅ Facile | ⚠️ Python |

---

## 🎯 **RACCOMANDAZIONE**

**Usa Node.js** se:
- ✅ Vuoi integrazione nativa con la PWA
- ✅ Preferisci un linguaggio unificato
- ✅ Vuoi error handling avanzato

**Usa Bash** se:
- ✅ Vuoi zero dipendenze Node.js
- ✅ Preferisci script leggeri
- ✅ Lavori principalmente su Linux/macOS

**Mantieni Python** se:
- ✅ Il sistema attuale funziona bene
- ✅ Non vuoi cambiare workflow
- ✅ Hai già tutto configurato

---

## 🔄 **MIGRAZIONE DA PYTHON**

### **Mantieni entrambi:**
```bash
# Python (attuale)
python apps_script_manager.py push-complete <SCRIPT_ID>

# Node.js (nuovo)
node scripts/apps-script-manager.js push <SCRIPT_ID>

# Bash (nuovo)
./scripts/apps-script-manager.sh push <SCRIPT_ID>
```

### **Migrazione graduale:**
1. **Testa** le nuove opzioni
2. **Confronta** performance e usabilità
3. **Scegli** quella che preferisci
4. **Aggiorna** documentazione e workflow

---

## 🐛 **TROUBLESHOOTING**

### **Node.js: "googleapis not found"**
```bash
cd scripts
npm install
```

### **Bash: "curl not found"**
```bash
# Ubuntu/Debian
sudo apt install curl jq

# macOS
brew install curl jq

# Windows
# Usa Git Bash o WSL
```

### **OAuth: "Invalid credentials"**
1. Verifica `credentials.json` nella root
2. Controlla che sia OAuth2 (non Service Account)
3. Riprova autenticazione

### **API: "has not been used"**
1. Vai su Google Cloud Console
2. Abilita Google Apps Script API
3. Attendi 1-2 minuti
4. Riprova

---

## 📚 **DOCUMENTAZIONE**

- **Setup completo**: `docs/GUIDA_PUSH_PULL.md`
- **API Reference**: [Google Apps Script API](https://developers.google.com/apps-script/api)
- **OAuth2 Guide**: [Google OAuth2](https://developers.google.com/identity/protocols/oauth2)

---

**🎉 Ora hai 3 opzioni per gestire Apps Script senza dipendere solo da Python!**
