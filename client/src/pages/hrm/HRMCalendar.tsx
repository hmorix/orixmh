import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../../components/seo/SEOHead'
import {
  ArrowLeft, Plus, Trash2, ChevronLeft, ChevronRight,
  RefreshCw, Check, Flag, Sun, Coffee
} from 'lucide-react'
import { config } from '../../lib/config'

type Holiday = {
  _id?: string
  date: string
  name: string
  type: 'national' | 'regional' | 'company' | 'restricted'
  description?: string
}

const BASE_HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-01', name: "New Year's Day", type: 'national' },
  { date: '2026-01-14', name: 'Makar Sankranti', type: 'regional' },
  { date: '2026-01-26', name: 'Republic Day', type: 'national' },
  { date: '2026-02-26', name: 'Maha Shivratri', type: 'regional' },
  { date: '2026-03-19', name: 'Holi (2nd Day)', type: 'national' },
  { date: '2026-03-20', name: 'Holi', type: 'national' },
  { date: '2026-04-02', name: 'Ram Navami', type: 'national' },
  { date: '2026-04-03', name: 'Good Friday', type: 'national' },
  { date: '2026-04-14', name: 'Dr. Ambedkar Jayanti / Baisakhi', type: 'national' },
  { date: '2026-04-21', name: 'Eid al-Fitr', type: 'national' },
  { date: '2026-05-01', name: 'Labour Day', type: 'national' },
  { date: '2026-05-16', name: 'Buddha Purnima', type: 'national' },
  { date: '2026-06-28', name: 'Eid al-Adha', type: 'national' },
  { date: '2026-07-18', name: 'Muharram', type: 'national' },
  { date: '2026-08-15', name: 'Independence Day', type: 'national' },
  { date: '2026-08-24', name: 'Janmashtami', type: 'national' },
  { date: '2026-09-02', name: 'Ganesh Chaturthi', type: 'regional' },
  { date: '2026-09-27', name: 'Milad-un-Nabi', type: 'national' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national' },
  { date: '2026-10-15', name: 'Dussehra', type: 'national' },
  { date: '2026-11-02', name: 'Diwali (Lakshmi Puja)', type: 'national' },
  { date: '2026-11-03', name: 'Diwali (Govardhan Puja)', type: 'national' },
  { date: '2026-11-04', name: 'Bhai Dooj', type: 'regional' },
  { date: '2026-11-05', name: 'Chhath Puja', type: 'regional' },
  { date: '2026-11-19', name: 'Guru Nanak Jayanti', type: 'national' },
  { date: '2026-12-25', name: 'Christmas', type: 'national' },
]

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function HRMCalendar() {
  const today = new Date()
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(today.getFullYear() === 2026 ? today.getMonth() : 0)
  const [holidays, setHolidays] = useState<Holiday[]>(BASE_HOLIDAYS_2026)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [newH, setNewH] = useState({ date: '', name: '', type: 'company' as Holiday['type'], description: '' })

  const loadHolidays = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${config.apiUrl}/hrm/calendar?year=${year}`, { credentials: 'include', cache: 'no-store' })
      const d = await r.json().catch(() => ({}))
      if (r.ok && Array.isArray(d.data) && d.data.length > 0) {
        const serverDates = new Set(d.data.map((h: Holiday) => h.date))
        const base = BASE_HOLIDAYS_2026.filter(h => !serverDates.has(h.date))
        setHolidays([...base, ...d.data])
      }
    } catch { /* keep defaults */ } finally { setLoading(false) }
  }

  useEffect(() => { loadHolidays() }, [year])

  const addHoliday = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newH.date || !newH.name) return
    try {
      const r = await fetch(`${config.apiUrl}/hrm/calendar`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newH)
      })
      const d = await r.json().catch(() => ({}))
      setHolidays(prev => [...prev.filter(h => h.date !== newH.date), d.data || newH])
    } catch {
      setHolidays(prev => [...prev.filter(h => h.date !== newH.date), { ...newH }])
    }
    setMsg('Holiday added to calendar')
    setShowAdd(false)
    setNewH({ date: '', name: '', type: 'company', description: '' })
    setTimeout(() => setMsg(null), 3000)
  }

  const removeHoliday = async (h: Holiday) => {
    if (!confirm(`Remove "${h.name}" from calendar?`)) return
    try {
      if (h._id) await fetch(`${config.apiUrl}/hrm/calendar?id=${h._id}`, { method: 'DELETE', credentials: 'include' })
    } catch { /**/ }
    setHolidays(prev => prev.filter(x => !(x.date === h.date && x.name === h.name)))
    setMsg(`"${h.name}" removed`)
    setTimeout(() => setMsg(null), 2500)
  }

  const hMap: Record<string, Holiday> = {}
  holidays.forEach(h => { hMap[h.date] = h })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const mkDs = (day: number) => `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  const typeColor: Record<string, string> = {
    national: 'text-red-400 bg-red-500/15',
    regional: 'text-orange-400 bg-orange-500/15',
    company: 'text-[#C8FF00] bg-[#C8FF00]/15',
    restricted: 'text-blue-400 bg-blue-500/15'
  }

  const monthHols = holidays.filter(h => h.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
  const workingDays = (() => {
    let c = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, month, d).getDay()
      if (dow !== 0 && dow !== 6 && !hMap[mkDs(d)]) c++
    }
    return c
  })()

  const prevMonth = () => { if (month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1) }
  const nextMonth = () => { if (month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1) }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="HR Calendar 2026 — Holidays & Working Days | HMorix"
        description="Official HMorix 2026 company calendar with national holidays, weekends off, and custom company holidays."
        keywords="hr calendar, holiday calendar 2026, India holidays, working days"
        canonical="/hrm/calendar"
      />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/hrm" className="inline-flex items-center gap-2 text-xs text-cream/50 hover:text-[#C8FF00] transition-colors">
            <ArrowLeft size={14}/> Back to HRM
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={loadHolidays} className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5">
              <RefreshCw size={12} className={loading?'animate-spin':''}/> Refresh
            </button>
            <button onClick={()=>{setNewH({date:selectedDate||'',name:'',type:'company',description:''});setShowAdd(true)}} className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5">
              <Plus size={13}/> Mark Holiday
            </button>
          </div>
        </div>

        <div className="mb-7">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">HR Calendar {year}</h1>
          <p className="text-cream/50 text-sm mt-1">Official company calendar — national holidays, weekends off, and custom leaves marked by HR/Admin.</p>
        </div>

        {msg && (
          <div className="mb-5 p-3.5 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-[10px] text-sm text-[#C8FF00] flex items-center gap-2">
            <Check size={14}/> {msg}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          {[
            { label: 'Working Days (Month)', val: workingDays, color: 'text-cream' },
            { label: 'Holidays This Month', val: monthHols.length, color: 'text-red-400' },
            { label: 'Total 2026 Holidays', val: holidays.filter(h=>h.date.startsWith('2026')).length, color: 'text-orange-400' },
            { label: 'Company Holidays', val: holidays.filter(h=>h.type==='company').length, color: 'text-[#C8FF00]' },
          ].map(s => (
            <div key={s.label} className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px] text-center">
              <div className="text-xs text-cream/40">{s.label}</div>
              <div className={`font-display text-2xl font-bold mt-1 ${s.color}`}>{s.val}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-glass-border">
              <button onClick={prevMonth} className="p-2 rounded-[8px] hover:bg-white/[0.06]"><ChevronLeft size={16} className="text-cream/60"/></button>
              <div className="font-display font-bold text-base text-cream">{MONTHS[month]} {year}</div>
              <button onClick={nextMonth} className="p-2 rounded-[8px] hover:bg-white/[0.06]"><ChevronRight size={16} className="text-cream/60"/></button>
            </div>
            <div className="grid grid-cols-7">
              {DAYS.map((d,i)=>(
                <div key={d} className={`text-center text-[10px] font-bold py-2.5 ${i===0||i===6?'text-red-400/70':'text-cream/40'}`}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day,i)=>{
                if (!day) return <div key={`e-${i}`} className="aspect-square"/>
                const ds = mkDs(day)
                const holiday = hMap[ds]
                const isToday = ds===todayStr
                const dow = new Date(year,month,day).getDay()
                const isSun=dow===0, isSat=dow===6
                return (
                  <div key={ds} onClick={()=>setSelectedDate(ds)}
                    className={`aspect-square p-1 cursor-pointer flex flex-col items-center justify-start pt-2 transition-all ${
                      isToday?'bg-[#C8FF00]/20 border border-[#C8FF00]/40':
                      selectedDate===ds?'bg-white/[0.08]':
                      holiday?'bg-red-500/10':
                      (isSun||isSat)?'bg-white/[0.02]':''
                    } hover:bg-white/[0.06]`}
                  >
                    <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday?'bg-[#C8FF00] text-obsidian':
                      isSun?'text-red-400':isSat?'text-orange-400':
                      holiday?'text-red-300':'text-cream/80'
                    }`}>{day}</span>
                    {holiday&&<div className="w-1 h-1 rounded-full bg-red-400 mt-0.5"/>}
                    {(isSat||isSun)&&!holiday&&<div className="w-1 h-1 rounded-full bg-orange-400/50 mt-0.5"/>}
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-3 p-4 border-t border-glass-border">
              {[['bg-[#C8FF00]','Today'],['bg-red-400','Holiday'],['bg-orange-400/60','Weekend (Off)']].map(([dot,label])=>(
                <div key={label} className="flex items-center gap-1.5 text-[10px] text-cream/50">
                  <div className={`w-2 h-2 rounded-full ${dot}`}/>{label}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-glass-border flex items-center justify-between">
              <div className="font-semibold text-sm text-cream">
                {selectedDate ? new Date(selectedDate+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'long'}) : `${MONTHS[month]} Holidays`}
              </div>
              {selectedDate&&<button onClick={()=>setSelectedDate(null)} className="text-cream/40 hover:text-cream text-xs">Clear</button>}
            </div>
            <div className="flex-1 overflow-y-auto max-h-[480px] divide-y divide-glass-border/50">
              {(selectedDate?holidays.filter(h=>h.date===selectedDate):monthHols).map(h=>(
                <div key={h.date+h.name} className="p-3.5 flex items-start gap-3 group hover:bg-white/[0.02]">
                  <div className={`w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0 ${typeColor[h.type]}`}>
                    <Flag size={12}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-cream">{h.name}</div>
                    <div className="text-[10px] text-cream/40 mt-0.5">
                      {new Date(h.date+'T12:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'})}
                    </div>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${typeColor[h.type]}`}>{h.type}</span>
                  </div>
                  {(h.type==='company'||h.type==='restricted')&&(
                    <button onClick={()=>removeHoliday(h)} className="opacity-0 group-hover:opacity-100 p-1 text-cream/30 hover:text-red-400 transition-all">
                      <Trash2 size={12}/>
                    </button>
                  )}
                </div>
              ))}
              {!selectedDate&&(()=>{
                const wends=[]
                for(let d=1;d<=daysInMonth;d++){
                  const dow=new Date(year,month,d).getDay()
                  if((dow===0||dow===6)&&!hMap[mkDs(d)])wends.push({d,dow})
                }
                return wends.slice(0,5).map(w=>(
                  <div key={w.d} className="p-3.5 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[6px] bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <Sun size={12} className="text-orange-400"/>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-cream/70">{w.dow===0?'Sunday':'Saturday'} Off</div>
                      <div className="text-[10px] text-cream/40">{new Date(year,month,w.d).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                    </div>
                  </div>
                ))
              })()}
              {monthHols.length===0&&!selectedDate&&(
                <div className="p-8 text-center text-xs text-cream/30">
                  <Coffee size={22} className="mx-auto mb-2 opacity-40"/>No holidays this month
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-obsidian-2 border border-glass-border rounded-[16px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm text-cream">All {year} Holidays</h3>
            <div className="flex gap-3 text-[10px]">
              {[['bg-red-400','National'],['bg-orange-400','Regional'],['bg-[#C8FF00]','Company'],['bg-blue-400','Restricted']].map(([c,l])=>(
                <span key={l} className="flex items-center gap-1 text-cream/50"><span className={`w-2 h-2 rounded-full ${c}`}/>{l}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {holidays.filter(h=>h.date.startsWith(String(year))).sort((a,b)=>a.date.localeCompare(b.date)).map(h=>(
              <div key={h.date+h.name} className="flex items-center gap-2.5 p-2.5 rounded-[8px] hover:bg-white/[0.02] group">
                <span className={`w-1.5 h-8 rounded-full flex-shrink-0 ${h.type==='national'?'bg-red-400':h.type==='regional'?'bg-orange-400':h.type==='company'?'bg-[#C8FF00]':'bg-blue-400'}`}/>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-cream truncate">{h.name}</div>
                  <div className="text-[10px] text-cream/40">{new Date(h.date+'T12:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</div>
                </div>
                {(h.type==='company'||h.type==='restricted')&&(
                  <button onClick={()=>removeHoliday(h)} className="ml-auto opacity-0 group-hover:opacity-100 text-cream/30 hover:text-red-400"><Trash2 size={11}/></button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAdd&&(
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-obsidian-2 border border-glass-border rounded-[18px] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <h3 className="font-display font-semibold text-base text-cream">Mark Custom Holiday</h3>
              <button onClick={()=>setShowAdd(false)} className="text-cream/40 hover:text-cream">x</button>
            </div>
            <form onSubmit={addHoliday} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Date *</label>
                <input type="date" required value={newH.date} onChange={e=>setNewH({...newH,date:e.target.value})} className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Holiday Name *</label>
                <input required value={newH.name} onChange={e=>setNewH({...newH,name:e.target.value})} placeholder="e.g. Founder's Day, Annual Picnic" className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Type</label>
                <select value={newH.type} onChange={e=>setNewH({...newH,type:e.target.value as Holiday['type']})} className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]">
                  <option value="company">Company Holiday (Paid Off)</option>
                  <option value="restricted">Restricted Holiday (Optional)</option>
                  <option value="national">National Holiday</option>
                  <option value="regional">Regional Holiday</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Note (optional)</label>
                <input value={newH.description} onChange={e=>setNewH({...newH,description:e.target.value})} placeholder="Brief note" className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"/>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setShowAdd(false)} className="btn-outline text-xs py-1.5 px-3">Cancel</button>
                <button type="submit" className="btn-primary text-xs py-1.5 px-5">Add Holiday</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
