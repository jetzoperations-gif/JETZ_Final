import { useState, useEffect } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Service = Database['public']['Tables']['services']['Row']

interface ServiceModalProps {
    service?: Service | null
    onClose: () => void
    onSuccess: () => void
}

export default function ServiceModal({ service, onClose, onSuccess }: ServiceModalProps) {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (service) {
            setName(service.name)
        }
    }, [service])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            if (service) {
                // Update
                const { error } = await supabase
                    .from('services')
                    .update({ name })
                    .eq('id', service.id)
                if (error) throw error
            } else {
                // Create
                const { error } = await supabase
                    .from('services')
                    .insert({ name })
                if (error) throw error
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            alert('Error saving service: ' + error.message)
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
                    {service ? 'Edit Service' : 'Add New Service'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Service Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Premium Wash"
                            autoFocus
                        />
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
                            disabled={loading || !name.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {service ? 'Save Changes' : 'Create Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
