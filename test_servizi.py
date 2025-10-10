import requests

url = "https://script.google.com/macros/s/AKfycbypx2mx9e_-sWVyi6sb8wlpz3P-6atQSYerCsR7VamD1O5QbHaFjY9dNT2KykjuaX7Mrg/exec"

print("🧪 Test endpoint servizi con token fake:\n")
r = requests.get(f"{url}?endpoint=servizi&authorization=fake")
data = r.json()
print(f"Success: {data.get('success')}")
print(f"Error: {data.get('error')}")
