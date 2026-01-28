'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { Loader2, ReceiptText, CheckCircle, X, Banknote, MessageSquare } from 'lucide-react'

type OrderItem = Database['public']['Tables']['order_items']['Row']

interface PaymentModalProps {
    orderId: string
    vehicleName: string
    customerName: string
    plateNumber: string
    tokenId: number
    orderStatus: string // Add this
    onClose: () => void
    onPaymentSuccess: () => void
}

export default function PaymentModal({ orderId, vehicleName, customerName, plateNumber, orderStatus, tokenId, onClose, onPaymentSuccess }: PaymentModalProps) {
    const [items, setItems] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [status, setStatus] = useState(orderStatus) // Local status state
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

    const updateStatus = async (newStatus: string) => {
        setProcessing(true)
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)

        if (error) {
            alert('Error: ' + error.message)
        } else {
            setStatus(newStatus)
        }
        setProcessing(false)
    }

    const handleMarkAsReady = () => updateStatus('ready')
    const handleMarkAsWorking = () => updateStatus('working')

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
                    <ReceiptText size={48} className="mx-auto mb-2 opacity-80" />
                    <h2 className="text-2xl font-bold">Job Summary</h2>
                    <p className="opacity-90 font-medium">{customerName} • {plateNumber}</p>
                    <p className="opacity-75 text-sm mt-1">Token #{tokenId} • {vehicleName}</p>
                    <div className="mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${status === 'ready' ? 'bg-green-400 text-green-900 animate-pulse' : 'bg-blue-800 text-blue-200'}`}>
                            {status === 'ready' ? 'READY FOR PICKUP' : status}
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="py-10 text-center text-gray-400">Loading details...</div>
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
                                <span className="text-gray-500 font-bold">Total Due</span>
                                <span className="text-3xl font-black text-blue-900">₱{total.toFixed(2)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                {status === 'queued' && (
                                    <button
                                        onClick={handleMarkAsWorking}
                                        disabled={processing}
                                        className="col-span-2 bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors flex justify-center items-center"
                                    >
                                        <Loader2 className="mr-2" size={20} /> START WORKING
                                    </button>
                                )}

                                {status !== 'ready' && status !== 'queued' && (
                                    <button
                                        onClick={handleMarkAsReady}
                                        disabled={processing}
                                        className="col-span-2 bg-yellow-400 text-yellow-900 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors flex justify-center items-center"
                                    >
                                        <CheckCircle className="mr-2" size={20} /> MARK AS READY
                                    </button>
                                )}

                                <a
                                    href={`sms:?body=Hi! Your vehicle ${vehicleName} is ready at Jetz Carwash. Total due: P${total.toFixed(2)}. Thank you!`}
                                    className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-200 transition-colors"
                                >
                                    <MessageSquare size={20} /> Notify
                                </a>

                                <button
                                    onClick={handleMarkAsPaid}
                                    disabled={processing}
                                    className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all flex justify-center items-center"
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            <CheckCircle className="mr-2" /> Mark Paid
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
