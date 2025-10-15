#!/bin/bash
# BarberBro Apps Script Manager - Bash Version
# Push/Pull codice da Google Apps Script usando curl

set -e

# Configurazione
SCRIPT_FILE="apps-script/BarberBro_SlotManager_Complete.gs"
MANIFEST_FILE="apps-script/appsscript.json"
TOKEN_FILE="token.json"
CREDENTIALS_FILE="credentials.json"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzioni di utilità
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verifica dipendenze
check_dependencies() {
    local missing=()
    
    if ! command -v curl &> /dev/null; then
        missing+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing+=("jq")
    fi
    
    if [ ${#missing[@]} -ne 0 ]; then
        log_error "Dipendenze mancanti: ${missing[*]}"
        log_info "Installa con:"
        log_info "  Ubuntu/Debian: sudo apt install curl jq"
        log_info "  macOS: brew install curl jq"
        log_info "  Windows: Usa Git Bash o WSL"
        exit 1
    fi
}

# Ottieni token OAuth2
get_oauth_token() {
    if [ ! -f "$CREDENTIALS_FILE" ]; then
        log_error "File $CREDENTIALS_FILE non trovato!"
        log_info "Scarica le credenziali OAuth2 da Google Cloud Console"
        exit 1
    fi
    
    # Estrai client_id e client_secret
    local client_id=$(jq -r '.installed.client_id // .web.client_id' "$CREDENTIALS_FILE")
    local client_secret=$(jq -r '.installed.client_secret // .web.client_secret' "$CREDENTIALS_FILE")
    
    if [ "$client_id" = "null" ] || [ "$client_secret" = "null" ]; then
        log_error "client_id o client_secret non trovati in $CREDENTIALS_FILE"
        exit 1
    fi
    
    # Genera URL di autorizzazione
    local auth_url="https://accounts.google.com/o/oauth2/v2/auth?client_id=$client_id&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/script.projects&response_type=code&access_type=offline"
    
    log_info "Apri questo URL nel browser:"
    echo "$auth_url"
    echo ""
    
    read -p "📝 Incolla il codice di autorizzazione: " auth_code
    
    # Scambia codice per token
    log_info "Scambio codice per token..."
    
    local token_response=$(curl -s -X POST "https://oauth2.googleapis.com/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "client_id=$client_id" \
        -d "client_secret=$client_secret" \
        -d "code=$auth_code" \
        -d "grant_type=authorization_code" \
        -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob")
    
    echo "$token_response" | jq '.' > "$TOKEN_FILE"
    log_success "Token salvato in $TOKEN_FILE"
}

# Ottieni access token valido
get_access_token() {
    if [ ! -f "$TOKEN_FILE" ]; then
        get_oauth_token
    fi
    
    local access_token=$(jq -r '.access_token' "$TOKEN_FILE")
    local expires_at=$(jq -r '.expires_at // 0' "$TOKEN_FILE")
    local current_time=$(date +%s)
    
    # Se il token è scaduto, usa refresh token
    if [ "$expires_at" -lt "$current_time" ]; then
        log_info "Token scaduto, uso refresh token..."
        
        local refresh_token=$(jq -r '.refresh_token' "$TOKEN_FILE")
        local client_id=$(jq -r '.installed.client_id // .web.client_id' "$CREDENTIALS_FILE")
        local client_secret=$(jq -r '.installed.client_secret // .web.client_secret' "$CREDENTIALS_FILE")
        
        local refresh_response=$(curl -s -X POST "https://oauth2.googleapis.com/token" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "client_id=$client_id" \
            -d "client_secret=$client_secret" \
            -d "refresh_token=$refresh_token" \
            -d "grant_type=refresh_token")
        
        # Aggiorna token file
        local new_access_token=$(echo "$refresh_response" | jq -r '.access_token')
        local expires_in=$(echo "$refresh_response" | jq -r '.expires_in')
        local new_expires_at=$((current_time + expires_in))
        
        jq --arg token "$new_access_token" --arg expires "$new_expires_at" \
           '.access_token = $token | .expires_at = $expires' "$TOKEN_FILE" > "${TOKEN_FILE}.tmp"
        mv "${TOKEN_FILE}.tmp" "$TOKEN_FILE"
        
        access_token="$new_access_token"
        log_success "Token aggiornato"
    fi
    
    echo "$access_token"
}

# Push script su Google Apps Script
push_script() {
    local script_id="$1"
    
    if [ -z "$script_id" ]; then
        log_error "Script ID richiesto!"
        log_info "Uso: $0 push <SCRIPT_ID>"
        exit 1
    fi
    
    if [ ! -f "$SCRIPT_FILE" ]; then
        log_error "File $SCRIPT_FILE non trovato!"
        exit 1
    fi
    
    check_dependencies
    
    local access_token=$(get_access_token)
    local script_content=$(cat "$SCRIPT_FILE")
    
    # Crea manifest se non esiste
    if [ ! -f "$MANIFEST_FILE" ]; then
        cat > "$MANIFEST_FILE" << EOF
{
  "timeZone": "Europe/Rome",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  }
}
EOF
        log_info "Manifest creato: $MANIFEST_FILE"
    fi
    
    local manifest_content=$(cat "$MANIFEST_FILE")
    
    # Prepara payload JSON
    local payload=$(jq -n \
        --arg code "$script_content" \
        --arg manifest "$manifest_content" \
        '{
            files: [
                {
                    name: "Code",
                    type: "SERVER_JS",
                    source: $code
                },
                {
                    name: "appsscript",
                    type: "JSON",
                    source: $manifest
                }
            ]
        }')
    
    log_info "Push script su Google Apps Script..."
    log_info "📂 File: $SCRIPT_FILE"
    log_info "📊 Dimensione: $(wc -c < "$SCRIPT_FILE") caratteri"
    log_info "🆔 Script ID: $script_id"
    
    # Push su Google
    local response=$(curl -s -X PUT \
        "https://script.googleapis.com/v1/projects/$script_id/content" \
        -H "Authorization: Bearer $access_token" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    # Verifica risposta
    if echo "$response" | jq -e '.error' > /dev/null; then
        local error_message=$(echo "$response" | jq -r '.error.message')
        log_error "Errore upload: $error_message"
        
        if echo "$error_message" | grep -q "has not been used"; then
            log_info "💡 SOLUZIONE:"
            log_info "1. Vai su: https://console.cloud.google.com"
            log_info "2. APIs & Services → Library"
            log_info "3. Cerca: Google Apps Script API"
            log_info "4. Clicca ENABLE"
        fi
        exit 1
    fi
    
    log_success "Script aggiornato su Google Apps Script!"
    local files_count=$(echo "$response" | jq '.files | length')
    log_info "📊 Files caricati: $files_count"
    
    echo "$response" | jq -r '.files[] | "   • \(.name) (\(.type))"'
    echo ""
    log_info "🌐 Apri editor: https://script.google.com/d/$script_id/edit"
}

# Pull script da Google Apps Script
pull_script() {
    local script_id="$1"
    
    if [ -z "$script_id" ]; then
        log_error "Script ID richiesto!"
        log_info "Uso: $0 pull <SCRIPT_ID>"
        exit 1
    fi
    
    check_dependencies
    
    local access_token=$(get_access_token)
    
    log_info "Pull script da Google Apps Script..."
    log_info "🆔 Script ID: $script_id"
    
    # Download da Google
    local response=$(curl -s -X GET \
        "https://script.googleapis.com/v1/projects/$script_id/content" \
        -H "Authorization: Bearer $access_token")
    
    # Verifica risposta
    if echo "$response" | jq -e '.error' > /dev/null; then
        local error_message=$(echo "$response" | jq -r '.error.message')
        log_error "Errore download: $error_message"
        exit 1
    fi
    
    # Crea cartella scripts/
    mkdir -p scripts
    
    # Salva files
    local files_saved=0
    echo "$response" | jq -r '.files[] | @base64' | while IFS= read -r file_b64; do
        local file=$(echo "$file_b64" | base64 -d)
        local file_name=$(echo "$file" | jq -r '.name')
        local file_type=$(echo "$file" | jq -r '.type')
        local file_source=$(echo "$file" | jq -r '.source')
        
        if [ "$file_type" = "SERVER_JS" ]; then
            echo "$file_source" > "scripts/${file_name}.gs"
            log_success "Salvato: scripts/${file_name}.gs"
            files_saved=$((files_saved + 1))
        elif [ "$file_type" = "JSON" ]; then
            echo "$file_source" | jq '.' > "scripts/${file_name}.json"
            log_success "Salvato: scripts/${file_name}.json"
            files_saved=$((files_saved + 1))
        fi
    done
    
    log_success "Download completato! File salvati in cartella 'scripts/'"
}

# Mostra guida setup
show_setup_guide() {
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║  📘 GUIDA SETUP APPS SCRIPT MANAGER (Bash)                   ║
╚══════════════════════════════════════════════════════════════╝

🎯 Questo tool ti permette di pushare/pullare codice da Google Apps Script!

📋 SETUP INIZIALE (Una tantum):

1️⃣  Installa dipendenze
   Ubuntu/Debian: sudo apt install curl jq
   macOS: brew install curl jq
   Windows: Usa Git Bash o WSL

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
   • Esegui: ./apps-script-manager.sh push <SCRIPT_ID>
   • Si apre browser, autorizza app
   • Token salvato per uso futuro

🚀 COMANDI DISPONIBILI:

   ./apps-script-manager.sh setup
   → Mostra questa guida

   ./apps-script-manager.sh push <SCRIPT_ID>
   → Carica file completo su Google

   ./apps-script-manager.sh pull <SCRIPT_ID>
   → Scarica script da Google e salva in cartella 'scripts/'

📁 FILE NECESSARI:

   ✅ credentials.json     → OAuth per Apps Script API
   ✅ apps-script/BarberBro_SlotManager_Complete.gs

✨ ESEMPIO WORKFLOW:

   # Modifico codice locale
   vim apps-script/BarberBro_SlotManager_Complete.gs

   # Push su Google
   ./apps-script-manager.sh push ABC123XYZ

   # ✅ Fatto! Script aggiornato su Google in 2 secondi!

╚══════════════════════════════════════════════════════════════╝
EOF
}

# Main
case "${1:-}" in
    "setup")
        show_setup_guide
        ;;
    "push")
        push_script "$2"
        ;;
    "pull")
        pull_script "$2"
        ;;
    *)
        log_error "Comando mancante!"
        echo ""
        log_info "Comandi disponibili:"
        log_info "  $0 setup"
        log_info "  $0 push <SCRIPT_ID>"
        log_info "  $0 pull <SCRIPT_ID>"
        exit 1
        ;;
esac
