import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type PriceMatrixItem = {
    service_id: number
    service_name: string
    vehicle_type_id: number
    price: number
}

export function usePriceMatrix() {
    const [matrix, setMatrix] = useState<PriceMatrixItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMatrix = async () => {
            const { data, error } = await supabase
                .from('service_prices')
                .select(`
                price,
                vehicle_type_id,
                service_id,
                services (name)
            `)

            if (data) {
                const formatted = data.map((item: any) => ({
                    service_id: item.service_id,
                    service_name: item.services.name,
                    vehicle_type_id: item.vehicle_type_id,
                    price: item.price
                }))
                setMatrix(formatted)
            }
            setLoading(false)
        }

        fetchMatrix()
    }, [])

    const getPrice = (serviceId: number, vehicleTypeId: number) => {
        const item = matrix.find(
            (m) => m.service_id === serviceId && m.vehicle_type_id === vehicleTypeId
        )
        return item ? item.price : 0
    }

    return { matrix, getPrice, loading }
}
