import { useEffect, useState } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useStore } from './store/useStore'
import WelcomeScreen from './components/WelcomeScreen'
import ServiceSelector from './components/ServiceSelector'
import OperatorList from './components/OperatorList'
import SlotCalendar from './components/SlotCalendar'
import BookingForm from './components/BookingForm'
import BookingConfirm from './components/BookingConfirm'
import MyBookings from './components/MyBookings'
import LoadingScreen from './components/LoadingScreen'
import ErrorScreen from './components/ErrorScreen'
import LoginScreen from './components/LoginScreen'

function App() {
  const { 
    currentStep, 
    config, 
    auth,
    loading, 
    error,
    loadConfig,
    checkAuth,
    loadServices,
    loadOperators,
    loadSlots,
    services,
    operators
  } = useStore()
  
  const [showConfigError, setShowConfigError] = useState(false)
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  useEffect(() => {
    // 1. Carica configurazione (pubblico, no auth)
    loadConfig()
    
    // 2. Verifica se utente già loggato
    checkAuth()
    
    // 3. Timeout per mostrare errore dopo 10 secondi se config non carica
    const timer = setTimeout(() => {
      setShowConfigError(true)
    }, 10000)
    
    return () => clearTimeout(timer)
  }, [])

  // Carica dati iniziali DOPO login
  useEffect(() => {
    const loadInitialData = async () => {
      // Solo se autenticato e dati non ancora caricati
      if (auth.isAuthenticated && !initialDataLoaded && !isLoadingInitialData) {
        console.log('🚀 Caricamento dati iniziali dopo login...')
        setIsLoadingInitialData(true)
        
        try {
          // Carica in parallelo servizi, operatori e TUTTI gli slot
          await Promise.all([
            loadServices(),
            loadOperators(),
            loadSlots({}) // Senza filtri = TUTTI gli slot liberi
          ])
          
          console.log('✅ Dati iniziali caricati con successo!')
          setInitialDataLoaded(true)
        } catch (error) {
          console.error('❌ Errore caricamento dati iniziali:', error)
          // Non bloccare, continua comunque
        } finally {
          setIsLoadingInitialData(false)
        }
      }
    }
    
    loadInitialData()
  }, [auth.isAuthenticated, initialDataLoaded])

  // Forza reload config se manca google_client_id (config cache obsoleta)
  useEffect(() => {
    if (config && !config.google_client_id) {
      console.warn('⚠️ google_client_id mancante, ricarico config...')
      loadConfig()
    }
  }, [config])

  // Applica colori dinamici da config
  useEffect(() => {
    if (config) {
      // Helper per convertire HEX a RGB
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 122, 255'
      }
      
      // Imposta tutte le variabili CSS per i colori
      document.documentElement.style.setProperty('--color-primary', config.primary_color || '#007AFF')
      document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(config.primary_color || '#007AFF'))
      document.documentElement.style.setProperty('--color-primary-dark', config.primary_color_dark || '#0051D5')
      document.documentElement.style.setProperty('--color-secondary', config.secondary_color || '#34C759')
      document.documentElement.style.setProperty('--color-accent', config.accent_color || '#C19A6B')
      document.documentElement.style.setProperty('--color-background', config.background_color || '#F5F5F7')
      document.documentElement.style.setProperty('--color-text', config.text_color || '#1D1D1F')
      document.documentElement.style.setProperty('--color-text-secondary', config.text_secondary_color || '#86868B')
      document.title = `${config.shop_name || 'BarberBro'} - Booking`
    }
  }, [config])

  if (loading && !config) {
    return <LoadingScreen />
  }

  if (error) {
    return <ErrorScreen error={error} />
  }

  // Se configurazione non caricata, mostra loading
  if (!config || !config.shop_name) {
    return <LoadingScreen />
  }

  // Google OAuth Provider wrapper
  const googleClientId = config.google_client_id
  
  // Mostra loader per i primi 10 secondi, poi eventualmente l'errore
  if (!googleClientId) {
    if (!showConfigError) {
      return <LoadingScreen message="Caricamento configurazione..." />
    }
    return (
      <ErrorScreen 
        error="Configurazione OAuth mancante. Contatta l'amministratore per configurare google_client_id nel foglio ConfigPWA." 
      />
    )
  }

  // Router semplificato basato su currentStep
  function renderStep() {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen />
      case 'service':
        return <ServiceSelector />
      case 'operators':
        return <OperatorList />
      case 'calendar':
        return <SlotCalendar />
      case 'form':
        return <BookingForm />
      case 'confirm':
        return <BookingConfirm />
      case 'my-bookings':
        return <MyBookings />
      default:
        return <WelcomeScreen />
    }
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen bg-[#f5f5f7]">
        {/* Se NON autenticato → mostra LoginScreen */}
        {!auth.isAuthenticated ? (
          <LoginScreen />
        ) : isLoadingInitialData ? (
          // Se autenticato ma caricamento dati in corso → mostra LoadingScreen
          <LoadingScreen message="Caricamento dati..." />
        ) : (
          // Se autenticato E dati caricati → mostra booking flow
          renderStep()
        )}
      </div>
    </GoogleOAuthProvider>
  )
}

export default App
