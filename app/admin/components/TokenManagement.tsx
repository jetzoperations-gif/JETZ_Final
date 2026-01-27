'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import Link from 'next/link'
import { Printer } from 'lucide-react'
import ActiveTokensWidget from '@/components/ActiveTokensWidget'

type Token = Database['public']['Tables']['tokens']['Row']

export default function TokenManagement() {
    const [tokens, setTokens] = useState<Token[]>([])

    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        // Initial Fetch
        const fetchTokens = async () => {
            const { data } = await supabase.from('tokens').select('*').order('id')
            if (data) setTokens(data)
        }

        fetchTokens()

        // Realtime Subscription
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tokens' },
                (payload) => {
                    fetchTokens() // Refresh all on any change for simplicity
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleGenerateTokens = async () => {
        if (!confirm('This will ensure Tokens 1-50 exist. Continue?')) return
        setGenerating(true)

        const tokensToInsert = []
        for (let i = 1; i <= 50; i++) {
            // Check if exists first to avoid conflict errors if simple insert
            // simpler approach: upsert
            tokensToInsert.push({ id: i, status: 'available' })
        }

        const { error } = await supabase.from('tokens').upsert(tokensToInsert, { onConflict: 'id', ignoreDuplicates: true })

        if (error) {
            alert('Error generating tokens: ' + error.message)
        } else {
            alert('Tokens 1-50 ready!')
        }
        setGenerating(false)
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Live Token Status</h2>
                    <button
                        onClick={handleGenerateTokens}
                        disabled={generating || tokens.length >= 50}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-bold transition-colors disabled:opacity-50 border border-gray-200"
                    >
                        {generating ? 'Generating...' : tokens.length < 50 ? '+ Initialize Tokens' : 'Tokens Ready'}
                    </button>
                    <Link
                        href="/admin/print-tokens"
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-bold transition-colors flex items-center gap-1 border border-blue-200"
                    >
                        <Printer size={12} /> Print Cards
                    </Link>
                </div>
                <div className="flex gap-3">
                    <span className="flex items-center text-sm font-bold text-gray-700"><div className="w-3 h-3 bg-green-500 rounded-full mr-2 shadow-sm"></div> Available</span>
                    <span className="flex items-center text-sm font-bold text-gray-700"><div className="w-3 h-3 bg-red-500 rounded-full mr-2 shadow-sm"></div> Active</span>
                </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-8">
                {tokens.map((token) => (
                    <div
                        key={token.id}
                        className={`
              aspect-square flex items-center justify-center rounded-lg font-bold text-lg border-2
              ${token.status === 'active'
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : 'bg-green-50 border-green-200 text-green-600'}
            `}
                    >
                        {token.id}
                    </div>
                ))}
            </div>

            <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Active Orders</h3>
                <ActiveTokensWidget />
            </div>
        </div>
    )
}
