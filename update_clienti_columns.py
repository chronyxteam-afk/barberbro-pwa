#!/usr/bin/env python3
"""
Aggiunge colonne OAuth al foglio Clienti esistente
"""

import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
SPREADSHEET_ID = os.getenv('SPREADSHEET_ID')
SERVICE_ACCOUNT_FILE = 'credentials/service_account.json'

def update_clienti_sheet():
    """Aggiunge colonne OAuth al foglio Clienti"""
    
    print("🔧 Aggiorno foglio Clienti con colonne OAuth...")
    
    # Credenziali
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    # 1. Leggi header attuale
    result = sheet.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range='Clienti!A1:Z1'
    ).execute()
    
    current_header = result.get('values', [[]])[0]
    print(f"\n📋 Header attuale: {current_header}")
    
    # 2. Aggiungi nuove colonne se non esistono
    new_columns = []
    
    if 'cn_enablePWA' not in current_header:
        new_columns.append('cn_enablePWA')
    
    if 'cn_lastLogin' not in current_header:
        new_columns.append('cn_lastLogin')
    
    if 'cn_totalBookings' not in current_header:
        new_columns.append('cn_totalBookings')
    
    if not new_columns:
        print("✅ Tutte le colonne OAuth già presenti!")
        return
    
    print(f"\n➕ Colonne da aggiungere: {new_columns}")
    
    # 3. Aggiungi header
    start_col_letter = chr(65 + len(current_header))  # H, I, J...
    end_col_letter = chr(65 + len(current_header) + len(new_columns) - 1)
    
    header_range = f'Clienti!{start_col_letter}1:{end_col_letter}1'
    
    body = {
        'values': [new_columns]
    }
    
    result = sheet.values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=header_range,
        valueInputOption='RAW',
        body=body
    ).execute()
    
    print(f"✅ Header aggiornato: {result.get('updatedCells')} celle")
    
    # 4. Leggi numero righe
    result = sheet.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range='Clienti!A:A'
    ).execute()
    
    num_rows = len(result.get('values', []))
    print(f"📊 Righe totali: {num_rows}")
    
    # 5. Imposta valori default per righe esistenti
    if num_rows > 1:
        default_values = []
        
        for i in range(num_rows - 1):  # Escludi header
            row_values = []
            for col in new_columns:
                if col == 'cn_enablePWA':
                    row_values.append('NO')  # Default disabilitato
                elif col == 'cn_lastLogin':
                    row_values.append('')  # Vuoto
                elif col == 'cn_totalBookings':
                    row_values.append('0')  # Zero prenotazioni
            default_values.append(row_values)
        
        data_range = f'Clienti!{start_col_letter}2:{end_col_letter}{num_rows}'
        
        body = {
            'values': default_values
        }
        
        result = sheet.values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=data_range,
            valueInputOption='RAW',
            body=body
        ).execute()
        
        print(f"✅ Valori default impostati: {result.get('updatedCells')} celle")
    
    # 6. Formatta header (grassetto, sfondo blu)
    requests = [
        {
            'repeatCell': {
                'range': {
                    'sheetId': 0,  # Assumo sia il primo foglio
                    'startRowIndex': 0,
                    'endRowIndex': 1,
                    'startColumnIndex': len(current_header),
                    'endColumnIndex': len(current_header) + len(new_columns)
                },
                'cell': {
                    'userEnteredFormat': {
                        'backgroundColor': {
                            'red': 0.26,
                            'green': 0.52,
                            'blue': 0.96
                        },
                        'textFormat': {
                            'foregroundColor': {
                                'red': 1.0,
                                'green': 1.0,
                                'blue': 1.0
                            },
                            'bold': True
                        }
                    }
                },
                'fields': 'userEnteredFormat(backgroundColor,textFormat)'
            }
        }
    ]
    
    body = {
        'requests': requests
    }
    
    sheet.batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body=body
    ).execute()
    
    print("✅ Formattazione applicata!")
    
    print("\n" + "="*80)
    print("🎉 AGGIORNAMENTO COMPLETATO!")
    print("="*80)
    print(f"\n📋 Nuova struttura header:")
    print(f"   {current_header + new_columns}")
    print(f"\n⚠️ IMPORTANTE:")
    print(f"   • Tutti i clienti esistenti hanno cn_enablePWA = 'NO'")
    print(f"   • Devi abilitarli manualmente o con menu BarberBro")
    print(f"   • Colonne: {', '.join(new_columns)}")
    print(f"\n🌐 Apri foglio: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit")

if __name__ == '__main__':
    update_clienti_sheet()
