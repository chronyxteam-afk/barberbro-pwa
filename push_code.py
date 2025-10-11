#!/usr/bin/env python3
"""
Push rapido Code.gs su Apps Script
"""

import os
import sys
import json
import pickle
from pathlib import Path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Scope per Apps Script API
SCOPES = ['https://www.googleapis.com/auth/script.projects']

# File
TOKEN_FILE = 'token_apps_script.pickle'
SCRIPT_ID = '1vl-oqCAIpXPZ5WB5HZatKV4lcOBbZaURwwEOK4QmDmRmJYeIDw4EMlfT'
CODE_FILE = 'scripts/Code.gs'
MANIFEST_FILE = 'scripts/appsscript.json'


def get_credentials():
    """Ottiene credenziali OAuth"""
    creds = None
    
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("♻️  Refresh token...")
            creds.refresh(Request())
            with open(TOKEN_FILE, 'wb') as token:
                pickle.dump(creds, token)
        else:
            print("❌ Token non valido! Esegui prima: python apps_script_manager.py push-complete")
            sys.exit(1)
    
    return creds


def push():
    """Push Code.gs su Apps Script"""
    print(f"\n📤 Push {CODE_FILE} su Apps Script...")
    print(f"🆔 Script ID: {SCRIPT_ID}")
    
    # Leggi Code.gs
    if not os.path.exists(CODE_FILE):
        print(f"❌ File {CODE_FILE} non trovato!")
        sys.exit(1)
    
    with open(CODE_FILE, 'r', encoding='utf-8') as f:
        code = f.read()
    
    print(f"📊 Dimensione: {len(code):,} caratteri")
    
    # Leggi manifest
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    else:
        manifest = {
            "timeZone": "Europe/Rome",
            "dependencies": {},
            "exceptionLogging": "STACKDRIVER",
            "runtimeVersion": "V8"
        }
    
    # Credenziali
    creds = get_credentials()
    
    try:
        service = build('script', 'v1', credentials=creds)
        
        # Prepara contenuto
        content = {
            'files': [
                {
                    'name': 'Code',
                    'type': 'SERVER_JS',
                    'source': code
                },
                {
                    'name': 'appsscript',
                    'type': 'JSON',
                    'source': json.dumps(manifest)
                }
            ]
        }
        
        # Upload
        print("⏳ Upload in corso...")
        request = service.projects().updateContent(
            scriptId=SCRIPT_ID,
            body=content
        )
        response = request.execute()
        
        print("\n✅ SUCCESSO! Code.gs aggiornato su Google Apps Script")
        print(f"📊 Files: {len(response.get('files', []))}")
        
        for file in response.get('files', []):
            print(f"   • {file.get('name')} ({file.get('type')})")
        
        print(f"\n🌐 Editor: https://script.google.com/d/{SCRIPT_ID}/edit")
        print("\n🚀 PROSSIMI PASSI:")
        print("1. Vai su Apps Script editor (link sopra)")
        print("2. Deploy → Manage deployments")
        print("3. Edit deployment più recente")
        print("4. Version: New version")
        print("5. Description: 'Fix: servizioId opzionale'")
        print("6. Deploy")
        print("7. Copia nuovo URL deployment")
        
    except HttpError as error:
        print(f"\n❌ Errore: {error}")
        
        if "has not been used" in str(error):
            print("\n💡 ABILITA Google Apps Script API:")
            print("https://console.cloud.google.com/apis/library/script.googleapis.com")
        
        sys.exit(1)


if __name__ == '__main__':
    push()
