import { useStore } from '../store/useStore'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

export default function QuickSlots() {
  const { slots, selectSlot, setStep, prevStep } = useStore()

  const handleSelect = (slot) => {
    selectSlot(slot)
    setStep('form')
  }

  const formatTime = (dateTimeStr) => {
    try {
      const [datePart, timePart] = dateTimeStr.split(' ')
      const [day, month, year] = datePart.split('/')
      const isoDate = `${year}-${month}-${day}T${timePart}`
      const date = parseISO(isoDate)
      return format(date, "HH:mm", { locale: it })
    } catch (e) {
      return dateTimeStr.split(' ')[1]?.substring(0, 5) || dateTimeStr
    }
  }

  const formatDateHeader = (dateTimeStr) => {
    try {
      const [datePart, timePart] = dateTimeStr.split(' ')
      const [day, month, year] = datePart.split('/')
      const isoDate = `${year}-${month}-${day}T${timePart}`
      const date = parseISO(isoDate)
      return format(date, "EEEE d MMMM", { locale: it })
    } catch (e) {
      return dateTimeStr.split(' ')[0]
    }
  }

  // Raggruppa slot per data
  const groupedSlots = slots.slice(0, 20).reduce((groups, slot) => {
    const dateKey = slot.at_startDateTime.split(' ')[0] // "08/10/2025"
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(slot)
    return groups
  }, {})

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
            Primi slot disponibili
          </h2>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6 animate-fadeIn">
        {slots.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-[#86868b]">
              Nessuno slot disponibile al momento. Prova con date diverse.
            </p>
          </div>
        ) : (
          Object.entries(groupedSlots).map(([dateKey, dateSlots]) => (
            <div key={dateKey} className="space-y-3">
              {/* Header Data */}
              <div className="sticky top-[73px] bg-[#f5f5f7] py-2 z-[5]">
                <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide">
                  {formatDateHeader(dateSlots[0].at_startDateTime)}
                </h3>
              </div>
              
              {/* Slot del giorno */}
              <div className="space-y-2">
                {dateSlots.map((slot, index) => {
                  const isTurnoSpeciale = slot.at_notes === 'Turno Speciale'
                  return (
                    <button
                      key={slot.at_ID}
                      onClick={() => handleSelect(slot)}
                      className={`card-hover w-full text-left p-4 ${isTurnoSpeciale ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200' : ''}`}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`text-[20px] font-semibold min-w-[60px] ${isTurnoSpeciale ? 'text-amber-600' : 'text-[#007AFF]'}`}>
                            {formatTime(slot.at_startDateTime)}
                          </div>
                          <div>
                            <div className="text-[15px] text-[#1d1d1f]">
                              con <span className="font-medium">{slot.op_name}</span>
                            </div>
                            {isTurnoSpeciale && (
                              <div className="text-[12px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                                ⭐ Turno Speciale
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`text-xl ml-4 ${isTurnoSpeciale ? 'text-amber-600' : 'text-[#007AFF]'}`}>→</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
