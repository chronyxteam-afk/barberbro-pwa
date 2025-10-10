import requests

API = "https://script.google.com/macros/s/AKfycbwjoGsi3f1tBdKXA1eOEgxjTnXwkSSwBfUQWL5shAHJgTKtOawD2eElK31volNJtSPeQw/exec"

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
