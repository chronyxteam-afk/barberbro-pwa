#!/usr/bin/env python3
"""
Verifica prenotazioni per cliente specifico
"""

import os
from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build

load_dotenv()

SPREADSHEET_ID = os.getenv('SPREADSHEET_ID')
SERVICE_ACCOUNT_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def check_bookings_for_customer(customer_id):
    """Verifica prenotazioni per cliente"""
    
    print(f"\n🔍 Cerco prenotazioni per: {customer_id}")
    
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    # Leggi foglio AppunTamenti
    result = sheet.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range='AppunTamenti!A:H'
    ).execute()
    
    values = result.get('values', [])
    
    if not values:
        print("❌ Foglio AppunTamenti vuoto!")
        return
    
    header = values[0]
    print(f"\n📋 Header AppunTamenti: {' | '.join(header)}")
    
    # Trova indici
    idx_id = header.index('at_ID') if 'at_ID' in header else 0
    idx_datetime = header.index('at_startDateTime') if 'at_startDateTime' in header else 1
    idx_cn = header.index('cn_ID') if 'cn_ID' in header else 2
    idx_sv = header.index('sv_ID') if 'sv_ID' in header else 3
    idx_or = header.index('or_ID') if 'or_ID' in header else 4
    idx_status = header.index('at_status') if 'at_status' in header else 5
    idx_notes = header.index('at_notes') if 'at_notes' in header else 6
    
    print(f"\n📍 Indici: ID={idx_id}, DateTime={idx_datetime}, cn_ID={idx_cn}, Status={idx_status}")
    
    # Cerca prenotazioni
    found_bookings = []
    
    for i, row in enumerate(values[1:], start=2):
        if len(row) > idx_cn:
            cn_id = row[idx_cn] if len(row) > idx_cn else ''
            
            if cn_id == customer_id:
                at_id = row[idx_id] if len(row) > idx_id else ''
                at_datetime = row[idx_datetime] if len(row) > idx_datetime else ''
                at_status = row[idx_status] if len(row) > idx_status else ''
                sv_id = row[idx_sv] if len(row) > idx_sv else ''
                or_id = row[idx_or] if len(row) > idx_or else ''
                
                found_bookings.append({
                    'row': i,
                    'at_ID': at_id,
                    'dateTime': at_datetime,
                    'cn_ID': cn_id,
                    'sv_ID': sv_id,
                    'or_ID': or_id,
                    'status': at_status
                })
    
    print(f"\n✅ Trovate {len(found_bookings)} prenotazioni per {customer_id}:\n")
    
    if found_bookings:
        for b in found_bookings:
            print(f"Riga {b['row']:3d}: {b['at_ID']:20s} | {b['dateTime']:20s} | Status: {b['status']:15s} | Servizio: {b['sv_ID']} | Operatore: {b['or_ID']}")
    else:
        print("❌ Nessuna prenotazione trovata!")
    
    # Conta per status
    print(f"\n📊 Riepilogo per status:")
    status_count = {}
    for b in found_bookings:
        status = b['status']
        status_count[status] = status_count.get(status, 0) + 1
    
    for status, count in status_count.items():
        print(f"   {status}: {count}")


if __name__ == '__main__':
    import sys
    
    customer_id = sys.argv[1] if len(sys.argv) > 1 else 'f72d7451'
    
    check_bookings_for_customer(customer_id)
