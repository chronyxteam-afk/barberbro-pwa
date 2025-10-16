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

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await createBooking({
        slotId: selectedSlot.at_ID,
        servizioId: selectedService.sv_ID,
        operatoreId: selectedOperator?.op_ID || selectedSlot.op_ID,
        customerName: customer?.name || '',
        customerPhone: customer?.phone || '',
        customerEmail: customer?.email || ''
      })
      setStep('confirm')
    } catch (error) {
      alert('Errore durante la prenotazione: ' + error.message)
    } finally {
      setSubmitting(false)
    }
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
            Conferma prenotazione
          </h2>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6 animate-fadeIn">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Riepilogo Prenotazione */}
          <div className="card p-6">
            <h3 className="font-bold text-[#1d1d1f] mb-4 text-lg">Riepilogo prenotazione</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✂️</span>
                <div className="flex-1">
                  <div className="text-[13px] text-[#86868b]">Servizio</div>
                  <div className="font-semibold text-[#1d1d1f]">{selectedService?.sv_name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div className="flex-1">
                  <div className="text-[13px] text-[#86868b]">Operatore</div>
                  <div className="font-semibold text-[#1d1d1f]">{selectedOperator?.op_name || 'Non specificato'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div className="flex-1">
                  <div className="text-[13px] text-[#86868b]">Data e ora</div>
                  <div className="font-semibold text-[#1d1d1f]">{selectedSlot?.at_startDateTime}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏱️</span>
                <div className="flex-1">
                  <div className="text-[13px] text-[#86868b]">Durata</div>
                  <div className="font-semibold text-[#1d1d1f]">{selectedService?.sv_duration} minuti</div>
                </div>
              </div>
              {selectedService?.sv_price && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div className="flex-1">
                    <div className="text-[13px] text-[#86868b]">Prezzo</div>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>€{selectedService?.sv_price}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dati Cliente (solo visualizzazione) */}
          <div className="card p-6">
            <h3 className="font-bold text-[#1d1d1f] mb-4 text-lg">I tuoi dati</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#86868b] text-sm">Nome</span>
                <span className="font-semibold text-[#1d1d1f]">{customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b] text-sm">Email</span>
                <span className="font-semibold text-[#1d1d1f]">{customer?.email}</span>
              </div>
            </div>
          </div>

          {/* Bottone Conferma */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Prenotazione in corso...
              </span>
            ) : (
              '✅ Conferma Prenotazione'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
