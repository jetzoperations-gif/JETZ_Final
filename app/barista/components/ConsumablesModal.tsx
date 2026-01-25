'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { X, Plus, Coffee, Cookie } from 'lucide-react'

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

    // Fetch Inventory and Current Order Items
    useEffect(() => {
        supabase
            .from('inventory_items')
            .select('*')
            .order('name')
            .then(({ data }) => {
                if (data) setItems(data)
            })
    }, [])

    const filteredItems = items.filter(i => i.category === activeTab)

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
            // Optional: Show a toast or small feedback
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Log Consumables</h2>
                        <p className="text-sm text-gray-500">Token #{tokenId} • {vehicleName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                        <X size={24} />
                    </button>
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

                {/* Item Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredItems.map((item) => (
                            <button
                                key={item.id}
                                disabled={loading}
                                onClick={() => handleAddItem(item)}
                                className="flex flex-col items-center p-4 border rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <span className="font-bold text-gray-800 text-center mb-1">{item.name}</span>
                                <span className="text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">₱{item.price}</span>
                                <div className="mt-3 p-1 bg-blue-100 text-blue-600 rounded-full">
                                    <Plus size={16} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 rounded-b-xl text-center">
                    <p className="text-xs text-gray-500">Tap an item to instantly log it to this job.</p>
                </div>
            </div>
        </div>
    )
}
