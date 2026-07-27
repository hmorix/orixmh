import { useEffect, useState } from 'react'
import SEOHead from '../../components/seo/SEOHead'
import { DollarSign, Download, Calendar, TrendingUp, Users } from 'lucide-react'
import { config } from '../../lib/config'

export default function Payroll() {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [rows, setRows] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({ totalPayroll: '₹0', avgSalary: '₹0', totalBenefits: 'Included', taxWithholding: '0%', nextPayDate: '—' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadPayroll = () => {
    fetch(`${config.apiUrl}/hrm/payroll?period=${encodeURIComponent(period)}`, { credentials: 'include', cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'Unable to load payroll')
        setRows(data.data.rows || [])
        setSummary({
          totalPayroll: `₹${Number(data.data.summary?.totalPayroll || 0).toLocaleString('en-IN')}`,
          avgSalary: `₹${Number(data.data.summary?.avgSalary || 0).toLocaleString('en-IN')}`,
          totalBenefits: 'Included',
          taxWithholding: '12%',
          nextPayDate: data.data.summary?.nextPayDate || `${period}-28`,
        })
      })
      .catch(() => {
        setRows([])
        setSummary({ totalPayroll: '₹0', avgSalary: '₹0', totalBenefits: 'Included', taxWithholding: '0%', nextPayDate: '—' })
      })
  }

  useEffect(() => {
    loadPayroll()
  }, [period])

  const runPayroll = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${config.apiUrl}/hrm/payroll`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to run payroll')
      setRows(data.data.rows || rows)
      setMessage('Payroll processed successfully')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to run payroll')
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    window.open(`${config.apiUrl}/hrm/payroll/export?period=${encodeURIComponent(period)}`, '_blank')
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="HRM Payroll" description="Payroll management system - process salaries, track deductions, manage benefits, and generate payroll reports." keywords="payroll management, salary processing, employee compensation, tax withholding, benefits management, payroll software, HR payroll" canonical="/hrm/payroll" />
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Payroll Management</h1>
            <p className="text-cream/50 text-sm mt-1">Next pay date: <span className="text-[#C8FF00]">{summary.nextPayDate}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[6px] text-sm text-cream/70">
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-05">May 2026</option>
            </select>
            <button onClick={exportCsv} className="btn-outline text-sm flex items-center gap-2"><Download size={14} /> Export CSV</button>
            <button onClick={runPayroll} disabled={loading} className="btn-primary text-sm disabled:opacity-60">{loading ? 'Running...' : 'Run Payroll'}</button>
          </div>
        </div>

        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Payroll', value: summary.totalPayroll, icon: DollarSign },
            { label: 'Avg Salary', value: summary.avgSalary, icon: TrendingUp },
            { label: 'Benefits', value: summary.totalBenefits, icon: Users },
            { label: 'Tax Withholding', value: summary.taxWithholding, icon: Calendar },
            { label: 'Employees', value: String(rows.length), icon: Users },
          ].map((s, i) => (
            <div key={i} className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px]">
              <s.icon size={16} className="text-[#C8FF00] mb-2" />
              <div className="font-display text-lg font-bold">{s.value}</div>
              <div className="text-[10px] text-cream/30">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Payroll Table */}
        <div className="bg-obsidian-2 border border-glass-border rounded-[12px] overflow-hidden">
          <div className="p-4 border-b border-glass-border flex items-center justify-between">
            <h2 className="font-display font-semibold">Employee Payroll - {period}</h2>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px]">{rows.filter(e => e.status === 'processed').length} processed</span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-[10px]">{rows.filter(e => e.status === 'pending').length} pending</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-cream/30 text-xs border-b border-glass-border bg-white/[0.02]">
                  <th className="p-4 font-medium">Employee</th>
                  <th className="p-4 font-medium">Department</th>
                  <th className="p-4 font-medium">Base Salary</th>
                  <th className="p-4 font-medium">Bonus</th>
                  <th className="p-4 font-medium">Deductions</th>
                  <th className="p-4 font-medium">Net Pay</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((emp: any, index: number) => (
                  <tr key={emp.employeeId || emp.id || index} className="border-b border-glass-border/50 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-obsidian-3 rounded-full flex items-center justify-center text-[10px] font-bold">{emp.name.split(' ').map((n: string) => n[0]).join('')}</div>
                        <div>
                          <div className="font-medium">{emp.name}</div>
                          <div className="text-[10px] text-cream/30">{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-cream/50">{emp.department}</td>
                    <td className="p-4">₹{Number(emp.baseSalary).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-green-400">+₹{Number(emp.bonus).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-red-400">-₹{Number(emp.deductions).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-[#C8FF00] font-semibold">₹{Number(emp.net).toLocaleString('en-IN')}</td>
                    <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] ${emp.status === 'processed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{emp.status}</span></td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-cream/40">No payroll data yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
