'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Loader2 } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function ServiceMixChart() {
    const [data, setData] = useState<{ name: string; value: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchServiceMix()
    }, [])

    const fetchServiceMix = async () => {
        // Fetch all orders to see popularity
        const { data: orders } = await supabase
            .from('orders')
            .select(`
                service_id,
                services ( name )
            `)

        if (orders) {
            const counts: Record<string, number> = {}

            orders.forEach((order: any) => {
                const serviceName = order.services?.name || 'Unknown'
                counts[serviceName] = (counts[serviceName] || 0) + 1
            })

            const chartData = Object.keys(counts).map(key => ({
                name: key,
                value: counts[key]
            })).sort((a, b) => b.value - a.value) // Sort by popularity

            setData(chartData)
        }
        setLoading(false)
    }

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" /></div>

    if (data.length === 0) return <div className="text-center p-10 text-gray-400">No data available</div>

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Popular Services</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
