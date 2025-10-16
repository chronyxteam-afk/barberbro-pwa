import { useStore } from '../store/useStore'

export default function PathChoice() {
  const { selectPath, setStep, loadOperators, loadSlots, prevStep, selectedService } = useStore()

  const handleLucky = async () => {
    selectPath('lucky')
    // Passa il servizioId selezionato
    await loadSlots({ servizioId: selectedService.sv_ID })
    setStep('quick-slots')
  }

  const handleFascia = async (fascia) => {
    selectPath(fascia)
    // Carica slot con filtro fascia oraria
    await loadSlots({ servizioId: selectedService.sv_ID, fascia })
    setStep('quick-slots')
  }

  const handleChoose = async () => {
    selectPath('choose')
    await loadOperators()
    setStep('operators')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header - Apple Style */}
      <div className="bg-white/80 backdrop-blur-apple border-b border-[#d2d2d7] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => prevStep()} 
            className="text-[#007AFF] text-[17px] font-medium hover:opacity-60 transition-opacity"
          >
            ← Indietro
          </button>
          <h2 className="text-[17px] font-semibold text-[#1d1d1f] flex-1 text-center whitespace-nowrap">
            Come vuoi prenotare?
          </h2>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-6">
        {/* Mi Sento Fortunato - A tutta larghezza sopra */}
        <button
          onClick={handleLucky}
          className="card-hover w-full p-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-[22px] font-bold mb-1">
                🍀 Mi Sento Fortunato
              </h3>
              <p className="text-[13px] opacity-90">
                Primi slot disponibili
              </p>
            </div>
            <div className="text-3xl">✨</div>
          </div>
        </button>

        {/* Separatore */}
        <div className="text-center text-[#86868b] text-[13px] font-medium">
          oppure scegli la fascia oraria
        </div>

        {/* Grid 2 colonne per le 3 fasce orarie */}
        <div className="grid grid-cols-2 gap-3">
          {/* Mattino */}
          <button
            onClick={() => handleFascia('morning')}
            className="card-hover p-5 text-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 64 64" 
              className="w-12 h-12 mx-auto mb-3 text-[var(--color-primary)]"
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
            <h3 className="font-semibold text-[15px] text-[#1d1d1f] mb-1">
              Mattino
            </h3>
            <p className="text-xs text-[#86868b]">
              8:00 - 12:00
            </p>
          </button>

          {/* Pomeriggio */}
          <button
            onClick={() => handleFascia('afternoon')}
            className="card-hover p-5 text-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 64 64" 
              className="w-12 h-12 mx-auto mb-3 text-[var(--color-accent)]"
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
            <h3 className="font-semibold text-[15px] text-[#1d1d1f] mb-1">
              Pomeriggio
            </h3>
            <p className="text-xs text-[#86868b]">
              12:00 - 18:00
            </p>
          </button>

          {/* Sera - Occupa 2 colonne */}
          <button
            onClick={() => handleFascia('evening')}
            className="card-hover p-5 text-center col-span-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 64 64" 
              className="w-12 h-12 mx-auto mb-3 text-[var(--color-secondary)]"
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
            <h3 className="font-semibold text-[15px] text-[#1d1d1f] mb-1">
              Sera
            </h3>
            <p className="text-xs text-[#86868b]">
              Dalle 18:00 in poi
            </p>
          </button>
        </div>

        {/* Separatore */}
        <div className="text-center text-[#86868b] text-[13px] font-medium pt-4">
          oppure
        </div>

        {/* Scegli il Barbiere */}
        <button
          onClick={handleChoose}
          className="card-hover w-full p-6 text-center"
        >
          <div className="text-5xl mb-3">👤</div>
          <h3 className="text-[20px] font-bold text-[#1d1d1f] mb-1">
            Scegli il Barbiere
          </h3>
          <p className="text-[13px] text-[#86868b]">
            Seleziona il tuo preferito
          </p>
        </button>
      </div>
    </div>
  )
}
