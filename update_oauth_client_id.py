#!/usr/bin/env python3
"""
Aggiorna google_client_id nel foglio ConfigPWA
"""

import os
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# Carica .env se esiste
load_dotenv()

# Configurazione
SERVICE_ACCOUNT_FILE = 'credentials/service_account.json'
SPREADSHEET_ID = os.getenv('SPREADSHEET_ID', '1QBkRx85eJ8jQtWAQ4i-rXhfIXX7HqdlMJp84rnpqHnI')
SHEET_NAME = 'ConfigPWA'

# Client ID da salvare
CLIENT_ID = '1052449684709-v9e1tnfrbkagain3aa30e12ts5f6k7j8.apps.googleusercontent.com'

def list_sheets():
    """Lista tutti i fogli nello spreadsheet"""
    
    creds = Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    service = build('sheets', 'v4', credentials=creds)
    
    # Get spreadsheet metadata
    sheet_metadata = service.spreadsheets().get(
        spreadsheetId=SPREADSHEET_ID
    ).execute()
    
    sheets = sheet_metadata.get('sheets', [])
    print(f"📊 Fogli disponibili nello spreadsheet:")
    for sheet in sheets:
        print(f"   • {sheet['properties']['title']}")
    
    return [sheet['properties']['title'] for sheet in sheets]

def update_client_id():
    """Aggiorna google_client_id nel foglio ConfigPWA"""
    
    print(f"🆔 Spreadsheet ID: {SPREADSHEET_ID}\n")
    
    # Lista i fogli disponibili
    try:
        available_sheets = list_sheets()
    except Exception as e:
        print(f"\n❌ Errore lettura spreadsheet: {e}")
        print(f"💡 Verifica che il Service Account abbia accesso al foglio")
        return False
    
    if SHEET_NAME not in available_sheets:
        print(f"\n❌ Foglio '{SHEET_NAME}' non trovato!")
        return False
    
    print(f"\n✅ Foglio '{SHEET_NAME}' trovato!")
    
    # Autenticazione
    creds = Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    # Leggi tutto il foglio ConfigPWA
    result = sheet.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A:C'
    ).execute()
    
    values = result.get('values', [])
    
    # Trova la riga con param_key = 'google_client_id'
    row_index = None
    for i, row in enumerate(values):
        if len(row) > 0 and row[0] == 'google_client_id':
            row_index = i + 1  # +1 perché le righe partono da 1
            break
    
    if row_index is None:
        print("❌ Riga 'google_client_id' non trovata!")
        return False
    
    # Aggiorna la cella param_value (colonna B)
    cell_range = f'{SHEET_NAME}!B{row_index}'
    
    sheet.values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=cell_range,
        valueInputOption='RAW',
        body={'values': [[CLIENT_ID]]}
    ).execute()
    
    print(f"\n✅ Client ID aggiornato!")
    print(f"📍 Cella: {cell_range}")
    print(f"🔑 Valore: {CLIENT_ID}")
    
    return True

if __name__ == '__main__':
    update_client_id()
