'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { Car, Clock, Loader2, ChevronRight } from 'lucide-react'
import TokenDetailsModal from './TokenDetailsModal'

type Order = Database['public']['Tables']['orders']['Row'] & {
    vehicle_types: { name: string } | null
    customer_name: string | null
    plate_number: string | null
}

export default function ActiveTokensWidget() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select(`
                *,
                vehicle_types ( name )
            `)
            .eq('status', 'queued')
            .order('created_at', { ascending: true })

        if (data) setOrders(data as any)
        setLoading(false)
    }

    useEffect(() => {
        fetchOrders()

        // Subscribe to changes
        const channel = supabase
            .channel('home-active-tokens')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => fetchOrders()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    if (loading) return (
        <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-blue-600" />
        </div>
    )

    // Removed the null return so the widget is always visible
    // if (orders.length === 0) return null

    return (
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-blue-600 px-4 py-3 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Car size={18} /> Active Jobs
                </h3>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {orders.length}
                </span>
            </div>

            <div className="max-h-60 overflow-y-auto">
                {orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                        <Car size={32} className="opacity-20" />
                        <p className="text-sm">No active jobs right now</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <button
                            key={order.id}
                            onClick={() => setSelectedOrderId(order.id)}
                            className="w-full text-left border-b last:border-0 p-3 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 font-bold text-gray-700 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200">
                                    {order.token_id}
                                </div>
                                <div>
                                    <div className="flex flex-col">
                                        <p className="font-bold text-gray-800 text-sm leading-tight">
                                            {order.customer_name || 'Guest Customer'}
                                        </p>
                                        <p className="text-xs text-blue-600 font-medium mt-0.5">
                                            {order.plate_number ? `${order.plate_number} • ` : ''}{order.vehicle_types?.name}
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                        <Clock size={10} />
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500" />
                        </button>
                    ))
                )}
            </div>

            {selectedOrderId && (
                <TokenDetailsModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}
        </div>
    )
}
