'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Service } from '@/lib/types'
import { ArrowRight, Sparkles } from 'lucide-react'
import { TokenInput } from './components/TokenInput'

export default function KioskLandingPage() {
    const [services, setServices] = useState<Service[]>([])
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [showTokenInput, setShowTokenInput] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const fetchServices = async () => {
            const { data } = await supabase.from('services').select('*')
            if (data) setServices(data)
        }
        fetchServices()
    }, [])

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service)
        setShowTokenInput(true)
    }

    const handleTokenConfirm = async (tokenId: number) => {
        if (!selectedService) return

        // Create Pending Order
        const { error } = await supabase.from('orders').insert({
            token_id: tokenId,
            service_id: selectedService.id,
            total_amount: 0, // 0 until Staff verifies vehicle type
            status: 'pending_verification',
            source: 'kiosk',
            is_verified: false
        })

        if (!error) {
            setSuccess(true)
            setShowTokenInput(false)
            setTimeout(() => {
                setSuccess(false)
                setSelectedService(null)
            }, 3000)
        } else {
            alert('Error placing order. Please ask staff.')
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-6 text-white">
                <div className="bg-green-500/20 p-8 rounded-full mb-6 text-green-400">
                    <Sparkles size={64} />
                </div>
                <h2 className="text-3xl font-black mb-2">Order Sent!</h2>
                <p className="text-slate-400">Please show your Token to the staff for verification.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-20 relative">
            {/* Hero Section */}
            <header className="p-8 pt-12">
                <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Jetz Carwash
                </h1>
                <p className="text-slate-400 text-lg">Select a service to start.</p>
            </header>

            {/* Service Grid */}
            <div className="px-6 space-y-4">
                {services.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => handleServiceSelect(s)}
                        className="w-full relative group overflow-hidden bg-slate-800 hover:bg-slate-700 border border-slate-700 p-6 rounded-2xl text-left transition-all hover:scale-[1.02] shadow-xl"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles size={64} />
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{s.name}</h3>
                        <div className="flex items-center text-blue-400 font-medium gap-2 mt-4">
                            Select this package <ArrowRight size={18} />
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer Help */}
            <div className="fixed bottom-0 left-0 w-full p-6 bg-slate-900/90 backdrop-blur border-t border-slate-800 text-center">
                <p className="text-sm text-slate-500">Need help? Ask our staff for assistance.</p>
            </div>

            {/* Token Input Modal */}
            {showTokenInput && (
                <TokenInput
                    onConfirm={handleTokenConfirm}
                    onCancel={() => setShowTokenInput(false)}
                />
            )}
        </div>
    )
}
