# 🚀 Deploy Nuovo Apps Script

## Modifiche Apportate

### ✅ Modifiche al file `Code.gs`

1. **`apiGetSlot()` - servizioId ora OPZIONALE**
   - Se `servizioId` non è presente → chiama `getAllFreeSlots()` e restituisce TUTTI gli slot liberi
   - Se `servizioId` è presente → usa il metodo originale per filtrare per servizio

2. **Nuova funzione `getAllFreeSlots(dataInizio, dataFine, operatoreId)`**
   - Legge TUTTO il foglio AppunTamenti
   - Filtra solo slot con `at_status = "Libero"`
   - Filtra per range di date
   - Filtra opzionalmente per operatore
   - Restituisce array di slot liberi (senza calcolare durate servizi)

## 📋 Istruzioni per il Deploy

### 1. Apri Apps Script Editor
```
https://script.google.com/home/projects/1vl-oqCAIpXPZ5WB5HZatKV4lcOBbZaURwwEOK4QmDmRmJYeIDw4EMlfT
```

### 2. Verifica le Modifiche
- Controlla che il codice sia aggiornato
- Verifica che la funzione `getAllFreeSlots()` sia presente (linea ~1355)
- Verifica che `apiGetSlot()` controlli `if (!servizioId)` (linea ~2115)

### 3. Crea Nuovo Deployment
1. Clicca su **Deploy** → **New deployment**
2. Tipo: **Web app**
3. Descrizione: `v2.2 - servizioId opzionale, carica tutti slot liberi`
4. Esegui come: **Me (chronyx.team@gmail.com)**
5. Chi ha accesso: **Chiunque**
6. Clicca **Deploy**

### 4. Copia il Nuovo URL Deployment
Esempio:
```
https://script.google.com/macros/s/AKfycbz...NUOVO_ID.../exec
```

### 5. Aggiorna Frontend (IMPORTANTE!)

**File da modificare**: `pwa/src/services/apiService.js`

```javascript
// Cambia l'URL da:
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbz7rsOTUYpa83iPvyv_67HeBj7gtI2eXMc33wdvan-jpDP66-lsqGRQWpLa_cSMz46P/exec'

// A:
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycb...NUOVO_ID.../exec'
```

### 6. Test
1. Apri Console Browser (F12)
2. Login nella PWA
3. Controlla log:
   ```
   🔍 loadSlots - carico slot con filtri: TUTTI gli slot liberi
   📦 Risposta API slot: {success: true, slots: Array(X), total: X}
   ✅ Slot caricati: X
   ```

## ⚠️ Troubleshooting

### Errore: "servizioId obbligatorio"
- Il deployment è vecchio
- Devi creare un **nuovo deployment** (non aggiornare quello esistente)
- Aggiorna l'URL nel frontend

### 0 slot caricati ma foglio ha dati
- Verifica campo `at_status` nel foglio (deve essere ESATTAMENTE "Libero", non "libero" o "LIBERO")
- Verifica formato data in `at_startDateTime` (deve essere "gg/mm/aaaa HH:MM:SS")

### Slot caricati ma non filtrati correttamente
- Verifica che il calcolo `at_endDateTime` nel frontend usi la durata corretta del servizio
- Controlla che `sv_ID` negli slot corrisponda ai servizi caricati

## 📝 Note
- Mantieni i vecchi deployment attivi per rollback rapido se necessario
- Testa sempre prima di comunicare ai clienti
- Il nuovo sistema carica ~10x più veloce (1 chiamata API vs molte)
