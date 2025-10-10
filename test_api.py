#!/usr/bin/env python3
"""
Test API Google Apps Script
"""

import requests

API_URL = "https://script.google.com/macros/s/AKfycbypx2mx9e_-sWVyi6sb8wlpz3P-6atQSYerCsR7VamD1O5QbHaFjY9dNT2KykjuaX7Mrg/exec"

def test_endpoint(endpoint, params=None):
    url = f"{API_URL}?endpoint={endpoint}"
    if params:
        for key, value in params.items():
            url += f"&{key}={value}"
    
    print(f"\n🔍 Testing: {endpoint}")
    print(f"   URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', 'N/A')}")
            
            if not data.get('success', False):
                print(f"   ❌ Error: {data.get('error', 'Unknown')}")
            else:
                # Mostra primi dati
                if endpoint == 'servizi' and 'servizi' in data:
                    print(f"   📋 Servizi trovati: {len(data['servizi'])}")
                    for s in data['servizi'][:3]:
                        print(f"      • {s.get('sv_name')} - €{s.get('sv_price')}")
                
                elif endpoint == 'operatori' and 'operatori' in data:
                    print(f"   👥 Operatori trovati: {len(data['operatori'])}")
                    for o in data['operatori']:
                        print(f"      • {o.get('op_name')}")
                
                elif endpoint == 'slot' and 'slot' in data:
                    print(f"   📅 Slot trovati: {len(data['slot'])}")
                    for slot in data['slot'][:5]:
                        print(f"      • {slot.get('at_startDateTime')} - {slot.get('op_name')}")
        else:
            print(f"   ❌ HTTP Error: {response.text[:200]}")
    
    except Exception as e:
        print(f"   ❌ Exception: {e}")

if __name__ == '__main__':
    print("=" * 60)
    print("🧪 TEST API GOOGLE APPS SCRIPT")
    print("=" * 60)
    
    # Test config (pubblico)
    test_endpoint('config')
    
    # Test servizi (richiede auth)
    test_endpoint('servizi')
    
    # Test operatori (richiede auth)
    test_endpoint('operatori')
    
    # Test slot (richiede auth)
    test_endpoint('slot')
    
    print("\n" + "=" * 60)
