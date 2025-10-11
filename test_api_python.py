import requests
import json

# URL dell'API
import requests
import json

# URL API aggiornato
API_URL = 'https://script.google.com/macros/s/AKfycbzXpAkYW6m6V0qdWG8N5UPRqKDUgcW3mp7S4hOLRhgYcAMG89aMDcW4WHkUcFfb2IEW9A/exec'

print("🧪 Test API Apps Script")
print("=" * 60)
print(f"URL: {API_URL}")
print()

# Test 1: SENZA servizioId
print("📋 Test 1: Carica slot SENZA servizioId")
print("-" * 60)

try:
    url = f"{API_URL}?action=getSlots"
    print(f"🔍 Chiamata: {url}")
    
    response = requests.get(url, timeout=30)
    print(f"📊 Status Code: {response.status_code}")
    
    data = response.json()
    print(f"📦 Risposta:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    if data.get('success'):
        print(f"\n✅ SUCCESS! Caricati {data.get('total', 0)} slot")
    else:
        print(f"\n❌ ERRORE: {data.get('error', 'Errore sconosciuto')}")
        
except Exception as e:
    print(f"\n❌ ERRORE FETCH: {e}")

print("\n" + "=" * 60)

# Test 2: CON servizioId
print("\n📋 Test 2: Carica slot CON servizioId")
print("-" * 60)

try:
    url = f"{API_URL}?action=getSlots&servizioId=e3a7f9b2"
    print(f"🔍 Chiamata: {url}")
    
    response = requests.get(url, timeout=30)
    print(f"📊 Status Code: {response.status_code}")
    
    data = response.json()
    print(f"📦 Risposta:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    if data.get('success'):
        print(f"\n✅ SUCCESS! Caricati {data.get('total', 0)} slot per servizio")
    else:
        print(f"\n❌ ERRORE: {data.get('error', 'Errore sconosciuto')}")
        
except Exception as e:
    print(f"\n❌ ERRORE FETCH: {e}")

print("\n" + "=" * 60)
print("\n💡 Se vedi errori, verifica:")
print("1. Il deployment Apps Script è attivo?")
print("2. L'URL del deployment è corretto?")
print("3. Il codice in Apps Script è stato salvato prima del deploy?")
