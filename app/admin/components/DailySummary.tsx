'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Copy, FileText, Loader2 } from 'lucide-react'

export default function DailySummary() {
    const [generating, setGenerating] = useState(false)

    const getReportText = async () => {
        const today = new Date().toISOString().split('T')[0]

        // 1. Fetch Sales (Paid orders today)
        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'paid')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`)

        const totalSales = orders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0
        const totalCars = orders?.length || 0

        // 2. Fetch Expenses
        const { data: expenses } = await supabase
            .from('expenses')
            .select('amount, description')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`)

        const totalExpenses = expenses?.reduce((acc, e) => acc + e.amount, 0) || 0
        const expenseDetails = expenses?.map(e => `${e.description} (P${e.amount})`).join(', ') || 'None'

        // 3. Construct Text
        const netCash = totalSales - totalExpenses

        return `
📊 JETZ DAILY REPORT (${today})
Sales: ₱${totalSales.toLocaleString()}
Expenses: ₱${totalExpenses.toLocaleString()} (${expenseDetails})
----------------
NET CASH: ₱${netCash.toLocaleString()}
Total Cars: ${totalCars}
        `.trim()
    }

    const generateReport = async () => {
        setGenerating(true)
        const report = await getReportText()
        try {
            await navigator.clipboard.writeText(report)
            alert('Report copied to clipboard!')
        } catch (err) {
            console.error('Failed to copy', err)
            alert('Generated but failed to copy. Check console.')
        }
        setGenerating(false)
    }

    const handleSMS = async () => {
        setGenerating(true)
        const report = await getReportText()
        window.open(`sms:?body=${encodeURIComponent(report)}`, '_blank')
        setGenerating(false)
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={handleSMS}
                disabled={generating}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-sm font-medium"
            >
                {generating ? <Loader2 className="animate-spin" size={18} /> : <div className="flex items-center gap-2">Send SMS 📱</div>}
            </button>
            <button
                onClick={generateReport}
                disabled={generating}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
                {generating ? <Loader2 className="animate-spin" size={18} /> : <div className="flex items-center gap-2"><Copy size={18} /> Copy</div>}
            </button>
        </div>
    )
}
