import { Database } from './database.types'

export type VehicleType = Database['public']['Tables']['vehicle_types']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type ServicePrice = Database['public']['Tables']['service_prices']['Row']
export type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Token = Database['public']['Tables']['tokens']['Row']

export interface CartItem {
    type: 'service' | 'inventory'
    id: number
    name: string
    price: number
    quantity: number
}
