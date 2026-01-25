'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { Loader2, Receipt, CheckCircle, X } from 'lucide-react'

type OrderItem = Database['public']['Tables']['order_items']['Row']

interface PaymentModalProps {
    orderId: string
    vehicleName: string
    tokenId: number
    onClose: () => void
    onPaymentSuccess: () => void
}

export default function PaymentModal({ orderId, vehicleName, tokenId, onClose, onPaymentSuccess }: PaymentModalProps) {
    const [items, setItems] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const fetchDetails = async () => {
            const { data } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId)

            if (data) {
                setItems(data)
                const sum = data.reduce((acc, item) => acc + (item.price_snapshot * item.quantity), 0)
                setTotal(sum)
            }
            setLoading(false)
        }
        fetchDetails()
    }, [orderId])

    const handleMarkAsPaid = async () => {
        setProcessing(true)

        // 1. Update Order Status
        const { error: orderError } = await supabase
            .from('orders')
            .update({ status: 'paid', total_amount: total }) // Ensure final total is saved
            .eq('id', orderId)

        if (orderError) {
            alert('Error updating order: ' + orderError.message)
            setProcessing(false)
            return
        }

        // 2. Free up the Token
        const { error: tokenError } = await supabase
            .from('tokens')
            .update({ status: 'available', current_job_id: null })
            .eq('id', tokenId)

        if (tokenError) {
            alert('Payment recorded but error freeing token: ' + tokenError.message)
        }

        onPaymentSuccess()
        // No need to setProcessing(false) as we are closing/redirecting
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">

                <div className="bg-blue-600 p-6 text-white text-center relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-blue-200 hover:text-white">
                        <X size={24} />
                    </button>
                    <Receipt size={48} className="mx-auto mb-2 opacity-80" />
                    <h2 className="text-2xl font-bold">Final Bill</h2>
                    <p className="opacity-90">Token #{tokenId} • {vehicleName}</p>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="py-10 text-center text-gray-400">Loading bill...</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                        <div>
                                            <span className="font-semibold text-gray-800">{item.item_name}</span>
                                            <div className="text-xs text-gray-500 capitalize">{item.item_type}</div>
                                        </div>
                                        <span className="font-mono text-gray-700">₱{item.price_snapshot.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-4 flex justify-between items-end">
                                <span className="text-gray-500 font-bold">Total Amount</span>
                                <span className="text-3xl font-black text-blue-900">₱{total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleMarkAsPaid}
                                disabled={processing}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all flex justify-center items-center mt-6"
                            >
                                {processing ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <CheckCircle className="mr-2" /> Mark as Paid
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
