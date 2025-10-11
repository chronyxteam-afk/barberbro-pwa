#!/usr/bin/env python3
"""
Verifica contenuto foglio AppunTamenti
"""
import requests

API = "https://script.google.com/macros/s/AKfycbz7rsOTUYpa83iPvyv_67HeBj7gtI2eXMc33wdvan-jpDP66-lsqGRQWpLa_cSMz46P/exec"

# 1. Login
print("🔐 Login...")
r = requests.get(f"{API}?endpoint=login&email=chronyx.team@gmail.com")
data = r.json()

if not data['success']:
    print(f"❌ Login failed")
    exit(1)

token = data['token']
print(f"✅ Logged in\n")

# 2. Test endpoint custom per leggere AppunTamenti raw
print("📋 Info dal foglio AppunTamenti:")
print("=" * 60)

# Chiamiamo l'API slot con debug
r = requests.get(
    f"{API}?endpoint=slot&authorization={token}" +
    "&servizioId=e3a7f9b2"  # TAGLIO UOMO
)

result = r.json()

print(f"Success: {result.get('success')}")
print(f"Total slots: {result.get('total', 0)}")
print(f"Filters: {result.get('filters', {})}")

if result.get('total', 0) == 0:
    print("\n" + "=" * 60)
    print("⚠️  NESSUNO SLOT TROVATO")
    print("=" * 60)
    print("""
Possibili cause:

1. Il foglio AppunTamenti è VUOTO
   Vai su: https://docs.google.com/spreadsheets/d/1O-3CmzjiS0eY8l-ITfNKMtaiN1RZn9xB4wlZFpvFaFw/edit
   Controlla se il foglio "AppunTamenti" ha righe

2. Nessuno slot ha status='Libero'
   Gli slot potrebbero avere:
   - status='Non Disponibile'
   - status='Prenotato'
   - Campo status vuoto

3. Le date degli slot sono fuori range
   L'API cerca slot nei prossimi 30 giorni da oggi
   Data inizio: {result.get('filters', {}).get('dataInizio')}
   Data fine: {result.get('filters', {}).get('dataFine')}

4. AppSheet usa campi virtuali
   Se su AppSheet calcoli at_endDateTime virtualmente,
   assicurati che lo script Apps Script NON cerchi di leggere
   quel campo dal foglio (che non esiste fisicamente)

SOLUZIONE:
Vuoi che crei uno script per generare 100 slot di test
per i prossimi 7 giorni? (S/N)
""")
else:
    print(f"\n✅ Trovati {result.get('total')} slot!")
    for i, slot in enumerate(result.get('slots', [])[:5]):
        print(f"\nSlot {i+1}:")
        print(f"  ID: {slot.get('at_ID')}")
        print(f"  Data/Ora: {slot.get('at_startDateTime')}")
        print(f"  Operatore: {slot.get('or_ID')}")
        print(f"  Status: {slot.get('at_status')}")
