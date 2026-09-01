import { useEffect, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { config } from '../lib/config'
import SEOHead from '../components/seo/SEOHead'
import {
  ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle,
  Loader2, User, Mail, Phone, MapPin, Briefcase, Globe, ChevronRight
} from 'lucide-react'

export default function ApplyJob() {
  const { id } = useParams()
  const [job, setJob] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [resumeFileName, setResumeFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '',
    resumeUrl: '', portfolio: '', resumeText: '',
    coverLetter: '', experience: '', currentCTC: '',
    expectedCTC: '', noticePeriod: '30'
  })

  useEffect(() => {
    fetch(`${config.apiUrl}/careers`, { cache: 'no-store' })
      .then(async r => {
        const d = await r.json().catch(() => ({}))
        if (r.ok) setJob((d.data || []).find((item: any) => String(item._id) === String(id)))
      })
  }, [id])

  const handleFileUpload = async (file: File) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Resume must be under 5MB' }); return
    }
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain']
    if (!allowed.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only PDF, DOC, DOCX, or TXT files allowed' }); return
    }
    setResumeFileName(file.name)
    setUploadProgress(10)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'resumes')
    formData.append('type', 'resume')
    try {
      setUploadProgress(30)
      let response = await fetch(`${config.apiUrl}/upload/resume`, {
        method: 'POST', body: formData
      })
      if (!response.ok) {
        response = await fetch(`${config.apiUrl}/upload`, {
          method: 'POST', credentials: 'include', body: formData
        })
      }
      setUploadProgress(80)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Upload failed')
      const publicUrl = data.url || data.publicUrl || data.data?.url || ''
      setForm(prev => ({ ...prev, resumeUrl: publicUrl }))
      setUploadProgress(100)
      setMessage({ type: 'success', text: `✓ ${file.name} uploaded to Supabase Storage` })
      setTimeout(() => { setUploadProgress(0); setMessage(null) }, 3000)
    } catch {
      setUploadProgress(0)
      setForm(prev => ({ ...prev, resumeUrl: `pending:${file.name}` }))
      setMessage({ type: 'error', text: 'Upload failed. Your resume name will be stored as reference.' })
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    if (step === 2) { setStep(3); return }
    setSubmitting(true); setMessage(null)
    try {
      const response = await fetch(`${config.apiUrl}/careers/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, jobId: id,
          salaryExpectation: form.expectedCTC ? Number(form.expectedCTC.replace(/[^0-9]/g,'')) : 0
        })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to submit application')
      setMessage({ type: 'success', text: `🎉 Application submitted! Reference: APP-${String(data.data?._id||'').slice(-6).toUpperCase()}. Our HR team will review and contact you within 3-5 business days.` })
      setStep(1)
      setForm({ name:'', email:'', phone:'', location:'', resumeUrl:'', portfolio:'', resumeText:'', coverLetter:'', experience:'', currentCTC:'', expectedCTC:'', noticePeriod:'30' })
      setResumeFileName('')
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unable to submit application' })
    } finally { setSubmitting(false) }
  }

  const STEPS = ['Personal Info', 'Resume & Skills', 'Review & Submit']

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title={`Apply for ${job?.role || job?.title || 'Role'} | HMorix Careers`}
        description="Apply for a career opportunity at HMorix Technologies. Upload your resume and connect with our HR team."
        keywords="careers, jobs, apply, HMorix, hiring"
        canonical={`/careers/${id}/apply`}
      />
      <div className="max-w-[820px] mx-auto px-4 sm:px-6">
        <Link to="/careers" className="inline-flex items-center gap-2 text-xs text-cream/40 hover:text-[#C8FF00] transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Careers
        </Link>

        {job && (
          <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px] mb-7 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#C8FF00] flex items-center justify-center text-obsidian font-black text-base flex-shrink-0">HM</div>
            <div className="flex-1">
              <div className="font-display font-bold text-lg text-cream">{job.role || job.title}</div>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-cream/50">
                <span className="flex items-center gap-1"><Briefcase size={12}/>{job.department}</span>
                <span className="flex items-center gap-1"><MapPin size={12}/>{job.location}</span>
                <span className="flex items-center gap-1"><FileText size={12}/>{job.type||'Full-time'}</span>
                {job.salary && <span className="text-[#C8FF00] font-semibold">{job.salary}</span>}
              </div>
            </div>
            <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-[10px] text-green-400 font-bold uppercase">HIRING</span>
          </div>
        )}

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step === i+1 ? 'bg-[#C8FF00] text-obsidian' :
                step > i+1 ? 'bg-green-500/20 text-green-400' :
                'bg-white/[0.04] text-cream/40'
              }`}>
                {step > i+1 ? <CheckCircle2 size={12}/> : <span>{i+1}</span>}
                {label}
              </div>
              {i < 2 && <ChevronRight size={14} className="text-cream/20"/>}
            </div>
          ))}
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-[12px] border flex items-start gap-3 text-sm ${
            message.type==='success' ? 'bg-[#C8FF00]/10 border-[#C8FF00]/30 text-[#C8FF00]' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message.type==='success' ? <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5"/> : <AlertCircle size={16} className="flex-shrink-0 mt-0.5"/>}
            <div>{message.text}</div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {step === 1 && (
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
              <h2 className="font-display font-bold text-base text-cream">Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-cream/60 flex items-center gap-1.5 font-medium"><User size={11}/>Full Name *</label>
                  <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Rahul Sharma" className="w-full px-3 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/60 flex items-center gap-1.5 font-medium"><Mail size={11}/>Email Address *</label>
                  <input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="rahul@gmail.com" className="w-full px-3 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/60 flex items-center gap-1.5 font-medium"><Phone size={11}/>Phone Number</label>
                  <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/60 flex items-center gap-1.5 font-medium"><MapPin size={11}/>Current Location</label>
                  <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Delhi, India" className="w-full px-3 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/60 font-medium">Years of Experience</label>
                  <select value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} className="w-full px-3 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]">
                    <option value="">Select experience</option>
                    <option value="fresher">Fresher (0 years)</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-2">1-2 years</option>
                    <option value="2-4">2-4 years</option>
                    <option value="4-7">4-7 years</option>
                    <option value="7+">7+ years</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/60 font-medium">Notice Period</label>
                  <select value={form.noticePeriod} onChange={e=>setForm({...form,noticePeriod:e.target.value})} className="w-full px-3 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]">
                    <option value="immediate">Immediate</option>
                    <option value="15">15 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
              <h2 className="font-display font-bold text-base text-cream">Resume & Professional Details</h2>
              <div
                onClick={()=>fileRef.current?.click()}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFileUpload(f)}}
                className="border-2 border-dashed border-glass-border hover:border-[#C8FF00] rounded-[12px] p-8 text-center cursor-pointer transition-all group"
              >
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleFileUpload(f)}}/>
                {resumeFileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={36} className="text-[#C8FF00]"/>
                    <div className="text-sm font-semibold text-cream">{resumeFileName}</div>
                    <div className="text-xs text-cream/40">Click to replace</div>
                    {uploadProgress>0&&uploadProgress<100&&<div className="w-48 h-1.5 bg-white/[0.1] rounded-full mt-2"><div className="h-full bg-[#C8FF00] rounded-full transition-all" style={{width:`${uploadProgress}%`}}/></div>}
                    {uploadProgress===100&&<CheckCircle2 size={16} className="text-green-400"/>}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-[14px] bg-white/[0.04] border border-glass-border flex items-center justify-center group-hover:border-[#C8FF00] transition-all">
                      <Upload size={24} className="text-cream/40 group-hover:text-[#C8FF00] transition-colors"/>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-cream">Drop resume here or click to browse</div>
                      <div className="text-xs text-cream/40 mt-1">PDF, DOC, DOCX, TXT · Max 5MB</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-cream/60 flex items-center gap-1.5 font-medium"><Globe size={11}/>Portfolio / GitHub / LinkedIn</label>
                <input value={form.portfolio} onChange={e=>setForm({...form,portfolio:e.target.value})} placeholder="https://github.com/yourhandle" className="w-full px-3 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"/>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-cream/60 font-medium">Current CTC (Annual)</label>
                  <input value={form.currentCTC} onChange={e=>setForm({...form,currentCTC:e.target.value})} placeholder="e.g. ₹6,00,000" className="w-full px-3 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/60 font-medium">Expected CTC (Annual)</label>
                  <input value={form.expectedCTC} onChange={e=>setForm({...form,expectedCTC:e.target.value})} placeholder="e.g. ₹9,00,000" className="w-full px-3 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"/>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-cream/60 font-medium">Resume Summary / Key Skills</label>
                <textarea rows={4} value={form.resumeText} onChange={e=>setForm({...form,resumeText:e.target.value})} placeholder="Briefly describe your skills, tech stack, and key achievements..." className="w-full px-3 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] resize-none"/>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
              <h2 className="font-display font-bold text-base text-cream">Cover Letter & Final Review</h2>
              <div className="space-y-1">
                <label className="text-xs text-cream/60 font-medium">Why do you want to join HMorix? *</label>
                <textarea required rows={5} value={form.coverLetter} onChange={e=>setForm({...form,coverLetter:e.target.value})} placeholder="Tell us about your motivation and what you'd bring to the team..." className="w-full px-3 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] resize-none"/>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-[10px] border border-glass-border space-y-2">
                <div className="text-xs font-semibold text-cream/80 mb-2">Application Summary</div>
                {[['Name',form.name],['Email',form.email],['Phone',form.phone],['Location',form.location],['Experience',form.experience],['Notice Period',form.noticePeriod?`${form.noticePeriod} days`:''],['Expected CTC',form.expectedCTC],['Resume',resumeFileName||form.resumeUrl||'']].map(([k,v])=>v?(
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-cream/40">{k}</span>
                    <span className="text-cream font-medium truncate ml-4 max-w-[200px]">{v}</span>
                  </div>
                ):null)}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            {step>1 ? (
              <button type="button" onClick={()=>setStep(prev=>(prev-1) as 1|2|3)} className="btn-outline text-sm py-2.5 px-5">← Back</button>
            ) : <div/>}
            <button type="submit" disabled={submitting} className="btn-primary text-sm py-2.5 px-8 flex items-center gap-2 disabled:opacity-60">
              {submitting ? <><Loader2 size={14} className="animate-spin"/>Submitting...</> : step<3 ? 'Next →' : '🚀 Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
