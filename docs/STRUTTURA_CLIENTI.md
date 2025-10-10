# 📊 STRUTTURA FOGLIO CLIENTI - BarberBro

## 🗂️ **Colonne Foglio "Clienti"**

| Colonna | Nome Campo | Tipo | Descrizione | Esempio |
|---------|------------|------|-------------|---------|
| **A** | `cn_ID` | Testo | ID univoco cliente (auto-generato) | `CN1696234567890` |
| **B** | `cn_name` | Testo | Nome completo cliente | `Mario Rossi` |
| **C** | `cn_phone` | Testo | Telefono con prefisso | `+39 333 1234567` |
| **D** | `cn_email` | Email | Email usata per login OAuth | `mario.rossi@gmail.com` |
| **E** | `cn_enablePWA` | SI/NO | **Abilita accesso PWA** | `SI` o `NO` |
| **F** | `cn_lastLogin` | Data/Ora | Ultimo login PWA | `10/10/2025 14:30:00` |
| **G** | `cn_totalBookings` | Numero | Contatore prenotazioni totali | `5` |

---

## ⚙️ **Come funziona `cn_enablePWA`**

### **Valori Accettati:**
- ✅ `SI` → Cliente può accedere alla PWA
- ❌ `NO` → Cliente bloccato (riceve errore `PWA_DISABLED`)

### **Flusso di Verifica:**

```
1. Cliente clicca "Accedi con Google" nella PWA
2. Google OAuth → Estrae email (es: mario.rossi@gmail.com)
3. PWA chiama API: POST /login con { email: "mario.rossi@gmail.com" }
4. Apps Script esegue apiLogin(email):
   
   a. Cerca email nel foglio Clienti (colonna D)
   b. Se NON trovata → Errore: EMAIL_NOT_FOUND
   c. Se trovata → Legge colonna E (cn_enablePWA)
   d. Se cn_enablePWA = "NO" → Errore: PWA_DISABLED
   e. Se cn_enablePWA = "SI" → ✅ Genera token + Login OK
   
5. Aggiorna colonna F (cn_lastLogin) con timestamp corrente
6. Incrementa colonna G (cn_totalBookings) di +1
```

---

## 🔧 **Dove viene usato `cn_enablePWA`**

### **1. Funzione `loadClientiCache()` (riga 247-256)**
Legge foglio Clienti e carica in memoria:
```javascript
cn_enablePWA: row[4] === 'SI' || row[4] === true, // Colonna E
```

### **2. Funzione `apiLogin()` (riga 1707)**
Verifica accesso PWA:
```javascript
if (!cliente.cn_enablePWA) {
  return {
    success: false,
    error: 'Accesso PWA non abilitato',
    errorCode: 'PWA_DISABLED'
  };
}
```

### **3. Menu Gestione Accessi PWA (riga 1223-1286)**
Funzioni per abilitare/disabilitare clienti:
- `menuGestisciAccessiPWA()` → Abilita/Disabilita singolo cliente
- `menuAbilitaTuttiClienti()` → Imposta tutti a "SI"
- `menuDisabilitaTuttiClienti()` → Imposta tutti a "NO"

```javascript
sheet.getRange(i + 1, 5).setValue(enable ? 'SI' : 'NO'); // Colonna E
```

---

## 📝 **Esempio Pratico: Aggiungi Cliente con PWA Abilitata**

### **Manuale (Google Sheets):**
```
1. Apri foglio "Clienti"
2. Aggiungi riga:
   A: CN1696234567890
   B: Mario Rossi
   C: +39 333 1234567
   D: mario.rossi@gmail.com
   E: SI                        ← Abilita PWA
   F: (lascia vuoto)
   G: 0
3. Salva (Ctrl+S)
```

### **Automatico (Menu BarberBro):**
```
1. Menu 🔧 BarberBro → 🔐 Gestione Accessi PWA → 👥 Abilita/Disabilita Clienti
2. Inserisci email: mario.rossi@gmail.com
3. Popup: "Abilitare o disabilitare?"
4. Scegli: Abilita
5. ✅ Fatto! Colonna E impostata a "SI"
```

---

## 🚨 **Errori Comuni**

### ❌ **Errore: EMAIL_NOT_FOUND**
**Causa**: Email non esiste nel foglio Clienti (colonna D)  
**Soluzione**: Aggiungi riga con email corretta

### ❌ **Errore: PWA_DISABLED**
**Causa**: Colonna E (cn_enablePWA) = "NO" o vuota  
**Soluzione**: 
1. Trova riga cliente nel foglio Clienti
2. Modifica colonna E in "SI"
3. Salva

### ❌ **Cliente può loggarsi ma non vede slot**
**Causa**: cn_enablePWA = "SI" ma altri problemi (token, API, ecc.)  
**Verifica**:
1. Console browser: errori API?
2. Apps Script Logs: token valido?
3. ConfigPWA: enable_pwa = true?

---

## 🔐 **Sicurezza**

### **Perché usare cn_enablePWA?**
- 🛡️ **Controllo accessi**: Barbiere decide chi può usare PWA
- 🚫 **Blocco immediato**: Cambia "SI" → "NO" per disabilitare utente
- 📊 **Tracking**: cn_lastLogin e cn_totalBookings per monitoring
- 🎯 **Scalabile**: Ogni barbiere gestisce i propri clienti

### **Flusso Sicuro:**
```
Google OAuth (email verificata)
    ↓
Anagrafica Clienti (email in foglio)
    ↓
cn_enablePWA = SI (controllo barbiere)
    ↓
Token sessione 24h (CacheService)
    ↓
Bearer Authorization su tutte le API
```

---

## 📊 **Statistiche Utili**

### **Query da fare sul foglio Clienti:**

```javascript
// Conta clienti con PWA abilitata
=COUNTIF(E:E,"SI")

// Conta clienti con PWA disabilitata
=COUNTIF(E:E,"NO")

// Ultimo login più recente
=MAX(F:F)

// Cliente con più prenotazioni
=MAX(G:G)
```

---

## 🎯 **Best Practices**

1. ✅ **Sempre impostare cn_enablePWA**:
   - Nuovi clienti: Default "NO" (attivare manualmente)
   - Clienti fidati: Impostare "SI"

2. ✅ **Usare menu BarberBro**:
   - Più veloce che modificare foglio manualmente
   - Automatico, senza errori di battitura

3. ✅ **Monitorare cn_lastLogin**:
   - Clienti inattivi > 6 mesi: considerare disabilitazione
   - Clienti attivi: monitorare pattern di prenotazione

4. ✅ **Backup settimanale**:
   - Esporta foglio Clienti in CSV
   - Salva backup per disaster recovery

---

## 📚 **File Correlati**

- `apps-script/BarberBro_SlotManager_Complete.gs` → Logica backend
- `docs/SETUP_APPS_SCRIPT.md` → Guida setup completa
- `docs/CHECKLIST_DEPLOYMENT.md` → Deployment cliente
- `README_PILOT.md` → Guida test progetto pilot

---

🎉 **Ora sai tutto su come gestire gli accessi PWA!**
