'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Download } from 'lucide-react'

export default function SalesReports() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSales = async () => {
            const { data } = await supabase
                .from('orders')
                .select(`
                    *,
                    services ( name ),
                    vehicle_types ( name )
                `)
                .eq('status', 'paid')
                .order('updated_at', { ascending: false })

            if (data) setOrders(data)
            setLoading(false)
        }
        fetchSales()
    }, [])

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-bold uppercase">Total Revenue</p>
                    <p className="text-3xl font-black text-green-600 mt-2">₱{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-bold uppercase">Total Jobs</p>
                    <p className="text-3xl font-black text-blue-600 mt-2">{orders.length}</p>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-800">Transaction History</h2>
                    <button className="text-xs flex items-center gap-1 bg-white border px-3 py-1 rounded hover:bg-gray-50 cursor-not-allowed opacity-50">
                        <Download size={14} /> Export CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Service</th>
                                <th className="px-6 py-3">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading history...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No completed transactions yet.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()} <span className="text-xs">{new Date(order.created_at).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{order.customer_name || 'Guest'}</div>
                                            <div className="text-xs text-gray-500">{order.vehicle_types?.name} • <span className="font-mono bg-gray-100 px-1 rounded">{order.plate_number || 'N/A'}</span></div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {order.services?.name}
                                        </td>
                                        <td className="px-6 py-4 font-black text-green-600">
                                            ₱{order.total_amount?.toFixed(2) || '0.00'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
