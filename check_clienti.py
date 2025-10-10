#!/usr/bin/env python3
"""
Script per leggere il foglio Clienti e verificare la struttura
"""

import os
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
SPREADSHEET_ID = os.getenv('SPREADSHEET_ID')
SERVICE_ACCOUNT_FILE = 'credentials/service_account.json'

def get_sheet_data():
    """Leggi foglio Clienti"""
    
    if not SPREADSHEET_ID:
        print("❌ SPREADSHEET_ID non trovato nel .env!")
        return
    
    print(f"📊 Leggo foglio Google Sheets...")
    print(f"🆔 Spreadsheet ID: {SPREADSHEET_ID}")
    
    # Usa Service Account se esiste, altrimenti OAuth
    creds = None
    
    if os.path.exists(SERVICE_ACCOUNT_FILE):
        print("🔑 Uso Service Account...")
        from google.oauth2 import service_account
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    else:
        print("🔑 Uso OAuth...")
        TOKEN_FILE = 'token_sheets.pickle'
        CREDS_FILE = 'credentials.json'
        
        if os.path.exists(TOKEN_FILE):
            with open(TOKEN_FILE, 'rb') as token:
                creds = pickle.load(token)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(CREDS_FILE):
                    print(f"❌ File {CREDS_FILE} non trovato!")
                    return
                
                flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE, SCOPES)
                creds = flow.run_local_server(port=0)
            
            with open(TOKEN_FILE, 'wb') as token:
                pickle.dump(creds, token)
    
    try:
        service = build('sheets', 'v4', credentials=creds)
        
        # Leggi foglio Clienti
        sheet = service.spreadsheets()
        result = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range='Clienti!A1:G100'  # Leggi primi 100 righe
        ).execute()
        
        values = result.get('values', [])
        
        if not values:
            print("❌ Foglio Clienti vuoto o non trovato!")
            return
        
        print(f"\n✅ Foglio Clienti trovato! {len(values)} righe")
        print("\n" + "="*80)
        print("STRUTTURA FOGLIO CLIENTI")
        print("="*80)
        
        # Header
        header = values[0] if values else []
        print(f"\n📋 HEADER (Riga 1):")
        for i, col in enumerate(header):
            letter = chr(65 + i)  # A, B, C...
            print(f"   Colonna {letter} ({i+1}): {col}")
        
        # Dati esempio
        if len(values) > 1:
            print(f"\n📊 DATI (Prime 5 righe esempio):")
            print("-"*80)
            
            for i, row in enumerate(values[1:6], start=2):
                print(f"\n🔹 Riga {i}:")
                for j, cell in enumerate(row):
                    col_name = header[j] if j < len(header) else f"Colonna_{j+1}"
                    letter = chr(65 + j)
                    print(f"   {letter} ({col_name}): {cell}")
        
        # Conta righe con cn_enablePWA = SI
        if 'cn_enablePWA' in header:
            enable_col_index = header.index('cn_enablePWA')
            count_si = 0
            count_no = 0
            
            for row in values[1:]:
                if len(row) > enable_col_index:
                    val = row[enable_col_index].upper() if row[enable_col_index] else ''
                    if val == 'SI':
                        count_si += 1
                    elif val == 'NO':
                        count_no += 1
            
            print(f"\n📈 STATISTICHE cn_enablePWA:")
            print(f"   ✅ Abilitati (SI): {count_si}")
            print(f"   ❌ Disabilitati (NO): {count_no}")
            print(f"   ⚠️ Non specificato: {len(values) - 1 - count_si - count_no}")
        
        print("\n" + "="*80)
        
    except Exception as e:
        print(f"❌ Errore: {e}")

if __name__ == '__main__':
    get_sheet_data()
