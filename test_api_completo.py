import requests
import json

API_URL = "https://script.google.com/macros/s/AKfycbypx2mx9e_-sWVyi6sb8wlpz3P-6atQSYerCsR7VamD1O5QbHaFjY9dNT2KykjuaX7Mrg/exec"

# Prima faccio login per ottenere un token valido
print("🔐 Test Login...")
login_response = requests.get(f"{API_URL}?endpoint=login&email=chronyx.team@gmail.com")
login_data = login_response.json()

if login_data.get('success'):
    token = login_data.get('token')
    print(f"✅ Login OK, token: {token[:30]}...")
    
    # Test servizi con token
    print("\n📋 Test Servizi con token...")
    servizi_url = f"{API_URL}?endpoint=servizi&authorization={token}"
    servizi_response = requests.get(servizi_url)
    servizi_data = servizi_response.json()
    
    print(f"Status: {servizi_response.status_code}")
    print(f"Success: {servizi_data.get('success')}")
    
    if servizi_data.get('success'):
        servizi = servizi_data.get('servizi', [])
        print(f"✅ Servizi trovati: {len(servizi)}")
        for s in servizi[:3]:
            print(f"   • {s.get('sv_name')} - €{s.get('sv_price')} ({s.get('sv_duration')}min)")
    else:
        print(f"❌ Errore: {servizi_data.get('error')}")
    
    # Test operatori con token
    print("\n👥 Test Operatori con token...")
    operatori_url = f"{API_URL}?endpoint=operatori&authorization={token}"
    operatori_response = requests.get(operatori_url)
    operatori_data = operatori_response.json()
    
    if operatori_data.get('success'):
        operatori = operatori_data.get('operatori', [])
        print(f"✅ Operatori trovati: {len(operatori)}")
        for o in operatori[:5]:
            print(f"   • {o.get('op_name')} ({o.get('op_workStart')}-{o.get('op_workEnd')})")
    else:
        print(f"❌ Errore: {operatori_data.get('error')}")
    
    # Test slot con token
    print("\n📅 Test Slot con token...")
    slot_url = f"{API_URL}?endpoint=slot&authorization={token}"
    slot_response = requests.get(slot_url)
    slot_data = slot_response.json()
    
    if slot_data.get('success'):
        slot = slot_data.get('slot', [])
        print(f"✅ Slot trovati: {len(slot)}")
        for s in slot[:5]:
            print(f"   • {s.get('at_startDateTime')} - {s.get('op_name')} ({s.get('at_status')})")
    else:
        print(f"❌ Errore: {slot_data.get('error')}")
        
else:
    print(f"❌ Login fallito: {login_data.get('error')}")
