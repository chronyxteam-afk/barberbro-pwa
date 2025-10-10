# 🔧 BARBERBRO - Sistema Gestione Slot Dinamici

## 📋 Guida Completa all'Installazione e Utilizzo

---

## 🎯 Cosa fa questo sistema?

Gestisce automaticamente gli slot di disponibilità del barbiere tenendo conto di:
- ✅ Orari di apertura negozio
- ✅ Orari operatori individuali
- ✅ Pause pranzo
- ✅ Assenze (ferie, permessi)
- ✅ Appuntamenti già prenotati
- ✅ Durata servizi + buffer
- ✅ Auto-regolazione dinamica

---

## 🚀 INSTALLAZIONE

### Step 1: Apri Google Apps Script

1. Apri il foglio Google: https://docs.google.com/spreadsheets/d/1O-3CmzjiS0eY8l-ITfNKMtaiN1RZn9xB4wlZFpvFaFw/edit
2. Vai su **Estensioni → Apps Script**
3. Si aprirà l'editor di Google Apps Script

### Step 2: Copia il codice

Nel tuo workspace trovi 3 file `.gs`:
- `BarberBro_SlotManager_Part1.gs`
- `BarberBro_SlotManager_Part2.gs`
- `BarberBro_SlotManager_Part3.gs`

**Copiare tutto in un unico file nell'editor Google Apps Script:**

1. Nell'editor Apps Script, clicca su **Code.gs** (file principale)
2. **CANCELLA** tutto il contenuto esistente
3. **COPIA** il contenuto dei 3 file in ordine:
   - Prima Part1
   - Poi Part2
   - Poi Part3
4. Clicca su **Salva** (icona dischetto)
5. Rinomina il progetto in "BarberBro SlotManager"

### Step 3: Autorizza lo script

1. Nell'editor, seleziona la funzione **setup** dal menu in alto
2. Clicca su **Esegui** (▶️)
3. Ti chiederà di autorizzare lo script:
   - Clicca **Rivedi autorizzazioni**
   - Seleziona il tuo account Google
   - Clicca **Avanzate**
   - Clicca **Vai a BarberBro SlotManager (non sicuro)**
   - Clicca **Consenti**

### Step 4: Esegui Setup

1. Dopo l'autorizzazione, esegui di nuovo **setup**
2. Verrà creato il foglio **Configurazione**
3. ✅ Installazione completata!

---

## ⚙️ CONFIGURAZIONE

### Foglio Configurazione

Dopo il setup, troverai un nuovo foglio chiamato **Configurazione** con questi parametri:

| PARAMETRO | VALORE DEFAULT | DESCRIZIONE |
|-----------|----------------|-------------|
| slot_periodo_settimane | 4 | Quante settimane in avanti generare |
| slot_durata_standard | 30 | Slot visibili di default (minuti) |
| slot_durata_minima | 15 | Granularità minima slot |
| negozio_apertura | 08:00 | Apertura negozio |
| negozio_chiusura | 19:30 | Chiusura negozio |
| negozio_pausa_inizio | 12:30 | Inizio pausa |
| negozio_pausa_fine | 14:00 | Fine pausa |
| buffer_prima_default | 5 | Buffer prima servizio (min) |
| buffer_dopo_default | 5 | Buffer dopo servizio (min) |
| buffer_abilita | TRUE | Abilita/disabilita buffer |
| lavora_lunedi ... domenica | TRUE/FALSE | Giorni lavorativi |

**Modifica questi valori secondo le tue esigenze!**

---

## 🎮 UTILIZZO

### Menu BarberBro

Nel foglio Google troverai un nuovo menu **🔧 BarberBro** con:

#### 1. **⚙️ Setup Configurazione**
Crea il foglio Configurazione (da fare solo la prima volta)

#### 2. **🔄 Genera Slot**
Genera tutti gli slot per il periodo configurato
- Chiede conferma prima di procedere
- Opzione per cancellare slot esistenti o mantenerli
- Genera slot per tutti gli operatori attivi
- Rispetta assenze e orari

