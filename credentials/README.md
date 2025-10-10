# Credenziali BarberBro

⚠️ **NON COMMITTARE QUESTA CARTELLA SU GIT!**

## 📋 **File**

- `credentials.json` - OAuth 2.0 credentials (Google Cloud Console)
- `service_account.json` - Service account key (opzionale)
- `token.pickle` - Token OAuth generato automaticamente

## 🔒 **Sicurezza**

Questa cartella è nel `.gitignore` per sicurezza.

**Non condividere mai questi file pubblicamente!**

## 🔧 **Setup**

Vedi `../docs/GUIDA_CREDENZIALI.md` per istruzioni complete su come ottenere le credenziali.

## 🔑 **Accesso Multi-Utente**

Per ogni barbiere/negozio:

1. Crea un nuovo progetto Google Cloud
2. Genera nuove credenziali OAuth
3. Deploy separato della PWA con URL API diverso
4. Configura `ConfigPWA` nel foglio Google Sheets

Ogni negozio ha il suo Google Sheets separato!
