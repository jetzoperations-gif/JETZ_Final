import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { Loader2, ReceiptText, CheckCircle, X, Banknote, MessageSquare, Share2, MessageCircle, Phone, Copy } from 'lucide-react'

type OrderItem = Database['public']['Tables']['order_items']['Row']

interface PaymentModalProps {
    orderId: string
    vehicleName: string
    customerName: string
    customerPhone?: string
    plateNumber: string
    tokenId: number
    orderStatus: string
    onClose: () => void
    onPaymentSuccess: () => void
}

export default function PaymentModal({ orderId, vehicleName, customerName, customerPhone, plateNumber, orderStatus, tokenId, onClose, onPaymentSuccess }: PaymentModalProps) {
    const [items, setItems] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [status, setStatus] = useState(orderStatus)
    const [total, setTotal] = useState(0)

    const [showNotifyModal, setShowNotifyModal] = useState(false)
    const [notifyNumber, setNotifyNumber] = useState('')

    // Staff & Commission State
    const [washers, setWashers] = useState<{ id: string, name: string }[]>([])
    const [selectedWasher, setSelectedWasher] = useState('')
    const [commission, setCommission] = useState(0)

    useEffect(() => {
        // Initialize notify number
        if (customerPhone) setNotifyNumber(customerPhone)

        // Fetch Washers
        const fetchWashers = async () => {
            const { data } = await supabase.from('staff').select('id, name').eq('active', true).order('name')
            if (data) setWashers(data)
        }
        fetchWashers()
    }, [customerPhone])

    useEffect(() => {
        const fetchDetails = async () => {
            const { data } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId)

            let serviceTotal = 0
            let itemsTotal = 0

            if (data) {
                setItems(data)
                itemsTotal = data.reduce((acc, item) => {
                    const lineTotal = item.price_snapshot * item.quantity
                    // Assume 'services' or items without type are eligible for commission
                    // or strictly 'service' type. Let's be strict if possible, or fallback.
                    if (item.item_type === 'service') {
                        serviceTotal += lineTotal
                    }
                    return acc + lineTotal
                }, 0)

                // If serviceTotal is still 0 but we have a total, maybe check if we failed to tag item types
                // Fallback: If NO service items found but we have items, maybe it's legacy data. 
                // Let's assume Commission is 35% of Total if ServiceTotal is 0? 
                // No, safer to just use serviceTotal.

                setTotal(itemsTotal)
                setCommission(serviceTotal * 0.35)
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
        if (!selectedWasher) {
            alert('Please select a Washer first.')
            return
        }
        setProcessing(true)

        // 1. Update Order Status + Washer + Commission
        const { error: orderError } = await supabase
            .from('orders')
            .update({
                status: 'paid',
                total_amount: total,
                washer_name: selectedWasher, // Saving the Name for simple history
                commission_amount: commission,
                is_verified: true
            })
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
    }

    const handleNotify = (platform: 'sms' | 'whatsapp' | 'viber' | 'copy') => {
        if (!notifyNumber && platform !== 'copy') {
            const num = prompt('Enter Customer Mobile Number:', '')
            if (!num) return
            setNotifyNumber(num)
        }

        let targetNum = notifyNumber

        const message = `High Jetz Carwash: Hi ${customerName}! Your vehicle (${vehicleName} - ${plateNumber}) is READY for pickup. Total Due: P${total.toFixed(2)}. Thank you!`
        const encodedMsg = encodeURIComponent(message)

        let intlNum = (targetNum || '').replace(/\D/g, '')
        if (intlNum.startsWith('0')) intlNum = '63' + intlNum.substring(1)

        switch (platform) {
            case 'sms':
                window.location.href = `sms:${targetNum}?body=${encodedMsg}`
                break
            case 'whatsapp':
                window.open(`https://wa.me/${intlNum}?text=${encodedMsg}`, '_blank')
                break
            case 'viber':
                window.open(`viber://forward?text=${encodedMsg}`, '_blank')
                break
            case 'copy':
                navigator.clipboard.writeText(message)
                alert('Message copied!')
                break
        }
        setShowNotifyModal(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">

                <div className="bg-blue-600 p-6 text-white text-center relative shrink-0">
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

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="py-10 text-center text-gray-400">Loading details...</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-3 pr-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                        <div>
                                            <span className="font-semibold text-gray-800">{item.item_name}</span>
                                            <div className="text-xs text-gray-500 capitalize">{item.item_type}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-gray-700">₱{(item.price_snapshot * item.quantity).toFixed(2)}</div>
                                            {item.item_type === 'service' && <div className="text-[10px] text-green-600 font-bold">Com: ₱{(item.price_snapshot * item.quantity * 0.35).toFixed(2)}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-4 flex justify-between items-end">
                                <span className="text-gray-500 font-bold">Total Due</span>
                                <span className="text-3xl font-black text-blue-900">₱{total.toFixed(2)}</span>
                            </div>

                            {/* WASHER SELECTION */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Assign Washer (Required)</label>
                                <select
                                    value={selectedWasher}
                                    onChange={e => setSelectedWasher(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">-- Who washed this? --</option>
                                    {washers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                </select>
                                {selectedWasher && commission > 0 && (
                                    <div className="mt-2 text-xs text-green-600 font-bold flex justify-between bg-green-50 p-2 rounded">
                                        <span>Washer Share (35%):</span>
                                        <span>₱{commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
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

                                <button
                                    onClick={() => setShowNotifyModal(true)}
                                    className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-200 transition-colors"
                                >
                                    <MessageSquare size={20} /> Notify
                                </button>

                                <button
                                    onClick={handleMarkAsPaid}
                                    disabled={processing}
                                    className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Notify Modal Overlay */}
                {showNotifyModal && (
                    <div className="absolute inset-0 bg-white z-50 p-6 animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Notify Customer</h3>
                            <button onClick={() => setShowNotifyModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Customer Mobile Number</label>
                                <input
                                    type="tel"
                                    value={notifyNumber}
                                    onChange={(e) => setNotifyNumber(e.target.value)}
                                    placeholder="0912 345 6789"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-lg bg-white text-black placeholder:text-gray-400 force-visible-input"
                                />
                                <p className="text-xs text-gray-500 mt-1">If empty, ask customer for number.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button onClick={() => handleNotify('sms')} className="flex items-center justify-center gap-3 w-full bg-blue-500 text-white py-3 rounded-lg font-bold">
                                    <MessageSquare size={20} /> Send SMS
                                </button>
                                <button onClick={() => handleNotify('whatsapp')} className="flex items-center justify-center gap-3 w-full bg-green-600 text-white py-3 rounded-lg font-bold">
                                    <MessageCircle size={20} /> Send WhatsApp
                                </button>
                                <button onClick={() => handleNotify('viber')} className="flex items-center justify-center gap-3 w-full bg-[#7360f2] text-white py-3 rounded-lg font-bold">
                                    <Phone size={20} /> Send Viber
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
