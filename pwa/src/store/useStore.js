import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiService } from '../services/apiService'

// Helper per parsare date italiane DD/MM/YYYY HH:MM:SS
const parseItalianDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null
  
  const [datePart, timePart] = dateStr.split(' ')
  if (!datePart || !timePart) return null
  
  const [day, month, year] = datePart.split('/')
  const [hour, minute, second] = timePart.split(':')
  
  // Crea data in formato ISO (che JavaScript capisce)
  const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second?.padStart(2, '0') || '00'}`
  const date = new Date(isoDate)
  
  return isNaN(date.getTime()) ? null : date
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ==================== STATE ====================
      
      // Configurazione PWA
      config: {
        // Default config per testing (sarà sostituito da API)
        shop_name: 'BarberBro',
        shop_logo_url: '',
        primary_color: '#C19A6B',
        accent_color: '#1F1F1F',
        phone_contact: '+39 333 123 4567',
        address: 'Via Principale 1',
        maps_url: '',
        booking_days: 30,
        min_notice_hours: 2,
        show_ratings: true,
        require_phone: true,
        welcome_message: 'Benvenuto! Prenota il tuo appuntamento in pochi click.'
      },
      
      // Auth (OAuth Google)
      auth: {
        isAuthenticated: false,
        token: null,
        user: null // { id, name, email, phone }
      },
      
      // Cliente
      customer: null,
      isReturningCustomer: false,
      
      // Dati app (caricati dall'API dopo login)
      services: [],
      operators: [],
      slots: [],
      allSlots: [], // Backup di tutti gli slot per filtri client-side
      
      // Booking flow
      currentStep: 'welcome',
      selectedService: null,
      selectedOperator: null,
      selectedSlot: null,
      selectedPath: null, // 'lucky' o 'choose'
      
      // Preferenze utente
      preferences: {
        timeSlot: null, // 'morning', 'afternoon', 'evening', 'flexible'
        preferredDays: [], // [1, 2, 3] = Lun, Mar, Mer
        whenBooking: 'asap' // 'asap', 'this-week', 'next-week'
      },
      
      // UI State
      loading: false,
      error: null,
      
      // Prenotazioni cliente
      myBookings: [],
      
      // ==================== ACTIONS ====================
      
      // ========== AUTH ACTIONS ==========
      
      // Login con Google OAuth
      login: async (email, name) => {
        set({ loading: true, error: null })
        try {
          const result = await apiService.login(email)
          
          if (!result.success) {
            return { success: false, error: result.error || 'Login fallito' }
          }
          
          // Salva token e user in state (persist si occuperà di salvare in localStorage)
          set({
            auth: {
              isAuthenticated: true,
              token: result.token,
              user: result.user
            },
            customer: {
              name: result.user.name,
              email: result.user.email,
              phone: result.user.phone
            },
            loading: false
          })
          
          console.log('✅ Login riuscito:', result.user.name)
          
          return { success: true }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },
      
      // Logout
      logout: () => {
        set({
          auth: {
            isAuthenticated: false,
            token: null,
            user: null
          },
          customer: null,
          currentStep: 'welcome'
        })
        
        console.log('👋 Logout eseguito')
      },
      
      // Verifica se token è scaduto (chiamato all'avvio)
      checkAuth: async () => {
        const currentAuth = get().auth
        
        if (!currentAuth?.token || !currentAuth?.user?.email) {
          // Nessun auth salvato
          console.log('❌ Auth non presente, login necessario')
          set({ auth: { isAuthenticated: false, token: null, user: null } })
          return false
        }
        
        // Token presente nello state persistito
        console.log('✅ Auth recuperato da cache:', currentAuth.user?.email)
        
        // Verifica che il token non sia una stringa vuota
        if (typeof currentAuth.token !== 'string' || currentAuth.token.trim() === '') {
          console.warn('⚠️ Token vuoto o invalido, logout')
          set({ auth: { isAuthenticated: false, token: null, user: null } })
          return false
        }
        
        // TODO: Opzionale - verifica validità token con API
        return true
      },
      
      // ========== CONFIG & CUSTOMER ACTIONS ==========
      
      // Carica configurazione
      loadConfig: async () => {
        set({ loading: true, error: null })
        try {
          const result = await apiService.getConfig()
          if (result.success) {
            set({ config: result.config, loading: false })
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },
      
      // Carica cliente da localStorage o API
      loadCustomer: async () => {
        const savedPhone = localStorage.getItem('barberbro_customer_phone')
        if (savedPhone) {
          try {
            const result = await apiService.getCustomer(savedPhone)
            if (result.success && result.found) {
              set({
                customer: result.customer,
                isReturningCustomer: true,
                preferences: {
                  ...get().preferences,
                  favoriteOperator: result.preferences?.favoriteOperator,
                  favoriteService: result.preferences?.favoriteService
                }
              })
            }
          } catch (error) {
            console.error('Errore caricamento cliente:', error)
          }
        }
      },
      
      // Carica servizi
      loadServices: async () => {
        set({ loading: true })
        try {
          const result = await apiService.getServices()
          if (result.success && result.servizi) {
            console.log('✅ Servizi caricati:', result.servizi.length)
            // Mappa i campi API (id, name) ai campi frontend (sv_ID, sv_name)
            const mappedServices = result.servizi.map(sv => ({
              sv_ID: sv.id,
              sv_name: sv.name,
              sv_duration: sv.duration,
              sv_price: sv.price,
              sv_description: sv.description || ''
            }))
            set({ services: mappedServices, loading: false })
          } else {
            console.error('❌ Errore caricamento servizi:', result.error)
            set({ loading: false, error: result.error })
          }
        } catch (error) {
          console.error('❌ Errore loadServices:', error)
          set({ error: error.message, loading: false })
        }
      },
      
      // Carica operatori
      loadOperators: async () => {
        set({ loading: true })
        try {
          const result = await apiService.getOperators()
          if (result.success && result.operatori) {
            console.log('✅ Operatori caricati:', result.operatori.length)
            // Mappa i campi API (id, name) ai campi frontend (op_ID, op_name)
            const mappedOperators = result.operatori.map(op => ({
              op_ID: op.id,
              op_name: op.name,
              op_workStart: op.workStart,
              op_workEnd: op.workEnd,
              op_breakStart: op.breakStart,
              op_breakEnd: op.breakEnd
            }))
            set({ operators: mappedOperators, loading: false })
          } else {
            console.error('❌ Errore caricamento operatori:', result.error)
            set({ loading: false, error: result.error })
          }
        } catch (error) {
          console.error('❌ Errore loadOperators:', error)
          set({ error: error.message, loading: false })
        }
      },
      
      // Carica slot disponibili - TUTTI per il servizio selezionato
      loadSlots: async (filters = {}) => {
        set({ loading: true })
        try {
          // Se non c'è servizioId, carica TUTTI gli slot liberi
          // Altrimenti carica solo per quel servizio
          const apiFilters = {}
          if (filters.servizioId) {
            apiFilters.servizioId = filters.servizioId
          }
          
          console.log('🔍 loadSlots - carico slot con filtri:', apiFilters.servizioId ? `servizio ${apiFilters.servizioId}` : 'TUTTI gli slot liberi')
          const result = await apiService.getSlots(apiFilters)
          console.log('📦 Risposta API slot:', result)
          
          // Calcola at_endDateTime per ogni slot
          const config = get().config
          const services = get().services
          
          const bufferPrima = config.buffer_prima || 0
          const bufferDopo = config.buffer_dopo || 0
          
          // L'API restituisce "slots" (plurale), non "slot"
          if (result.success && result.slots) {
            console.log('✅ Slot caricati dall\'API:', result.slots.length)
            
            // Calcola at_endDateTime per ogni slot
            // Formula: endDateTime = startDateTime + durata + bufferPrima + bufferDopo
            let invalidCount = 0
            const slotsWithEndTime = result.slots
              .filter(slot => {
                // Filtra slot con date invalide usando la funzione helper
                const startDate = parseItalianDate(slot.at_startDateTime)
                
                if (!startDate) {
                  console.warn(`⚠️ Slot con data invalida ignorato:`, slot)
                  invalidCount++
                  return false
                }
                
                return true
              })
              .map(slot => {
                // Parse data con helper
                const startDate = parseItalianDate(slot.at_startDateTime)
                
                // Trova il servizio associato allo slot per ottenere la durata
                const service = services.find(s => s.sv_ID === slot.sv_ID)
                const durata = service?.sv_duration || 30
                
                const totalMinutes = durata + bufferPrima + bufferDopo
                const endDate = new Date(startDate.getTime() + totalMinutes * 60000)
                
                return {
                  ...slot,
                  at_endDateTime: endDate.toISOString(),
                  // Aggiungi anche formattazione leggibile
                  at_endDateTime_formatted: endDate.toLocaleString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }
              })
            
            // Salva TUTTI gli slot con endDateTime calcolato
            set({ 
              slots: slotsWithEndTime,
              allSlots: slotsWithEndTime, // Backup per filtri client-side
              loading: false 
            })
            
            if (invalidCount > 0) {
              console.warn(`⚠️ ${invalidCount} slot con date invalide sono stati scartati`)
            }
            console.log(`⏱️ Calcolato at_endDateTime per ${slotsWithEndTime.length} slot validi (buffer: ${bufferPrima + bufferDopo}min)`)
            console.log(`📊 Riepilogo: API=${result.slots.length} | Invalidi=${invalidCount} | Validi=${slotsWithEndTime.length}`)
          } else if (result.success && result.slots === undefined) {
            // Caso in cui success=true ma manca il campo slots
            console.warn('⚠️ API success ma slots undefined, array vuoto?')
            set({ slots: [], allSlots: [], loading: false })
          } else {
            console.error('❌ Errore caricamento slot:', result.error || 'Errore sconosciuto')
            console.error('📋 Risposta completa:', JSON.stringify(result))
            set({ loading: false, error: result.error || 'Errore caricamento slot' })
          }
        } catch (error) {
          console.error('❌ Errore loadSlots:', error)
          set({ error: error.message, loading: false })
        }
      },
      
      // Filtra slot lato client (veloce, no API call)
      filterSlots: (filters = {}) => {
        const allSlots = get().allSlots || []
        const preferences = get().preferences
        
        let filtered = [...allSlots]
        
        // Filtra per servizio (SOLO se specificato)
        if (filters.servizioId) {
          filtered = filtered.filter(slot => slot.sv_ID === filters.servizioId)
        }
        
        // Filtra per operatore (SOLO se specificato, altrimenti mostra tutti)
        if (filters.operatoreId) {
          filtered = filtered.filter(slot => slot.or_ID === filters.operatoreId)
        }
        
        // Filtra per data
        if (filters.data) {
          const targetDate = new Date(filters.data).toDateString()
          filtered = filtered.filter(slot => {
            const slotDate = parseItalianDate(slot.at_startDateTime)
            return slotDate && slotDate.toDateString() === targetDate
          })
        }
        
        // Filtra per fascia oraria dalle preferenze utente (se impostate)
        const fasciaPreferita = preferences?.timeSlot
        if (fasciaPreferita && fasciaPreferita !== 'flexible') {
          filtered = filtered.filter(slot => {
            const slotDate = parseItalianDate(slot.at_startDateTime)
            if (!slotDate) return false
            
            const hour = slotDate.getHours()
            if (fasciaPreferita === 'morning') return hour >= 8 && hour < 12
            if (fasciaPreferita === 'afternoon') return hour >= 12 && hour < 18
            if (fasciaPreferita === 'evening') return hour >= 18 && hour < 21
            return true
          })
        }
        
        // Ordina per data (dal più vicino al più lontano)
        filtered.sort((a, b) => {
          const dateA = parseItalianDate(a.at_startDateTime)
          const dateB = parseItalianDate(b.at_startDateTime)
          if (!dateA || !dateB) return 0
          return dateA - dateB
        })
        
        const filterDesc = []
        if (filters.servizioId) filterDesc.push(`servizio: ${filters.servizioId}`)
        if (filters.operatoreId) filterDesc.push(`operatore: ${filters.operatoreId}`)
        if (fasciaPreferita && fasciaPreferita !== 'flexible') filterDesc.push(`fascia: ${fasciaPreferita}`)
        
        console.log(`🔍 Filtro client-side: ${allSlots.length} → ${filtered.length} slot ${filterDesc.length > 0 ? `(${filterDesc.join(', ')})` : '(nessun filtro)'}`)
        set({ slots: filtered })
      },
      
      // Crea prenotazione
      createBooking: async (bookingData) => {
        set({ loading: true })
        try {
          console.log('📝 Invio prenotazione al backend:', bookingData)
          const result = await apiService.createBooking(bookingData)
          
          if (result.success) {
            // Salva telefono per returning customer
            localStorage.setItem('barberbro_customer_phone', bookingData.customerPhone)
            
            // Salva customer nello store
            set({ 
              customer: {
                name: bookingData.customerName,
                phone: bookingData.customerPhone,
                email: bookingData.customerEmail
              },
              loading: false 
            })
            
            console.log('✅ Prenotazione confermata:', result)
            return result
          } else {
            throw new Error(result.error || 'Errore nella prenotazione')
          }
        } catch (error) {
          console.error('❌ Errore createBooking:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },
      
      // Carica prenotazioni cliente
      loadMyBookings: async () => {
        set({ loading: true })
        try {
          const customer = get().customer
          const phone = customer?.phone || localStorage.getItem('barberbro_customer_phone')
          
          if (!phone) {
            console.warn('⚠️ Nessun telefono cliente trovato')
            set({ myBookings: [], loading: false })
            return
          }
          
          console.log('📋 Caricamento prenotazioni per:', phone)
          const result = await apiService.getMyBookings(phone)
          
          if (result.success) {
            set({ myBookings: result.bookings || [], loading: false })
            console.log('✅ Prenotazioni caricate:', result.bookings?.length || 0)
          } else {
            throw new Error(result.error || 'Errore nel caricamento prenotazioni')
          }
        } catch (error) {
          console.error('❌ Errore loadMyBookings:', error)
          set({ error: error.message, myBookings: [], loading: false })
        }
      },
      
      // Cancella prenotazione
      cancelBooking: async (appointmentId) => {
        set({ loading: true })
        try {
          const customer = get().customer
          const phone = customer?.phone || localStorage.getItem('barberbro_customer_phone')
          
          if (!phone) {
            throw new Error('Telefono cliente non trovato')
          }
          
          console.log('❌ Cancellazione prenotazione:', appointmentId)
          const result = await apiService.cancelBooking(appointmentId, phone)
          
          if (result.success) {
            // Rimuovi dalla lista locale
            set({ 
              myBookings: get().myBookings.filter(b => b.at_ID !== appointmentId),
              loading: false
            })
            console.log('✅ Prenotazione cancellata')
            return result
          } else {
            throw new Error(result.error || 'Errore nella cancellazione')
          }
        } catch (error) {
          console.error('❌ Errore cancelBooking:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },
      
      // Navigazione
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => {
        // Nuovo flusso semplificato: welcome → service → operators → calendar → form → confirm
        const steps = ['welcome', 'service', 'operators', 'calendar', 'form', 'confirm']
        const currentIndex = steps.indexOf(get().currentStep)
        if (currentIndex < steps.length - 1) {
          set({ currentStep: steps[currentIndex + 1] })
        }
      },
      prevStep: () => {
        // Nuovo flusso semplificato: welcome → service → operators → calendar → form → confirm
        const steps = ['welcome', 'service', 'operators', 'calendar', 'form', 'confirm']
        const currentIndex = steps.indexOf(get().currentStep)
        if (currentIndex > 0) {
          set({ currentStep: steps[currentIndex - 1] })
        }
      },
      
      // Selezioni
      selectService: (service) => set({ selectedService: service }),
      selectOperator: (operator) => set({ selectedOperator: operator }),
      selectSlot: (slot) => set({ selectedSlot: slot }),
      selectPath: (path) => set({ selectedPath: path }),
      
      // Preferenze
      setPreferences: (prefs) => set({ preferences: { ...get().preferences, ...prefs } }),
      
      // Reset
      resetBooking: () => set({
        selectedService: null,
        selectedOperator: null,
        selectedSlot: null,
        selectedPath: null,
        currentStep: 'welcome'
      }),
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'barberbro-storage',
      partialize: (state) => ({
        auth: state.auth,
        config: state.config,
        customer: state.customer,
        isReturningCustomer: state.isReturningCustomer,
        services: state.services,
        operators: state.operators,
        slots: state.slots,
        allSlots: state.allSlots, // Salva anche il backup per filtri client-side
        preferences: state.preferences
      })
    }
  )
)
