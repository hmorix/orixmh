import React, { useState, useEffect } from 'react'
import { 
  GraduationCap, Award, FileText, Users, Clock, CheckCircle2, 
  XCircle, Plus, Download, Eye, Briefcase, Calendar, Star, Building2 
} from 'lucide-react'
import config from '../../lib/config'
import SEOHead from '../../components/seo/SEOHead'
import {
  printInternshipOfferLetter,
  printInternshipCertificate,
  printPermanentOfferLetter,
  printInternApprovalLetter,
  InternshipOfferData,
  InternshipCertData,
  PermanentOfferData,
  InternApprovalData
} from '../../lib/hrm-documents'

export default function Internship() {
  const [activeTab, setActiveTab] = useState('Applications')
  const [interns, setInterns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState('Internship Offer Letter')
  const [docFormData, setDocFormData] = useState<any>({})

  const fetchInterns = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${config.apiUrl}/hrm/interns`, { credentials: 'include', cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setInterns(data.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInterns()
  }, [])

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${config.apiUrl}/hrm/interns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      })
      if (res.ok) {
        fetchInterns()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd.entries())
    try {
      const res = await fetch(`${config.apiUrl}/hrm/interns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      })
      if (res.ok) {
        setShowAddModal(false)
        fetchInterns()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDocGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDocType === 'Internship Offer Letter') {
      printInternshipOfferLetter(docFormData as InternshipOfferData)
    } else if (selectedDocType === 'Internship Approval Letter') {
      printInternApprovalLetter(docFormData as InternApprovalData)
    } else if (selectedDocType === 'Internship Certificate') {
      printInternshipCertificate(docFormData as InternshipCertData)
    } else if (selectedDocType === 'Permanent Employment Offer') {
      printPermanentOfferLetter(docFormData as PermanentOfferData)
    }
  }

  const handleDocFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDocFormData({ ...docFormData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-obsidian text-cream p-6">
      <SEOHead title="Internship Management - HMorix" />
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#C8FF00] flex items-center gap-3">
            <GraduationCap className="w-8 h-8" />
            Internship Management
          </h1>
          <p className="text-cream/60 mt-2">Hire, track, certify and convert interns to permanent employees</p>
        </header>

        <div className="flex gap-4 border-b border-glass-border mb-8 overflow-x-auto">
          {['Applications', 'Active Interns', 'Completed', 'Generate Documents'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 whitespace-nowrap font-medium transition-colors ${activeTab === tab ? 'text-[#C8FF00] border-b-2 border-[#C8FF00]' : 'text-cream/60 hover:text-cream'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Applications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="bg-obsidian-2 border border-glass-border p-4 rounded-xl">
                  <div className="text-sm text-cream/60">Total</div>
                  <div className="text-2xl font-bold">{interns.filter(i => i.status === 'applied').length}</div>
                </div>
                <div className="bg-obsidian-2 border border-glass-border p-4 rounded-xl">
                  <div className="text-sm text-cream/60">Shortlisted</div>
                  <div className="text-2xl font-bold text-blue-400">{interns.filter(i => i.status === 'shortlisted').length}</div>
                </div>
                <div className="bg-obsidian-2 border border-glass-border p-4 rounded-xl">
                  <div className="text-sm text-cream/60">Interview</div>
                  <div className="text-2xl font-bold text-yellow-400">{interns.filter(i => i.status === 'interview').length}</div>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-[#C8FF00] text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#b3e600]"
              >
                <Plus className="w-4 h-4" /> Add Application
              </button>
            </div>

            <div className="bg-obsidian-2 border border-glass-border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-black/20 border-b border-glass-border">
                  <tr>
                    <th className="p-4 text-cream/60 font-medium">Name</th>
                    <th className="p-4 text-cream/60 font-medium">College/Course</th>
                    <th className="p-4 text-cream/60 font-medium">Role</th>
                    <th className="p-4 text-cream/60 font-medium">Status</th>
                    <th className="p-4 text-cream/60 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {loading ? (
                    <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
                  ) : interns.filter(i => ['applied', 'shortlisted', 'interview', 'rejected'].includes(i.status)).map(intern => (
                    <tr key={intern._id}>
                      <td className="p-4">
                        <div className="font-medium">{intern.name}</div>
                        <div className="text-sm text-cream/40">{intern.email}</div>
                      </td>
                      <td className="p-4">
                        <div>{intern.college}</div>
                        <div className="text-sm text-cream/40">{intern.course}</div>
                      </td>
                      <td className="p-4">{intern.role}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          intern.status === 'applied' ? 'bg-gray-500/20 text-gray-300' :
                          intern.status === 'shortlisted' ? 'bg-blue-500/20 text-blue-300' :
                          intern.status === 'interview' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {intern.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        {intern.status === 'applied' && <button onClick={() => handleUpdateStatus(intern._id, 'shortlisted')} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 text-sm">Shortlist</button>}
                        {intern.status === 'shortlisted' && <button onClick={() => handleUpdateStatus(intern._id, 'interview')} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded hover:bg-yellow-500/30 text-sm">Interview</button>}
                        {['applied', 'shortlisted', 'interview'].includes(intern.status) && (
                          <>
                            <button onClick={() => handleUpdateStatus(intern._id, 'approved')} className="px-3 py-1 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 text-sm">Approve</button>
                            <button onClick={() => handleUpdateStatus(intern._id, 'rejected')} className="px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 text-sm">Reject</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Active Interns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interns.filter(i => i.status === 'approved').map(intern => (
              <div key={intern._id} className="bg-obsidian-2 border border-glass-border p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{intern.name}</h3>
                    <div className="text-sm text-[#C8FF00]">{intern.internId}</div>
                  </div>
                  <div className="bg-[#C8FF00]/10 text-[#C8FF00] p-2 rounded-lg">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="text-sm"><span className="text-cream/60">Role:</span> {intern.role}</div>
                  <div className="text-sm"><span className="text-cream/60">Dept:</span> {intern.department}</div>
                  <div className="text-sm"><span className="text-cream/60">Duration:</span> {new Date(intern.startDate).toLocaleDateString()} - {new Date(intern.endDate).toLocaleDateString()}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleUpdateStatus(intern._id, 'completed')} className="w-full py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 text-sm font-medium">Mark Completed</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Completed' && (
          <div className="bg-obsidian-2 border border-glass-border rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black/20 border-b border-glass-border">
                <tr>
                  <th className="p-4 text-cream/60 font-medium">Name</th>
                  <th className="p-4 text-cream/60 font-medium">Intern ID</th>
                  <th className="p-4 text-cream/60 font-medium">Role</th>
                  <th className="p-4 text-cream/60 font-medium">Completion Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {interns.filter(i => i.status === 'completed').map(intern => (
                  <tr key={intern._id}>
                    <td className="p-4 font-medium">{intern.name}</td>
                    <td className="p-4">{intern.internId}</td>
                    <td className="p-4">{intern.role}</td>
                    <td className="p-4">{new Date(intern.endDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Generate Documents' && (
          <div className="bg-obsidian-2 border border-glass-border rounded-xl p-6 max-w-3xl">
            <h2 className="text-xl font-bold mb-6">Document Generator</h2>
            <form onSubmit={handleDocGenerate} className="space-y-6">
              <div>
                <label className="block text-sm text-cream/60 mb-2">Document Type</label>
                <select 
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]"
                >
                  <option value="Internship Offer Letter">Internship Offer Letter</option>
                  <option value="Internship Approval Letter">Internship Approval Letter</option>
                  <option value="Internship Certificate">Internship Certificate</option>
                  <option value="Permanent Employment Offer">Permanent Employment Offer</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-cream/60 mb-2">Name</label>
                  <input type="text" name="name" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                </div>
                <div>
                  <label className="block text-sm text-cream/60 mb-2">Intern ID</label>
                  <input type="text" name="internId" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                </div>

                {selectedDocType !== 'Permanent Employment Offer' && (
                  <>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">College</label>
                      <input type="text" name="college" onChange={handleDocFieldChange} className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">Course</label>
                      <input type="text" name="course" onChange={handleDocFieldChange} className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm text-cream/60 mb-2">Role/Designation</label>
                  <input type="text" name="role" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                </div>
                <div>
                  <label className="block text-sm text-cream/60 mb-2">Department</label>
                  <input type="text" name="department" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                </div>

                {['Internship Offer Letter', 'Internship Approval Letter', 'Internship Certificate'].includes(selectedDocType) && (
                  <>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">Start Date</label>
                      <input type="date" name="startDate" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">End Date</label>
                      <input type="date" name="endDate" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                  </>
                )}

                {selectedDocType === 'Internship Offer Letter' && (
                  <>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">Stipend (Monthly ₹)</label>
                      <input type="number" name="stipend" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">Location</label>
                      <input type="text" name="location" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                  </>
                )}

                {selectedDocType === 'Internship Approval Letter' && (
                  <>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">Supervisor Name</label>
                      <input type="text" name="supervisorName" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">Supervisor Email</label>
                      <input type="email" name="supervisorEmail" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                  </>
                )}

                {selectedDocType === 'Internship Certificate' && (
                  <>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">Certificate No</label>
                      <input type="text" name="certificateNo" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">Skills (comma separated)</label>
                      <input type="text" name="skills" onChange={handleDocFieldChange} className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                  </>
                )}

                {selectedDocType === 'Permanent Employment Offer' && (
                  <>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">New Employee ID</label>
                      <input type="text" name="employeeId" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">Annual CTC (₹)</label>
                      <input type="number" name="ctc" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">Joining Date</label>
                      <input type="date" name="joiningDate" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                    <div>
                      <label className="block text-sm text-cream/60 mb-2">Location</label>
                      <input type="text" name="location" onChange={handleDocFieldChange} required className="w-full bg-black/50 border border-glass-border rounded-lg p-3 text-cream focus:outline-none focus:border-[#C8FF00]" />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-[#C8FF00] text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#b3e600]">
                  <Download className="w-5 h-5" /> Generate Document
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian border border-glass-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Intern Application</h2>
              <button onClick={() => setShowAddModal(false)} className="text-cream/60 hover:text-cream"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-cream/60 mb-1">Name</label>
                  <input type="text" name="name" required className="w-full bg-black/50 border border-glass-border rounded-lg p-2 text-cream" />
                </div>
                <div>
                  <label className="block text-sm text-cream/60 mb-1">Email</label>
                  <input type="email" name="email" className="w-full bg-black/50 border border-glass-border rounded-lg p-2 text-cream" />
                </div>
                <div>
                  <label className="block text-sm text-cream/60 mb-1">College</label>
                  <input type="text" name="college" className="w-full bg-black/50 border border-glass-border rounded-lg p-2 text-cream" />
                </div>
                <div>
                  <label className="block text-sm text-cream/60 mb-1">Course</label>
                  <input type="text" name="course" className="w-full bg-black/50 border border-glass-border rounded-lg p-2 text-cream" />
                </div>
                <div>
                  <label className="block text-sm text-cream/60 mb-1">Role</label>
                  <input type="text" name="role" required className="w-full bg-black/50 border border-glass-border rounded-lg p-2 text-cream" />
                </div>
                <div>
                  <label className="block text-sm text-cream/60 mb-1">Department</label>
                  <input type="text" name="department" required className="w-full bg-black/50 border border-glass-border rounded-lg p-2 text-cream" />
                </div>
                <div>
                  <label className="block text-sm text-cream/60 mb-1">Start Date</label>
                  <input type="date" name="startDate" required className="w-full bg-black/50 border border-glass-border rounded-lg p-2 text-cream" />
                </div>
                <div>
                  <label className="block text-sm text-cream/60 mb-1">End Date</label>
                  <input type="date" name="endDate" required className="w-full bg-black/50 border border-glass-border rounded-lg p-2 text-cream" />
                </div>
                <div>
                  <label className="block text-sm text-cream/60 mb-1">Stipend</label>
                  <input type="number" name="stipend" required className="w-full bg-black/50 border border-glass-border rounded-lg p-2 text-cream" />
                </div>
                <div>
                  <label className="block text-sm text-cream/60 mb-1">Location</label>
                  <input type="text" name="location" required className="w-full bg-black/50 border border-glass-border rounded-lg p-2 text-cream" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-glass-border text-cream/60 hover:text-cream">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#C8FF00] text-black rounded-lg font-medium hover:bg-[#b3e600]">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
