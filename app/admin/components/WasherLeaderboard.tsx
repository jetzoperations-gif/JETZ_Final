'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Trophy, Medal, Award } from 'lucide-react'

interface WasherStats {
    name: string
    count: number
    total_revenue: number
}

export default function WasherLeaderboard() {
    const [stats, setStats] = useState<WasherStats[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            const now = new Date()
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

            // Fetch completed/paid orders this month
            // Note: Grouping usually done via RPC or client-side aggregation if small scale.
            // For MVP, client-side aggregation is fine.
            const { data } = await supabase
                .from('orders')
                .select('washer_name, total_amount')
                .in('status', ['paid', 'completed']) // Assuming completed counts too? Or just paid? usually 'paid' implies finished job.
                // .gte('created_at', firstDay) // disabling date filter for demo data visibility if needed, but per req "current month"
                .gte('created_at', firstDay)

            if (data) {
                const map: Record<string, WasherStats> = {}

                data.forEach(order => {
                    const name = order.washer_name || 'Unassigned'
                    if (!map[name]) map[name] = { name, count: 0, total_revenue: 0 }
                    map[name].count += 1
                    map[name].total_revenue += (order.total_amount || 0)
                })

                // Convert to array and sort
                const sorted = Object.values(map).sort((a, b) => b.total_revenue - a.total_revenue)
                setStats(sorted)
            }
            setLoading(false)
        }

        fetchStats()
    }, [])

    if (loading) return <div className="p-4 text-center text-gray-400">Loading Leaderboard...</div>

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Top Washers (This Month)
            </h3>

            <div className="space-y-4">
                {stats.length === 0 ? (
                    <p className="text-gray-400 text-sm">No data yet.</p>
                ) : (
                    stats.map((stat, idx) => (
                        <div key={stat.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`font-bold w-6 text-center ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-gray-300'}`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{stat.name}</div>
                                    <div className="text-xs text-gray-500">{stat.count} vehicles</div>
                                </div>
                            </div>
                            <div className="font-mono font-bold text-blue-600">
                                ₱{stat.total_revenue.toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
