#!/usr/bin/env node
/**
 * BarberBro Apps Script Manager - Node.js Version
 * Push/Pull codice da Google Apps Script senza Python
 */

const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// Configurazione
const CONFIG = {
  credentialsFile: 'credentials.json',
  tokenFile: 'token.json',
  scriptFile: 'apps-script/BarberBro_SlotManager_Complete.gs',
  manifestFile: 'apps-script/appsscript.json',
  scopes: ['https://www.googleapis.com/auth/script.projects']
};

class AppsScriptManager {
  constructor() {
    this.auth = null;
    this.script = null;
  }

  /**
   * Inizializza autenticazione OAuth2
   */
  async authenticate() {
    try {
      // Carica credenziali
      const credentials = JSON.parse(await fs.readFile(CONFIG.credentialsFile, 'utf8'));
      
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      // Carica token esistente
      try {
        const token = JSON.parse(await fs.readFile(CONFIG.tokenFile, 'utf8'));
        oAuth2Client.setCredentials(token);
        this.auth = oAuth2Client;
        console.log('✅ Token caricato da file esistente');
        return;
      } catch (err) {
        // Token non esiste, richiedi autorizzazione
      }

      // Richiedi autorizzazione
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: CONFIG.scopes,
      });

      console.log('🔐 Autorizzazione richiesta!');
      console.log('📌 Apri questo URL nel browser:');
      console.log(authUrl);
      console.log('');

      const code = await this.getAuthCode();
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      // Salva token per uso futuro
      await fs.writeFile(CONFIG.tokenFile, JSON.stringify(tokens, null, 2));
      console.log('✅ Token salvato!');

      this.auth = oAuth2Client;
    } catch (error) {
      console.error('❌ Errore autenticazione:', error.message);
      process.exit(1);
    }
  }

  /**
   * Richiede codice di autorizzazione dall'utente
   */
  getAuthCode() {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('📝 Incolla il codice di autorizzazione qui: ', (code) => {
        rl.close();
        resolve(code);
      });
    });
  }

  /**
   * Inizializza servizio Apps Script
   */
  async initScriptService() {
    if (!this.auth) {
      await this.authenticate();
    }
    this.script = google.script({ version: 'v1', auth: this.auth });
  }

  /**
   * Push script completo su Google Apps Script
   */
  async pushComplete(scriptId) {
    if (!scriptId) {
      console.error('❌ Script ID richiesto!');
      console.log('💡 Uso: node apps-script-manager.js push <SCRIPT_ID>');
      process.exit(1);
    }

    await this.initScriptService();

    try {
      // Leggi file script
      const scriptContent = await fs.readFile(CONFIG.scriptFile, 'utf8');
      console.log(`📂 File locale: ${CONFIG.scriptFile}`);
      console.log(`📊 Dimensione: ${scriptContent.length.toLocaleString()} caratteri`);

      // Leggi o crea manifest
      let manifest;
      try {
        manifest = JSON.parse(await fs.readFile(CONFIG.manifestFile, 'utf8'));
      } catch (err) {
        manifest = {
          timeZone: "Europe/Rome",
          dependencies: {},
          exceptionLogging: "STACKDRIVER",
          runtimeVersion: "V8",
          webapp: {
            executeAs: "USER_DEPLOYING",
            access: "ANYONE"
          }
        };
        console.log('📄 Manifest creato automaticamente');
      }

      // Prepara contenuto
      const content = {
        files: [
          {
            name: 'Code',
            type: 'SERVER_JS',
            source: scriptContent
          },
          {
            name: 'appsscript',
            type: 'JSON',
            source: JSON.stringify(manifest)
          }
        ]
      };

      console.log(`🆔 Script ID: ${scriptId}`);
      console.log('⏳ Upload in corso...');

      // Push su Google
      const response = await this.script.projects.updateContent({
        scriptId: scriptId,
        resource: content
      });

      console.log('\n✅ SUCCESSO! Script aggiornato su Google Apps Script');
      console.log(`📊 Files caricati: ${response.data.files.length}`);

      // Mostra file caricati
      response.data.files.forEach(file => {
        console.log(`   • ${file.name} (${file.type})`);
      });

      console.log(`\n🌐 Apri editor: https://script.google.com/d/${scriptId}/edit`);

    } catch (error) {
      console.error('\n❌ Errore upload:', error.message);
      
      if (error.message.includes('has not been used')) {
        console.log('\n💡 SOLUZIONE:');
        console.log('1. Vai su: https://console.cloud.google.com');
        console.log('2. APIs & Services → Library');
        console.log('3. Cerca: Google Apps Script API');
        console.log('4. Clicca ENABLE');
        console.log('5. Attendi 1-2 minuti');
        console.log('6. Riprova questo comando');
      }
      
      process.exit(1);
    }
  }

  /**
   * Pull script da Google Apps Script
   */
  async pull(scriptId) {
    if (!scriptId) {
      console.error('❌ Script ID richiesto!');
      console.log('💡 Uso: node apps-script-manager.js pull <SCRIPT_ID>');
      process.exit(1);
    }

    await this.initScriptService();

    try {
      console.log(`📥 Pull script da Google Apps Script...`);
      console.log(`🆔 Script ID: ${scriptId}`);

      // Download contenuto
      console.log('⏳ Download in corso...');
      const response = await this.script.projects.getContent({
        scriptId: scriptId
      });

      // Crea cartella scripts/
      const outputDir = 'scripts';
      try {
        await fs.mkdir(outputDir, { recursive: true });
      } catch (err) {
        // Cartella già esiste
      }

      // Salva files
      let filesSaved = 0;
      for (const file of response.data.files || []) {
        const fileName = file.name;
        const fileType = file.type;
        const source = file.source;

        if (fileType === 'SERVER_JS') {
          const filePath = path.join(outputDir, `${fileName}.gs`);
          await fs.writeFile(filePath, source, 'utf8');
          console.log(`✅ Salvato: ${filePath}`);
          filesSaved++;
        } else if (fileType === 'JSON') {
          const filePath = path.join(outputDir, `${fileName}.json`);
          const jsonObj = JSON.parse(source);
          await fs.writeFile(filePath, JSON.stringify(jsonObj, null, 2), 'utf8');
          console.log(`✅ Salvato: ${filePath}`);
          filesSaved++;
        }
      }

      console.log(`\n🎉 Download completato! ${filesSaved} file salvati in cartella 'scripts/'`);

    } catch (error) {
      console.error('\n❌ Errore download:', error.message);
      process.exit(1);
    }
  }

  /**
   * Mostra guida setup
   */
  showSetupGuide() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  📘 GUIDA SETUP APPS SCRIPT MANAGER (Node.js)               ║
