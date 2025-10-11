#!/usr/bin/env python3
"""
Script per controllare i prezzi dei servizi nel foglio Google
"""

import requests

# URL API
API_URL = "https://script.google.com/macros/s/AKfycbx-EQwpCTc7-Kz3cyIgcxYylHZrCiawDKHhLOG0_iQbIpzBaZoTu6R_Rd9x8hElw22SyQ/exec"

print("🧪 Test API - Controllo Servizi e Prezzi")
print("=" * 60)

# Test config (pubblico)
print("\n📋 Test 1: Config (pubblico)")
try:
    url = f"{API_URL}?endpoint=config"
    response = requests.get(url)
    data = response.json()
    
    if data.get('success'):
        print("✅ Config OK")
        config = data.get('config', {})
        print(f"   Shop: {config.get('shop_name')}")
        print(f"   Buffer prima: {config.get('buffer_prima')} min")
        print(f"   Buffer dopo: {config.get('buffer_dopo')} min")
    else:
        print(f"❌ Errore: {data.get('error')}")
except Exception as e:
    print(f"❌ Errore: {e}")

# Test login per ottenere token
print("\n🔐 Test 2: Login per ottenere token")
email = input("Inserisci la tua email Google (registrata nel foglio): ")
try:
    url = f"{API_URL}?endpoint=login&email={email}"
    response = requests.get(url)
    data = response.json()
    
    if data.get('success'):
        token = data.get('token')
        print(f"✅ Login OK, token: {token[:30]}...")
        
        # Test servizi con token
        print("\n📋 Test 3: Servizi (con autenticazione)")
        try:
            url = f"{API_URL}?endpoint=servizi&authorization={token}"
            response = requests.get(url)
            data = response.json()
            
            if data.get('success'):
                servizi = data.get('servizi', [])
                print(f"✅ Servizi trovati: {len(servizi)}")
                print("\nDettaglio servizi:")
                print("-" * 60)
                
                for servizio in servizi:
                    sv_ID = servizio.get('sv_ID')
                    sv_name = servizio.get('sv_name')
                    sv_price = servizio.get('sv_price')
                    sv_duration = servizio.get('sv_duration')
                    
                    print(f"  ID: {sv_ID}")
                    print(f"  Nome: {sv_name}")
                    print(f"  Prezzo: €{sv_price} (tipo: {type(sv_price).__name__})")
                    print(f"  Durata: {sv_duration} min")
                    print("-" * 60)
            else:
                print(f"❌ Errore: {data.get('error')}")
        except Exception as e:
            print(f"❌ Errore: {e}")
    else:
        print(f"❌ Login fallito: {data.get('error')}")
        print("⚠️ Verifica che la tua email sia registrata nel foglio Clienti e che cn_enablePWA sia TRUE")
except Exception as e:
    print(f"❌ Errore: {e}")

print("\n" + "=" * 60)
print("✅ Test completato!")
