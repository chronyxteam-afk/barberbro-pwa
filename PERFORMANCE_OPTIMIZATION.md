# 🚀 Ottimizzazioni Performance - BarberBro PWA

## 🎯 Obiettivo
Ridurre i lag di caricamento senza cambiare backend (Apps Script → AppSheet).

---

## ⚡ Quick Wins (Implementabili Subito)

### 1. **Cache Browser Aggressiva** ⭐ PRIORITÀ ALTA
Servizi e operatori cambiano raramente → cache 1 ora invece di richiedere ogni volta.

```javascript
// pwa/src/store/useStore.js
const CACHE_DURATION = 60 * 60 * 1000; // 1 ora

loadServices: async () => {
  const cached = get().services;
  const cacheTime = localStorage.getItem('services_cache_time');
  
  // Se ho cache valida, non ricarico
  if (cached.length > 0 && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
    console.log('✅ Servizi da cache browser');
    return;
  }
  
  // Altrimenti ricarico e salvo timestamp
  const result = await apiService.getServices();
  if (result.success) {
    localStorage.setItem('services_cache_time', Date.now());
  }
}
```

**Beneficio**: Caricamento istantaneo dopo il primo accesso ✨

---

### 2. **Parallel Requests** ⭐ PRIORITÀ ALTA
Attualmente carichi servizi → aspetti → poi operatori. Carica tutto in parallelo!

```javascript
// pwa/src/components/WelcomeScreen.jsx
const loadData = async () => {
  try {
    console.log('🔄 Inizio caricamento dati...');
    setIsLoadingData(true);
    
    // PARALLELO invece di sequenziale
    await Promise.all([
      loadServices(),
      loadOperators()
    ]);
    
    console.log('✅ Dati caricati dall\'API');
  } catch (error) {
    console.error('❌ Errore caricamento dati:', error);
  } finally {
    setIsLoadingData(false);
  }
}
```

**Beneficio**: Riduce tempo caricamento da 4-6s a 2-3s 📉

---

### 3. **Prefetch Intelligente** ⭐ PRIORITÀ MEDIA
Carica slot PRIMA che l'utente selezioni un operatore (quando seleziona il servizio).

```javascript
// pwa/src/components/ServiceSelector.jsx
const handleSelect = async (service) => {
  selectService(service);
  
  // Prefetch: carica slot in background mentre user legge PathChoice
  loadSlots({ servizioId: service.sv_ID }).catch(err => {
    console.warn('Prefetch slot fallito:', err);
  });
  
  setStep('path-choice');
}
```

**Beneficio**: Slot già pronti quando l'utente clicca "Mi Sento Fortunato" 🎯

---

### 4. **Service Worker per Cache Offline** ⭐ PRIORITÀ BASSA
PWA vera con cache offline di config, servizi, operatori.

```javascript
// pwa/public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('endpoint=config')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open('barberbro-v1').then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

**Beneficio**: App funziona anche offline (dati vecchi) 📱

---

## 🔧 Apps Script Optimizations

### 5. **Batch API Endpoint** ⭐ PRIORITÀ MEDIA
Invece di 3 chiamate (config, servizi, operatori), fai 1 sola.

```javascript
// scripts/Code.gs
case 'init':
  result = {
    success: true,
    config: getConfigPWA(),
    servizi: apiGetServizi().servizi,
    operatori: apiGetOperatori().operatori
  };
  break;
