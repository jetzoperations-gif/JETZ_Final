'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Token = Database['public']['Tables']['tokens']['Row']

export default function TokenManagement() {
    const [tokens, setTokens] = useState<Token[]>([])

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

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Live Token Status</h2>
                <div className="flex gap-2">
                    <span className="flex items-center text-sm"><div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div> Available</span>
                    <span className="flex items-center text-sm"><div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div> Active</span>
                </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
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
        </div>
    )
}
