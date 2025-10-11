#!/usr/bin/env python3
"""
Script per generare slot liberi di test nel foglio AppunTamenti
"""
import requests
from datetime import datetime, timedelta
import uuid

API = "https://script.google.com/macros/s/AKfycbz7rsOTUYpa83iPvyv_67HeBj7gtI2eXMc33wdvan-jpDP66-lsqGRQWpLa_cSMz46P/exec"

# 1. Login
print("🔐 Login...")
r = requests.get(f"{API}?endpoint=login&email=chronyx.team@gmail.com")
data = r.json()

if not data['success']:
    print(f"❌ Login failed: {data.get('error')}")
    exit(1)

token = data['token']
print(f"✅ Token: {token[:20]}...\n")

# 2. Ottieni servizi
print("📋 Carico servizi...")
r = requests.get(f"{API}?endpoint=servizi&authorization={token}")
servizi = r.json().get('servizi', [])
print(f"✅ Trovati {len(servizi)} servizi\n")

# 3. Ottieni operatori
print("👥 Carico operatori...")
r = requests.get(f"{API}?endpoint=operatori&authorization={token}")
operatori = r.json().get('operatori', [])
print(f"✅ Trovati {len(operatori)} operatori\n")

if not servizi or not operatori:
    print("❌ Nessun servizio o operatore disponibile!")
    exit(1)

print("=" * 60)
print("SITUAZIONE ATTUALE:")
print("=" * 60)

# Test slot per ogni combinazione
for servizio in servizi[:3]:  # Primi 3 servizi
    print(f"\n🔍 Servizio: {servizio['name']} (ID: {servizio['id']})")
    
    for operatore in operatori:
        r = requests.get(
            f"{API}?endpoint=slot&authorization={token}" +
            f"&servizioId={servizio['id']}&operatoreId={operatore['id']}"
        )
        result = r.json()
        
        if result.get('success'):
            slots = result.get('slots', [])
            print(f"   👤 {operatore['name']}: {len(slots)} slot disponibili")
            
            if len(slots) > 0:
                print(f"      Primo slot: {slots[0].get('at_startDateTime', 'N/A')}")
        else:
            print(f"   ❌ Errore: {result.get('error')}")

print("\n" + "=" * 60)
print("SUGGERIMENTI:")
print("=" * 60)
print("""
Se vedi 0 slot per tutti i servizi/operatori, significa che:

1. Il foglio AppunTamenti è VUOTO
2. Tutti gli slot hanno status diverso da 'Libero'
3. Gli slot sono fuori dal range di date (prossimi 30 giorni)

SOLUZIONI:

A) Crea slot manualmente in Google Sheets:
   - Apri: https://docs.google.com/spreadsheets/d/1O-3CmzjiS0eY8l-ITfNKMtaiN1RZn9xB4wlZFpvFaFw/edit
   - Vai al foglio "AppunTamenti"
   - Aggiungi righe con:
     * at_ID: ID univoco (es: a1b2c3d4)
     * at_startDateTime: Data/ora (es: 12/10/2025 09:00:00)
     * cn_ID: VUOTO
     * sv_ID: VUOTO
     * or_ID: ID operatore (es: dc26e8af)
     * at_status: Libero
     * at_notes: VUOTO

B) Usa lo script di generazione automatica slot:
   - Devo crearlo se vuoi generare slot per i prossimi 7 giorni
   - Genera slot ogni 30 minuti per ogni operatore

Vuoi che crei lo script di generazione automatica? (A/B)
""")
