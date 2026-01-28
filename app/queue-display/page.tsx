'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Types for our local state
interface DisplayOrder {
    id: string
    plate_number: string
    status: string
    vehicle_type_id: number | null
    service_id: number | null
    // We will populate these names from lookups
    vehicle_name?: string
    service_name?: string
}

export default function QueueDisplayPage() {
    const [orders, setOrders] = useState<DisplayOrder[]>([])
    const [services, setServices] = useState<Record<number, string>>({})
    const [types, setTypes] = useState<Record<number, string>>({})
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        // Clock
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        fetchMetadata().then(() => {
            fetchOrders()
            subscribeToOrders()
        })
    }, [])

    const fetchMetadata = async () => {
        const { data: sData } = await supabase.from('services').select('id, name')
        const { data: tData } = await supabase.from('vehicle_types').select('id, name')

        const sMap: Record<number, string> = {}
        sData?.forEach((s: any) => (sMap[s.id] = s.name))
        setServices(sMap)

        const tMap: Record<number, string> = {}
        tData?.forEach((t: any) => (tMap[t.id] = t.name))
        setTypes(tMap)
    }

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .neq('status', 'completed')
            .neq('status', 'cancelled')
            .neq('status', 'paid')
            .order('created_at', { ascending: true })

        if (data) {
            setOrders(data)
        }
    }

    const subscribeToOrders = () => {
        const channel = supabase
            .channel('queue-display')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setOrders((prev) => [...prev, payload.new as DisplayOrder])
                    } else if (payload.eventType === 'UPDATE') {
                        setOrders((prev) =>
                            prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
                                .filter(o => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'paid') // Remove if moved to completed/paid
                        )
                        // If status became completed/paid, we need to remove it?
                        // The filter above handles modifications that change status to hidden ones.
                        // However, if we just updated a row to 'completed', payload.new has 'completed'.
                        // Re-fetching might be cleaner but this works for simple updates.
                        const newRec = payload.new as DisplayOrder
                        if (['completed', 'cancelled', 'paid'].includes(newRec.status)) {
                            setOrders(prev => prev.filter(o => o.id !== newRec.id))
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setOrders((prev) => prev.filter((o) => o.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    // Helper for Status Colors and Animation
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'queued': return 'text-gray-400'
            case 'washing': return 'text-blue-400'
            case 'drying':
            case 'detailing': return 'text-orange-400'
            case 'ready': return 'text-green-500 animate-pulse font-bold' // Blinking green
            default: return 'text-white'
        }
    }

    const getStatusText = (status: string) => {
        if (status === 'ready') return 'READY'
        return status.toUpperCase()
    }

    return (
        <div className="bg-black min-h-screen text-white p-4 font-mono overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-end border-b-4 border-yellow-500 pb-4 mb-4">
                <div>
                    <h1 className="text-6xl font-black tracking-widest text-yellow-500 uppercase">Departures</h1>
                    <p className="text-xl text-gray-400 mt-2">JETZ OPS MONITOR</p>
                </div>
                <div className="text-right">
                    <p className="text-5xl font-bold text-yellow-500">
                        {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xl text-gray-500">{currentTime.toDateString()}</p>
                </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 text-2xl text-gray-500 border-b border-gray-800 pb-2 mb-4 uppercase tracking-widest px-4">
                <div>Plate No.</div>
                <div>Vehicle</div>
                <div>Service</div>
                <div>Status</div>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-auto space-y-2">
                {orders.length === 0 ? (
                    <div className="text-center text-4xl text-gray-700 py-20 uppercase tracking-widest animate-pulse">
                        Waiting for orders...
                    </div>
                ) : (
                    orders.map((order) => (
                        <div
                            key={order.id}
                            className="grid grid-cols-4 gap-4 text-4xl bg-gray-900 bg-opacity-50 p-6 rounded-lg border border-gray-800 shadow-lg items-center uppercase tracking-wider relative overflow-hidden"
                            style={{ fontFamily: '"Courier New", Courier, monospace' }}
                        >
                            {/* Mechanical Board scanline effect logic could go here later */}

                            <div className="font-bold text-white tracking-widest">
                                {order.plate_number || '---'}
                            </div>
                            <div className="text-yellow-100 truncate">
                                {types[order.vehicle_type_id!] || 'Unknown'}
                            </div>
                            <div className="text-yellow-100 truncate text-3xl">
                                {services[order.service_id!] || 'Standard'}
                            </div>
                            <div className={`${getStatusStyle(order.status)} font-black text-shadow-glow`}>
                                {getStatusText(order.status)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="text-center py-4 text-gray-600 text-sm border-t border-gray-800 mt-4">
                JETZ CARWASH SYSTEMS • REAL-TIME TRACKER
            </div>
        </div>
    )
}
