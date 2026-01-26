'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import ActiveOrdersGrid from './components/ActiveOrdersGrid'
import ConsumablesModal from './components/ConsumablesModal'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Order = Database['public']['Tables']['orders']['Row'] & {
    vehicle_types: { name: string } | null
}

export default function BaristaPage() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [notifications, setNotifications] = useState<{ id: string, orderId: string, time: Date }[]>([])
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(false)

    // Valid external URL
    const dingSound = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'

    const enableSound = () => {
        const audio = new Audio(dingSound)
        audio.play().then(() => {
            setSoundEnabled(true)
        }).catch(e => {
            console.error("Enable sound failed", e)
            alert(`Error: ${e.name} - ${e.message}\n\nPlease check Site Settings > Sound > Allow.`)
        })
    }

    // Load form local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('barista_notifications')
        if (saved) {
            try {
                // Parse dates back to Date objects
                const parsed = JSON.parse(saved).map((n: any) => ({
                    ...n,
                    time: new Date(n.time)
                }))
                setNotifications(parsed)
            } catch (e) {
                console.error('Failed to parse notifications', e)
            }
        }
    }, [])

    // Save to local storage whenever changed
    useEffect(() => {
        localStorage.setItem('barista_notifications', JSON.stringify(notifications))
    }, [notifications])

    const handleNewNotification = (orderId: string) => {
        // Add to list
        setNotifications(prev => {
            const newVal = [{
                id: Math.random().toString(),
                orderId,
                time: new Date()
            }, ...prev]
            return newVal
        })

        // Play Sound
        if (soundEnabled) {
            const audio = new Audio(dingSound)
            audio.play().catch(e => console.log('Audio play failed', e))
        }
    }

    const handleNotificationClick = async (notif: { id: string, orderId: string }) => {
        // 1. Fetch the fresh order details
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                vehicle_types ( name )
            `)
            .eq('id', notif.orderId)
            .single()

        if (data) {
            // 2. Open Modal
            // @ts-ignore
            setSelectedOrder(data)

            // 3. Remove from list (Mark as read)
            setNotifications(prev => prev.filter(n => n.id !== notif.id))
            setIsNotifOpen(false)
        } else {
            alert('Order not found or completed.')
            setNotifications(prev => prev.filter(n => n.id !== notif.id))
        }
    }

    return (
        <MainLayout title="Cafe & Sales Log" role="staff">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Operations Board</h2>
                            <p className="text-gray-500">Tap a job to log consumables.</p>
                        </div>

                        {/* Notification Bell Area */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="bg-white p-3 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors relative"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>

                                {notifications.length > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">
                                        {notifications.length}
                                    </div>
                                )}
                            </button>

                            {/* Dropdown */}
                            {isNotifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                                        <h3 className="font-bold text-gray-700">Notifications</h3>
                                        <button onClick={() => setNotifications([])} className="text-xs text-blue-600 hover:underline">Clear All</button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 text-sm">
                                                No new alerts
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <button
                                                    key={n.id}
                                                    onClick={() => handleNotificationClick(n)}
                                                    className="w-full text-left p-3 border-b hover:bg-blue-50 transition-colors flex items-start gap-3 group"
                                                >
                                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full mt-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm group-hover:text-blue-700">New Menu Order</p>
                                                        <p className="text-xs text-gray-500">Tap to view details</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{n.time.toLocaleTimeString()}</p>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enable Sound Banner */}
                    {!soundEnabled && (
                        <div className="mt-4 bg-orange-100 border border-orange-200 text-orange-800 p-3 rounded-lg flex items-center justify-between">
                            <span className="text-sm font-semibold flex items-center gap-2">
                                🔔 Audio alerts are muted.
                            </span>
                            <button
                                onClick={enableSound}
                                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                            >
                                Enable Alerts
                            </button>
                        </div>
                    )}

                    {/* Test Button (Only show when enabled to verify) */}
                    {soundEnabled && (
                        <button
                            onClick={() => handleNewNotification('Test Notification')}
                            className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-gray-700 font-medium"
                        >
                            Test Sound 🔊
                        </button>
                    )}
                </div>

                <ActiveOrdersGrid
                    onSelectOrder={setSelectedOrder}
                    onNewItem={(orderId) => handleNewNotification(orderId)}
                />

                {selectedOrder && (
                    <ConsumablesModal
                        orderId={selectedOrder.id}
                        tokenId={selectedOrder.token_id || 0}
                        vehicleName={selectedOrder.vehicle_types?.name || 'Vehicle'}
                        onClose={() => setSelectedOrder(null)}
                    />
                )}
            </div>
        </MainLayout>
    )
}
