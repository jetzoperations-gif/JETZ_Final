'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Copy, FileText, Loader2, Share2, MessageSquare, MessageCircle, Phone, X } from 'lucide-react'

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

    const [showShareModal, setShowShareModal] = useState(false)

    const handleShare = async (platform: 'sms' | 'whatsapp' | 'viber' | 'copy') => {
        let currentNumber = ownerNumber

        if (platform !== 'copy' && !currentNumber) {
            const num = prompt('Please enter the Owner Mobile Number (e.g. 09123456789):', '')
            if (!num) return
            setOwnerNumber(num)
            localStorage.setItem('jetz_owner_number', num)
            currentNumber = num
        }

        setGenerating(true)
        const report = await getReportText()
        setGenerating(false)
        setShowShareModal(false) // Close modal after selection

        const encodedReport = encodeURIComponent(report)

        // Format number for international apps
        let intlNum = currentNumber.replace(/\D/g, '')
        if (intlNum.startsWith('0')) intlNum = '63' + intlNum.substring(1)

        switch (platform) {
            case 'sms':
                window.location.href = `sms:${currentNumber}?body=${encodedReport}`
                break
            case 'whatsapp':
                window.open(`https://wa.me/${intlNum}?text=${encodedReport}`, '_blank')
                break
            case 'viber':
                window.open(`viber://forward?text=${encodedReport}`, '_blank')
                break
            case 'copy':
                try {
                    await navigator.clipboard.writeText(report)
                    alert('Report copied to clipboard!')
                } catch (err) {
                    alert('Failed to copy. Please select text manually.')
                }
                break
        }
    }

    return (
        <>
            <div className="flex gap-2 items-center">
                <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => setShowShareModal(true)}
                        disabled={generating}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                    >
                        {generating ? <Loader2 className="animate-spin" size={18} /> : (
                            <div className="flex items-center gap-2">
                                <Share2 size={18} /> Share Report
                            </div>
                        )}
                    </button>
                    <button
                        onClick={configureNumber}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors border-l border-gray-300 bg-gray-50 flex flex-col justify-center items-center leading-none"
                        title="Configure Owner Number"
                    >
                        {ownerNumber ? <span className="text-[10px] font-mono font-bold text-gray-600">{ownerNumber}</span> : <span className="text-xs font-bold text-blue-600">SET NO.</span>}
                    </button>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 relative">
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-gray-800 mb-2">Share Daily Report</h3>
                        <p className="text-sm text-gray-500 mb-6">Choose how you want to send the report to <span className="font-mono font-bold text-gray-700">{ownerNumber || 'Owner'}</span></p>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => handleShare('sms')}
                                className="flex items-center justify-center gap-3 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                <MessageSquare size={20} /> Send via SMS
                            </button>

                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="flex items-center justify-center gap-3 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                <MessageCircle size={20} /> Send via WhatsApp
                            </button>

                            <button
                                onClick={() => handleShare('viber')}
                                className="flex items-center justify-center gap-3 w-full bg-[#7360f2] text-white py-3 rounded-lg hover:opacity-90 transition-colors font-medium"
                            >
                                <Phone size={20} /> Send via Viber
                            </button>

                            <div className="border-t border-gray-100 my-2"></div>

                            <button
                                onClick={() => handleShare('copy')}
                                className="flex items-center justify-center gap-3 w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                <Copy size={20} /> Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
