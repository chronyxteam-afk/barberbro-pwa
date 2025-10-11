import { useStore } from '../store/useStore'

export default function ServiceSelector() {
  const { services, selectService, filterSlots, setStep, prevStep } = useStore()

  const handleSelect = (service) => {
    selectService(service)
    // Filtra gli slot già caricati per questo servizio (lato client, istantaneo)
    filterSlots({ servizioId: service.sv_ID })
    // Vai direttamente alla scelta operatori
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
          <h2 className="text-[17px] font-semibold text-[#1d1d1f] flex-1 text-center">
            Scegli il servizio
          </h2>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-3 animate-fadeIn">
        {services.map((service, index) => (
          <button
            key={service.sv_ID}
            onClick={() => handleSelect(service)}
            className="card-hover w-full text-left p-5"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-[17px] text-[#1d1d1f] mb-2">
                  {service.sv_name}
                </h3>
                <div className="flex items-center gap-4 text-[15px] text-[#86868b]">
                  <span>⏱ {service.sv_duration} min</span>
                  <span>•</span>
                  <span className="font-medium text-[#007AFF]">€{service.sv_price}</span>
                </div>
                {service.sv_description && (
                  <p className="text-[13px] text-[#86868b] mt-2">
                    {service.sv_description}
                  </p>
                )}
              </div>
              <div className="text-[#007AFF] text-xl ml-4">→</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
