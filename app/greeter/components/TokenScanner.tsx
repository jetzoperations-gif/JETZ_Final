'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface TokenScannerProps {
    onTokenSelect: (tokenId: number) => void
    selectedToken: number | null
}

export function TokenScanner({ onTokenSelect, selectedToken }: TokenScannerProps) {
    const [input, setInput] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const token = parseInt(input)
        if (token >= 1 && token <= 50) {
            onTokenSelect(token)
            setInput('')
        }
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">1. Scan / Select Token</h3>

            <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="number"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter Token # (1-50)"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold text-gray-800"
                    />
                </div>
            </form>

            <div className={`p-4 rounded-lg text-center transition-all ${selectedToken ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <div className="text-xs uppercase font-medium mb-1">Active Token</div>
                <div className="text-3xl font-black">
                    {selectedToken ? `#${selectedToken}` : '--'}
                </div>
            </div>
        </div>
    )
}
