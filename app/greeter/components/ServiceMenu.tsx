'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { usePriceMatrix } from '@/lib/hooks/usePriceMatrix'

type Service = Database['public']['Tables']['services']['Row']

interface ServiceMenuProps {
    vehicleTypeId: number
    onSelect: (service: Service, price: number) => void
    onBack: () => void
}

export default function ServiceMenu({ vehicleTypeId, onSelect, onBack }: ServiceMenuProps) {
    const [services, setServices] = useState<Service[]>([])
    const { getPrice, loading: priceLoading } = usePriceMatrix()

    useEffect(() => {
        supabase.from('services').select('*').order('id').then(({ data }) => {
            if (data) setServices(data)
        })
    }, [])

    if (priceLoading) return <div className="p-10 text-center">Loading prices...</div>

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="text-sm font-semibold text-gray-500 hover:text-gray-800">
                    &larr; Change Vehicle
                </button>
                <h2 className="text-xl font-bold text-gray-900">Select Service</h2>
                <div className="w-20"></div> {/* Spacer */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((service) => {
                    const price = getPrice(service.id, vehicleTypeId)
                    return (
                        <button
                            key={service.id}
                            onClick={() => onSelect(service, price)}
                            className="flex justify-between items-center p-4 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 shadow-sm text-left group transition-all"
                        >
                            <span className="font-bold text-gray-900 text-lg group-hover:text-blue-800">{service.name}</span>
                            <span className="font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
                                ₱{price}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
