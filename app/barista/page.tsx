'use client'

import { useState } from 'react'
import MainLayout from '@/components/MainLayout'
import ActiveOrdersGrid from './components/ActiveOrdersGrid'
import ConsumablesModal from './components/ConsumablesModal'
import { Database } from '@/lib/database.types'

type Order = Database['public']['Tables']['orders']['Row'] & {
    vehicle_types: { name: string } | null
}

export default function BaristaPage() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [notifications, setNotifications] = useState<string[]>([])
    const [soundEnabled, setSoundEnabled] = useState(false)

    // Valid external URL (The Base64 string was corrupted)
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

    const handleNewNotification = (msg: string) => {
        setNotifications(prev => [msg, ...prev])

        if (soundEnabled) {
            const audio = new Audio(dingSound)
            audio.play().catch(e => console.log('Audio play failed', e))
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

                        {/* Notification Bell */}
                        <div className="relative">
                            <div className="bg-white p-3 rounded-full shadow-sm border border-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            </div>
                            {notifications.length > 0 && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">
                                    {notifications.length}
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
