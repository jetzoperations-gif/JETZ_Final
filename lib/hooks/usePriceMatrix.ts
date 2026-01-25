import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ServicePrice } from '@/lib/types'

export function usePriceMatrix() {
    const [prices, setPrices] = useState<ServicePrice[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPrices()
    }, [])

    const fetchPrices = async () => {
        const { data, error } = await supabase
            .from('service_prices')
            .select('*')

        if (!error && data) {
            setPrices(data)
        }
        setLoading(false)
    }

    const getPrice = (serviceId: number, vehicleTypeId: number | null): number => {
        if (!vehicleTypeId) return 0 // or base price?
        const match = prices.find(
            p => p.service_id === serviceId && p.vehicle_type_id === vehicleTypeId
        )
        return match ? match.price : 0
    }

    return { prices, loading, getPrice }
}
