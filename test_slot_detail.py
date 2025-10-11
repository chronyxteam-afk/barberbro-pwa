#!/usr/bin/env python3
import requests
from datetime import datetime, timedelta

API = "https://script.google.com/macros/s/AKfycbz7rsOTUYpa83iPvyv_67HeBj7gtI2eXMc33wdvan-jpDP66-lsqGRQWpLa_cSMz46P/exec"

print("1. Login...")
r = requests.get(f"{API}?endpoint=login&email=chronyx.team@gmail.com")
data = r.json()

if not data['success']:
    print(f"   ❌ Login failed: {data.get('error')}")
    exit(1)

token = data['token']
print(f"   ✅ Token: {token[:20]}...")

# Test slot con diversi parametri
print("\n2. Test slot con solo servizioId...")
r = requests.get(f"{API}?endpoint=slot&authorization={token}&servizioId=e3a7f9b2")
data = r.json()
print(f"   Success: {data.get('success')}")
print(f"   Slots: {len(data.get('slots', []))}")
print(f"   Response: {data}")

print("\n3. Test slot con date esplicite...")
oggi = datetime.now().strftime('%d/%m/%Y')
tra30 = (datetime.now() + timedelta(days=30)).strftime('%d/%m/%Y')
print(f"   dataInizio: {oggi}")
print(f"   dataFine: {tra30}")

r = requests.get(f"{API}?endpoint=slot&authorization={token}&servizioId=e3a7f9b2&dataInizio={oggi}&dataFine={tra30}")
data = r.json()
print(f"   Success: {data.get('success')}")
print(f"   Slots: {len(data.get('slots', []))}")
print(f"   Response: {data}")

print("\n4. Test servizi per vedere sv_ID disponibili...")
r = requests.get(f"{API}?endpoint=servizi&authorization={token}")
data = r.json()
if data.get('success'):
    print(f"   Servizi disponibili:")
    for sv in data.get('servizi', [])[:5]:
        print(f"      - {sv['id']}: {sv['name']}")
