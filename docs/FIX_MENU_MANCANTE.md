# 🔧 FIX: Menu BarberBro Incompleto

## ❌ Problema
Nel menu vedi solo "Setup ConfigPWA" ma manca "Crea Guida ConfigPWA"

---

## ✅ Soluzione Rapida

### **Metodo 1: Reinstalla Trigger (RACCOMANDATO)**

1. **Apri Apps Script**:
   - Google Sheets → Menu Estensioni → Apps Script

2. **Esegui funzione `installaTriggerMenu`**:
   - Dropdown funzioni in alto → Seleziona: `installaTriggerMenu`
   - Clicca Esegui ▶️
   - Attendi popup: "✅ Trigger installato!"

3. **Ricarica Google Sheets**:
   - Premi `F5` o chiudi/riapri il foglio

4. **Verifica menu**:
   ```
   🔧 BarberBro
   ├── ⚙️ Setup Configurazione
   ├── 🎨 Setup ConfigPWA
   ├── 📖 Crea Guida ConfigPWA          ← Deve esserci!
   ├── ───────────────────
   ├── 🔐 Gestione Accessi PWA
   │   ├── 👥 Abilita/Disabilita Clienti
   │   ├── ✅ Abilita TUTTI i Clienti
   │   └── ❌ Disabilita TUTTI i Clienti
   ├── ───────────────────
   ├── 🔄 Genera Slot
   ├── 🗑️ Reset Cache
   ├── ───────────────────
   └── 📦 Archivia Appuntamenti Vecchi
   ```

---

### **Metodo 2: Esegui Manualmente `setupGuidaConfigPWA`**

Se il menu non si aggiorna, esegui direttamente la funzione:

1. **Apps Script**:
   - Dropdown funzioni → Seleziona: `setupGuidaConfigPWA`
   - Clicca Esegui ▶️

2. **Attendi conferma**:
   - Console: "Guida ConfigPWA creata con 80+ righe"

3. **Verifica foglio**:
   - Google Sheets → Cerca tab **"Guida_ConfigPWA"**
   - Deve contenere 80+ righe di documentazione

---

### **Metodo 3: Forza Ricarica Menu**

Se dopo `installaTriggerMenu` il menu non appare:

1. **Apri Script Editor**:
   - Google Sheets → Estensioni → Apps Script

2. **Esegui `onOpen` manualmente**:
   - Dropdown funzioni → Seleziona: `onOpen`
   - Clicca Esegui ▶️

3. **Torna su Sheets e ricarica** (F5)

---

## 🐛 Debug: Verifica Trigger

Se il problema persiste:

1. **Apps Script** → Menu a sinistra: **Trigger** (⏰)

2. **Verifica trigger esistente**:
   ```
   Funzione: onOpen
   Tipo evento: Dall'evento foglio di lavoro
   Tipo: All'apertura
   ```

3. **Se NON presente**:
   - Esegui `installaTriggerMenu` (Metodo 1)

4. **Se presente ma non funziona**:
   - Elimina trigger esistente
   - Esegui `installaTriggerMenu` (crea nuovo trigger)

---

## 📋 Checklist Completa Setup

Dopo aver sistemato il menu, verifica di aver eseguito TUTTE queste funzioni:

- [x] `setup` → Crea foglio Configurazione
- [x] `setupConfigPWA` → Crea foglio ConfigPWA (53 parametri)
- [ ] `setupGuidaConfigPWA` → Crea foglio Guida_ConfigPWA (80+ righe) ⚠️ **FAI QUESTO**
- [x] `installaTriggerMenu` → Installa menu automatico

---

## 🎯 Ordine Corretto Esecuzione

Segui questo ordine la prima volta:

```
1. setup                   → Crea struttura base
2. setupConfigPWA         → Parametri PWA
3. setupGuidaConfigPWA    → Documentazione parametri ⭐
4. installaTriggerMenu    → Menu automatico
5. F5 (ricarica foglio)   → Verifica menu completo
```

---

## 🚨 Problema Persistente?

Se dopo tutti i metodi il menu continua a mancare voci:

### **Verifica versione script**:

1. Apps Script → Riga 1576 dovrebbe contenere:
   ```javascript
   .addItem('📖 Crea Guida ConfigPWA', 'setupGuidaConfigPWA')
   ```

2. **Se manca**, copia di nuovo il file completo:
   - `apps-script/BarberBro_SlotManager_Complete.gs`
   - Incolla tutto in Apps Script
   - Salva (Ctrl+S)
   - Esegui `installaTriggerMenu`
   - Ricarica foglio

---

## ✅ Risultato Atteso

Dopo il fix, avrai:

- ✅ Menu completo con 10 voci
- ✅ Foglio **Guida_ConfigPWA** con documentazione completa
- ✅ Trigger installato per menu automatico
- ✅ Pronto per configurare OAuth e testare

---

🎉 **Una volta sistemato il menu, procedi con il setup OAuth seguendo README_PILOT.md!**
