# 🏷️ Configurare il Nome della PWA

Il nome della PWA (quello che appare quando l'utente installa l'app sul telefono) viene configurato **automaticamente** dal foglio **ConfigPWA** in Google Sheets!

## 📋 Come Funziona

Il manifest della PWA viene generato **dinamicamente** al caricamento dell'app usando i valori dal foglio **ConfigPWA**:

| Campo ConfigPWA | Dove viene usato |
|-----------------|------------------|
| `shop_name` | Nome completo della PWA (es. "Barber Shop Mario") |
| `shop_name` (primi 12 caratteri) | Nome breve sotto l'icona |
| `shop_tagline` | Descrizione della PWA |
| `primary_color` | Colore tema della PWA |

## ✅ Configurazione Automatica

1. Apri il foglio **ConfigPWA** su Google Sheets
2. Modifica i campi:
   - `shop_name`: Nome del negozio
   - `shop_tagline`: Slogan/descrizione
   - `primary_color`: Colore principale (es. `#C19A6B`)
3. **Non serve fare nulla altro!**
4. Al prossimo accesso alla PWA, il manifest sarà aggiornato automaticamente

## 🎯 Quando Viene Usato

- **Nome completo (`APP_NAME`)**: 
  - Quando l'utente installa la PWA
  - Nel prompt "Aggiungi a Home"
  - Nelle impostazioni app del telefono

- **Nome breve (`APP_SHORT_NAME`)**:
  - Sotto l'icona della PWA nella home screen
  - Quando lo spazio è limitato

## 💡 Suggerimenti

- **Nome breve**: Max 12 caratteri altrimenti viene troncato
- **Nome completo**: Max 45 caratteri per evitare troncature
- Usa il **nome del negozio** dal foglio ConfigPWA per coerenza
- Testa su iPhone e Android per vedere come appare

## ⚠️ Nota Importante

Il nome nel manifest è **statico** (fissato al momento del build).  
Se vuoi cambiarlo, devi:
1. Aggiornare le variabili GitHub
2. Rifare il deploy (push su main)
3. Gli utenti che hanno già installato la PWA vedranno il vecchio nome fino alla reinstallazione

Il nome **dentro l'app** (schermata welcome/login) invece è **dinamico** e viene preso dal foglio ConfigPWA (`shop_name`).

