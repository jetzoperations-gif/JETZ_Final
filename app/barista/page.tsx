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
    const [audio] = useState(typeof Audio !== "undefined" ? new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') : null)

    const handleNewNotification = (msg: string) => {
        setNotifications(prev => [msg, ...prev])
        audio?.play().catch(e => console.log('Audio play failed', e))
    }

    return (
        <MainLayout title="Cafe & Sales Log" role="staff">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex justify-between items-end">
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
