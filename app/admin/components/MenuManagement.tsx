'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Service = Database['public']['Tables']['services']['Row']
type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export default function MenuManagement() {
    const [services, setServices] = useState<Service[]>([])
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const { data: servicesData } = await supabase.from('services').select('*').order('name')
            const { data: inventoryData } = await supabase.from('inventory_items').select('*').order('name')

            if (servicesData) setServices(servicesData)
            if (inventoryData) setInventory(inventoryData)
            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) return <div className="p-4">Loading menu data...</div>

    return (
        <div className="space-y-8">
            {/* Services Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {services.map((service) => (
                        <div key={service.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                            {/* Future: Show prices per vehicle type here */}
                        </div>
                    ))}
                </div>
            </div>

            {/* Inventory Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">Cafe Inventory</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-200">
                                <th className="p-3 font-bold text-gray-700">Item Name</th>
                                <th className="p-3 font-bold text-gray-700">Category</th>
                                <th className="p-3 font-bold text-gray-700">Price</th>
                                <th className="p-3 font-bold text-gray-700">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-semibold text-gray-900">{item.name}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold
                      ${item.category === 'Drinks' ? 'bg-blue-100 text-blue-800' :
                                                item.category === 'Snacks' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-3 font-medium text-gray-700">₱{item.price}</td>
                                    <td className="p-3 font-medium text-gray-700">{item.stock_qty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
