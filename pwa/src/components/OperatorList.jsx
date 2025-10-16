import { useStore } from '../store/useStore'

export default function OperatorList() {
  const { operators, selectOperator, filterSlots, setStep, prevStep } = useStore()

  const handleSelect = (operator) => {
    selectOperator(operator)
    // Filtra slot lato client (veloce, no API call)
    if (operator.op_ID === 'all') {
      // "Mi Sento Fortunato" - Mostra TUTTI gli slot di tutti gli operatori
      filterSlots({}) // Nessun filtro operatore
    } else {
      // Operatore specifico - Filtra per operatore
      filterSlots({ operatoreId: operator.op_ID })
    }
    setStep('calendar')
  }

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
            Scegli l'operatore
          </h2>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-4">
        {/* Pulsante "Mi Sento Fortunato" */}
        <button
          onClick={() => handleSelect({ op_ID: 'all', op_name: 'Qualsiasi operatore' })}
          className="card-hover w-full text-left p-6 bg-gradient-to-r from-primary to-accent text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl mb-1">
                🍀 Mi Sento Fortunato
              </h3>
              <p className="text-sm opacity-90">
                Mostra tutti gli slot disponibili
              </p>
            </div>
            <div className="text-3xl">✨</div>
          </div>
        </button>

        {/* Lista operatori */}
        {operators.map(operator => (
          <button
            key={operator.op_ID}
            onClick={() => handleSelect(operator)}
            className="card-hover w-full text-left p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  👤 {operator.op_name}
                </h3>
                <p className="text-sm text-gray-600">
                  Orario: {operator.op_workStart} - {operator.op_workEnd}
                </p>
              </div>
              <div className="text-2xl text-primary">→</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
