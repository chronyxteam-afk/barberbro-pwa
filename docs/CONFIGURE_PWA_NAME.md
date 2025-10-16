# 🏷️ Configurare il Nome della PWA

Il nome della PWA (quello che appare quando l'utente installa l'app sul telefono) può essere personalizzato tramite **variabili GitHub**.

## 📋 Come Configurare

### Opzione 1: Usare valori di default (attuale)

Se non configuri nulla, la PWA userà:
- **Nome**: `BarberBro Booking`
- **Nome breve**: `BarberBro`
- **Descrizione**: `Prenota il tuo taglio in pochi tap`

### Opzione 2: Personalizzare tramite GitHub Variables

1. Vai su **GitHub** → Repository **barberbro-pwa**
2. Clicca su **Settings** → **Secrets and variables** → **Actions**
3. Nella tab **Variables**, clicca **New repository variable**
4. Aggiungi le seguenti variabili:

| Nome Variabile | Esempio Valore | Descrizione |
|----------------|----------------|-------------|
| `APP_NAME` | `Barber Shop Mario - Prenota` | Nome completo della PWA (max 45 caratteri) |
| `APP_SHORT_NAME` | `Mario Barber` | Nome breve (max 12 caratteri, appare sull'icona) |
| `APP_DESCRIPTION` | `Prenota il tuo appuntamento da Mario` | Descrizione PWA |

5. Dopo aver salvato, fai un **nuovo commit** (anche vuoto) per triggerare il rebuild:
   ```bash
   git commit --allow-empty -m "chore: rebuild PWA with new name"
   git push origin main
   ```

6. La PWA verrà ricostruita con i nuovi nomi!

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

