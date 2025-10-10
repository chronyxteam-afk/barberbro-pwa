#!/usr/bin/env python3
"""
Test per verificare i dati nel foglio Google
"""

import pickle
import os
from googleapiclient.discovery import build

SPREADSHEET_ID = '1gYm5OTwJfVE26n_YX9PG8qE6tQT6uPCGLDLgUpbzKDs'

def main():
    # Carica credenziali
    if not os.path.exists('token_sheets.pickle'):
        print("❌ token_sheets.pickle non trovato!")
        return
    
    with open('token_sheets.pickle', 'rb') as token:
        creds = pickle.load(token)
    
    service = build('sheets', 'v4', credentials=creds)
    
    # Test SerVizi
    print("\n📋 SERVIZI (SerVizi!A2:D10):")
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range='SerVizi!A2:D10'
        ).execute()
        values = result.get('values', [])
        if values:
            for row in values:
                print(f"  ✓ {row}")
        else:
            print("  ❌ NESSUN SERVIZIO TROVATO")
    except Exception as e:
        print(f"  ❌ Errore: {e}")
    
    # Test OpeRatori
    print("\n👥 OPERATORI (OpeRatori!A2:D10):")
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range='OpeRatori!A2:D10'
        ).execute()
        values = result.get('values', [])
        if values:
            for row in values:
                print(f"  ✓ {row}")
        else:
            print("  ❌ NESSUN OPERATORE TROVATO")
    except Exception as e:
        print(f"  ❌ Errore: {e}")
    
    # Test AppunTamenti (primi 10 slot)
    print("\n📅 SLOT (AppunTamenti!A2:G11):")
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range='AppunTamenti!A2:G11'
        ).execute()
        values = result.get('values', [])
        if values:
            for row in values:
                print(f"  ✓ {row}")
        else:
            print("  ❌ NESSUNO SLOT TROVATO")
    except Exception as e:
        print(f"  ❌ Errore: {e}")

if __name__ == '__main__':
    main()
