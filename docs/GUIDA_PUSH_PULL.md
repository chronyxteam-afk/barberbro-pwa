# 🚀 BarberBro - Sistema Completo Push/Pull Apps Script

Questo sistema ti permette di lavorare sul codice Google Apps Script direttamente da VS Code e pushare le modifiche automaticamente!

---

## 📋 SETUP INIZIALE (Una tantum)

### Step 1: Abilita Google Apps Script API

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Seleziona il progetto **"barberappsheetscript"**
3. Menu → **APIs & Services** → **Library**
4. Cerca **"Google Apps Script API"**
5. Clicca **Enable**

### Step 2: Crea credenziali OAuth 2.0

⚠️ **IMPORTANTE**: Apps Script API NON funziona con Service Account, serve OAuth 2.0!

1. Menu → **APIs & Services** → **Credentials**
2. Clicca **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Desktop app**
4. Name: **BarberBro Desktop OAuth**
5. Clicca **CREATE**
6. **Scarica il JSON** (pulsante download)
7. Rinominalo in `credentials.json` (quello per OAuth, diverso da service_account.json!)
8. Mettilo nella cartella del progetto

**Risultato**: Ora hai DUE file di credenziali:
- `service_account.json` → Per Google Sheets (lettura/scrittura dati)
- `credentials.json` → Per Apps Script API (push/pull codice)

### Step 3: Apri Apps Script nel foglio (prima volta)

1. Apri il foglio: https://docs.google.com/spreadsheets/d/1O-3CmzjiS0eY8l-ITfNKMtaiN1RZn9xB4wlZFpvFaFw/edit
2. Menu → **Estensioni** → **Apps Script**
3. Si apre l'editor (creerà un progetto vuoto)
4. **Copia lo Script ID** dalla URL:
   ```
   https://script.google.com/home/projects/ABC123XYZ.../edit
                                       ↑ Questo è lo Script ID
   ```
5. Apri il file `.env` e inserisci:
   ```
   APPS_SCRIPT_ID=il_tuo_script_id_qui
   ```

---

## 🎮 UTILIZZO

### Comandi Disponibili

```bash
# Guida setup
python apps_script_manager.py setup

# Scarica script da Google (PULL)
python apps_script_manager.py pull

# Carica script su Google (PUSH)
python apps_script_manager.py push <script_id> <file.gs>

# Carica il file completo unificato
python apps_script_manager.py push-complete <script_id>
```

---

## 📤 PUSH: Carica script su Google

### Prima volta (autenticazione)

```bash
python apps_script_manager.py push-complete IL_TUO_SCRIPT_ID
```

**Cosa succede:**
1. Si apre il browser
2. Ti chiede di autorizzare l'app
3. Scegli il tuo account Google
4. Clicca **Avanzate** → **Vai a BarberBro (non sicuro)**
5. Clicca **Consenti**
6. Token salvato in `token_apps_script.pickle`
7. Script pushato! ✅

### Volte successive

```bash
python apps_script_manager.py push-complete IL_TUO_SCRIPT_ID
```

Usa il token salvato, nessuna autenticazione richiesta! 🚀

---

## 📥 PULL: Scarica script da Google

Scarica il codice attuale da Google e salvalo localmente nella cartella `scripts/`:

```bash
python apps_script_manager.py pull
```

Utile per:
- Vedere modifiche fatte direttamente nell'editor Google
- Backup del codice
- Sincronizzare con altri sviluppatori

---

## 🔄 WORKFLOW COMPLETO

### 1. Modifica locale

Lavori nel file `BarberBro_SlotManager_Complete.gs` in VS Code con:
- ✅ Syntax highlighting
- ✅ Autocomplete
- ✅ Git versioning
- ✅ Ricerca avanzata

### 2. Push su Google

```bash
python apps_script_manager.py push-complete IL_TUO_SCRIPT_ID
```

### 3. Testa nel foglio

1. Apri il foglio Google
2. Menu **🔧 BarberBro** → **Genera Slot**
3. Testa le funzioni

### 4. Se qualcun altro modifica

```bash
python apps_script_manager.py pull
```

Scarichi le modifiche e le vedi in VS Code!

---

## 📁 STRUTTURA FILE

```
barberBro-Start/
├── credentials.json                    ← OAuth per Apps Script API
├── service_account.json                ← Service Account per Sheets API
├── token_apps_script.pickle            ← Token OAuth salvato (auto-generato)
├── .env                                ← Config (SPREADSHEET_ID, APPS_SCRIPT_ID)
├── BarberBro_SlotManager_Complete.gs   ← Script unificato completo
├── apps_script_manager.py              ← Manager push/pull
└── scripts/                            ← Script scaricati con pull (auto-creato)
```

---

## 🎯 ESEMPI PRATICI

### Scenario 1: Prima installazione completa

```bash
# 1. Setup API (mostra guida)
python apps_script_manager.py setup

# 2. [Vai su Cloud Console e abilita API come indicato]

# 3. [Apri foglio → Apps Script → Copia Script ID → Metti in .env]

# 4. Push iniziale (ti chiede autorizzazione)
python apps_script_manager.py push-complete ABC123XYZ

# ✅ Fatto! Script su Google
```

