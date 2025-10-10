#!/usr/bin/env python3
"""
Abilita automaticamente email per login PWA
"""

import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
SPREADSHEET_ID = os.getenv('SPREADSHEET_ID')
SERVICE_ACCOUNT_FILE = 'credentials/service_account.json'

def enable_pwa_for_email(email):
    """Abilita PWA per email specifica"""
    
    print(f"🔧 Abilito PWA per: {email}")
    
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    # Leggi foglio Clienti
    result = sheet.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range='Clienti!A:Z'
    ).execute()
    
    values = result.get('values', [])
    
    if not values:
        print("❌ Foglio Clienti vuoto!")
        return False
    
    # Trova indici colonne
    header = values[0]
    idx_email = header.index('cn_email') if 'cn_email' in header else -1
    idx_enable_pwa = header.index('cn_enablePWA') if 'cn_enablePWA' in header else -1
    
    if idx_email < 0 or idx_enable_pwa < 0:
        print(f"❌ Colonne mancanti! cn_email: {idx_email}, cn_enablePWA: {idx_enable_pwa}")
        return False
    
    # Cerca email
    for i, row in enumerate(values[1:], start=2):
        if len(row) > idx_email and row[idx_email].lower() == email.lower():
            # Trovata! Abilita PWA
            col_letter = chr(65 + idx_enable_pwa)  # A=65, B=66, etc.
            cell_range = f'Clienti!{col_letter}{i}'
            
            body = {'values': [['SI']]}
            
            result = sheet.values().update(
                spreadsheetId=SPREADSHEET_ID,
                range=cell_range,
                valueInputOption='RAW',
                body=body
            ).execute()
            
            print(f"✅ Email abilitata!")
            print(f"   Riga: {i}")
            print(f"   Cella: {cell_range}")
            print(f"   Cliente: {row[header.index('cn_fullname')] if 'cn_fullname' in header else 'N/A'}")
            return True
    
    print(f"❌ Email non trovata nel foglio Clienti!")
    print(f"💡 Aggiungi manualmente una riga con:")
    print(f"   - cn_email: {email}")
    print(f"   - cn_enablePWA: SI")
    return False

if __name__ == '__main__':
    enable_pwa_for_email('chronyx.team@gmail.com')
