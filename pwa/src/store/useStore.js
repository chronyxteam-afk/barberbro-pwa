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
          
          // Salva token e user in state
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
          
          // Salva token in localStorage (per persist)
          localStorage.setItem('barberbro_auth_token', result.token)
          localStorage.setItem('barberbro_user_email', result.user.email)
          
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
        
        // Rimuovi da localStorage
        localStorage.removeItem('barberbro_auth_token')
        localStorage.removeItem('barberbro_user_email')
        
        console.log('👋 Logout eseguito')
      },
      
      // Verifica se token è scaduto (chiamato all'avvio)
      checkAuth: async () => {
        const token = localStorage.getItem('barberbro_auth_token')
        const email = localStorage.getItem('barberbro_user_email')
        
        if (!token || !email) {
          // Nessun token salvato
          set({ auth: { isAuthenticated: false, token: null, user: null } })
          return false
        }
        
        // TODO: Verifica token con API (opzionale)
        // Per ora assumiamo che se esiste è valido
        // In produzione, dovresti fare una chiamata API per verificare
        
        set({
          auth: {
            isAuthenticated: true,
            token: token,
            user: { email } // Dati parziali, saranno riempiti da loadCustomer
          }
        })
        
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
            set({ services: result.servizi, loading: false })
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
            set({ operators: result.operatori, loading: false })
          } else {
            console.error('❌ Errore caricamento operatori:', result.error)
            set({ loading: false, error: result.error })
          }
        } catch (error) {
          console.error('❌ Errore loadOperators:', error)
          set({ error: error.message, loading: false })
        }
      },
      
      // Carica slot disponibili
      loadSlots: async (filters = {}) => {
        set({ loading: true })
        try {
          const result = await apiService.getSlots(filters)
          if (result.success && result.slot) {
            console.log('✅ Slot caricati:', result.slot.length)
            set({ slots: result.slot, loading: false })
          } else {
            console.error('❌ Errore caricamento slot:', result.error)
            set({ loading: false, error: result.error })
          }
        } catch (error) {
          console.error('❌ Errore loadSlots:', error)
          set({ error: error.message, loading: false })
        }
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
        const steps = ['welcome', 'service', 'path', 'quick-slots', 'operators', 'calendar', 'form', 'confirm']
        const currentIndex = steps.indexOf(get().currentStep)
        if (currentIndex < steps.length - 1) {
          set({ currentStep: steps[currentIndex + 1] })
        }
      },
      prevStep: () => {
        const steps = ['welcome', 'service', 'path', 'quick-slots', 'operators', 'calendar', 'form', 'confirm']
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
        customer: state.customer,
        preferences: state.preferences
      })
    }
  )
)