```

```javascript
// pwa/src/services/apiService.js
async init() {
  return this.fetchAPI('init');
}
```

**Beneficio**: 1 round-trip invece di 3 → -66% tempo ⚡

---

### 6. **HTTP Caching Headers** ⭐ PRIORITÀ BASSA
Apps Script può restituire header Cache-Control.

```javascript
// scripts/Code.gs
function doGet(e) {
  const response = // ... logica normale
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Cache-Control', 'public, max-age=3600'); // 1 ora
}
```

**Beneficio**: Browser cache automatica anche senza codice JS 🌐

---

## 🔮 Quando Passare ad AppSheet API

### Soglia Decisionale:
- ❌ **0-50 prenotazioni/giorno**: Apps Script OK
- ⚠️ **50-200 prenotazioni/giorno**: Apps Script con tutte le ottimizzazioni
- ✅ **200+ prenotazioni/giorno**: AppSheet API giustificato

### Indicatori che Serve AppSheet:
1. **Cold start > 10 secondi** costantemente
2. **Timeout 30 secondi** raggiunti frequentemente  
3. **Conflitti prenotazione** (2 utenti stesso slot)
4. **Costi opportunità** > $50/mese persi per slowness

---

## 📊 Implementazione Fasi

### Fase 1: Quick Wins (1 giorno) ⚡
- [ ] Cache browser 1 ora (servizi/operatori)
- [ ] Parallel requests
- [ ] Prefetch slot

**Risultato atteso**: Caricamento da 6s → 2-3s

### Fase 2: Batch API (2 giorni) 🚀
- [ ] Endpoint `/init` unico
- [ ] Refactor frontend per chiamata singola

**Risultato atteso**: Caricamento da 3s → 1-1.5s

### Fase 3: Service Worker (3 giorni) 📱
- [ ] Cache offline config/servizi/operatori
- [ ] Update strategy background

**Risultato atteso**: Apertura istantanea (dopo prima visita)

---

## 💰 Costi Comparativi

### Apps Script (Attuale)
- **Costo**: $0/mese
- **Velocità**: 2-6 secondi (ottimizzabile a 1-2s)
- **Limite**: 20,000 chiamate/giorno
- **Scenario reale**: ~50 prenotazioni/giorno × 5 chiamate = 250 chiamate/giorno ✅

### AppSheet API
- **Costo**: $50-500/mese (dipende da piano)
- **Velocità**: 0.5-1 secondo
- **Limite**: Illimitato (piano business)
- **Scenario reale**: Vale la pena solo con volumi alti

### Break-Even Point:
Se risparmi **30 minuti/giorno** di frustrazione utenti (conversione +5%) →  
Con ticket medio €25 e 50 prenotazioni/giorno →  
Guadagno: 50 × 0.05 × €25 = **€62.5/giorno** = €1,875/mese

AppSheet a $50/mese si ripaga SOLO se hai almeno 100+ prenotazioni/giorno.

---

## 🎯 Raccomandazione Finale

### Per Ora: **Implementa Fase 1 + Fase 2**
- Costo: 3 giorni sviluppo
- Risultato: 70-80% velocità AppSheet
- Investimento: $0/mese

### Monitora Metriche:
```javascript
// Aggiungi analytics
console.time('loadServices');
await loadServices();
console.timeEnd('loadServices');
```

### Passa ad AppSheet quando:
1. **Volume**: 200+ prenotazioni/giorno
2. **Ricavi**: €3,000+/mese
3. **Problemi**: Timeout frequenti o conflitti

---

## 📝 Note Implementazione

### Test Performance
```bash
# Script per testare velocità API
python test_performance.py
```

```python
import requests
import time

API = "https://script.google.com/..."

# Test 10 chiamate
times = []
for i in range(10):
    start = time.time()
    r = requests.get(f"{API}?endpoint=servizi&authorization=TOKEN")
    end = time.time()
    times.append(end - start)
    print(f"Call {i+1}: {end-start:.2f}s")

print(f"\nMedia: {sum(times)/len(times):.2f}s")
print(f"Min: {min(times):.2f}s")
print(f"Max: {max(times):.2f}s")
```

---

## ✅ Conclusione

**Apps Script + Ottimizzazioni** è la scelta giusta per:
- ✅ MVP e validazione
- ✅ Budget limitato
- ✅ Volume basso-medio (<200 prenotazioni/giorno)

**AppSheet API** diventa necessario solo quando:
- ⚠️ Hai budget €50+/mese
- ⚠️ Volume alto (200+ prenotazioni/giorno)
- ⚠️ Problemi tecnici ricorrenti (timeout, conflitti)

**Inizia con Apps Script** ottimizzato e passa ad AppSheet solo quando i ricavi lo giustificano! 💰
