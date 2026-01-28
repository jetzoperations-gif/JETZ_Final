'use client'

import { useState } from 'react'
import { X, DollarSign, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ExpenseModalProps {
    onClose: () => void
    onSuccess: () => void
}

export default function ExpenseModal({ onClose, onSuccess }: ExpenseModalProps) {
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!description || !amount) return

        setLoading(true)
        const { error } = await supabase.from('expenses').insert({
            description,
            amount: parseFloat(amount),
            logged_by: 'Cashier' // simplified for now, could take from context
        })

        setLoading(false)

        if (error) {
            alert('Error logging expense: ' + error.message)
        } else {
            onSuccess()
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <DollarSign size={20} /> Log Expense
                    </h2>
                    <button onClick={onClose} className="text-red-100 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Description</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="e.g. Ice, Snacks"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Expense'}
                    </button>
                </form>
            </div>
        </div>
    )
}
