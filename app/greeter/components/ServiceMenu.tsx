'use client'

import { Service, ServicePrice } from '@/lib/types'

interface ServiceMenuProps {
    services: Service[]
    prices: ServicePrice[]
    vehicleTypeId: number | null
    onSelect: (serviceId: number) => void
    selectedServiceId: number | null
}

export function ServiceMenu({ services, prices, vehicleTypeId, onSelect, selectedServiceId }: ServiceMenuProps) {

    const getPrice = (serviceId: number) => {
        // If no vehicle selected, show base/sedan price (assumed id 1) or range
        const vId = vehicleTypeId || 1
        const match = prices.find(p => p.service_id === serviceId && p.vehicle_type_id === vId)
        return match ? match.price : 0
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">3. Select Service</h3>

            <div className="space-y-2">
                {services.map((s) => {
                    const price = getPrice(s.id)
                    const isSelected = selectedServiceId === s.id

                    return (
                        <button
                            key={s.id}
                            onClick={() => onSelect(s.id)}
                            className={`w-full p-4 rounded-lg flex justify-between items-center transition-all border-2 ${isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
                                    : 'border-gray-100 bg-white text-gray-800 hover:border-gray-300'
                                }`}
                        >
                            <span className="font-bold">{s.name}</span>
                            <span className={`text-lg font-mono ${isSelected ? 'text-white' : 'text-blue-600 font-bold'}`}>
                                ₱{price}
                            </span>
                        </button>
                    )
                })}
            </div>
            {!vehicleTypeId && (
                <p className="text-xs text-center text-orange-500 mt-2 italic">
                    * Showing base prices. Select vehicle to see exact rate.
                </p>
            )}
        </div>
    )
}
