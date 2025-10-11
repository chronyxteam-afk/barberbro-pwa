#!/usr/bin/env python3
import requests
from datetime import datetime, timedelta

API = "https://script.google.com/macros/s/AKfycbz7rsOTUYpa83iPvyv_67HeBj7gtI2eXMc33wdvan-jpDP66-lsqGRQWpLa_cSMz46P/exec"

# Login
print("1. Login...")
r = requests.get(f"{API}?endpoint=login&email=chronyx.team@gmail.com")
data = r.json()
token = data['token']
print(f"   ✅ Token: {token[:20]}...")

# Servizi
print("\n2. Ottieni primo servizio...")
r = requests.get(f"{API}?endpoint=servizi&authorization={token}")
data = r.json()
primo_servizio = data['servizi'][0]
servizio_id = primo_servizio['id']
print(f"   Servizio: {primo_servizio['name']} (ID: {servizio_id})")

# Slot
print(f"\n3. Slot disponibili per servizio {servizio_id}...")
oggi = datetime.now().strftime('%d/%m/%Y')
domani = (datetime.now() + timedelta(days=7)).strftime('%d/%m/%Y')

r = requests.get(
    f"{API}?endpoint=slot&authorization={token}&servizioId={servizio_id}&dataInizio={oggi}&dataFine={domani}"
)
data = r.json()
print(f"   Success: {data.get('success')}")
if data.get('success'):
    slots = data.get('slot', [])
    print(f"   Slot trovati: {len(slots)}")
    if slots:
        print(f"\n   Primo slot:")
        for key, value in list(slots[0].items())[:8]:
            print(f"      {key}: {value}")
else:
    print(f"   ❌ Error: {data.get('error')}")