### Scenario 2: Modifico una funzione

```javascript
// In BarberBro_SlotManager_Complete.gs

function setup() {
  // ... modifico la funzione ...
}
```

```bash
# Push modifiche
python apps_script_manager.py push-complete ABC123XYZ

# ✅ Aggiornato su Google in 2 secondi!
```

### Scenario 3: Backup/download

```bash
# Scarica tutto il codice attuale
python apps_script_manager.py pull

# Trova i file in scripts/
# - scripts/Code.gs
# - scripts/appsscript.json
```

---

## 🔐 SICUREZZA

### File da NON committare (già in .gitignore)

- `credentials.json` ← OAuth credentials
- `service_account.json` ← Service account
- `token_apps_script.pickle` ← Token salvato
- `.env` ← Configuration

### File da committare

- `BarberBro_SlotManager_Complete.gs` ← Codice script
- `apps_script_manager.py` ← Manager
- `requirements.txt` ← Dipendenze
- `GUIDA_*.md` ← Documentazione

---

## 🐛 TROUBLESHOOTING

### Errore: "Google Apps Script API has not been enabled"

**Soluzione:**
1. Vai su Cloud Console
2. APIs & Services → Library
3. Cerca "Google Apps Script API"
4. Clicca Enable
5. Aspetta 1-2 minuti

### Errore: "Invalid credentials"

**Soluzione:**
1. Cancella `token_apps_script.pickle`
2. Riprova il comando
3. Riautorizza nel browser

### Errore: "Script ID not found"

**Soluzione:**
1. Apri il foglio Google
2. Estensioni → Apps Script
3. Copia lo Script ID dalla URL
4. Aggiorna `.env` con il valore corretto

### Non trovo lo Script ID

**Lo Script ID è nella URL dell'editor Apps Script:**

```
https://script.google.com/home/projects/1A2B3C4D5E.../edit
                                       ^^^^^^^^^^
                                       Questo!
```

Oppure:
```
https://script.google.com/d/1A2B3C4D5E.../edit
                            ^^^^^^^^^^
```

### Service Account vs OAuth

**Service Account** (`service_account.json`):
- ✅ Per Google Sheets API (lettura/scrittura celle)
- ✅ Per automazioni server-side
- ❌ NON funziona con Apps Script API

**OAuth** (`credentials.json`):
- ✅ Per Apps Script API (push/pull codice)
- ✅ Richiede autorizzazione browser prima volta
- ✅ Token salvato per usi futuri

**Entrambi sono necessari!** 🔑

---

## 🚀 VANTAGGIO DI QUESTO SISTEMA

### Prima (manuale)

1. Apri foglio Google
2. Estensioni → Apps Script
3. Modifica nell'editor web
4. Salva
5. Ricarica foglio per testare
6. Nessun version control
7. Un solo schermo

### Ora (automatico)

1. Apri VS Code
2. Modifica `BarberBro_SlotManager_Complete.gs`
3. `python apps_script_manager.py push-complete ABC123`
4. ✅ Online in 2 secondi!
5. Git versioning automatico
6. Doppio schermo: code + foglio

---

## 💡 TIPS

### Alias comandi (opzionale)

Aggiungi al tuo `.bashrc` o PowerShell profile:

```bash
# Bash/Zsh
alias bb-push='python apps_script_manager.py push-complete'
alias bb-pull='python apps_script_manager.py pull'

# PowerShell
function bb-push { python apps_script_manager.py push-complete $args }
function bb-pull { python apps_script_manager.py pull }
```

Uso:
```bash
bb-push ABC123XYZ    # invece di python apps_script_manager.py push-complete ...
bb-pull              # invece di python apps_script_manager.py pull
```

### Hotkey VS Code

Crea un task in `.vscode/tasks.json`:

```json
{
  "label": "Push Apps Script",
  "type": "shell",
  "command": "python apps_script_manager.py push-complete ${input:scriptId}",
  "inputs": [
    {
      "id": "scriptId",
      "type": "promptString",
      "description": "Script ID"
    }
  ]
}
```

Poi: `Ctrl+Shift+P` → `Tasks: Run Task` → `Push Apps Script`

---

## ✅ CHECKLIST SETUP

Prima di usare il sistema, verifica:

- [ ] Google Apps Script API abilitata su Cloud Console
- [ ] File `credentials.json` (OAuth) nella cartella progetto
- [ ] File `service_account.json` (per Sheets) nella cartella progetto
- [ ] Aperto Apps Script almeno una volta dal foglio
- [ ] Script ID copiato e inserito in `.env`
- [ ] Eseguito prima autenticazione con successo
- [ ] File `token_apps_script.pickle` creato automaticamente

---

## 🎉 PRONTO!

Ora puoi lavorare sul codice comodamente in VS Code e pushare con un comando!

```bash
python apps_script_manager.py push-complete IL_TUO_SCRIPT_ID
```

**Buon coding! 🚀**
