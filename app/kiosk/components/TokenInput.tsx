'use client'

import { useState } from 'react'

interface TokenInputProps {
    onConfirm: (tokenId: number) => void
    onCancel: () => void
}

export function TokenInput({ onConfirm, onCancel }: TokenInputProps) {
    const [token, setToken] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const t = parseInt(token)
        if (t >= 1 && t <= 50) {
            onConfirm(t)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm">
                <h3 className="text-xl font-bold text-white mb-2">Do you have a Token?</h3>
                <p className="text-slate-400 text-sm mb-6">
                    Enter the number on the physical card given to you by the staff.
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="number"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Token #"
                        className="w-full bg-slate-900 border border-slate-600 text-white text-3xl font-bold text-center py-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-6"
                        autoFocus
                    />

                    <div className="space-y-3">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all"
                        >
                            Confirm Token
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full text-slate-400 font-medium py-2 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
