'use client'

import { useState } from 'react'
import { VehicleType, Service } from '@/lib/types'
import { Check, X, AlertTriangle } from 'lucide-react'
import { VehicleSelector } from './VehicleSelector'

interface VerificationModalProps {
    order: any // Ideally typed with Join, but raw Order is ok for now. 
    vehicles: VehicleType[]
    onConfirm: (orderId: string, vehicleId: number) => void
    onCancel: (orderId: string) => void
}

export function VerificationModal({ order, vehicles, onConfirm, onCancel }: VerificationModalProps) {
    const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)

    if (!order) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-orange-500 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="animate-pulse" />
                        <span className="font-bold text-lg">Verify Kiosk Order</span>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-mono">
                        Token #{order.token_id}
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-gray-500 text-sm mb-1">Customer requested:</p>
                    <h2 className="text-2xl font-black text-gray-800 mb-6">
                        {order.services?.name || 'Unknown Service'}
                    </h2>

                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6">
                        <p className="text-orange-800 font-bold mb-2">Required: Confirm Vehicle Type</p>
                        <p className="text-sm text-orange-600 mb-4">
                            The customer cannot select their own vehicle size to prevent pricing errors. Please verify the actual car.
                        </p>

                        <div className="bg-white rounded-xl border border-orange-200 p-2">
                            <VehicleSelector
                                vehicleTypes={vehicles}
                                selectedVehicleId={selectedVehicle}
                                onSelect={setSelectedVehicle}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => onCancel(order.id)}
                            className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Reject
                        </button>
                        <button
                            disabled={!selectedVehicle}
                            onClick={() => selectedVehicle && onConfirm(order.id, selectedVehicle)}
                            className={`flex-1 py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${selectedVehicle
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Check size={20} />
                            Approve Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
