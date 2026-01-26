'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { Car, Clock } from 'lucide-react'

type Order = Database['public']['Tables']['orders']['Row'] & {
    vehicle_types: { name: string } | null
}

interface ActiveOrdersGridProps {
    onSelectOrder: (order: Order) => void
}

export default function ActiveOrdersGrid({ onSelectOrder }: ActiveOrdersGridProps) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [highlightedOrders, setHighlightedOrders] = useState<string[]>([])

    const fetchOrders = async () => {
        // Fetch orders that are currently "in progress" (queued)
        // We join vehicle_types to get the name (Sedan, SUV, etc.)
        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        vehicle_types ( name )
      `)
            .eq('status', 'queued')
            .order('created_at', { ascending: true })

        if (data) setOrders(data as any) // Type casting due to complex join
        setLoading(false)
    }

    useEffect(() => {
        fetchOrders()

        // Realtime subscription to new orders or status changes
        const channel = supabase
            .channel('barista-orders')
            // Listen for NEW ORDERS (Car Wash Jobs)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    fetchOrders()
                }
            )
            // Listen for NEW ITEMS (Digital Menu Orders)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'order_items' },
                (payload) => {
                    // payload.new has order_id. We should highlight that card.
                    const newOrderId = payload.new.order_id
                    setHighlightedOrders(prev => [...prev, newOrderId])

                    // Remove highlight after 10 seconds
                    setTimeout(() => {
                        setHighlightedOrders(prev => prev.filter(id => id !== newOrderId))
                    }, 10000)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    if (loading) return <div className="text-center p-10 text-gray-500">Loading active jobs...</div>

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <Car size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No active cars in the bay</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
            {orders.map((order) => (
                <button
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="relative flex flex-col items-start p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-400 transition-all text-left group"
                >
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                        Token #{order.token_id}
                    </div>

                    <div className="mb-3 p-3 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Car size={24} />
                    </div>

                    <h3 className="font-bold text-gray-800 text-lg">
                        {order.vehicle_types?.name || 'Unknown Vehicle'}
                    </h3>

                    <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Clock size={12} className="mr-1" />
                        <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Notification Badge Logic would go here - for now, simpler to just show visual cue if it was updated recently, 
                        but effectively the Grid auto-updates, so the Barista just sees the Token appear or stay there. 
                        To make it "Flash", we'd need to track "last updated". 
                        For this iteration, let's add a "New Item" indicator if we catch an INSERT event for this order.
                    */}
                    {/* We can use local state to track "highlighted" orders from the subscription */}
                    {highlightedOrders.includes(order.id) && (
                        <div className="absolute top-2 right-2 animate-bounce bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                            New Item! ☕
                        </div>
                    )}

                    {order.washer_name && (
                        <p className="text-xs text-gray-400 mt-1">Washer: {order.washer_name}</p>
                    )}
                </button>
            ))}
        </div>
    )
}
