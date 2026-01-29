import { useState, useEffect } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Service = Database['public']['Tables']['services']['Row']
type VehicleType = Database['public']['Tables']['vehicle_types']['Row']

interface ServiceModalProps {
    service?: Service | null
    onClose: () => void
    onSuccess: () => void
}

export default function ServiceModal({ service, onClose, onSuccess }: ServiceModalProps) {
    const [name, setName] = useState('')
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
    const [prices, setPrices] = useState<Record<number, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            // 1. Fetch Vehicle Types
            const { data: vTypes } = await supabase.from('vehicle_types').select('*').order('sort_order', { ascending: true })
            if (vTypes) {
                setVehicleTypes(vTypes)
            }

            // 2. If editing, fetch existing prices
            if (service) {
                setName(service.name)
                const { data: svcPrices } = await supabase
                    .from('service_prices')
                    .select('*')
                    .eq('service_id', service.id)

                if (svcPrices) {
                    const priceMap: Record<number, string> = {}
                    svcPrices.forEach(p => {
                        if (p.vehicle_type_id) priceMap[p.vehicle_type_id] = p.price.toString()
                    })
                    setPrices(priceMap)
                }
            }
            setLoading(false)
        }

        init()
    }, [service])

    const handlePriceChange = (vTypeId: number, val: string) => {
        setPrices(prev => ({ ...prev, [vTypeId]: val }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setSaving(true)
        try {
            let serviceId = service?.id

            // 1. Save Service Name
            if (service) {
                // Update
                const { error } = await supabase
                    .from('services')
                    .update({ name })
                    .eq('id', service.id)
                if (error) throw error
            } else {
                // Create
                const { data, error } = await supabase
                    .from('services')
                    .insert({ name })
                    .select()
                    .single()
                if (error) throw error
                serviceId = data.id
            }

            if (!serviceId) throw new Error('Failed to get service ID')

            // 2. Save Prices
            const priceUpserts = vehicleTypes.map(vt => ({
                service_id: serviceId,
                vehicle_type_id: vt.id,
                price: parseFloat(prices[vt.id] || '0')
            }))

            // We use upsert to insert new prices or update existing ones.
            // Note: This relies on a unique constraint on (service_id, vehicle_type_id).
            // If that constraint is missing, this might create duplicates. 
            // Assuming the schema is standard for this pattern.
            // If constraint is missing, we might need to delete old ones first, but upsert is safer if setup correctly.
            // Let's try upsert logic.
            for (const p of priceUpserts) {
                // We need to find the existing record ID to upsert properly if no unique constraint exists, 
                // OR we can delete all prices for this service and re-insert.
                // Re-inserting is a simple robust strategy for this scale.

                // Strategy: Check if it exists
                const { data: existing } = await supabase
                    .from('service_prices')
                    .select('id')
                    .eq('service_id', serviceId)
                    .eq('vehicle_type_id', p.vehicle_type_id)
                    .maybeSingle()

                if (existing) {
                    await supabase.from('service_prices').update({ price: p.price }).eq('id', existing.id)
                } else {
                    await supabase.from('service_prices').insert(p)
                }
            }

            onSuccess()
            onClose()
        } catch (error: any) {
            alert('Error saving service: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-gray-800 mb-6">
                    {service ? 'Edit Service & Prices' : 'Add New Service'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Service Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 force-visible-input"
                            placeholder="e.g. Premium Wash"
                            autoFocus
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Prices per Vehicle Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            {vehicleTypes.map((vt) => (
                                <div key={vt.id}>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">{vt.name}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-400">₱</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={prices[vt.id] || ''}
                                            onChange={(e) => handlePriceChange(vt.id, e.target.value)}
                                            className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-sm font-mono force-visible-input"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !name.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {service ? 'Save Changes' : 'Create Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
