import { useStore } from '../store/useStore'

export default function BookingConfirm() {
  const { 
    config,
    selectedSlot, 
    selectedService,
    customer,
    resetBooking, 
    setStep 
  } = useStore()

  const handleDone = () => {
    resetBooking()
    setStep('welcome')
  }

  const handleMyBookings = () => {
    resetBooking()
    setStep('my-bookings')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prenotazione Confermata!
          </h2>
          <p className="text-gray-600 text-lg">
            Ti aspettiamo da {config?.shop_name || 'BarberBro'}
          </p>
        </div>

        <div className="card p-8 mb-6">
          <h3 className="font-bold text-gray-900 mb-4 text-center">Dettagli Prenotazione</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Servizio:</span>
              <span className="font-semibold">{selectedService?.sv_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data e ora:</span>
              <span className="font-semibold">{selectedSlot?.at_startDateTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Durata:</span>
              <span className="font-semibold">{selectedService?.sv_duration} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prezzo:</span>
              <span className="font-semibold text-primary">€{selectedService?.sv_price}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleMyBookings}
            className="btn-primary w-full"
          >
            📅 Vedi le mie prenotazioni
          </button>
          
          <button
            onClick={handleDone}
            className="btn-secondary w-full"
          >
            🏠 Torna alla home
          </button>
        </div>

        <div className="card p-4 mt-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-700 text-center">
            💡 <strong>Tip:</strong> Salva il numero {customer?.phone} per gestire le tue prenotazioni!
          </p>
        </div>
      </div>
    </div>
  )
}
