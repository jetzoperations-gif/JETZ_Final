import { useState, useEffect } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface InventoryModalProps {
    item?: InventoryItem | null
    onClose: () => void
    onSuccess: () => void
}

export default function InventoryModal({ item, onClose, onSuccess }: InventoryModalProps) {
    const [name, setName] = useState('')
    const [category, setCategory] = useState<'Drinks' | 'Snacks' | 'CarCare'>('CarCare')
    const [price, setPrice] = useState('')
    const [stock, setStock] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (item) {
            setName(item.name)
            setCategory(item.category || 'CarCare')
            setPrice(item.price.toString())
            setStock(item.stock_qty.toString())
        }
    }, [item])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !price || !stock) return

        setLoading(true)
        try {
            const payload = {
                name,
                category,
                price: parseFloat(price),
                stock_qty: parseInt(stock)
            }

            if (item) {
                // Update
                const { error } = await supabase
                    .from('inventory_items')
                    .update(payload)
                    .eq('id', item.id)
                if (error) throw error
            } else {
                // Create
                const { error } = await supabase
                    .from('inventory_items')
                    .insert(payload)
                if (error) throw error
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            alert('Error saving item: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-gray-800 mb-6">
                    {item ? 'Edit Inventory Item' : 'Add New Item'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Microfiber Cloth"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="CarCare">Car Care</option>
                            <option value="Drinks">Drinks</option>
                            <option value="Snacks">Snacks</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Price (₱)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Stock Qty</label>
                            <input
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim() || !price || !stock}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {item ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
