import { useStore } from '../store/useStore'

export default function WelcomeScreen() {
  const { 
    config, 
    customer, 
    isReturningCustomer,
    setPreferences,
    setStep,
    logout,
    auth
  } = useStore()

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
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-8 text-center animate-fadeIn">
        {/* Logo/Icon */}
        <div className="mb-6">
          {config?.shop_logo_url ? (
            <img 
              src={config.shop_logo_url} 
              alt={config.shop_name}
              className="w-28 h-28 mx-auto rounded-full shadow-2xl object-cover border-4 border-white"
            />
          ) : (
            <div 
              className="w-28 h-28 mx-auto rounded-full shadow-2xl border-4 border-white flex items-center justify-center text-5xl"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))`
              }}
            >
              💈
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-semibold mb-3 tracking-tight" style={{ color: 'var(--color-text)' }}>
          {config?.shop_name || 'BarberBro'}
        </h1>

        {/* Subtitle */}
        <p className="text-lg mb-8 font-normal" style={{ color: 'var(--color-text-secondary)' }}>
          {config?.welcome_message || 'Prenota il tuo appuntamento in pochi tap'}
        </p>

        {/* Returning Customer Card */}
        {isReturningCustomer && customer && (
          <div className="card mb-6 animate-scaleIn bg-gradient-to-br from-blue-50 to-white" style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.2 }}>
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))`
                }}
              >
                👋
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Bentornato</p>
                <p className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{customer.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Preferences - Apple Style Pills */}
        <div className="mt-8">
          <p className="text-sm font-medium text-[#86868b] mb-3 uppercase tracking-wide">
            Preferenza orario
          </p>
          <div className="space-y-3 max-w-lg mx-auto">
            {/* Primo disponibile - Full width */}
            <button
              onClick={() => handleTimePreference('flexible')}
              className="card-hover w-full p-5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-[18px] font-bold mb-1">
                    🍀 Primo disponibile
                  </h3>
                  <p className="text-[12px] opacity-90">
                    Mostrami tutti gli slot
                  </p>
                </div>
                <div className="text-2xl">✨</div>
              </div>
            </button>

            {/* Grid 2x2 per le 3 fasce */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleTimePreference('morning')}
                className="card-hover p-4 flex flex-col items-center gap-2 group"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 64 64" 
                  className="w-10 h-10 text-[var(--color-primary)]"
                  stroke="currentColor" 
                  fill="none" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  aria-label="Mattina"
                >
                  <path d="M12 44h40"/>
                  <path d="M20 44a12 12 0 0 1 24 0" />
                  <path d="M32 14v6M18 22l4 4M46 22l-4 4M12 32h6M46 32h6M22 14l2 5M40 14l-2 5"/>
                </svg>
                <span className="text-[14px] font-medium text-[#1d1d1f]">Mattino</span>
                <span className="text-[11px] text-[#86868b]">8:00 - 12:00</span>
              </button>
              
              <button
                onClick={() => handleTimePreference('afternoon')}
                className="card-hover p-4 flex flex-col items-center gap-2 group"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 64 64" 
                  className="w-10 h-10 text-[var(--color-accent)]"
                  stroke="currentColor" 
                  fill="none" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  aria-label="Pomeriggio"
                >
                  <circle cx="42" cy="22" r="10"/>
                  <path d="M42 8v4M42 32v4M56 22h-4M32 22h-4M51 13l-3 3M33 31l3-3M51 31l-3-3M33 13l3 3"/>
                  <path d="M12 48h40"/>
                </svg>
                <span className="text-[14px] font-medium text-[#1d1d1f]">Pomeriggio</span>
                <span className="text-[11px] text-[#86868b]">12:00 - 18:00</span>
              </button>
              
              <button
                onClick={() => handleTimePreference('evening')}
                className="card-hover p-4 flex flex-col items-center gap-2 group col-span-2"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 64 64" 
                  className="w-10 h-10 text-[var(--color-secondary)]"
                  stroke="currentColor" 
                  fill="none" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  aria-label="Sera"
                >
                  <path d="M40 14a14 14 0 1 0 10 24a12 12 0 1 1-10-24z"/>
                  <path d="M20 20l0 4M18 22l4 0"/>
                  <path d="M26 12l0 3M24.5 13.5l3 0"/>
                  <path d="M18 48h28"/>
                </svg>
                <span className="text-[14px] font-medium text-[#1d1d1f]">Sera</span>
                <span className="text-[11px] text-[#86868b]">Dalle 18:00 in poi</span>
              </button>
            </div>
          </div>
        </div>

        {/* My Bookings Link */}
        <button
          onClick={() => setStep('my-bookings')}
          className="btn-text mt-6"
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
