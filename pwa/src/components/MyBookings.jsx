import { useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { useStore } from '../store/useStore'

export default function MyBookings() {
  const { 
    config,
    customer,
    myBookings, 
    loading, 
    error,
    loadMyBookings, 
    cancelBooking,
    setStep 
  } = useStore()

  useEffect(() => {
    if (customer?.phone) {
      loadMyBookings()
    }
  }, [customer, loadMyBookings])

  const handleCancel = async (bookingId) => {
    if (window.confirm('Sei sicuro di voler cancellare questa prenotazione?')) {
      await cancelBooking(bookingId)
    }
  }

  const formatDateTime = (dateTimeStr) => {
    try {
      // Format: "08/10/2025 15:30:00"
      const [datePart, timePart] = dateTimeStr.split(' ')
      const [day, month, year] = datePart.split('/')
      const isoString = `${year}-${month}-${day}T${timePart}`
      const date = parseISO(isoString)
      return format(date, "EEEE d MMMM 'alle' HH:mm", { locale: it })
    } catch (e) {
      return dateTimeStr
    }
  }

  const isUpcoming = (dateTimeStr) => {
    try {
      const [datePart, timePart] = dateTimeStr.split(' ')
      const [day, month, year] = datePart.split('/')
      const isoString = `${year}-${month}-${day}T${timePart}`
      const date = parseISO(isoString)
      return date > new Date()
    } catch (e) {
      return true
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Carico le tue prenotazioni...</p>
        </div>
      </div>
    )
  }

  const upcomingBookings = myBookings.filter(b => isUpcoming(b.at_startDateTime))
  const pastBookings = myBookings.filter(b => !isUpcoming(b.at_startDateTime))

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setStep('welcome')}
            className="text-2xl hover:scale-110 transition-transform"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Le mie prenotazioni</h1>
            <p className="text-sm text-gray-600">{customer?.name || 'Cliente'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        {error && (
          <div className="card p-4 mb-6 bg-red-50 border-red-200">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {myBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nessuna prenotazione
            </h3>
            <p className="text-gray-600 mb-6">
              Non hai ancora prenotato nessun appuntamento
            </p>
            <button
              onClick={() => setStep('service')}
              className="btn-primary"
            >
              Prenota ora
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  🔜 Prossimi appuntamenti
                </h2>
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.at_ID} className="card card-hover p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{booking.serviceName}</h3>
                          <p className="text-sm text-gray-600">con {booking.operatorName}</p>
                        </div>
                        <span className="text-lg font-bold text-primary">
                          €{booking.at_price}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                        <span>📅</span>
                        <span>{formatDateTime(booking.at_startDateTime)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span>⏱️</span>
                        <span>{booking.at_duration} minuti</span>
                      </div>

                      <button
                        onClick={() => handleCancel(booking.at_ID)}
                        className="w-full py-2 px-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                      >
                        ❌ Cancella prenotazione
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  ✅ Appuntamenti passati
                </h2>
                <div className="space-y-3">
                  {pastBookings.map((booking) => (
                    <div key={booking.at_ID} className="card p-4 opacity-75">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{booking.serviceName}</h3>
                          <p className="text-sm text-gray-600">con {booking.operatorName}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-600">
                          €{booking.at_price}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>📅</span>
                        <span>{formatDateTime(booking.at_startDateTime)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => setStep('welcome')}
          className="btn-secondary w-full mt-6"
        >
          🏠 Torna alla home
        </button>
      </div>
    </div>
  )
}