**Quando usarlo:**
- Prima volta dopo l'installazione
- Quando aggiungi nuovi operatori
- Ogni mese per rigenerare il calendario

#### 3. **📅 Aggiorna Date Fine Appuntamenti**
Calcola automaticamente la data/ora fine per appuntamenti che non ce l'hanno
- Usa la durata del servizio
- Aggiorna il foglio AppunTamenti

#### 4. **🧪 Test Slot Disponibili**
Testa la ricerca di slot disponibili
- Esempio preconfigurato
- Verifica nel log per vedere i risultati

#### 5. **ℹ️ Info Script**
Mostra info sulla versione

---

## 📊 FUNZIONI PRINCIPALI

### 1. generaSlotCompleti()

Genera tutti gli slot vuoti per il periodo configurato.

**Cosa fa:**
- Legge operatori attivi da foglio **OpeRatori**
- Legge assenze da foglio **AssenZe**
- Per ogni giorno lavorativo crea slot da 15 min
- Rispetta orari operatore e pause
- Salta giorni di assenza
- Scrive nel foglio **SloTs**

**Esempio risultato:**
```
st_ID                    | or_ID     | st_start              | st_end
dc26e8af_202509270800   | dc26e8af  | 27/09/2025 8:00:00   | 27/09/2025 8:15:00
dc26e8af_202509270815   | dc26e8af  | 27/09/2025 8:15:00   | 27/09/2025 8:30:00
...
```

### 2. getSlotDisponibili(servizioId, data, operatoreId)

Trova gli slot disponibili per un servizio in una data.

**Parametri:**
- `servizioId` (string): ID del servizio (es: 'e3a7f9b2')
- `data` (string): Data formato gg/mm/aaaa (es: '27/09/2025')
- `operatoreId` (string, opzionale): Filtra per operatore

**Ritorna:**
Array di oggetti slot:
```javascript
{
  slotId: 'dc26e8af_202509270800',
  operatoreId: 'dc26e8af',
  operatoreNome: 'Yuri',
  startDateTime: Date,
  endDateTime: Date,
  orario: '08:00'
}
```

**Logica intelligente:**
1. Controlla quali operatori possono fare il servizio (foglio **ServizioOperatore**)
2. Trova slot consecutivi sufficienti per la durata servizio + buffer
3. Verifica che non siano già occupati da altri appuntamenti
4. Verifica assenze operatori

**Esempio uso:**
```javascript
// Trova slot per TAGLIO UOMO il 27/09/2025
const slots = getSlotDisponibili('e3a7f9b2', '27/09/2025');

// Con operatore specifico
const slotsYuri = getSlotDisponibili('e3a7f9b2', '27/09/2025', 'dc26e8af');
```

### 3. Auto-regolazione

Gli slot si adattano automaticamente:

**Scenario 1: Servizio da 15 minuti**
- Slot standard: 30 min
- Servizio: 15 min
- Risultato: Prossimo slot disponibile dopo 15 min

**Scenario 2: Servizio da 45 minuti**
- Slot standard: 30 min
- Servizio: 45 min
- Risultato: Occupa 3 slot da 15 min, prossimo disponibile dopo 45 min

**Scenario 3: Con buffer**
- Servizio: 20 min
- Buffer prima: 5 min
- Buffer dopo: 5 min
- Totale: 30 min occupati

---

## 🔌 API PER APPSHEET

### API JSON (da usare con Google Apps Script Web App)

#### 1. apiGetSlotDisponibili(servizioId, data, operatoreId)

Ritorna slot disponibili in formato JSON.

