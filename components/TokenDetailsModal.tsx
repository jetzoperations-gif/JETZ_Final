'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, CheckCircle, Clock, FileText, Printer } from 'lucide-react'

interface TokenDetailsModalProps {
    orderId: string
    onClose: () => void
}

export default function TokenDetailsModal({ orderId, onClose }: TokenDetailsModalProps) {
    const [order, setOrder] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch Order Details
            const { data: orderData } = await supabase
                .from('orders')
                .select(`
                    *,
                    vehicle_types ( name ),
                    services ( name )
                `)
                .eq('id', orderId)
                .single()

            if (orderData) {
                setOrder(orderData)
            }

            // 2. Fetch Order Items
            const { data: itemsData } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId)

            if (itemsData) {
                setItems(itemsData)
            }

            setLoading(false)
        }

        fetchData()
    }, [orderId])

    const totalAmount = items.reduce((sum, item) => sum + (item.price_snapshot * item.quantity), 0)

    if (loading) return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl animate-pulse">Loading details...</div>
        </div>
    )

    if (!order) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold">{order.customer_name || 'Guest'}</h2>
                            <span className="bg-blue-600 text-xs px-2 py-0.5 rounded text-white font-mono">#{order.token_id}</span>
                        </div>
                        <p className="text-slate-400 text-sm">
                            {order.plate_number ? <span className="font-mono bg-slate-800 px-1 rounded mr-2">{order.plate_number}</span> : ''}
                            {order.vehicle_types?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                            <Clock size={12} />
                            <span>{new Date(order.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">

                    {/* Status Badge */}
                    <div className="flex justify-between items-center mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-gray-500 font-bold text-sm">Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                            ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                        `}>
                            {order.status}
                        </span>
                    </div>

                    {/* Main Service */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Service Package</h3>
                        <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 block">{order.services?.name}</span>
                                    <span className="text-xs text-blue-600 font-medium">Standard Wash</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Minicafe Items */}
                    {items.filter((i: any) => i.item_type === 'inventory').length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Minicafe Order</h3>
                            <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
                                {items.filter((i: any) => i.item_type === 'inventory').map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{item.item_name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.category || 'Item'}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-700">₱{item.price_snapshot * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-200">
                        <span className="font-black text-xl text-gray-900">Total</span>
                        <span className="font-black text-xl text-blue-600">₱{totalAmount}</span>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 border-t flex gap-3">
                    <button
                        onClick={() => {
                            // Create a printable window or use a print-only CSS block
                            // Simplest approach: Add a hidden print section and use media queries
                            const printContent = document.getElementById('printable-receipt');
                            const originalContent = document.body.innerHTML;

                            if (printContent) {
                                // Proper way to print specific element without losing event listeners is harder in SPA
                                // Better way: Open new window
                                const win = window.open('', '', 'height=600,width=400');
                                if (win) {
                                    win.document.write('<html><head><title>Receipt</title>');
                                    win.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">'); // CDN for styling
                                    win.document.write('</head><body class="bg-white p-4">');
                                    win.document.write(printContent.innerHTML);
                                    win.document.write('</body></html>');
                                    win.document.close();
                                    win.focus();
                                    // wrapper to ensure styles loaded
                                    setTimeout(() => {
                                        win.print();
                                        win.close();
                                    }, 500);
                                }
                            }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 py-3 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <Printer size={18} /> Print
                    </button>

                    {/* Hidden Printable Receipt Template */}
                    <div id="printable-receipt" className="hidden">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold uppercase tracking-wider">Jetz Carwash</h1>
                            <p className="text-sm text-gray-500">Official Receipt</p>
                        </div>

                        <div className="mb-4 border-b pb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Date:</span>
                                <span className="font-bold">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">Token:</span>
                                <span className="font-bold">#{order.token_id}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">Vehicle:</span>
                                <span className="font-bold">{order.vehicle_types?.name}</span>
                            </div>
                            {order.plate_number && (
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-500">Plate:</span>
                                    <span className="font-bold uppercase">{order.plate_number}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 mb-4">
                            {/* Service */}
                            <div className="flex justify-between text-sm">
                                <span>{order.services?.name}</span>
                                <span className="font-bold">Service</span>
                            </div>

                            {/* Items */}
                            {items.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.item_name}</span>
                                    <span className="font-bold">₱{(item.price_snapshot * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed pt-4 flex justify-between items-center text-lg">
                            <span className="font-bold">TOTAL</span>
                            <span className="font-black">₱{totalAmount.toFixed(2)}</span>
                        </div>

                        <div className="mt-8 text-center text-xs text-gray-400">
                            <p>Thank you for choosing Jetz!</p>
                            <p>Please come again.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                        Close
                    </button>
                </div>

            </div>
        </div>
    )
}
