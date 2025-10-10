#!/usr/bin/env python3
"""
Lista tutti i fogli nel Google Sheets
"""

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import pickle
import os

SPREADSHEET_ID = '1gYm5OTwJfVE26n_YX9PG8qE6tQT6uPCGLDLgUpbzKDs'

def main():
    if not os.path.exists('token_apps_script.pickle'):
        print("❌ token_apps_script.pickle non trovato!")
        return
    
    with open('token_apps_script.pickle', 'rb') as token:
        creds = pickle.load(token)
    
    try:
        service = build('sheets', 'v4', credentials=creds)
        
        # Ottieni metadata del foglio
        spreadsheet = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
        
        print("\n📊 FOGLI NEL SPREADSHEET:")
        print(f"   Titolo: {spreadsheet.get('properties', {}).get('title')}")
        print(f"   Fogli totali: {len(spreadsheet.get('sheets', []))}")
        print()
        
        for sheet in spreadsheet.get('sheets', []):
            props = sheet.get('properties', {})
            title = props.get('title')
            sheet_id = props.get('sheetId')
            rows = props.get('gridProperties', {}).get('rowCount', 0)
            cols = props.get('gridProperties', {}).get('columnCount', 0)
            
            print(f"   • {title}")
            print(f"     ID: {sheet_id}, Righe: {rows}, Colonne: {cols}")
    
    except Exception as e:
        print(f"❌ Errore: {e}")

if __name__ == '__main__':
    main()
