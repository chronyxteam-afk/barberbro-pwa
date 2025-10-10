#!/usr/bin/env python3
"""
Aggiunge google_client_id al foglio ConfigPWA
"""

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pickle
import os

SPREADSHEET_ID = '1gYm5OTwJfVE26n_YX9PG8qE6tQT6uPCGLDLgUpbzKDs'
GOOGLE_CLIENT_ID = '1052449684709-v9e1tnfrbkagain3aa30e12ts5f6k7j8.apps.googleusercontent.com'

def main():
    # Carica credenziali Apps Script
    if not os.path.exists('token_apps_script.pickle'):
        print("❌ token_apps_script.pickle non trovato!")
        return
    
    with open('token_apps_script.pickle', 'rb') as token:
        creds = pickle.load(token)
    
    try:
        service = build('sheets', 'v4', credentials=creds)
        
        # Prima leggi il foglio ConfigPWA per vedere cosa c'è
        print("\n📖 Lettura ConfigPWA...")
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range='ConfigPWA!A:B'
        ).execute()
        
        values = result.get('values', [])
        print(f"   Righe trovate: {len(values)}")
        
        # Cerca se esiste già google_client_id
        client_id_row = None
        for i, row in enumerate(values):
            if len(row) > 0:
                print(f"   {i+1}: {row[0]} = {row[1] if len(row) > 1 else '(vuoto)'}")
                if row[0] == 'google_client_id':
                    client_id_row = i + 1
                    print(f"      ✓ Trovato alla riga {client_id_row}")
        
        if client_id_row:
            # Aggiorna la riga esistente
            print(f"\n✏️  Aggiornamento google_client_id alla riga {client_id_row}...")
            range_name = f'ConfigPWA!B{client_id_row}'
        else:
            # Aggiungi nuova riga
            print(f"\n➕ Aggiunta nuova riga con google_client_id...")
            next_row = len(values) + 1
            range_name = f'ConfigPWA!A{next_row}:B{next_row}'
            values_to_write = [['google_client_id', GOOGLE_CLIENT_ID]]
        
        if client_id_row:
            # Solo il valore nella colonna B
            values_to_write = [[GOOGLE_CLIENT_ID]]
        
        body = {'values': values_to_write}
        
        result = service.spreadsheets().values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=range_name,
            valueInputOption='RAW',
            body=body
        ).execute()
        
        print(f"✅ SUCCESSO! Aggiornate {result.get('updatedCells')} celle")
        print(f"\n🔑 google_client_id configurato:")
        print(f"   {GOOGLE_CLIENT_ID}")
        
        # Rileggi per conferma
        print("\n📖 Verifica finale ConfigPWA...")
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range='ConfigPWA!A:B'
        ).execute()
        
        values = result.get('values', [])
        for row in values:
            if len(row) > 0 and row[0] == 'google_client_id':
                print(f"   ✓ google_client_id = {row[1] if len(row) > 1 else '(VUOTO!)'}")
                break
    
    except HttpError as error:
        print(f"❌ Errore API: {error}")
    except Exception as e:
        print(f"❌ Errore: {e}")

if __name__ == '__main__':
    main()
