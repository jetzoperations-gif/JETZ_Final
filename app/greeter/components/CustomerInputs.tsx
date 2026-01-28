'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

interface CustomerInputsProps {
    onConfirm: (name: string, plateNumber: string) => void
    onBack: () => void
}

export default function CustomerInputs({ onConfirm, onBack }: CustomerInputsProps) {
    const [name, setName] = useState('')
    const [plateNumber, setPlateNumber] = useState('')
    const [isVip, setIsVip] = useState(false)

    // Simple debounce check for VIP
    const handlePlateChange = async (val: string) => {
        const upper = val.toUpperCase()
        setPlateNumber(upper)

        if (upper.length >= 3) {
            // Check history
            // Note: In a real app we'd debounce this API call
            const { count } = await import('@/lib/supabase').then(m => m.supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('plate_number', upper)
            )

            if (count && count > 5) {
                setIsVip(true)
                // Optional: Toast here if we had a toaster
            } else {
                setIsVip(false)
            }
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onConfirm(name, plateNumber)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
            {isVip && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                    🏆 GOLD MEMBER
                </div>
            )}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter customer name"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg text-gray-900 placeholder:text-gray-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Plate Number <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => handlePlateChange(e.target.value)}
                        placeholder="ABC 1234"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-mono uppercase text-gray-900 placeholder:text-gray-400"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue
                    </button>
                </div>
            </form>
        </div>
    )
}
