import { useStore } from '../store/useStore'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

export default function SlotCalendar() {
  const { slots, selectSlot, setStep, prevStep } = useStore()

  const handleSelect = (slot) => {
    selectSlot(slot)
    setStep('form')
  }

  const formatTime = (dateTimeStr) => {
    try {
      const [datePart, timePart] = dateTimeStr.split(' ')
      return timePart?.substring(0, 5) || dateTimeStr
    } catch (e) {
      return dateTimeStr
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
  const groupedSlots = slots.reduce((groups, slot) => {
    const dateKey = slot.at_startDateTime.split(' ')[0] // "08/10/2025"
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(slot)
    return groups
  }, {})
  
  // Debug: mostra quanti giorni ci sono
  const numGiorni = Object.keys(groupedSlots).length
  console.log(`📅 Slot raggruppati per ${numGiorni} giorni:`, Object.keys(groupedSlots))

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header - Apple Style */}
      <div className="bg-white/80 backdrop-blur-apple border-b border-[#d2d2d7] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => prevStep()} 
            className="text-[#007AFF] text-[17px] font-medium hover:opacity-60 transition-opacity"
          >
            ← Indietro
          </button>
          <h2 className="text-[17px] font-semibold text-[#1d1d1f] flex-1 text-center">
            Scegli data e ora
          </h2>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6 animate-fadeIn">
        {Object.entries(groupedSlots).map(([dateKey, dateSlots]) => (
          <div key={dateKey} className="space-y-3">
            {/* Header Data */}
            <div className="sticky top-[73px] bg-[#f5f5f7] py-2 z-[5]">
              <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide">
                {formatDateHeader(dateSlots[0].at_startDateTime)}
              </h3>
            </div>
            
            {/* Grid orari */}
            <div className="grid grid-cols-3 gap-2">
              {dateSlots.map((slot) => (
                <button
                  key={slot.at_ID}
                  onClick={() => handleSelect(slot)}
                  className="card-hover p-4 text-center min-h-[60px] flex items-center justify-center"
                >
                  <div className="font-semibold text-[17px] text-[#007AFF]">
                    {formatTime(slot.at_startDateTime)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
