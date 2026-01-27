'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { X, Plus, Coffee, Cookie, FileText } from 'lucide-react'
import TokenDetailsModal from '@/components/TokenDetailsModal'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface ConsumablesModalProps {
    orderId: string
    vehicleName: string
    tokenId: number
    onClose: () => void
}

export default function ConsumablesModal({ orderId, vehicleName, tokenId, onClose }: ConsumablesModalProps) {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [activeTab, setActiveTab] = useState<'Drinks' | 'Snacks'>('Drinks')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState('')
    const [showDetails, setShowDetails] = useState(false)

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(''), 2000)
    }

    const [orderItems, setOrderItems] = useState<{ id: string, item_name: string, price_snapshot: number, quantity: number }[]>([])

    const [serviceName, setServiceName] = useState('Loading...')

    // Fetch Inventory and Current Order Items
    useEffect(() => {
        // 1. Inventory
        supabase
            .from('inventory_items')
            .select('*')
            .order('name')
            .then(({ data }) => {
                if (data) setItems(data)
            })

        // 2. Existing Order Items
        fetchOrderItems()

        // 3. Fetch Service Name associated with this Order
        const fetchService = async () => {
            const { data } = await supabase
                .from('orders')
                .select(`
                    service_id,
                    services ( name )
                `)
                .eq('id', orderId)
                .single()

            if (data && data.services) {
                // @ts-ignore
                setServiceName(data.services.name)
            } else {
                setServiceName('No Service')
            }
        }
        fetchService()
    }, [orderId])

    const fetchOrderItems = async () => {
        const { data } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)
            .order('item_name')

        if (data) setOrderItems(data)
    }

    const handleRemoveItem = async (itemId: string, itemName: string) => {
        if (!confirm(`Remove ${itemName} from this order?`)) return

        const { error } = await supabase
            .from('order_items')
            .delete()
            .eq('id', itemId)

        if (error) {
            alert('Error removing item')
        } else {
            showToast(`Removed: ${itemName}`)
            fetchOrderItems() // Refresh list
        }
    }

    const handleAddItem = async (item: InventoryItem) => {
        setLoading(true)

        // Add to order_items
        const { error } = await supabase
            .from('order_items')
            .insert({
                order_id: orderId,
                item_type: 'inventory',
                item_id: item.id,
                item_name: item.name,
                price_snapshot: item.price,
                quantity: 1
            })

        if (error) {
            alert('Error adding item: ' + error.message)
        } else {
            showToast(`Logged: ${item.name}`)
            fetchOrderItems() // Refresh list to show new item
        }
        setLoading(false)
    }

    const filteredItems = items.filter(i => i.category === activeTab)

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Manage Order</h2>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 font-bold">Token #{tokenId} • {vehicleName}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
                                    Package: {serviceName}
                                </span>
                                <button
                                    onClick={() => setShowDetails(true)}
                                    className="text-xs flex items-center gap-1 bg-white border border-gray-300 px-2 py-0.5 rounded shadow-sm hover:bg-gray-100 transition-colors text-gray-700 font-bold"
                                >
                                    <FileText size={12} /> View Details
                                </button>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* Nested Details Modal */}
                {showDetails && (
                    <TokenDetailsModal
                        orderId={orderId}
                        onClose={() => setShowDetails(false)}
                    />
                )}

                {/* Current Order List (New Section) */}
                <div className="bg-blue-50 p-4 border-b max-h-40 overflow-y-auto">
                    <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">Current Consumables</h3>
                    {orderItems.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No items logged yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {orderItems.map(oi => (
                                <div key={oi.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                    <span className="text-sm font-medium text-gray-800">{oi.item_name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-gray-500">₱{oi.price_snapshot}</span>
                                        <button
                                            onClick={() => handleRemoveItem(oi.id, oi.item_name)}
                                            className="text-red-500 hover:text-red-700 text-xs font-bold hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-gray-50 border-b">
                    <button
                        onClick={() => setActiveTab('Drinks')}
                        className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors
                    ${activeTab === 'Drinks' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}
                `}
                    >
                        <Coffee size={18} /> Drinks
                    </button>
                    <button
                        onClick={() => setActiveTab('Snacks')}
                        className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors
                    ${activeTab === 'Snacks' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}
                `}
                    >
                        <Cookie size={18} /> Snacks
                    </button>
                </div>

                {/* Item Grid (Add New) */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredItems.map((item) => (
                            <button
                                key={item.id}
                                disabled={loading}
                                onClick={() => handleAddItem(item)}
                                className="flex flex-col items-center p-4 border rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 h-full justify-between"
                            >
                                <span className="font-bold text-gray-800 text-center mb-1 text-sm">{item.name}</span>
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">₱{item.price}</span>
                                    <div className="p-1 bg-blue-100 text-blue-600 rounded-full w-full flex justify-center">
                                        <Plus size={16} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 rounded-b-xl text-center">
                    <div className="flex justify-between items-center w-full">
                        <p className="text-xs text-gray-500 text-left">Tap item to log.</p>
                        <button
                            onClick={onClose}
                            className="bg-blue-600 text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Done / Back to Board
                        </button>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-5 z-50">
                    <span className="font-bold text-sm flex items-center gap-2">
                        ✅ {toast}
                    </span>
                </div>
            )}
        </div>
    )
}
