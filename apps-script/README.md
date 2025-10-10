# 📜 BarberBro Apps Script Backend

Sistema di gestione slot dinamici e API REST per prenotazioni.

## 📋 **File**

- `BarberBro_SlotManager_Complete.gs` - Script principale (1,700+ righe)
- `appsscript.json` - Manifest Apps Script

## 🚀 **Deploy**

### **1. Apri Apps Script Editor**
```
https://script.google.com/d/1vl-oqCAIpXPZ5WB5HZatKV4lcOBbZaURwwEOK4QmDmRmJYeIDw4EMlfT/edit
```

### **2. Setup Iniziale**

Dal menu `🔧 BarberBro`:
- Esegui `⚙️ Setup Configurazione` (prima volta)
- Esegui `🎨 Setup ConfigPWA` (per PWA multi-tenant)
- Esegui `🔄 Genera Slot` (genera slot disponibili)

### **3. Deploy Web App**

1. Menu → `Deploy → New deployment`
2. Type: `Web app`
3. Execute as: `Me`
4. Who has access: **`Anyone`** ← IMPORTANTE per PWA!
5. Click `Deploy`
6. **Copia URL** (es: `https://script.google.com/macros/s/AKfycby.../exec`)

### **4. Configurazione PWA**

Imposta l'URL nel file `.env` della PWA:
```bash
VITE_API_URL=https://script.google.com/macros/s/AKfycby.../exec
```

## 📊 **Fogli Google Sheets**

### **Configurazione** (Sistema)
Parametri operativi: orari, buffer, slot duration, etc.

### **ConfigPWA** (Multi-tenant)
Parametri PWA personalizzabili per ogni barbiere:
- `shop_name` - Nome negozio
- `primary_color` / `accent_color` - Colori brand
- `phone_contact` / `address` - Contatti
- `booking_days` - Giorni prenotabili in avanti
- `min_notice_hours` - Ore minime preavviso
- etc.

### **Clienti**
Gestito automaticamente dalla PWA:
- `cn_ID` - ID cliente
- `cn_name` - Nome completo
- `cn_phone` - Telefono
- `cn_email` - Email (opzionale)

### **SerVizi**
- `sv_ID` - ID servizio
- `sv_name` - Nome servizio
- `sv_duration` - Durata minuti
- `sv_price` - Prezzo €

### **OpeRatori**
- `or_ID` - ID operatore
- `or_name` - Nome operatore
- `or_workStart` / `or_workEnd` - Orari lavoro
- `or_breakStart` / `or_breakEnd` - Pausa
- `or_active` - Attivo (TRUE/FALSE)

### **AppunTamenti**
Slot e prenotazioni unificati:
- `at_ID` - ID slot/appuntamento
- `at_startDateTime` - Data/ora inizio
- `cn_ID` - ID cliente (vuoto = libero)
- `sv_ID` - ID servizio (vuoto = libero)
- `or_ID` - ID operatore
- `at_status` - 'Libero' | 'Prenotato' | 'Completato' | 'Cancellato' | 'Non Disponibile'
- `at_notes` - Note

### **Storico**
Appuntamenti archiviati automaticamente.

## 🔌 **API REST Endpoints**

### **GET Endpoints**

#### `/config`
Configurazione PWA multi-tenant.

**Response:**
```json
{
  "success": true,
  "config": {
    "shop_name": "BarberBro Milano",
    "primary_color": "#C19A6B",
    "booking_days": 30,
    ...
  }
}
```

#### `/servizi`
Lista servizi disponibili.

**Response:**
```json
{
  "success": true,
  "servizi": [
    {
      "id": "S001",
      "name": "Taglio Classico",
      "duration": 30,
      "price": 20
    }
  ]
}
```

#### `/operatori`
Lista operatori attivi.

**Response:**
```json
{
  "success": true,
  "operatori": [
    {
      "id": "OP001",
      "name": "Marco Rossi",
      "workStart": "09:00",
      "workEnd": "19:00"
    }
  ]
}
```

#### `/slot?servizioId=S001&dataInizio=08/10/2025&fascia=morning`
Slot disponibili con filtri.

**Parametri:**
- `servizioId` (required) - ID servizio
- `dataInizio` (optional) - Data inizio (default: oggi)
- `dataFine` (optional) - Data fine (default: oggi + booking_days)
- `operatoreId` (optional) - Filtra per operatore
- `fascia` (optional) - 'morning' | 'afternoon' | 'evening'

**Response:**
```json
{
  "success": true,
  "slots": [
    {
      "at_ID": "A123",
      "at_startDateTime": "08/10/2025 10:00:00",
      "or_ID": "OP001",
      "or_name": "Marco"
    }
  ],
  "total": 15
}
```

#### `/cliente?phone=3331234567`
Dati cliente + preferenze (returning customer).

**Response:**
```json
{
  "success": true,
  "found": true,
  "customer": {
    "id": "CN123",
    "name": "Mario Rossi",
    "phone": "3331234567",
    "email": "mario@email.com"
  },
  "preferences": {
    "lastBooking": { ... },
    "favoriteOperator": "OP001",
    "favoriteService": "S001"
  }
}
```

#### `/prenotazioni?phone=3331234567`
Lista prenotazioni attive cliente.

**Response:**
```json
{
  "success": true,
  "customer": { ... },
  "prenotazioni": [
    {
      "id": "A123",
      "dateTime": "08/10/2025 15:30:00",
      "serviceId": "S001",
      "serviceName": "Taglio",
      "operatorId": "OP001",
      "operatorName": "Marco",
      "status": "Prenotato"
    }
  ],
  "total": 2
}
```

### **POST Endpoints**

#### `/prenota`
Crea nuova prenotazione.

**Body:**
```json
{
  "action": "prenota",
  "slotId": "A123",
  "servizioId": "S001",
  "operatoreId": "OP001",
  "customerName": "Mario Rossi",
  "customerPhone": "3331234567",
  "customerEmail": "mario@email.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Prenotazione creata con successo",
  "appointment": {
    "id": "A123",
    "customerId": "CN123",
    "customerName": "Mario Rossi",
    ...
  }
}
```

#### `/cancella`
Cancella prenotazione.

**Body:**
```json
{
  "action": "cancella",
  "appointmentId": "A123",
  "phone": "3331234567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Prenotazione cancellata con successo"
}
```

## 🔧 **Manutenzione**

### **Aggiornare Script**

Dalla cartella `tools/`:
```bash
python apps_script_manager.py push-complete SCRIPT_ID
```

### **Reset Cache**

Esegui da Apps Script editor:
```javascript
resetCache();
```

### **Archiviazione Automatica**

Menu → `📦 Archivia Appuntamenti Vecchi`

Sposta in Storico:
- Appuntamenti con data < oggi
- Status: Completato, Cancellato, Non Presentato, Annullato

## 📈 **Performance**

- **generaSlotCompleti**: ~300-500ms (4 settimane, 3 operatori)
- **getSlotDisponibili**: ~80-120ms
- **Cache hit rate**: ~95%
- **API response**: <200ms

## 🔐 **Sicurezza**

- ✅ Validazione input su tutti gli endpoint
- ✅ Verifica proprietà prenotazione (cn_ID + phone)
- ✅ Gestione errori con try/catch
- ✅ CORS headers per accesso pubblico PWA

## 📚 **Documentazione Completa**

Vedi `../docs/` per guide dettagliate.
