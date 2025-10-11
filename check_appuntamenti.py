#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build

load_dotenv()

# Credenziali service account
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
creds = service_account.Credentials.from_service_account_file(
    'service-account-key.json', scopes=SCOPES)

service = build('sheets', 'v4', credentials=creds)

SPREADSHEET_ID = '1O-3CmzjiS0eY8l-ITfNKMtaiN1RZn9xB4wlZFpvFaFw'

print("🔍 Controllo foglio AppunTamenti...\n")

# Header
result = service.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID, 
    range='AppunTamenti!A1:Z1'
).execute()

header = result.get('values', [[]])[0]
print("📋 HEADER:")
for i, col in enumerate(header[:15]):
    print(f"   {chr(65+i)}: {col}")

# Prime 10 righe
result = service.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID, 
    range='AppunTamenti!A2:O20'
).execute()

rows = result.get('values', [])
print(f"\n📊 Trovate {len(rows)} righe\n")

# Cerca slot liberi
slot_liberi = 0
for i, row in enumerate(rows):
    if len(row) > 5:
        status = row[5] if len(row) > 5 else ''
        if status == 'Libero':
            slot_liberi += 1
            if slot_liberi <= 5:  # Mostra primi 5
                print(f"🟢 Slot Libero (riga {i+2}):")
                print(f"   at_ID: {row[0] if len(row) > 0 else 'N/A'}")
                print(f"   at_startDateTime: {row[1] if len(row) > 1 else 'N/A'}")
                print(f"   sv_ID: {row[3] if len(row) > 3 else 'N/A'}")
                print(f"   or_ID: {row[4] if len(row) > 4 else 'N/A'}")
                print(f"   at_status: {status}")
                print()

print(f"\n✅ Totale slot liberi trovati: {slot_liberi}")

# Controlla anche gli status
statuses = {}
for row in rows:
    if len(row) > 5:
        status = row[5] if len(row) > 5 else 'VUOTO'
        statuses[status] = statuses.get(status, 0) + 1

print(f"\n📊 Distribuzione Status:")
for status, count in statuses.items():
    print(f"   {status}: {count}")
