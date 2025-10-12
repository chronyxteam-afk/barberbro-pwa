import { useStore } from '../store/useStore'

export default function BookingConfirm() {
  const { 
    config,
    selectedSlot, 
    selectedService,
    selectedOperator,
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

  // Funzione per generare link Google Calendar
  const addToGoogleCalendar = () => {
    if (!selectedSlot || !selectedService) return

    // Converti data/ora in formato Google Calendar
    const startDate = new Date(selectedSlot.at_startDateTime)
    const endDate = new Date(startDate.getTime() + selectedService.sv_duration * 60000)
    
    const formatDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '')
    }

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${selectedService.sv_name} - ${config?.shop_name || 'BarberBro'}`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `Servizio: ${selectedService.sv_name}\nOperatore: ${selectedOperator?.op_name || 'Non specificato'}\nDurata: ${selectedService.sv_duration} min\nPrezzo: €${selectedService.sv_price}`,
      location: config?.shop_address || config?.shop_name || 'BarberBro'
    })

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank')
  }

  // Funzione per scaricare file .ics (Apple Calendar, Outlook, etc)
  const downloadICS = () => {
    if (!selectedSlot || !selectedService) return

    const startDate = new Date(selectedSlot.at_startDateTime)
    const endDate = new Date(startDate.getTime() + selectedService.sv_duration * 60000)
    
    const formatICSDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '')
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BarberBro//Booking//IT
BEGIN:VEVENT
UID:${selectedSlot.at_ID}@barberbro.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${selectedService.sv_name} - ${config?.shop_name || 'BarberBro'}
DESCRIPTION:Servizio: ${selectedService.sv_name}\\nOperatore: ${selectedOperator?.op_name || 'Non specificato'}\\nDurata: ${selectedService.sv_duration} min\\nPrezzo: €${selectedService.sv_price}
LOCATION:${config?.shop_address || config?.shop_name || 'BarberBro'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `prenotazione-${selectedSlot.at_ID}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <span className="text-gray-600">Operatore:</span>
              <span className="font-semibold">{selectedOperator?.op_name || 'Non specificato'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data e ora:</span>
              <span className="font-semibold">{selectedSlot?.at_startDateTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Durata:</span>
              <span className="font-semibold">{selectedService?.sv_duration} min</span>
            </div>
            {selectedService?.sv_price && (
              <div className="flex justify-between">
                <span className="text-gray-600">Prezzo:</span>
                <span className="font-semibold text-primary">€{selectedService?.sv_price}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={addToGoogleCalendar}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            📅 Aggiungi a Google Calendar
          </button>

          <button
            onClick={downloadICS}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            📲 Scarica per Apple/Outlook
          </button>

          <button
            onClick={handleMyBookings}
            className="btn-primary w-full"
          >
            � Vedi le mie prenotazioni
          </button>
          
          <button
            onClick={handleDone}
            className="btn-text w-full"
          >
            🏠 Torna alla home
          </button>
        </div>
      </div>
    </div>
  )
}
