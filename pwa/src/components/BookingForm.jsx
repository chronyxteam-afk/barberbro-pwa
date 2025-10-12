import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function BookingForm() {
  const { 
    customer, 
    selectedSlot, 
    selectedService, 
    selectedOperator,
    createBooking,
    setStep,
    prevStep
  } = useStore()

  const [formData, setFormData] = useState({
    customerName: customer?.name || '',
    customerPhone: customer?.phone || '',
    customerEmail: customer?.email || ''
  })

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await createBooking({
        slotId: selectedSlot.at_ID,
        servizioId: selectedService.sv_ID,
        operatoreId: selectedOperator?.op_ID || selectedSlot.op_ID,
        ...formData
      })
      setStep('confirm')
    } catch (error) {
      alert('Errore durante la prenotazione: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => prevStep()} className="text-2xl">←</button>
          <h2 className="text-xl font-bold flex-1">I tuoi dati</h2>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Riepilogo */}
          <div className="card p-6 bg-primary/5">
            <h3 className="font-bold text-gray-900 mb-3">Riepilogo prenotazione</h3>
            <div className="space-y-2 text-sm">
              <div>✂️ {selectedService?.sv_name}</div>
              <div>👤 {selectedOperator?.op_name || 'Non specificato'}</div>
              <div>⏱️ {selectedService?.sv_duration} min</div>
              {selectedService?.sv_price && (
                <div>💰 €{selectedService?.sv_price}</div>
              )}
              <div>📅 {selectedSlot?.at_startDateTime}</div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome completo *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary focus:outline-none"
                placeholder="Mario Rossi"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefono *
              </label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary focus:outline-none"
                placeholder="3331234567"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email (opzionale)
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary focus:outline-none"
                placeholder="mario@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50"
          >
            {submitting ? 'Prenotazione...' : '✅ Conferma Prenotazione'}
          </button>
        </form>
      </div>
    </div>
  )
}
