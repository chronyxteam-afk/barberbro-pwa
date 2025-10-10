# 🔑 Guida Completa: Configurare le Credenziali Google Cloud

Questa guida ti mostra come ottenere le credenziali per accedere a Google Sheets dal tuo script Python.

## 📋 Indice
1. [Creare un Progetto Google Cloud](#1-creare-un-progetto-google-cloud)
2. [Abilitare Google Sheets API](#2-abilitare-google-sheets-api)
3. [Scegliere il tipo di autenticazione](#3-scegliere-il-tipo-di-autenticazione)
4. [Opzione A: Service Account (Consigliato)](#opzione-a-service-account-consigliato)
5. [Opzione B: OAuth 2.0 (Uso Personale)](#opzione-b-oauth-20-uso-personale)
6. [Condividere il Foglio Google](#6-condividere-il-foglio-google)
7. [Configurare il Progetto](#7-configurare-il-progetto)

---

## 1. Creare un Progetto Google Cloud

1. Vai su **[Google Cloud Console](https://console.cloud.google.com/)**
2. Clicca su **"Select a project"** (in alto a sinistra)
3. Clicca su **"NEW PROJECT"**
4. Inserisci un nome (es: "BarberBro-Gestionale")
5. Clicca su **"CREATE"**
6. Aspetta qualche secondo e seleziona il nuovo progetto

---

## 2. Abilitare Google Sheets API

1. Nel menu laterale (☰), vai su **"APIs & Services" → "Library"**
2. Cerca **"Google Sheets API"**
3. Clicca sulla card **"Google Sheets API"**
4. Clicca sul pulsante **"ENABLE"**
5. ✅ API abilitata!

---

## 3. Scegliere il Tipo di Autenticazione

### 🤖 Service Account (Consigliato)
**Quando usarlo:**
- ✅ Per automazioni e script
- ✅ Non richiede login ogni volta
- ✅ Più sicuro per script automatici
- ✅ Ideale per produzione

**Vai a:** [Opzione A](#opzione-a-service-account-consigliato)

### 👤 OAuth 2.0 (Uso Personale)
**Quando usarlo:**
- ✅ Per uso personale interattivo
- ✅ Vuoi usare il tuo account Google
- ✅ Per sviluppo e test rapidi

**Vai a:** [Opzione B](#opzione-b-oauth-20-uso-personale)

---

## Opzione A: Service Account (Consigliato)

### Passo 1: Creare il Service Account

1. Nel menu laterale, vai su **"APIs & Services" → "Credentials"**
2. Clicca su **"+ CREATE CREDENTIALS"** (in alto)
3. Seleziona **"Service account"**
4. Compila il form:
   - **Service account name:** `barberbro-service`
   - **Service account ID:** (generato automaticamente)
   - **Description:** `Service account per accesso a Google Sheets`
5. Clicca **"CREATE AND CONTINUE"**
6. **Role:** Seleziona **"Editor"** (o lascia vuoto per ora)
7. Clicca **"CONTINUE"** e poi **"DONE"**

### Passo 2: Scaricare la Chiave JSON

1. Nella pagina **"Credentials"**, trovi il service account appena creato
2. Clicca sul **nome del service account** (barberbro-service@...)
3. Vai sulla tab **"KEYS"**
4. Clicca **"ADD KEY" → "Create new key"**
5. Seleziona **"JSON"**
6. Clicca **"CREATE"**
7. 📥 Il file JSON verrà scaricato automaticamente

### Passo 3: Configurare il File

1. **IMPORTANTE:** Copia l'**email del service account**
   - La trovi nel file JSON appena scaricato, campo `"client_email"`
   - Sarà tipo: `barberbro-service@progetto.iam.gserviceaccount.com`
   - 📋 **COPIALA!** Ti servirà per condividere il foglio Google

2. Rinomina il file scaricato in `service_account.json`

3. Sposta il file nella cartella del progetto:
   ```
   C:\Users\sixba\progetti\barberBro-Start\service_account.json
   ```

✅ **Fatto!** Ora vai a: [6. Condividere il Foglio Google](#6-condividere-il-foglio-google)

---

## Opzione B: OAuth 2.0 (Uso Personale)

### Passo 1: Creare le Credenziali OAuth

1. Nel menu laterale, vai su **"APIs & Services" → "Credentials"**
2. Clicca su **"+ CREATE CREDENTIALS"**
3. Seleziona **"OAuth client ID"**

### Passo 2: Configurare OAuth Consent Screen (se richiesto)

Se è la prima volta, dovrai configurare la schermata di consenso:

1. Clicca su **"CONFIGURE CONSENT SCREEN"**
2. Seleziona **"External"** (per uso personale)
3. Clicca **"CREATE"**
4. Compila i campi obbligatori:
   - **App name:** `BarberBro`
   - **User support email:** (il tuo email)
   - **Developer contact:** (il tuo email)
5. Clicca **"SAVE AND CONTINUE"**
6. **Scopes:** Clicca **"SAVE AND CONTINUE"** (lascia vuoto)
7. **Test users:** Aggiungi il tuo email cliccando **"+ ADD USERS"**
8. Clicca **"SAVE AND CONTINUE"**
9. Clicca **"BACK TO DASHBOARD"**

### Passo 3: Creare OAuth Client ID

1. Torna su **"Credentials"**
2. Clicca **"+ CREATE CREDENTIALS" → "OAuth client ID"**
3. **Application type:** Seleziona **"Desktop app"**
4. **Name:** `BarberBro Desktop Client`
5. Clicca **"CREATE"**
6. 📥 Scarica il file JSON

### Passo 4: Configurare il File

1. Rinomina il file scaricato in `credentials.json`
2. Sposta il file nella cartella del progetto:
   ```
   C:\Users\sixba\progetti\barberBro-Start\credentials.json
   ```

✅ **Fatto!** Continua con: [7. Configurare il Progetto](#7-configurare-il-progetto)

---

## 6. Condividere il Foglio Google

### ⚠️ IMPORTANTE per Service Account

Se hai usato il **Service Account**, devi condividere il foglio Google con l'email del service account:

1. Apri il tuo **Foglio Google** del gestionale barbiere
2. Clicca su **"Condividi"** (in alto a destra)
3. Incolla l'**email del service account**
   - Esempio: `barberbro-service@progetto-123456.iam.gserviceaccount.com`
   - La trovi nel file `service_account.json`, campo `"client_email"`
4. Imposta i permessi su **"Editor"** (per leggere E scrivere)
5. **DESELEZIONA** "Invia notifica"
6. Clicca **"Condividi"**

✅ **Fatto!** Il service account può ora accedere al foglio.

### 📝 Per OAuth 2.0

Se usi OAuth 2.0, non serve condividere: accedi già con il tuo account Google.

---

## 7. Configurare il Progetto

### Passo 1: Ottenere lo Spreadsheet ID

1. Apri il foglio Google nel browser
2. Guarda l'URL:
   ```
   https://docs.google.com/spreadsheets/d/ABC123XYZ456_QUESTO_È_L_ID/edit
   ```
3. Copia la parte tra `/d/` e `/edit`
4. 📋 **COPIALO!**

### Passo 2: Creare il file .env

1. Copia il file `.env.example`:
   ```powershell
   copy .env.example .env
   ```

2. Apri `.env` e inserisci lo Spreadsheet ID:
   ```
   SPREADSHEET_ID=ABC123XYZ456_il_tuo_id_qui
   ```

3. Salva il file

✅ **Tutto pronto!**

---

## 🚀 Testare la Connessione

Ora puoi testare se tutto funziona:

```powershell
python esempio_utilizzo.py
```

### Se usi Service Account:
- Lo script si connette direttamente
- Non richiede login

### Se usi OAuth 2.0:
- Si aprirà il browser
- Ti chiederà di autorizzare l'app
- Clicca su "Consenti"
- Torna al terminale

---

## 🐛 Problemi Comuni

### Errore: "FileNotFoundError: credentials.json"
**Soluzione:**
- Verifica che il file sia nella cartella giusta
- Controlla il nome del file (minuscole/maiuscole)

### Errore: "The caller does not have permission"
**Soluzione:**
- Hai condiviso il foglio con l'email del service account?
- Hai dato permessi di "Editor"?

### Errore: "API has not been used in project"
**Soluzione:**
- Vai su Google Cloud Console
- Abilita Google Sheets API
- Aspetta 1-2 minuti

### Errore: "Access blocked: This app's request is invalid"
**Soluzione:**
- Verifica di aver configurato OAuth Consent Screen
- Aggiungi il tuo email come "Test user"
- Imposta lo scope corretto

---

## 📞 Link Utili

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Troubleshooting Guide](https://developers.google.com/sheets/api/guides/troubleshoot)

---

## ✅ Checklist Finale

Prima di testare, assicurati di aver fatto:

- [ ] Creato progetto Google Cloud
- [ ] Abilitato Google Sheets API
- [ ] Scaricato credenziali (service_account.json O credentials.json)
- [ ] Condiviso foglio con service account (se applicabile)
- [ ] Copiato Spreadsheet ID
- [ ] Creato file .env con lo Spreadsheet ID
- [ ] I file delle credenziali sono nella cartella del progetto

🎉 **Sei pronto per partire!**
