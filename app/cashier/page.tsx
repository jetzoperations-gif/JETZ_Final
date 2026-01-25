'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { ExternalLink, CreditCard } from 'lucide-react'
import PaymentModal from './components/PaymentModal'

type Order = Database['public']['Tables']['orders']['Row'] & {
    vehicle_types: { name: string } | null
}

export default function CashierPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchOrders = async () => {
        // Cashier sees everything that is NOT 'paid' or 'cancelled'
        // Usually 'queued' or 'completed' (if we had a completion step)
        const { data } = await supabase
            .from('orders')
            .select(`
        *,
        vehicle_types ( name )
      `)
            .in('status', ['queued', 'completed']) // Adjust based on your workflow
            .order('created_at', { ascending: true })

        if (data) setOrders(data as any)
        setLoading(false)
    }

    useEffect(() => {
        fetchOrders()
        const channel = supabase.channel('cashier-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [])

    const handlePaymentSuccess = () => {
        setSelectedOrder(null)
        fetchOrders() // Refresh list immediately
    }

    return (
        <MainLayout title="Cashier Station" role="cashier">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Payments</h2>

                {loading ? (
                    <div className="text-center p-10 text-gray-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <CreditCard size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500">No pending payments.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orders.map((order) => (
                            <button
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all text-left flex justify-between items-center group"
                            >
                                <div>
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                                        Token #{order.token_id}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {order.vehicle_types?.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-full text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <ExternalLink size={24} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {selectedOrder && (
                    <PaymentModal
                        orderId={selectedOrder.id}
                        tokenId={selectedOrder.token_id || 0}
                        vehicleName={selectedOrder.vehicle_types?.name || 'Vehicle'}
                        onClose={() => setSelectedOrder(null)}
                        onPaymentSuccess={handlePaymentSuccess}
                    />
                )}
            </div>
        </MainLayout>
    )
}
