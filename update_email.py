#!/usr/bin/env python3
"""
Script per aggiornare email cliente nel foglio Clienti
"""

import os
from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Carica env
load_dotenv()

SPREADSHEET_ID = os.getenv('SPREADSHEET_ID')
SERVICE_ACCOUNT_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def update_customer_email(customer_id, new_email):
    """Aggiorna email per cliente specifico"""
    
    print(f"\n🔧 Aggiorno email per cliente: {customer_id}")
    print(f"📧 Nuova email: {new_email}")
    
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"❌ File {SERVICE_ACCOUNT_FILE} non trovato!")
        return False
    
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    # Leggi foglio Clienti
    result = sheet.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range='Clienti!A:N'
    ).execute()
    
    values = result.get('values', [])
    
    if not values:
        print("❌ Foglio Clienti vuoto!")
        return False
    
    # Trova indici colonne
    header = values[0]
    print(f"\n📋 Header: {header}")
    
    idx_id = header.index('cn_ID') if 'cn_ID' in header else 0
    idx_name = header.index('cn_name') if 'cn_name' in header else 1
    idx_phone = header.index('cn_phone') if 'cn_phone' in header else 3
    idx_email = header.index('cn_email') if 'cn_email' in header else 4
    idx_enable_pwa = header.index('cn_enablePWA') if 'cn_enablePWA' in header else 11
    
    print(f"📍 Indici colonne: ID={idx_id}, Name={idx_name}, Phone={idx_phone}, Email={idx_email}, EnablePWA={idx_enable_pwa}")
    
    # Cerca cliente
    found = False
    for i, row in enumerate(values[1:], start=2):
        if len(row) > idx_id and row[idx_id] == customer_id:
            # Trovato!
            current_name = row[idx_name] if len(row) > idx_name else ''
            current_phone = row[idx_phone] if len(row) > idx_phone else ''
            current_email = row[idx_email] if len(row) > idx_email else ''
            current_pwa = row[idx_enable_pwa] if len(row) > idx_enable_pwa else ''
            
            print(f"\n✅ Cliente trovato alla riga {i}:")
            print(f"   ID: {row[idx_id]}")
            print(f"   Nome: {current_name}")
            print(f"   Telefono: {current_phone}")
            print(f"   Email attuale: '{current_email}'")
            print(f"   PWA abilitato: {current_pwa}")
            
            # Aggiorna email (colonna E = indice 4 = 'E')
            col_email_letter = chr(65 + idx_email)  # A=65
            cell_email = f'Clienti!{col_email_letter}{i}'
            
            # Aggiorna anche PWA se necessario
            col_pwa_letter = chr(65 + idx_enable_pwa)
            cell_pwa = f'Clienti!{col_pwa_letter}{i}'
            
            print(f"\n🔄 Aggiorno...")
            print(f"   Email: {cell_email} → {new_email}")
            
            # Update email
            body_email = {'values': [[new_email]]}
            sheet.values().update(
                spreadsheetId=SPREADSHEET_ID,
                range=cell_email,
                valueInputOption='RAW',
                body=body_email
            ).execute()
            
            # Abilita PWA se non già abilitato
            if current_pwa != 'SI':
                print(f"   PWA: {cell_pwa} → SI")
                body_pwa = {'values': [['SI']]}
                sheet.values().update(
                    spreadsheetId=SPREADSHEET_ID,
                    range=cell_pwa,
                    valueInputOption='RAW',
                    body=body_pwa
                ).execute()
            
            print(f"\n✅ Email aggiornata con successo!")
            found = True
            break
    
    if not found:
        print(f"\n❌ Cliente {customer_id} non trovato nel foglio!")
        return False
    
    return True


def list_all_customers():
    """Lista tutti i clienti per debug"""
    
    print(f"\n📊 Lista tutti i clienti...")
    
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"❌ File {SERVICE_ACCOUNT_FILE} non trovato!")
        return
    
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    result = sheet.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range='Clienti!A:N'
    ).execute()
    
    values = result.get('values', [])
    
    if not values:
        print("❌ Foglio vuoto!")
        return
    
    header = values[0]
    print(f"\n📋 Header: {' | '.join(header)}\n")
    
    for i, row in enumerate(values[1:], start=2):
        if len(row) > 0:
            cn_id = row[0] if len(row) > 0 else ''
            cn_name = row[1] if len(row) > 1 else ''
            cn_phone = row[3] if len(row) > 3 else ''
            cn_email = row[4] if len(row) > 4 else ''
            cn_pwa = row[11] if len(row) > 11 else ''
            
            print(f"Riga {i:2d}: {cn_id:15s} | {cn_name:20s} | {cn_phone:15s} | {cn_email:30s} | PWA:{cn_pwa}")


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) == 1:
        # Lista tutti
        list_all_customers()
    elif len(sys.argv) == 3:
        # Aggiorna
        customer_id = sys.argv[1]
        new_email = sys.argv[2]
        update_customer_email(customer_id, new_email)
    else:
        print("Uso:")
        print("  python update_email.py                          # Lista tutti i clienti")
        print("  python update_email.py <cn_ID> <email>          # Aggiorna email specifico")
        print("")
        print("Esempio:")
        print("  python update_email.py f72d7451 chronyx.team@gmail.com")
