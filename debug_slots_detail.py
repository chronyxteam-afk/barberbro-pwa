#!/usr/bin/env python3
"""
Debug dettagliato: perché gli slot non vengono trovati?
"""
import requests

API = "https://script.google.com/macros/s/AKfycbz7rsOTUYpa83iPvyv_67HeBj7gtI2eXMc33wdvan-jpDP66-lsqGRQWpLa_cSMz46P/exec"

print("🔐 Login...")
r = requests.get(f"{API}?endpoint=login&email=chronyx.team@gmail.com")
token = r.json()['token']
print(f"✅ Token OK\n")

print("=" * 70)
print("TEST 1: Slot senza filtri (tutti)")
print("=" * 70)
r = requests.get(f"{API}?endpoint=slot&authorization={token}&servizioId=e3a7f9b2")
result = r.json()
print(f"Success: {result.get('success')}")
print(f"Total: {result.get('total')}")
print(f"Filters applicati:")
print(f"  dataInizio: {result.get('filters', {}).get('dataInizio')}")
print(f"  dataFine: {result.get('filters', {}).get('dataFine')}")
print()

print("=" * 70)
print("TEST 2: Proviamo con tutti i servizi")
print("=" * 70)

# Ottieni lista servizi
r = requests.get(f"{API}?endpoint=servizi&authorization={token}")
servizi = r.json().get('servizi', [])

for sv in servizi[:5]:  # Primi 5
    r = requests.get(
        f"{API}?endpoint=slot&authorization={token}&servizioId={sv['id']}"
    )
    result = r.json()
    print(f"{sv['name']:30} → {result.get('total', 0)} slot")

print()
print("=" * 70)
print("TEST 3: Proviamo senza servizioId (dovrebbe dare errore)")
print("=" * 70)

r = requests.get(f"{API}?endpoint=slot&authorization={token}")
result = r.json()
print(f"Success: {result.get('success')}")
print(f"Error: {result.get('error')}")
print()

print("=" * 70)
print("DIAGNOSI")
print("=" * 70)
print("""
Se tutti i test sopra mostrano 0 slot, il problema potrebbe essere:

1. FILTRO DATE TROPPO STRETTO
   Lo script cerca slot solo nei prossimi 30 giorni DA ORA
   Se gli slot nel foglio sono per date diverse, non li trova
   
2. PARSING DATE ERRATO
   Se le date nel foglio sono in formato diverso da quello che
   lo script si aspetta, il parseDateTime fallisce silenziosamente
   
3. STATUS NON ESATTAMENTE 'Libero'
   Potrebbe essere 'libero' (minuscolo), 'LIBERO' (maiuscolo), 
   o avere spazi extra
   
4. CAMPO or_ID NON CORRISPONDENTE
   Gli slot potrebbero avere or_ID che non match con gli operatori
   
5. COLONNE SBAGLIATE
   Lo script legge le colonne in ordine fisso:
   Col 1 (A): at_ID
   Col 2 (B): at_startDateTime  
   Col 5 (E): or_ID
   Col 6 (F): at_status
   
   Se nel tuo foglio l'ordine è diverso, legge i campi sbagliati!

PROSSIMO STEP:
Puoi condividere una riga di esempio dal foglio AppunTamenti?
Oppure dimmi quale di questi 5 problemi ti sembra più probabile.
""")
