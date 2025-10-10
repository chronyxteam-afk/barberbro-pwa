#!/usr/bin/env python3
import requests

API = "https://script.google.com/macros/s/AKfycbwjoGsi3f1tBdKXA1eOEgxjTnXwkSSwBfUQWL5shAHJgTKtOawD2eElK31volNJtSPeQw/exec"

# Login
print("1. Login...")
r = requests.get(f"{API}?endpoint=login&email=chronyx.team@gmail.com")
data = r.json()
if not data['success']:
    print(f"   ❌ Login failed: {data.get('error')}")
    exit(1)

token = data['token']
print(f"   ✅ Token: {token[:20]}...")

# Operatori
print("\n2. Operatori...")
r = requests.get(f"{API}?endpoint=operatori&authorization={token}")
data = r.json()
print(f"   Status: {r.status_code}")
print(f"   Success: {data.get('success')}")
if data.get('success'):
    operatori = data.get('operatori', [])
    print(f"   Operatori trovati: {len(operatori)}")
    for op in operatori[:3]:
        print(f"      - ID: {op.get('id')}")
        print(f"        Nome: {op.get('name')}")
        print(f"        Orario: {op.get('workStart')} - {op.get('workEnd')}")
else:
    print(f"   ❌ Error: {data.get('error')}")
