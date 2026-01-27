'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, ScanLine } from 'lucide-react'

interface TokenScannerProps {
    onTokenVerified: (tokenId: number) => void
}

export default function TokenScanner({ onTokenVerified }: TokenScannerProps) {
    const [inputVal, setInputVal] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        // Auto-focus logic for scanners usually acting as keyboard input
        inputRef.current?.focus()
    }, [])

    const handleVerify = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputVal) return

        setVerifying(true)
        setError('')

        const tokenId = parseInt(inputVal)
        if (isNaN(tokenId)) {
            setError('Invalid Token ID')
            setVerifying(false)
            return
        }

        // Check if token exists and is available
        const { data, error } = await supabase
            .from('tokens')
            .select('status')
            .eq('id', tokenId)
            .single()

        if (error) {
            setError(`DB Error: ${error.message} (${error.code})`)
            console.error(error)
        } else if (!data) {
            setError('Token ID not found in database.')
        } else if (data.status !== 'available') {
            setError(`Token is currently ${data.status}`)
        } else {
            onTokenVerified(tokenId)
        }

        setVerifying(false)
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <ScanLine size={48} className="mx-auto text-blue-600 mb-4" />
            <h2 className="text-xl font-bold mb-4 text-gray-800">Scan QR Token</h2>

            <form onSubmit={handleVerify} className="max-w-xs mx-auto space-y-4">
                <input
                    ref={inputRef}
                    type="number"
                    className="w-full text-center text-2xl font-mono p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none text-gray-900 bg-white placeholder:text-gray-500 font-bold"
                    placeholder="Enter Token #"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                // Scanners usually send "Enter" key
                />

                {error && (
                    <div className="text-red-500 font-medium text-sm bg-red-50 p-3 rounded border border-red-200">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={verifying}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {verifying ? <Loader2 className="animate-spin mx-auto" /> : 'Enter Manual ID'}
                </button>
            </form>
        </div>
    )
}
