'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { Plus, Edit2, Trash2, Package, Sparkles } from 'lucide-react'
import ServiceModal from './ServiceModal'
import InventoryModal from './InventoryModal'

type Service = Database['public']['Tables']['services']['Row']
type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export default function MenuManagement() {
    const [services, setServices] = useState<Service[]>([])
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)

    // Modals State
    const [showServiceModal, setShowServiceModal] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)

    const [showInventoryModal, setShowInventoryModal] = useState(false)
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

    const fetchData = async () => {
        setLoading(true)
        const { data: servicesData } = await supabase.from('services').select('*').order('name')
        const { data: inventoryData } = await supabase.from('inventory_items').select('*').order('name')

        if (servicesData) setServices(servicesData)
        if (inventoryData) setInventory(inventoryData)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDeleteService = async (id: number) => {
        if (!confirm('Are you sure? This might affect existing orders if not handled carefully.')) return
        const { error } = await supabase.from('services').delete().eq('id', id)
        if (error) alert('Error deleting: ' + error.message)
        else fetchData()
    }

    const handleDeleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return
        const { error } = await supabase.from('inventory_items').delete().eq('id', id)
        if (error) alert('Error deleting: ' + error.message)
        else fetchData()
    }

    if (loading && services.length === 0) return <div className="p-10 text-center text-gray-500">Loading menu data...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Services Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="text-blue-500" /> Services
                        </h2>
                        <p className="text-sm text-gray-500">Manage car wash packages and services.</p>
                    </div>
                    <button
                        onClick={() => { setEditingService(null); setShowServiceModal(true) }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm"
                    >
                        <Plus size={18} /> Add Service
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                        <div key={service.id} className="p-5 border border-gray-200 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 transition-all group flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">ID: {service.id}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setEditingService(service); setShowServiceModal(true) }}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteService(service.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {services.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                            No services found. Add one to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Inventory Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Package className="text-orange-500" /> Cafe Inventory
                        </h2>
                        <p className="text-sm text-gray-500">Manage drinks, snacks, and car care products.</p>
                    </div>
                    <button
                        onClick={() => { setEditingItem(null); setShowInventoryModal(true) }}
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-bold text-sm"
                    >
                        <Plus size={18} /> Add Item
                    </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 font-bold text-gray-600 text-sm">Item Name</th>
                                <th className="p-4 font-bold text-gray-600 text-sm">Category</th>
                                <th className="p-4 font-bold text-gray-600 text-sm">Price</th>
                                <th className="p-4 font-bold text-gray-600 text-sm">Stock</th>
                                <th className="p-4 font-bold text-gray-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4 font-bold text-gray-800">{item.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                      ${item.category === 'Drinks' ? 'bg-blue-100 text-blue-800' :
                                                item.category === 'Snacks' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono font-medium text-gray-600">₱{item.price.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`font-bold ${item.stock_qty < 5 ? 'text-red-500' : 'text-gray-700'}`}>
                                            {item.stock_qty}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingItem(item); setShowInventoryModal(true) }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {inventory.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        No inventory items found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {showServiceModal && (
                <ServiceModal
                    service={editingService}
                    onClose={() => setShowServiceModal(false)}
                    onSuccess={fetchData}
                />
            )}

            {showInventoryModal && (
                <InventoryModal
                    item={editingItem}
                    onClose={() => setShowInventoryModal(false)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    )
}
