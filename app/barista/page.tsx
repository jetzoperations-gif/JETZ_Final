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

    return (
        <MainLayout title="Cafe & Sales Log" role="staff">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Operations Board</h2>
                        <p className="text-gray-500">Tap a job to log consumables.</p>
                    </div>
                </div>

                <ActiveOrdersGrid onSelectOrder={setSelectedOrder} />

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
