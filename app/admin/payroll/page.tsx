'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, Wallet, Printer } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PayrollEntry {
    name: string
    total_services: number
    total_sales: number
    total_commission: number
}

export default function PayrollPage() {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [payroll, setPayroll] = useState<PayrollEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [grandTotal, setGrandTotal] = useState(0)

    // Set default checks to "This Week" (Monday to Sunday)
    useEffect(() => {
        const curr = new Date()
        const first = curr.getDate() - curr.getDay() + 1 // First day is the day of the month - the day of the week + 1
        const last = first + 6 // last day is the first day + 6

        const firstday = new Date(curr.setDate(first)).toISOString().split('T')[0]
        const lastday = new Date(curr.setDate(last)).toISOString().split('T')[0]

        setStartDate(firstday)
        setEndDate(lastday)
    }, [])

    useEffect(() => {
        if (startDate && endDate) {
            fetchPayroll()
        }
    }, [startDate, endDate])

    const fetchPayroll = async () => {
        setLoading(true)
        // Fetch Paid orders within range
        const { data } = await supabase
            .from('orders')
            .select('washer_name, total_amount, commission_amount')
            .eq('status', 'paid')
            .gte('created_at', `${startDate}T00:00:00`)
            .lte('created_at', `${endDate}T23:59:59`)
            .not('washer_name', 'is', null)

        if (data) {
            const map: Record<string, PayrollEntry> = {}
            let totalPayout = 0

            data.forEach(order => {
                const name = order.washer_name || 'Unknown'
                if (!map[name]) map[name] = { name, total_services: 0, total_sales: 0, total_commission: 0 }

                map[name].total_services += 1
                map[name].total_sales += (order.total_amount || 0)
                map[name].total_commission += (order.commission_amount || 0)

                totalPayout += (order.commission_amount || 0)
            })

            setPayroll(Object.values(map).sort((a, b) => b.total_commission - a.total_commission))
            setGrandTotal(totalPayout)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 print:bg-white print:p-0">
            <div className="max-w-4xl mx-auto">

                {/* Header - No Print */}
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-sm border">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </Link>
                        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-wide">Weekly Payroll</h1>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800"
                    >
                        <Printer size={18} /> Print Payout
                    </button>
                </div>

                {/* Date Filter - No Print */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-4 print:hidden">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <span className="font-bold text-gray-600 text-sm">Date Range:</span>
                    </div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm font-bold"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm font-bold"
                    />
                </div>

                {/* Printable Report */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-none">
                    <div className="p-8 border-b border-gray-100 text-center">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tighter mb-1">JETZ CARWASH</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Washer Commission Payroll</p>
                        <p className="text-sm mt-2 font-mono">{startDate} to {endDate}</p>
                    </div>

                    <div className="p-0">
                        {loading ? (
                            <div className="p-10 text-center text-gray-400">Computing Commissions...</div>
                        ) : payroll.length === 0 ? (
                            <div className="p-10 text-center text-gray-400">No paid orders found for this period.</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Washer Name</th>
                                        <th className="px-6 py-4 font-bold text-center">Vehicles</th>
                                        <th className="px-6 py-4 font-bold text-right">Gross Sales</th>
                                        <th className="px-6 py-4 font-bold text-right text-blue-700">Commission (35%)</th>
                                        <th className="px-6 py-4 font-bold print:hidden">Signature</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payroll.map((p) => (
                                        <tr key={p.name} className="hover:bg-blue-50/50">
                                            <td className="px-6 py-4 font-bold text-gray-800">{p.name}</td>
                                            <td className="px-6 py-4 text-center font-mono text-gray-600">{p.total_services}</td>
                                            <td className="px-6 py-4 text-right font-mono text-gray-500">₱{p.total_sales.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-mono font-black text-blue-700 text-lg">₱{p.total_commission.toLocaleString()}</td>
                                            <td className="px-6 py-4 border-b border-gray-100 print:hidden text-gray-300 italic">______________</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-900 text-white">
                                    <tr>
                                        <td className="px-6 py-4 font-bold uppercase">Total Payout</td>
                                        <td className="px-6 py-4 text-center font-mono opacity-70">{payroll.reduce((a, b) => a + b.total_services, 0)}</td>
                                        <td className="px-6 py-4 text-right font-mono opacity-70">₱{payroll.reduce((a, b) => a + b.total_sales, 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-mono font-black text-xl text-yellow-400">₱{grandTotal.toLocaleString()}</td>
                                        <td className="px-6 py-4 print:hidden"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>

                    <div className="p-8 text-center text-xs text-gray-400 mt-8 hidden print:block border-t">
                        Generated via Jetz Internal System • {new Date().toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    )
}
