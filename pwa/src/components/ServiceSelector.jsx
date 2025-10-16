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

  // Raggruppa servizi per categoria
  const groupedServices = services.reduce((acc, service) => {
    const category = service.sv_category || 'Altro'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {})

  // Ordina le categorie (Capelli prima, poi Barba, poi il resto alfabetico)
  const sortedCategories = Object.keys(groupedServices).sort((a, b) => {
    const priority = { 'Capelli': 1, 'Barba': 2 }
    const priorityA = priority[a] || 999
    const priorityB = priority[b] || 999
    if (priorityA !== priorityB) return priorityA - priorityB
    return a.localeCompare(b)
  })

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header - Apple Style */}
      <div className="bg-white/80 backdrop-blur-apple border-b border-[#d2d2d7] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => prevStep()} 
            className="text-[#007AFF] text-[28px] font-bold hover:opacity-60 transition-opacity w-10 flex items-center justify-center"
            aria-label="Indietro"
          >
            ←
          </button>
          <h2 className="text-[17px] font-semibold text-[#1d1d1f] flex-1 text-center whitespace-nowrap">
            Scegli il servizio
          </h2>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-8 animate-fadeIn">
        {sortedCategories.map((category) => (
          <div key={category} className="space-y-3">
            {/* Titolo Categoria */}
            <h3 className="text-[22px] font-bold text-[#1d1d1f] px-2">
              {category}
            </h3>
            
            {/* Servizi della categoria */}
            <div className="space-y-3">
              {groupedServices[category].map((service, index) => (
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
                      <div className="flex items-center gap-4 text-[15px] text-[#86868b] mb-2">
                        <span>⏱ {service.sv_duration} min</span>
                        {service.sv_price && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-[#007AFF]">€{service.sv_price}</span>
                          </>
                        )}
                      </div>
                      {service.sv_info && (
                        <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
                          {service.sv_info}
                        </p>
                      )}
                    </div>
                    <div className="text-[#007AFF] text-xl ml-4">→</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
