'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Download, Calendar, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'

// Helper for date formatting
const formatDate = (dateUnparsed: string) => {
    const date = new Date(dateUnparsed)
    return new Intl.DateTimeFormat('en-PH', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
    }).format(date)
}

export default function SalesReports() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'today' | 'week' | 'month'>('today')

    useEffect(() => {
        fetchSales()
    }, [filter])

    const fetchSales = async () => {
        setLoading(true)
        let query = supabase
            .from('orders')
            .select(`
                *,
                services ( name ),
                vehicle_types ( name )
            `)
            .or('status.eq.paid,status.eq.completed') // Include both paid and completed
            .order('created_at', { ascending: false })

        // Apply Date Filter
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const startOfWeek = new Date(now.setDate(now.getDate() - 7)).toISOString()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        if (filter === 'today') query = query.gte('created_at', startOfDay)
        if (filter === 'week') query = query.gte('created_at', startOfWeek)
        if (filter === 'month') query = query.gte('created_at', startOfMonth)

        const { data, error } = await query

        if (data) setTransactions(data)
        if (error) console.error('Error fetching sales:', error)
        setLoading(false)
    }

    // Calculations
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0)
    const totalJobs = transactions.length
    const averageOrder = totalJobs > 0 ? totalRevenue / totalJobs : 0

    // CSV Export
    const handleExportCSV = () => {
        if (transactions.length === 0) {
            alert('No data to export.')
            return
        }

        const headers = ['Time', 'Customer', 'Plate Number', 'Vehicle Type', 'Service', 'Amount', 'Status']
        const csvRows = [headers.join(',')]

        transactions.forEach(t => {
            const row = [
                `"${formatDate(t.created_at)}"`,
                `"${t.customer_name || 'Walk-in'}"`,
                `"${t.plate_number || ''}"`,
                `"${t.vehicle_types?.name || ''}"`,
                `"${t.services?.name || ''}"`,
                t.total_amount || 0,
                `"${t.status}"`
            ]
            csvRows.push(row.join(','))
        })

        const csvString = csvRows.join('\n')
        const blob = new Blob([csvString], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `jetz-sales-${filter}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Filter */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" /> Sales Overview
                    </h2>
                    <p className="text-sm text-gray-500">Track your business performance realtime.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['today', 'week', 'month'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                } capitalize`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <span className="font-bold text-xl">₱</span>
                        </div>
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                            <ArrowUpRight size={12} /> Revenue
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-800">₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    <p className="text-sm text-gray-500 mt-1">Total earnings for {filter}</p>
                </div>

                {/* Job Count Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Calendar size={24} />
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                            Volume
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-800">{totalJobs}</h3>
                    <p className="text-sm text-gray-500 mt-1">Completed jobs for {filter}</p>
                </div>

                {/* Avg Ticket Card */}
                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 rounded-xl border border-purple-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <span className="font-bold text-xl">AVG</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-gray-800">₱{averageOrder.toFixed(2)}</h3>
                    <p className="text-sm text-gray-500 mt-1">Average per vehicle</p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                    <button
                        onClick={handleExportCSV}
                        className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Time</th>
                                <th className="px-6 py-4 font-semibold">Customer / Vehicle</th>
                                <th className="px-6 py-4 font-semibold">Service</th>
                                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400">
                                        Loading sales data...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400 flex flex-col items-center justify-center">
                                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                                            <Calendar size={24} className="text-gray-300" />
                                        </div>
                                        No sales found for this period.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap font-mono text-xs">
                                            {formatDate(t.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{t.customer_name || 'Walk-in'}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                {t.vehicle_types?.name}
                                                {t.plate_number && (
                                                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono border">
                                                        {t.plate_number}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {t.services?.name}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-800">
                                            ₱{t.total_amount?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
