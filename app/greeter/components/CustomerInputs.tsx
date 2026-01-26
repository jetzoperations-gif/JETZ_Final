'use client'

import { useState } from 'react'

interface CustomerInputsProps {
    onConfirm: (name: string, plateNumber: string) => void
    onBack: () => void
}

export default function CustomerInputs({ onConfirm, onBack }: CustomerInputsProps) {
    const [name, setName] = useState('')
    const [plateNumber, setPlateNumber] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onConfirm(name, plateNumber)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                    ← Back
                </button>
                <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
                <div className="w-12"></div>
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
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
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
                        onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                        placeholder="ABC 1234"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-mono uppercase"
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
