'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { Car, Truck, Bus } from 'lucide-react'

type VehicleType = Database['public']['Tables']['vehicle_types']['Row']

interface VehicleSelectorProps {
    onSelect: (vehicle: VehicleType) => void
    onBack: () => void
}

export default function VehicleSelector({ onSelect, onBack }: VehicleSelectorProps) {
    const [types, setTypes] = useState<VehicleType[]>([])

    useEffect(() => {
        supabase.from('vehicle_types').select('*').order('sort_order').then(({ data }) => {
            if (data) setTypes(data)
        })
    }, [])

    const getIcon = (name: string) => {
        if (name.includes('Van') || name.includes('XL')) return <Bus size={32} />
        if (name.includes('SUV')) return <Truck size={32} />
        return <Car size={32} />
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <span className="mr-1">←</span> Back
                </button>
                <h2 className="text-xl font-bold text-gray-900">Select Vehicle Type</h2>
                <div className="w-16"></div> {/* Spacer for centering */}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {types.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => onSelect(type)}
                        className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm"
                    >
                        <div className="text-blue-800 mb-3">{getIcon(type.name)}</div>
                        <span className="font-bold text-lg text-gray-900">{type.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
