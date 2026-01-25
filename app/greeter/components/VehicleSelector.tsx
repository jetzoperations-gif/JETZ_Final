'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { Car, Truck, Bus } from 'lucide-react'

type VehicleType = Database['public']['Tables']['vehicle_types']['Row']

interface VehicleSelectorProps {
    onSelect: (vehicle: VehicleType) => void
}

export default function VehicleSelector({ onSelect }: VehicleSelectorProps) {
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
            <h2 className="text-xl font-bold text-center">Select Vehicle Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {types.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => onSelect(type)}
                        className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm"
                    >
                        <div className="text-gray-600 mb-2">{getIcon(type.name)}</div>
                        <span className="font-bold text-lg">{type.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
