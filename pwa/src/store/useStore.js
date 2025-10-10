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
      
      // Dati app (con mock data per testing)
      services: [
        { sv_ID: 1, sv_name: 'Taglio Classico', sv_duration: 30, sv_price: 25, sv_description: 'Taglio tradizionale con forbici' },
        { sv_ID: 2, sv_name: 'Taglio + Barba', sv_duration: 45, sv_price: 35, sv_description: 'Taglio e sistemazione barba' },
        { sv_ID: 3, sv_name: 'Rasatura Completa', sv_duration: 30, sv_price: 20, sv_description: 'Rasatura tradizionale con rasoio' },
        { sv_ID: 4, sv_name: 'Taglio Bambino', sv_duration: 20, sv_price: 15, sv_description: 'Taglio per bambini fino a 12 anni' }
      ],
      operators: [
        { op_ID: 1, op_name: 'Marco', op_workStart: '09:00', op_workEnd: '19:00' },
        { op_ID: 2, op_name: 'Giuseppe', op_workStart: '10:00', op_workEnd: '20:00' },
        { op_ID: 3, op_name: 'Antonio', op_workStart: '09:00', op_workEnd: '18:00' }
      ],
      slots: [
        // OGGI - Mattina
        { at_ID: 1, at_startDateTime: '08/10/2025 09:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 2, at_startDateTime: '08/10/2025 09:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 3, at_startDateTime: '08/10/2025 10:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 4, at_startDateTime: '08/10/2025 10:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 5, at_startDateTime: '08/10/2025 11:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 6, at_startDateTime: '08/10/2025 11:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        
        // OGGI - Pomeriggio
        { at_ID: 7, at_startDateTime: '08/10/2025 14:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 8, at_startDateTime: '08/10/2025 14:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 9, at_startDateTime: '08/10/2025 15:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 10, at_startDateTime: '08/10/2025 15:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 11, at_startDateTime: '08/10/2025 16:00:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 12, at_startDateTime: '08/10/2025 16:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        
        // OGGI - Sera
        { at_ID: 13, at_startDateTime: '08/10/2025 18:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 14, at_startDateTime: '08/10/2025 18:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 15, at_startDateTime: '08/10/2025 19:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 16, at_startDateTime: '08/10/2025 19:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        
        // DOMANI - Mattina
        { at_ID: 17, at_startDateTime: '09/10/2025 09:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 18, at_startDateTime: '09/10/2025 09:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 19, at_startDateTime: '09/10/2025 10:00:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 20, at_startDateTime: '09/10/2025 10:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 21, at_startDateTime: '09/10/2025 11:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 22, at_startDateTime: '09/10/2025 11:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        
        // DOMANI - Pomeriggio
        { at_ID: 23, at_startDateTime: '09/10/2025 14:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 24, at_startDateTime: '09/10/2025 14:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 25, at_startDateTime: '09/10/2025 15:00:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 26, at_startDateTime: '09/10/2025 15:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 27, at_startDateTime: '09/10/2025 16:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 28, at_startDateTime: '09/10/2025 16:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        
        // DOPODOMANI - Mattina
        { at_ID: 29, at_startDateTime: '10/10/2025 09:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 30, at_startDateTime: '10/10/2025 09:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 31, at_startDateTime: '10/10/2025 10:00:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 32, at_startDateTime: '10/10/2025 10:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 33, at_startDateTime: '10/10/2025 11:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 34, at_startDateTime: '10/10/2025 11:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        
        // DOPODOMANI - Pomeriggio
        { at_ID: 35, at_startDateTime: '10/10/2025 14:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 36, at_startDateTime: '10/10/2025 14:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 37, at_startDateTime: '10/10/2025 15:00:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 38, at_startDateTime: '10/10/2025 15:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 39, at_startDateTime: '10/10/2025 16:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 40, at_startDateTime: '10/10/2025 16:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        
        // SAB 11/10 - Mattina
        { at_ID: 41, at_startDateTime: '11/10/2025 09:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 42, at_startDateTime: '11/10/2025 09:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 43, at_startDateTime: '11/10/2025 10:00:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 44, at_startDateTime: '11/10/2025 10:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 45, at_startDateTime: '11/10/2025 11:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 46, at_startDateTime: '11/10/2025 11:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        
        // SAB 11/10 - Pomeriggio
        { at_ID: 47, at_startDateTime: '11/10/2025 14:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 48, at_startDateTime: '11/10/2025 14:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 49, at_startDateTime: '11/10/2025 15:00:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 50, at_startDateTime: '11/10/2025 15:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 51, at_startDateTime: '11/10/2025 16:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 52, at_startDateTime: '11/10/2025 16:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        
        // DOM 12/10 - Mattina (solo mattina, negozio chiuso pomeriggio)
        { at_ID: 53, at_startDateTime: '12/10/2025 09:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 54, at_startDateTime: '12/10/2025 09:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 55, at_startDateTime: '12/10/2025 10:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 56, at_startDateTime: '12/10/2025 10:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 57, at_startDateTime: '12/10/2025 11:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 58, at_startDateTime: '12/10/2025 11:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        
        // LUN 13/10 - Mattina
        { at_ID: 59, at_startDateTime: '13/10/2025 09:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 60, at_startDateTime: '13/10/2025 09:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 61, at_startDateTime: '13/10/2025 10:00:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 62, at_startDateTime: '13/10/2025 10:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 63, at_startDateTime: '13/10/2025 11:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 64, at_startDateTime: '13/10/2025 11:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        
        // LUN 13/10 - Pomeriggio
        { at_ID: 65, at_startDateTime: '13/10/2025 14:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 66, at_startDateTime: '13/10/2025 14:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 67, at_startDateTime: '13/10/2025 15:00:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 68, at_startDateTime: '13/10/2025 15:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 69, at_startDateTime: '13/10/2025 16:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 70, at_startDateTime: '13/10/2025 16:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        
        // MAR 14/10 - Mattina
        { at_ID: 71, at_startDateTime: '14/10/2025 09:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 72, at_startDateTime: '14/10/2025 09:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 73, at_startDateTime: '14/10/2025 10:00:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 74, at_startDateTime: '14/10/2025 10:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 75, at_startDateTime: '14/10/2025 11:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 76, at_startDateTime: '14/10/2025 11:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        
        // MAR 14/10 - Pomeriggio
        { at_ID: 77, at_startDateTime: '14/10/2025 14:00:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 78, at_startDateTime: '14/10/2025 14:30:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 79, at_startDateTime: '14/10/2025 15:00:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 },
        { at_ID: 80, at_startDateTime: '14/10/2025 15:30:00', at_duration: 30, op_ID: 1, op_name: 'Marco', sv_ID: 1 },
        { at_ID: 81, at_startDateTime: '14/10/2025 16:00:00', at_duration: 30, op_ID: 2, op_name: 'Giuseppe', sv_ID: 1 },
        { at_ID: 82, at_startDateTime: '14/10/2025 16:30:00', at_duration: 30, op_ID: 3, op_name: 'Antonio', sv_ID: 1 }
      ],
      
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
        // MOCK: Dati già caricati nello state iniziale
        // Quando hai il backend, rimuovi questo commento e usa l'API:
        /*
        set({ loading: true })
        try {
          const result = await apiService.getServices()
          if (result.success) {
            set({ services: result.servizi, loading: false })
          }
        } catch (error) {
          set({ error: error.message, loading: false })
        }
        */
        console.log('📦 Servizi mock già caricati:', get().services.length)
      },
      
      // Carica operatori
      loadOperators: async () => {
        // MOCK: Dati già caricati
        console.log('👨‍💼 Operatori mock già caricati:', get().operators.length)
      },
      
      // Carica slot disponibili
      loadSlots: async (filters = {}) => {
        // MOCK: Filtra gli slot in base alle preferenze
        const { selectedService, selectedOperator, preferences } = get()
        let filteredSlots = [...get().slots]
        
        // Filtra per operatore se selezionato
        if (selectedOperator) {
          filteredSlots = filteredSlots.filter(s => s.op_ID === selectedOperator.op_ID)
        }
        
        // Filtra per fascia oraria se selezionata
        if (preferences.timeSlot && preferences.timeSlot !== 'flexible') {
          filteredSlots = filteredSlots.filter(slot => {
            const time = slot.at_startDateTime.split(' ')[1].split(':')[0]
            const hour = parseInt(time)
            
            if (preferences.timeSlot === 'morning') return hour >= 8 && hour < 12
            if (preferences.timeSlot === 'afternoon') return hour >= 14 && hour < 18
            if (preferences.timeSlot === 'evening') return hour >= 18 && hour < 21
            return true
          })
        }
        
        set({ slots: filteredSlots })
        console.log('📅 Slot filtrati:', filteredSlots.length)
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
