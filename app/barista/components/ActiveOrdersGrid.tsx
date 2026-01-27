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
    onNewItem?: (orderId: string, tokenId: string | number) => void
}

export default function ActiveOrdersGrid({ onSelectOrder, onNewItem }: ActiveOrdersGridProps) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [highlightedOrders, setHighlightedOrders] = useState<string[]>([])
    const [badges, setBadges] = useState<{ [orderId: string]: number }>({})

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

    // Handler to clear badge on select
    const handleSelect = (order: Order) => {
        setBadges(prev => {
            const newBadges = { ...prev }
            delete newBadges[order.id]
            return newBadges
        })
        onSelectOrder(order)
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
                () => fetchOrders()
            )
            // Listen for ORDERS UPDATES (Triggered by Menu Order)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                async (payload) => {
                    const updatedOrderId = payload.new.id
                    let tokenNum = payload.new.token_id

                    // 1. Highlight Card (Bounce Effect only)
                    setHighlightedOrders(prev => [...prev, updatedOrderId])

                    // Note: We REMOVED the setBadges increment here to avoid Double Counting.
                    // The 'INSERT' on order_items below will handle the Badge increment + 'New Update' badge.
                    // This listener now just ensures the card visual 'bounce' and data refresh happens.

                    // 3. Trigger Global Notification (Optional here if items handle it, but maybe safer to keep for non-item updates? 
                    // Actually, if we want to avoid double global alerts too, we might want to restrict this.
                    // But for now, the user complaint was specifically about the "Square Box" (Card) havng '2'.
                    // So removing setBadges here solves that specific UI issue.

                    // Trigger Callbacks
                    if (!tokenNum) {
                        const { data } = await supabase.from('orders').select('token_id').eq('id', updatedOrderId).single()
                        if (data) tokenNum = data.token_id
                    }

                    // We only call onNewItem if we want the bell to ring? 
                    // Let's comment this out too to avoid double Bell rings if the Item Insert handles it.
                    // if (onNewItem && tokenNum) onNewItem(updatedOrderId, tokenNum)

                    setTimeout(() => {
                        setHighlightedOrders(prev => prev.filter(id => id !== updatedOrderId))
                    }, 10000)
                }
            )
            // Listen for NEW ITEMS (Digital Menu Orders)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'order_items' },
                async (payload) => {
                    const newOrderId = payload.new.order_id

                    // Highlight Card
                    setHighlightedOrders(prev => [...prev, newOrderId])
                    setBadges(prev => ({
                        ...prev,
                        [newOrderId]: (prev[newOrderId] || 0) + 1
                    }))

                    // Fetch Token ID reliably from DB (Decoupled from local state)
                    const { data } = await supabase
                        .from('orders')
                        .select('token_id')
                        .eq('id', newOrderId)
                        .single()

                    if (data && onNewItem) {
                        onNewItem(newOrderId, data.token_id)
                    }

                    setTimeout(() => {
                        setHighlightedOrders(prev => prev.filter(id => id !== newOrderId))
                    }, 10000)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, []) // Stable subscription, no dependencies

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
                    onClick={() => handleSelect(order)}
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

                    {/* RED NOTIFICATION BADGE on the Card */}
                    {badges[order.id] > 0 && (
                        <>
                            <div className="absolute top-2 right-2 animate-bounce bg-red-600 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full z-10 shadow-md border-2 border-white">
                                {badges[order.id]}
                            </div>
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-sm z-20 animate-pulse border border-amber-200 uppercase tracking-wider">
                                New Update!
                            </div>
                        </>
                    )}

                    {/* Bounce Effect for "Just Updated" */}
                    {highlightedOrders.includes(order.id) && (
                        <div className="absolute inset-0 border-2 border-blue-400 rounded-xl animate-pulse pointer-events-none"></div>
                    )}

                    {order.washer_name && (
                        <p className="text-xs text-gray-400 mt-1">Washer: {order.washer_name}</p>
                    )}
                </button>
            ))}
        </div>
    )
}
