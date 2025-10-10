import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export default function WelcomeScreen() {
  const { 
    config, 
    customer, 
    isReturningCustomer,
    setPreferences,
    setStep,
    loadServices,
    loadOperators,
    loadSlots,
    logout,
    auth
  } = useStore()

  // Carica i dati reali dal Google Sheets dopo il login
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Inizio caricamento dati...')
        
        if (loadServices) {
          await loadServices()
        }
        if (loadOperators) {
          await loadOperators()
        }
        if (loadSlots) {
          await loadSlots()
        }
        
        console.log('✅ Dati caricati dall\'API')
      } catch (error) {
        console.error('❌ Errore caricamento dati:', error)
        // Non bloccare l'interfaccia anche se caricamento fallisce
      }
    }
    
    // Carica dati solo se non sono già presenti
    loadData()
  }, []) // Rimuovo le dipendenze per evitare loop infiniti

  const handleTimePreference = (timeSlot) => {
    setPreferences({ timeSlot })
    setStep('service')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f5f5f7]">
      {/* Logout Button - Top Right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors"
        >
          <span>{auth?.user?.email || 'Account'}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Hero Section - Apple Style */}
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-12 text-center animate-fadeIn">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#007AFF] to-[#0051D5] rounded-[28px] shadow-lg flex items-center justify-center text-5xl">
            💈
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-semibold text-[#1d1d1f] mb-4 tracking-tight">
          {config?.shop_name || 'BarberBro'}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-[#86868b] mb-12 font-normal">
          {config?.welcome_message || 'Prenota il tuo appuntamento in pochi tap'}
        </p>

        {/* Returning Customer Card */}
        {isReturningCustomer && customer && (
          <div className="card mb-8 animate-scaleIn bg-gradient-to-br from-blue-50 to-white border-[#007AFF]/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#007AFF] to-[#0051D5] flex items-center justify-center text-2xl shadow-md">
                👋
              </div>
              <div className="text-left flex-1">
                <p className="text-sm text-[#86868b] font-medium">Bentornato</p>
                <p className="text-xl font-semibold text-[#1d1d1f]">{customer.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={() => setStep('service')}
          className="btn-primary w-full max-w-sm mx-auto mb-6 text-lg font-semibold shadow-lg shadow-[#007AFF]/25"
        >
          Prenota ora
        </button>

        {/* Preferences - Apple Style Pills */}
        <div className="mt-12">
          <p className="text-sm font-medium text-[#86868b] mb-4 uppercase tracking-wide">
            Preferenza orario
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
            <button
              onClick={() => handleTimePreference('flexible')}
              className="card-hover py-6 flex flex-col items-center gap-2 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">🍀</span>
              <span className="text-[15px] font-medium text-[#1d1d1f]">Primo disponibile</span>
            </button>
            
            <button
              onClick={() => handleTimePreference('morning')}
              className="card-hover py-6 flex flex-col items-center gap-2 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">🌅</span>
              <span className="text-[15px] font-medium text-[#1d1d1f]">Mattina</span>
              <span className="text-xs text-[#86868b]">8:00 - 12:00</span>
            </button>
            
            <button
              onClick={() => handleTimePreference('afternoon')}
              className="card-hover py-6 flex flex-col items-center gap-2 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">☀️</span>
              <span className="text-[15px] font-medium text-[#1d1d1f]">Pomeriggio</span>
              <span className="text-xs text-[#86868b]">14:00 - 18:00</span>
            </button>
            
            <button
              onClick={() => handleTimePreference('evening')}
              className="card-hover py-6 flex flex-col items-center gap-2 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">🌆</span>
              <span className="text-[15px] font-medium text-[#1d1d1f]">Sera</span>
              <span className="text-xs text-[#86868b]">18:00 - 20:00</span>
            </button>
          </div>
        </div>

        {/* My Bookings Link */}
        <button
          onClick={() => setStep('my-bookings')}
          className="btn-text mt-8"
        >
          📅 Le mie prenotazioni
        </button>
      </div>

      {/* Info Section */}
      <div className="max-w-2xl mx-auto px-6 pb-12">
        <div className="card bg-[#f5f5f7] border-0">
          <div className="space-y-3 text-center">
            {config?.address && (
              <div className="flex items-center justify-center gap-2 text-[#86868b]">
                <span>📍</span>
                <span className="text-[15px]">{config.address}</span>
              </div>
            )}
            {config?.phone_contact && (
              <div className="flex items-center justify-center gap-2 text-[#86868b]">
                <span>📞</span>
                <span className="text-[15px]">{config.phone_contact}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-[#86868b]">
            Powered by <span className="font-semibold">BarberBro</span> v2.1
          </p>
        </div>
      </div>
    </div>
  )
}
