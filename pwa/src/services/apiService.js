const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  console.error('⚠️ VITE_API_URL non configurato nel file .env')
}

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  // Helper per fetch con error handling
  async fetchAPI(endpoint, options = {}) {
    try {
      // Ottieni token dal persist storage di Zustand
      let token = null
      try {
        const persistedState = localStorage.getItem('barberbro-storage')
        if (persistedState) {
          const parsed = JSON.parse(persistedState)
          token = parsed.state?.auth?.token
        }
      } catch (e) {
        console.warn('⚠️ Errore lettura token da persist:', e)
      }
      
      // Per GET, passa token come query param invece di header (evita CORS preflight)
      const tokenParam = token ? `&authorization=${encodeURIComponent(token)}` : ''
      
      // Aggiungi parametri aggiuntivi dall'options.params
      let extraParams = ''
      if (options.params) {
        for (const [key, value] of Object.entries(options.params)) {
          if (value !== undefined && value !== null) {
            extraParams += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`
          }
        }
      }
      
      const url = `${this.baseUrl}?endpoint=${endpoint}${tokenParam}${extraParams}`
      
      const response = await fetch(url, {
        ...options,
        // NON inviare headers per evitare CORS preflight
        // headers: {
        //   'Content-Type': 'application/json',
        //   ...(token && { 'Authorization': `Bearer ${token}` }),
        //   ...options.headers
        // }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Gestisci errori auth
      if (data.statusCode === 401) {
        // Token scaduto/invalido → logout automatico
        console.warn('🔒 Token scaduto, ricarica necessaria')
        // Rimuovi tutto il persist storage per forzare logout
        localStorage.removeItem('barberbro-storage')
        window.location.reload() // Forza reload per mostrare LoginScreen
      }
      
      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // POST helper - Usa GET per evitare CORS preflight con Apps Script
  async postAPI(data) {
    try {
      // Ottieni token dal persist storage di Zustand
      let token = null
      try {
        const persistedState = localStorage.getItem('barberbro-storage')
        if (persistedState) {
          const parsed = JSON.parse(persistedState)
          token = parsed.state?.auth?.token
        }
      } catch (e) {
        console.warn('⚠️ Errore lettura token da persist:', e)
      }
      
      // Converti data in query params (Apps Script non supporta CORS preflight per POST con JSON)
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
        }
      }
      
      // Aggiungi token
      if (token) {
        params.append('authorization', token)
      }
      
      const url = `${this.baseUrl}?${params.toString()}`
      
      const response = await fetch(url, {
        method: 'GET' // Usa GET invece di POST per evitare CORS preflight
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('API POST Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ==================== GET ENDPOINTS ====================

  // Login OAuth (pubblico, no token)
  async login(email) {
    try {
      const url = `${this.baseUrl}?endpoint=login&email=${encodeURIComponent(email)}`
      
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Configurazione PWA (pubblico, no token)
  async getConfig() {
    return this.fetchAPI('config')
  }

  // Servizi
  async getServices() {
    return this.fetchAPI('servizi')
  }

  // Operatori
  async getOperators() {
    return this.fetchAPI('operatori')
  }

  // Slot disponibili
  async getSlots(filters = {}) {
    return this.fetchAPI('slot', { params: filters })
  }

  // Dati cliente (returning customer)
  async getCustomer(phone) {
    const params = new URLSearchParams({
      action: 'cliente',
      phone: phone
    })
    
    try {
      const response = await fetch(`${this.baseUrl}?${params}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('getCustomer error:', error)
      return { success: false, error: error.message }
    }
  }

  // Prenotazioni cliente
  async getMyBookings(phone) {
    const params = new URLSearchParams({
      action: 'prenotazioni',
      phone: phone
    })
    
    try {
      const response = await fetch(`${this.baseUrl}?${params}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('getMyBookings error:', error)
      return { success: false, error: error.message }
    }
  }

  // ==================== POST ENDPOINTS ====================

  // Crea prenotazione
  async createBooking(bookingData) {
    return this.postAPI({
      action: 'prenota',
      ...bookingData
    })
  }

  // Cancella prenotazione
  async cancelBooking(appointmentId, phone) {
    return this.postAPI({
      action: 'cancella',
      appointmentId,
      phone
    })
  }
}

// Singleton instance
export const apiService = new ApiService(API_URL)
