'use client'

import { Loader2 } from 'lucide-react'

interface VerificationModalProps {
    token: number
    vehicle: string
    service: string
    price: number
    loading: boolean
    onConfirm: () => void
    onCancel: () => void
}

export default function VerificationModal({
    token: tokenId, vehicle: vehicleName, service: serviceName, price, loading, onConfirm, onCancel
}: VerificationModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-center mb-6">Confirm Assignment</h3>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-900 font-medium">Token ID</span>
                        <span className="font-bold text-gray-900 text-lg">{tokenId}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-900 font-medium">Vehicle</span>
                        <span className="font-bold text-gray-900 uppercase">{vehicleName}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-900 font-medium">Service</span>
                        <span className="font-bold text-gray-900">{serviceName}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-900 font-medium">Total Price</span>
                        <span className="text-3xl font-extrabold text-blue-700">₱{price}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="py-3 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="py-3 font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    )
}