**Output:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "slotId": "dc26e8af_202509270800",
      "operatoreId": "dc26e8af",
      "operatoreNome": "Yuri",
      "startDateTime": "27/09/2025 08:00:00",
      "endDateTime": "27/09/2025 08:30:00",
      "orario": "08:00"
    }
  ]
}
```

#### 2. apiCreaAppuntamento(clienteId, servizioId, operatoreId, startDateTime, notes)

Crea un nuovo appuntamento.

**Parametri:**
- `clienteId`: ID cliente
- `servizioId`: ID servizio
- `operatoreId`: ID operatore
- `startDateTime`: Data/ora inizio (gg/mm/aaaa HH:MM:SS)
- `notes`: Note opzionali

**Output:**
```json
{
  "success": true,
  "appuntamentoId": "a1b2c3d4",
  "message": "Appuntamento creato con successo"
}
```

#### 3. apiCancellaAppuntamento(appuntamentoId, motivo)

Cancella un appuntamento esistente.

#### 4. apiStatisticheGiorno(data, operatoreId)

Ottiene statistiche appuntamenti per un giorno.

### Pubblicare come Web App

1. Nell'editor Apps Script, clicca su **Deploy → New deployment**
2. Tipo: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone** (o **Anyone within organization**)
5. Clicca **Deploy**
6. Copia l'URL del Web App

**Usare l'API:**
```
GET: https://script.google.com/...../exec?action=getSlots&servizio=e3a7f9b2&data=27/09/2025

POST: https://script.google.com/...../exec
Body: action=creaAppuntamento&cliente=f72d7451&servizio=e3a7f9b2&...
```

---

## 🎯 CASI D'USO

### Caso 1: Cliente prenota da web

1. Cliente sceglie servizio "TAGLIO UOMO"
2. Cliente sceglie data "27/09/2025"
3. Sistema chiama: `getSlotDisponibili('e3a7f9b2', '27/09/2025')`
4. Mostra slot liberi con orari
5. Cliente clicca su "08:00 - Yuri"
6. Sistema chiama: `apiCreaAppuntamento(...)`
7. ✅ Appuntamento creato

### Caso 2: Operatore vede calendario

1. Operatore apre AppSheet
2. Vede calendario con slot da 30 min
3. Slot già occupati sono evidenziati
4. Può cliccare su slot libero per creare appuntamento

### Caso 3: Gestione assenza

1. Operatore richiede ferie dal 25/09 al 26/09
2. Viene aggiunto nel foglio **AssenZe** con status "Confermato"
3. Sistema automaticamente:
   - Non genera slot per quei giorni
   - Non mostra l'operatore disponibile
   - Altri operatori rimangono disponibili

---

## 🐛 TROUBLESHOOTING

### Problema: "Foglio non trovato"
**Soluzione:** Verifica che i nomi dei fogli siano esatti (maiuscole/minuscole contano)

### Problema: "Nessun operatore attivo"
**Soluzione:** Controlla che nel foglio **OpeRatori** la colonna `or_active` sia TRUE

### Problema: "Non trovo slot disponibili"
**Soluzione:**
- Verifica che gli slot siano stati generati
- Controlla assenze operatori
- Verifica che qualche operatore possa fare quel servizio (foglio **ServizioOperatore**)

### Problema: "Troppi slot generati"
**Soluzione:** Riduci `slot_periodo_settimane` nel foglio Configurazione

---

## 📝 NOTE TECNICHE

### Formato Date

Il sistema usa il formato italiano: **gg/mm/aaaa HH:MM:SS**

Esempio: `27/09/2025 08:00:00`

### Performance

- Generazione slot: ~30 secondi per 4 settimane
- Query slot disponibili: < 1 secondo
- Limite Google: 6 minuti esecuzione massima

### Limiti Google Apps Script

- Max 6 minuti esecuzione
- Max 5000 righe scritte per chiamata
- Max 20.000 chiamate API al giorno

---

## 🎉 PRONTO!

Ora hai un sistema completo di gestione slot dinamici!

**Prossimi passi:**
1. ✅ Installa lo script
2. ✅ Configura i parametri
3. ✅ Genera gli slot
4. ✅ Testa con `getSlotDisponibili()`
5. ✅ Integra con AppSheet
6. ✅ Pubblica Web App per clienti

**Buon lavoro! 🚀**
