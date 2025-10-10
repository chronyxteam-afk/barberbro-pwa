import { useStore } from '../store/useStore'

export default function OperatorList() {
  const { operators, selectOperator, loadSlots, setStep, prevStep } = useStore()

  const handleSelect = async (operator) => {
    selectOperator(operator)
    await loadSlots({ operatoreId: operator.op_ID })
    setStep('calendar')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => prevStep()} className="text-2xl">←</button>
          <h2 className="text-xl font-bold flex-1">Scegli il barbiere</h2>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-4">
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
