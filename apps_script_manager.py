#!/usr/bin/env python3
"""
BarberBro Apps Script Manager
Push/Pull codice da Google Apps Script direttamente da VS Code
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
from dotenv import load_dotenv

# Carica variabili d'ambiente
load_dotenv()

# Scope per Apps Script API
SCOPES = ['https://www.googleapis.com/auth/script.projects']

# File di configurazione
CREDENTIALS_FILE = 'credentials.json'
TOKEN_FILE = 'token_apps_script.pickle'
SCRIPT_FILE = 'apps-script/BarberBro_SlotManager_Complete.gs'
MANIFEST_FILE = 'apps-script/appsscript.json'


def get_credentials():
    """Ottiene credenziali OAuth con refresh automatico"""
    creds = None
    
    # Token salvato da sessioni precedenti
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    
    # Se non ci sono credenziali valide, autenticazione
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("♻️  Refresh token...")
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                print(f"❌ File {CREDENTIALS_FILE} non trovato!")
                print("\n📘 COME OTTENERE credentials.json:")
                print("1. Vai su: https://console.cloud.google.com")
                print("2. Seleziona progetto 'barberappsheetscript'")
                print("3. APIs & Services → Credentials")
                print("4. + CREATE CREDENTIALS → OAuth client ID")
                print("5. Application type: Desktop app")
                print("6. Name: BarberBro Desktop OAuth")
                print("7. DOWNLOAD JSON → rinomina in 'credentials.json'")
                print("8. Metti il file nella cartella del progetto")
                sys.exit(1)
            
            print("🔐 Autenticazione richiesta...")
            print("📌 Si aprirà il browser per autorizzare l'app")
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Salva token per uso futuro
        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)
        print("✅ Token salvato!")
    
    return creds


def create_manifest():
    """Crea file manifest appsscript.json se non esiste"""
    manifest_path = Path(MANIFEST_FILE)
    
    if manifest_path.exists():
        with open(manifest_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    # Manifest di default
    manifest = {
        "timeZone": "Europe/Rome",
        "dependencies": {},
        "exceptionLogging": "STACKDRIVER",
        "runtimeVersion": "V8",
        "webapp": {
            "executeAs": "USER_DEPLOYING",
            "access": "ANYONE"
        }
    }
    
    # Salva manifest
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✅ Manifest creato: {MANIFEST_FILE}")
    return manifest


def push_complete(script_id=None):
    """Push file completo su Google Apps Script"""
    if not script_id:
        script_id = os.getenv('APPS_SCRIPT_ID')
    
    if not script_id:
        print("❌ APPS_SCRIPT_ID non trovato!")
        print("\n📘 COME OTTENERE Script ID:")
        print("1. Apri Google Sheets")
        print("2. Menu Estensioni → Apps Script")
        print("3. Copia ID dalla URL:")
        print("   https://script.google.com/d/ABC123XYZ/edit")
        print("                               ^^^^^^^^")
        print("4. Aggiungi al file .env:")
        print("   APPS_SCRIPT_ID=ABC123XYZ")
        sys.exit(1)
    
    print(f"\n📤 Push script su Google Apps Script...")
    print(f"📂 File locale: {SCRIPT_FILE}")
    print(f"🆔 Script ID: {script_id}")
    
    # Leggi file script
    if not os.path.exists(SCRIPT_FILE):
        print(f"❌ File {SCRIPT_FILE} non trovato!")
        sys.exit(1)
    
    with open(SCRIPT_FILE, 'r', encoding='utf-8') as f:
        code = f.read()
    
    # Crea/leggi manifest
    manifest = create_manifest()
    
    # Credenziali OAuth
    creds = get_credentials()
    
    try:
        # Build service Apps Script API
        service = build('script', 'v1', credentials=creds)
        
        # Prepara contenuto progetto
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
        
        # Push su Google
        print("⏳ Upload in corso...")
        request = service.projects().updateContent(
            scriptId=script_id,
            body=content
        )
        response = request.execute()
        
        print("\n✅ SUCCESSO! Script aggiornato su Google Apps Script")
        print(f"📊 Files caricati: {len(response.get('files', []))}")
        
        # Mostra file caricati
        for file in response.get('files', []):
            file_name = file.get('name', 'Unknown')
            file_type = file.get('type', 'Unknown')
            print(f"   • {file_name} ({file_type})")
        
        print(f"\n🌐 Apri editor: https://script.google.com/d/{script_id}/edit")
        
    except HttpError as error:
        print(f"\n❌ Errore upload: {error}")
        
        if "has not been used" in str(error):
            print("\n💡 SOLUZIONE:")
            print("1. Vai su: https://console.cloud.google.com")
            print("2. APIs & Services → Library")
            print("3. Cerca: Google Apps Script API")
            print("4. Clicca ENABLE")
            print("5. Attendi 1-2 minuti")
            print("6. Riprova questo comando")
        
        elif "Invalid project" in str(error):
            print("\n💡 SOLUZIONE:")
            print("1. Verifica lo Script ID nel file .env")
            print("2. Apri Google Sheets → Estensioni → Apps Script")
            print("3. Copia ID dalla URL")
            print("4. Aggiorna .env con ID corretto")
        
        sys.exit(1)


def pull():
    """Pull script da Google Apps Script"""
    script_id = os.getenv('APPS_SCRIPT_ID')
    
    if not script_id:
        print("❌ APPS_SCRIPT_ID non trovato nel file .env!")
        sys.exit(1)
    
    print(f"\n📥 Pull script da Google Apps Script...")
    print(f"🆔 Script ID: {script_id}")
    
    # Credenziali OAuth
    creds = get_credentials()
    
    try:
        # Build service
        service = build('script', 'v1', credentials=creds)
        
        # Download contenuto
        print("⏳ Download in corso...")
        request = service.projects().getContent(scriptId=script_id)
        response = request.execute()
        
        # Crea cartella scripts/
        output_dir = Path('scripts')
        output_dir.mkdir(exist_ok=True)
        
        # Salva files
        files_saved = 0
        for file in response.get('files', []):
            file_name = file.get('name')
            file_type = file.get('type')
            source = file.get('source')
            
            if file_type == 'SERVER_JS':
                file_path = output_dir / f"{file_name}.gs"
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(source)
                print(f"✅ Salvato: {file_path}")
                files_saved += 1
            
            elif file_type == 'JSON':
                file_path = output_dir / f"{file_name}.json"
                with open(file_path, 'w', encoding='utf-8') as f:
                    # Pretty print JSON
                    json_obj = json.loads(source)
                    json.dump(json_obj, f, indent=2)
                print(f"✅ Salvato: {file_path}")
                files_saved += 1
        
        print(f"\n🎉 Download completato! {files_saved} file salvati in cartella 'scripts/'")
        
    except HttpError as error:
        print(f"\n❌ Errore download: {error}")
        sys.exit(1)


def setup_guide():
    """Mostra guida setup iniziale"""
    print("""
