'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader2 } from 'lucide-react'

export default function RevenueChart() {
    const [data, setData] = useState<{ date: string; revenue: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRevenue()
    }, [])

    const fetchRevenue = async () => {
        const today = new Date()
        const last7Days = new Date(today)
        last7Days.setDate(today.getDate() - 6) // Go back 6 days

        const { data: orders } = await supabase
            .from('orders')
            .select('created_at, total_amount')
            .eq('status', 'paid')
            .gte('created_at', last7Days.toISOString())
            .order('created_at', { ascending: true })

        if (orders) {
            // Group by Date
            const grouped: Record<string, number> = {}

            // Initialize last 7 days with 0
            for (let i = 0; i < 7; i++) {
                const d = new Date(last7Days)
                d.setDate(last7Days.getDate() + i)
                const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                grouped[dateStr] = 0
            }

            orders.forEach(order => {
                const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                if (grouped[dateStr] !== undefined) {
                    grouped[dateStr] += order.total_amount || 0
                }
            })

            const chartData = Object.keys(grouped).map(key => ({
                date: key,
                revenue: grouped[key]
            }))

            setData(chartData)
        }
        setLoading(false)
    }

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" /></div>

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Weekly Revenue</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₱${value}`} />
                    <Tooltip
                        formatter={(value: number) => [`₱${(value || 0).toLocaleString()}`, 'Revenue']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
