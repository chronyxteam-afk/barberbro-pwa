import { useStore } from '../store/useStore'

export default function PathChoice() {
  const { selectPath, setStep, loadOperators, loadSlots, prevStep } = useStore()

  const handleLucky = async () => {
    selectPath('lucky')
    await loadSlots()
    setStep('quick-slots')
  }

  const handleChoose = async () => {
    selectPath('choose')
    await loadOperators()
    setStep('operators')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => prevStep()} className="text-2xl">←</button>
          <h2 className="text-xl font-bold flex-1">Come vuoi prenotare?</h2>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-12 space-y-6">
        <button
          onClick={handleLucky}
          className="card-hover w-full p-8 text-center"
        >
          <div className="text-5xl mb-4">🍀</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Mi Sento Fortunato
          </h3>
          <p className="text-gray-600">
            Mostrami i primi slot disponibili
          </p>
        </button>

        <div className="text-center text-gray-400 font-semibold">oppure</div>

        <button
          onClick={handleChoose}
          className="card-hover w-full p-8 text-center"
        >
          <div className="text-5xl mb-4">👤</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Scegli il Barbiere
          </h3>
          <p className="text-gray-600">
            Seleziona il tuo preferito
          </p>
        </button>
      </div>
    </div>
  )
}
