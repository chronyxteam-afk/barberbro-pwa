import { useStore } from '../store/useStore'

export default function ErrorScreen({ error }) {
  const { clearError, setStep } = useStore()

  const handleRetry = () => {
    clearError()
    setStep('welcome')
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <div className="card text-center p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ops! Qualcosa è andato storto
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Errore sconosciuto. Riprova più tardi.'}
          </p>
          <button 
            onClick={handleRetry}
            className="btn-primary w-full"
          >
            Riprova
          </button>
        </div>
      </div>
    </div>
  )
}
