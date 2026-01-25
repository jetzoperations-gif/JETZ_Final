export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    role: 'admin' | 'staff'
                    created_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    role?: 'admin' | 'staff'
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    role?: 'admin' | 'staff'
                    created_at?: string
                }
            }
            tokens: {
                Row: {
                    id: number
                    status: 'available' | 'active'
                    current_job_id: string | null
                }
                Insert: {
                    id: number
                    status?: 'available' | 'active'
                    current_job_id?: string | null
                }
                Update: {
                    id?: number
                    status?: 'available' | 'active'
                    current_job_id?: string | null
                }
            }
            vehicle_types: {
                Row: {
                    id: number
                    name: string
                    sort_order: number
                }
                Insert: {
                    id?: number
                    name: string
                    sort_order?: number
                }
                Update: {
                    id?: number
                    name?: string
                    sort_order?: number
                }
            }
            services: {
                Row: {
                    id: number
                    name: string
                }
                Insert: {
                    id?: number
                    name: string
                }
                Update: {
                    id?: number
                    name?: string
                }
            }
            service_prices: {
                Row: {
                    id: number
                    service_id: number | null
                    vehicle_type_id: number | null
                    price: number
                }
                Insert: {
                    id?: number
                    service_id?: number | null
                    vehicle_type_id?: number | null
                    price: number
                }
                Update: {
                    id?: number
                    service_id?: number | null
                    vehicle_type_id?: number | null
                    price?: number
                }
            }
            inventory_items: {
                Row: {
                    id: number
                    name: string
                    price: number
                    stock_qty: number
                    category: 'Drinks' | 'Snacks' | 'CarCare' | null
                }
                Insert: {
                    id?: number
                    name: string
                    price: number
                    stock_qty?: number
                    category?: 'Drinks' | 'Snacks' | 'CarCare' | null
                }
                Update: {
                    id?: number
                    name?: string
                    price?: number
                    stock_qty?: number
                    category?: 'Drinks' | 'Snacks' | 'CarCare' | null
                }
            }
            orders: {
                Row: {
                    id: string
                    token_id: number | null
                    vehicle_type_id: number | null
                    service_id: number | null
                    plate_number: string | null
                    washer_name: string | null
                    total_amount: number
                    status: 'pending_verification' | 'queued' | 'completed' | 'paid' | 'cancelled'
                    source: 'staff' | 'kiosk'
                    is_verified: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    token_id?: number | null
                    vehicle_type_id?: number | null
                    service_id?: number | null
                    plate_number?: string | null
                    washer_name?: string | null
                    total_amount?: number
                    status?: 'pending_verification' | 'queued' | 'completed' | 'paid' | 'cancelled'
                    source?: 'staff' | 'kiosk'
                    is_verified?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    token_id?: number | null
                    vehicle_type_id?: number | null
                    service_id?: number | null
                    plate_number?: string | null
                    washer_name?: string | null
                    total_amount?: number
                    status?: 'pending_verification' | 'queued' | 'completed' | 'paid' | 'cancelled'
                    source?: 'staff' | 'kiosk'
                    is_verified?: boolean
                    created_at?: string
                }
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string | null
                    item_type: 'service' | 'inventory' | null
                    item_id: number | null
                    item_name: string | null
                    price_snapshot: number
                    quantity: number
                }
                Insert: {
                    id?: string
                    order_id?: string | null
                    item_type?: 'service' | 'inventory' | null
                    item_id?: number | null
                    item_name?: string | null
                    price_snapshot: number
                    quantity?: number
                }
                Update: {
                    id?: string
                    order_id?: string | null
                    item_type?: 'service' | 'inventory' | null
                    item_id?: number | null
                    item_name?: string | null
                    price_snapshot?: number
                    quantity?: number
                }
            }
        }
    }
}