╚══════════════════════════════════════════════════════════════╝

🎯 Questo tool ti permette di pushare/pullare codice da Google Apps Script!

📋 SETUP INIZIALE (Una tantum):

1️⃣  Installa dipendenze
   npm install googleapis

2️⃣  Abilita Google Apps Script API
   • Vai su: https://console.cloud.google.com
   • Seleziona progetto 'barberappsheetscript'
   • APIs & Services → Library
   • Cerca: Google Apps Script API
   • Clicca ENABLE

3️⃣  Crea credenziali OAuth 2.0
   • APIs & Services → Credentials
   • + CREATE CREDENTIALS → OAuth client ID
   • Application type: Desktop app
   • Name: BarberBro Desktop OAuth
   • DOWNLOAD JSON → rinomina in 'credentials.json'
   • Metti il file in questa cartella

4️⃣  Prima volta: Autentica
   • Esegui: node apps-script-manager.js push <SCRIPT_ID>
   • Si apre browser, autorizza app
   • Token salvato per uso futuro

🚀 COMANDI DISPONIBILI:

   node apps-script-manager.js setup
   → Mostra questa guida

   node apps-script-manager.js push <SCRIPT_ID>
   → Carica file completo su Google

   node apps-script-manager.js pull <SCRIPT_ID>
   → Scarica script da Google e salva in cartella 'scripts/'

📁 FILE NECESSARI:

   ✅ credentials.json     → OAuth per Apps Script API
   ✅ apps-script/BarberBro_SlotManager_Complete.gs

✨ ESEMPIO WORKFLOW:

   # Modifico codice locale
   vim apps-script/BarberBro_SlotManager_Complete.gs

   # Push su Google
   node apps-script-manager.js push ABC123XYZ

   # ✅ Fatto! Script aggiornato su Google in 2 secondi!

╚══════════════════════════════════════════════════════════════╝
    `);
  }
}

// CLI
async function main() {
  const manager = new AppsScriptManager();
  const command = process.argv[2];
  const scriptId = process.argv[3];

  switch (command) {
    case 'setup':
      manager.showSetupGuide();
      break;
    
    case 'push':
      await manager.pushComplete(scriptId);
      break;
    
    case 'pull':
      await manager.pull(scriptId);
      break;
    
    default:
      console.log('❌ Comando mancante!');
      console.log('\n📘 Comandi disponibili:');
      console.log('   node apps-script-manager.js setup');
      console.log('   node apps-script-manager.js push <SCRIPT_ID>');
      console.log('   node apps-script-manager.js pull <SCRIPT_ID>');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AppsScriptManager;
