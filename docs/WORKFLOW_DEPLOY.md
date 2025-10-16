# 🚀 Workflow di Deploy - BarberBro

## 📌 Importante: Strategia di Deployment

### Apps Script - Endpoint Unico
- **1 SOLO deployment** con URL permanente `/exec`
- **NON creare nuovi deployment** ad ogni modifica
- **NON cambiare URL** per i test

#### Processo di aggiornamento:
1. Modifica codice in `scripts/Code.gs`
2. `npm run clasp:push` per inviare il codice
3. **Manualmente** in Apps Script: `Gestisci distribuzioni → Modifica versione`
4. Il codice aggiornato è immediatamente attivo sull'URL esistente

### PWA - Auto-Update con Service Worker
- **Cache busting automatico** tramite `SW_VERSION` e `CACHE_NAME`
- **Auto-update** su tutti i dispositivi tramite `skipWaiting()` e `clients.claim()`
- Ogni build invalida la cache precedente

#### Processo di aggiornamento:
1. Modifica codice in `pwa/src/`
2. Aggiorna `SW_VERSION` in `pwa/public/sw.js`
3. Build automatica via GitHub Actions al push
4. Client ricevono l'aggiornamento automaticamente al prossimo accesso

## ✅ Flusso Completo

```bash
# 1. Modifica il codice Apps Script
nano scripts/Code.gs

# 2. Push con clasp
npm run clasp:push

# 3. Vai su Apps Script e aggiorna la versione manualmente
# (Gestisci distribuzioni → Modifica versione)

# 4. Modifica PWA (se necessario)
nano pwa/src/components/...

# 5. Aggiorna Service Worker version
nano pwa/public/sw.js  # Incrementa SW_VERSION

# 6. Commit e push
git add .
git commit -m "feat: descrizione modifiche"
git push origin main

# 7. GitHub Actions fa il build e deploy automatico
# 8. Client si auto-aggiornano al prossimo accesso
```

## 🔗 URL Permanenti

- **Apps Script API**: `https://script.google.com/macros/s/.../exec` (NON CAMBIA MAI)
- **PWA**: `https://chronyxteam-afk.github.io/barberbro-pwa/` (NON CAMBIA MAI)

## ⚠️ Da NON Fare

- ❌ Creare nuovi deployment Apps Script
- ❌ Cambiare URL dell'API
- ❌ Dimenticare di aggiornare `SW_VERSION` nella PWA
- ❌ Fare commit senza testare in locale

## 📝 Note Tecniche

### Service Worker Cache Strategy
- **Cache-first** per assets statici (JS, CSS, immagini)
- **Network-first** per API calls
- **Automatic cleanup** delle cache vecchie al cambio versione
- **skipWaiting()** per attivazione immediata della nuova versione
- **clients.claim()** per prendere controllo di tutti i client aperti

### Apps Script Versioning
- Le versioni sono gestite **manualmente** dall'interfaccia Apps Script
- Ogni modifica del deployment aggiorna automaticamente l'endpoint
- **Non serve** creare nuove "Web app" per testare modifiche

