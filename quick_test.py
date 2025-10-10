import requests

API = "https://script.google.com/macros/s/AKfycbypx2mx9e_-sWVyi6sb8wlpz3P-6atQSYerCsR7VamD1O5QbHaFjY9dNT2KykjuaX7Mrg/exec"

# Login
print("1. Login...")
r = requests.get(f"{API}?endpoint=login&email=chronyx.team@gmail.com")
data = r.json()
print(f"   Success: {data['success']}")
token = data['token']
print(f"   Token: {token[:20]}...")

# Servizi
print("\n2. Servizi...")
r = requests.get(f"{API}?endpoint=servizi&authorization={token}")
print(f"   Status: {r.status_code}")
print(f"   Response: {r.text[:200]}")
