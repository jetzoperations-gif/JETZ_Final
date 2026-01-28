'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Copy, FileText, Loader2, Settings } from 'lucide-react'

export default function DailySummary() {
    const [generating, setGenerating] = useState(false)
    const [ownerNumber, setOwnerNumber] = useState('')

    // Load saved number on mount
    useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('jetz_owner_number')
            if (saved) setOwnerNumber(saved)
        }
    })

    const configureNumber = () => {
        const num = prompt('Enter Owner Mobile Number (e.g., 09123456789):', ownerNumber)
        if (num !== null) {
            setOwnerNumber(num)
            localStorage.setItem('jetz_owner_number', num)
        }
    }

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
        let currentNumber = ownerNumber

        if (!currentNumber) {
            const num = prompt('Please enter the Owner Mobile Number first:', '')
            if (!num) return
            setOwnerNumber(num)
            localStorage.setItem('jetz_owner_number', num)
            currentNumber = num
        }

        setGenerating(true)
        const report = await getReportText()
        const targetNumber = currentNumber || ''

        // Use location.href instead of window.open to avoid blank tabs
        window.location.href = `sms:${targetNumber}?body=${encodeURIComponent(report)}`

        setGenerating(false)
    }

    const handleWhatsApp = async () => {
        let currentNumber = ownerNumber

        if (!currentNumber) {
            const num = prompt('Please enter the Owner Mobile Number (e.g. 639123456789):', '')
            if (!num) return
            setOwnerNumber(num)
            localStorage.setItem('jetz_owner_number', num)
            currentNumber = num
        }

        // Ensure number format for WhatsApp (remove leading 0 if present, add 63)
        let formattedNum = currentNumber.replace(/\D/g, '')
        if (formattedNum.startsWith('0')) formattedNum = '63' + formattedNum.substring(1)

        setGenerating(true)
        const report = await getReportText()
        window.open(`https://wa.me/${formattedNum}?text=${encodeURIComponent(report)}`, '_blank')
        setGenerating(false)
    }

    return (
        <div className="flex gap-2 items-center">
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200 gap-1">
                <button
                    onClick={handleSMS}
                    disabled={generating}
                    className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors shadow-sm font-medium"
                    title={ownerNumber ? `SMS to ${ownerNumber}` : "Send SMS"}
                >
                    {generating ? <Loader2 className="animate-spin" size={18} /> : <div className="flex items-center gap-2">SMS 💬</div>}
                </button>
                <button
                    onClick={handleWhatsApp}
                    disabled={generating}
                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors shadow-sm font-medium"
                    title={ownerNumber ? `WhatsApp to ${ownerNumber}` : "Send WhatsApp"}
                >
                    {generating ? <Loader2 className="animate-spin" size={18} /> : <div className="flex items-center gap-2">WA 🟢</div>}
                </button>
                <button
                    onClick={configureNumber}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors border-l border-gray-300 bg-gray-50 flex flex-col justify-center items-center leading-none"
                    title="Configure Owner Number"
                >
                    {ownerNumber ? <span className="text-[10px] font-mono font-bold text-gray-600">{ownerNumber}</span> : <span className="text-xs font-bold text-blue-600">SET NO.</span>}
                </button>
            </div>

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
