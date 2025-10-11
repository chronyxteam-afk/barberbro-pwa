import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiService } from '../services/apiService'

export const useStore = create(
  persist(
    (set, get) => ({
      // ==================== STATE ====================
      
      // Configurazione PWA
      config: {
        // Default config per testing (sarà sostituito da API)
        shop_name: 'BarberBro Demo',
        shop_logo_url: '',
        primary_color: '#C19A6B',
        accent_color: '#1F1F1F',
        phone_contact: '+39 333 123 4567',
        address: 'Via Demo 1, Napoli',
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
          // Carica SOLO con servizioId, senza altri filtri
          // Il filtro per operatore/data/fascia verrà fatto lato client
          const apiFilters = {
            servizioId: filters.servizioId
          }
          
          console.log('🔍 loadSlots - carico TUTTI gli slot per servizio:', apiFilters.servizioId)
          const result = await apiService.getSlots(apiFilters)
          console.log('📦 Risposta API slot:', result)
          
          // Calcola at_endDateTime per ogni slot usando la durata del servizio e i buffer
          const config = get().config
          const selectedService = get().selectedService
          
          const bufferPrima = config.buffer_prima || 0
          const bufferDopo = config.buffer_dopo || 0
          const durata = selectedService?.sv_duration || 30
          
          // L'API restituisce "slots" (plurale), non "slot"
          if (result.success && result.slots) {
            console.log('✅ Slot caricati:', result.slots.length)
            
            // Calcola at_endDateTime per ogni slot
            // Formula: endDateTime = startDateTime + durata + bufferPrima + bufferDopo
            const slotsWithEndTime = result.slots.map(slot => {
              const startDate = new Date(slot.at_startDateTime)
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
            
            console.log(`⏱️ Calcolato at_endDateTime per ${slotsWithEndTime.length} slot (durata: ${durata}min + buffer: ${bufferPrima + bufferDopo}min)`)
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
        
        // Filtra per operatore (SOLO se specificato, altrimenti mostra tutti)
        if (filters.operatoreId) {
          filtered = filtered.filter(slot => slot.or_ID === filters.operatoreId)
        }
        
        // Filtra per data
        if (filters.data) {
          const targetDate = new Date(filters.data).toDateString()
          filtered = filtered.filter(slot => {
            const slotDate = new Date(slot.at_startDateTime).toDateString()
            return slotDate === targetDate
          })
        }
        
        // Filtra per fascia oraria dalle preferenze utente (se impostate)
        const fasciaPreferita = preferences?.timeSlot
        if (fasciaPreferita && fasciaPreferita !== 'flexible') {
          filtered = filtered.filter(slot => {
            const hour = new Date(slot.at_startDateTime).getHours()
            if (fasciaPreferita === 'morning') return hour >= 8 && hour < 12
            if (fasciaPreferita === 'afternoon') return hour >= 12 && hour < 18
            if (fasciaPreferita === 'evening') return hour >= 18 && hour < 21
            return true
          })
        }
        
        // Ordina per data (dal più vicino al più lontano)
        filtered.sort((a, b) => {
          const dateA = new Date(a.at_startDateTime)
          const dateB = new Date(b.at_startDateTime)
          return dateA - dateB
        })
        
        console.log(`🔍 Filtro client-side: ${allSlots.length} → ${filtered.length} slot ${filters.operatoreId ? `(operatore: ${filters.operatoreId})` : '(tutti gli operatori)'}`)
        set({ slots: filtered })
      },
      
      // Crea prenotazione
      createBooking: async (bookingData) => {
        // MOCK: Simula prenotazione senza backend
        console.log('📝 MOCK: Prenotazione creata', bookingData)
        
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
        
        return { success: true, message: 'Prenotazione confermata!' }
        
        /* Quando hai il backend, usa questo:
        set({ loading: true })
        try {
          const result = await apiService.createBooking(bookingData)
          if (result.success) {
            localStorage.setItem('barberbro_customer_phone', bookingData.customerPhone)
            set({ loading: false })
            return result
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
        */
      },
      
      // Carica prenotazioni cliente
      loadMyBookings: async () => {
        // MOCK: Simula prenotazioni salvate
        const mockBookings = [
          {
            at_ID: 101,
            at_startDateTime: '10/10/2025 15:00:00',
            at_duration: 30,
            at_price: 25,
            serviceName: 'Taglio Classico',
            operatorName: 'Marco'
          }
        ]
        set({ myBookings: mockBookings })
        console.log('📋 MOCK: Prenotazioni caricate:', mockBookings.length)
      },
      
      // Cancella prenotazione
      cancelBooking: async (appointmentId) => {
        // MOCK: Simula cancellazione
        console.log('❌ MOCK: Cancellazione prenotazione', appointmentId)
        set({ 
          myBookings: get().myBookings.filter(b => b.at_ID !== appointmentId)
        })
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
