#!/usr/bin/env python3
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

creds = Credentials.from_authorized_user_file('token.json')
service = build('sheets', 'v4', credentials=creds)

SPREADSHEET_ID = '1O-3CmzjiS0eY8l-ITfNKMtaiN1RZn9xB4wlZFpvFaFw'

# Leggi header OpeRatori
result = service.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID, 
    range='OpeRatori!A1:Z1'
).execute()

header = result.get('values', [[]])[0]

print('📋 Header OpeRatori:')
for i, col in enumerate(header):
    print(f'   Colonna {chr(65+i)} ({i}): {col}')

# Leggi prime 3 righe di dati
result = service.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID, 
    range='OpeRatori!A2:Z4'
).execute()

values = result.get('values', [])

print(f'\n📊 Dati (Prime {len(values)} righe):')
for row_num, row in enumerate(values):
    print(f'\n🔹 Riga {row_num + 2}:')
    for i, val in enumerate(row[:10]):  # Prime 10 colonne
        if i < len(header):
            print(f'   {chr(65+i)} ({header[i]}): {val}')
