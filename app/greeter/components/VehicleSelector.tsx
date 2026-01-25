'use client'

import { VehicleType } from '@/lib/types'
import { Car, Truck, Bus } from 'lucide-react'

interface VehicleSelectorProps {
    vehicleTypes: VehicleType[]
    selectedVehicleId: number | null
    onSelect: (id: number) => void
}

export function VehicleSelector({ vehicleTypes, selectedVehicleId, onSelect }: VehicleSelectorProps) {
    // Helper to get icon
    const getIcon = (name: string) => {
        if (name.includes('Sedan')) return <Car size={24} />
        if (name.includes('SUV')) return <Truck size={24} />
        if (name.includes('Van')) return <Bus size={24} />
        return <Car size={24} />
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">2. Select Vehicle Type</h3>

            <div className="grid grid-cols-3 gap-2">
                {vehicleTypes.map((v) => (
                    <button
                        key={v.id}
                        onClick={() => onSelect(v.id)}
                        className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all border-2 ${selectedVehicleId === v.id
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {getIcon(v.name)}
                        <span className="text-xs font-bold text-center">{v.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