╔══════════════════════════════════════════════════════════════╗
║  📘 GUIDA SETUP APPS SCRIPT MANAGER                         ║
╚══════════════════════════════════════════════════════════════╝

🎯 Questo tool ti permette di pushare/pullare codice da Google Apps Script!

📋 SETUP INIZIALE (Una tantum):

1️⃣  Abilita Google Apps Script API
   • Vai su: https://console.cloud.google.com
   • Seleziona progetto 'barberappsheetscript'
   • APIs & Services → Library
   • Cerca: Google Apps Script API
   • Clicca ENABLE

2️⃣  Crea credenziali OAuth 2.0
   • APIs & Services → Credentials
   • + CREATE CREDENTIALS → OAuth client ID
   • Application type: Desktop app
   • Name: BarberBro Desktop OAuth
   • DOWNLOAD JSON → rinomina in 'credentials.json'
   • Metti il file in questa cartella

3️⃣  Ottieni Script ID
   • Apri Google Sheets
   • Estensioni → Apps Script
   • Copia ID dalla URL:
     https://script.google.com/d/ABC123XYZ/edit
                                 ^^^^^^^^^
   • Aggiungi al file .env:
     APPS_SCRIPT_ID=ABC123XYZ

4️⃣  Prima volta: Autentica
   • Esegui: python apps_script_manager.py push-complete
   • Si apre browser, autorizza app
   • Token salvato per uso futuro

🚀 COMANDI DISPONIBILI:

   python apps_script_manager.py setup
   → Mostra questa guida

   python apps_script_manager.py push-complete [script_id]
   → Carica file completo su Google (usa ID da .env se non specificato)

   python apps_script_manager.py pull
   → Scarica script da Google e salva in cartella 'scripts/'

📁 FILE NECESSARI:

   ✅ credentials.json     → OAuth per Apps Script API
   ✅ .env                 → Config (APPS_SCRIPT_ID)
   ✅ apps-script/BarberBro_SlotManager_Complete.gs

✨ ESEMPIO WORKFLOW:

   # Modifico codice locale
   vim apps-script/BarberBro_SlotManager_Complete.gs

   # Push su Google
   python apps_script_manager.py push-complete

   # ✅ Fatto! Script aggiornato su Google in 2 secondi!

📚 Documentazione completa: docs/GUIDA_PUSH_PULL.md

╚══════════════════════════════════════════════════════════════╝
""")


def main():
    """Entry point"""
    if len(sys.argv) < 2:
        print("❌ Comando mancante!")
        print("\n📘 Comandi disponibili:")
        print("   python apps_script_manager.py setup")
        print("   python apps_script_manager.py push-complete [script_id]")
        print("   python apps_script_manager.py pull")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'setup':
        setup_guide()
    
    elif command == 'push-complete':
        script_id = sys.argv[2] if len(sys.argv) > 2 else None
        push_complete(script_id)
    
    elif command == 'pull':
        pull()
    
    else:
        print(f"❌ Comando sconosciuto: {command}")
        print("\n📘 Comandi disponibili:")
        print("   setup, push-complete, pull")
        sys.exit(1)


if __name__ == '__main__':
    main()
