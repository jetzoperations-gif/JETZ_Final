'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Service } from '@/lib/types'
import { ArrowRight, Sparkles } from 'lucide-react'
import { TokenInput } from './components/TokenInput'

function KioskContent() {
    const searchParams = useSearchParams()

    const [services, setServices] = useState<Service[]>([])
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [showTokenInput, setShowTokenInput] = useState(false)
    const [autoToken, setAutoToken] = useState<number | null>(null)
    const [success, setSuccess] = useState(false)
    const [assignedToken, setAssignedToken] = useState<number | null>(null)

    useEffect(() => {
        const fetchInitialData = async () => {
            // 1. Fetch Services
            const { data: servicesData } = await supabase.from('services').select('*').order('id')
            if (servicesData) setServices(servicesData)

            // 2. Determine Token Source
            const urlToken = searchParams.get('token')

            if (urlToken) {
                // A. From QR Code (Smart Token)
                const t = parseInt(urlToken)

                // Verify if strictly available (or allow 'active' if checking status? For now assume new order = available)
                // If user scans a token in use, we might want to warn.
                const { data: tokenData } = await supabase
                    .from('tokens')
                    .select('status')
                    .eq('id', t)
                    .single()

                if (tokenData && tokenData.status === 'available') {
                    setAutoToken(t)
                } else if (tokenData && tokenData.status === 'active') {
                    // Token is already in use (Customer is waiting) -> Send to Cafe Menu
                    window.location.href = `/menu?token=${t}`
                } else if (tokenData) {
                    alert(`Token #${t} is currently ${tokenData.status}. Please use another token or ask staff.`)
                }
            } else {
                // B. Auto-Assign (No physical token yet)
                const { data: tokenData } = await supabase
                    .from('tokens')
                    .select('id')
                    .eq('status', 'available')
                    .order('id')
                    .limit(1)
                    .single()

                if (tokenData) {
                    setAutoToken(tokenData.id)
                }
            }
        }
        fetchInitialData()
    }, [success, searchParams]) // Refresh when success resets loop

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service)
        // If we have an auto-token, go straight to confirm? Or verify?
        // Let's go straight to order creation with the auto token
        if (autoToken) {
            handlePlaceOrder(autoToken, service)
        } else {
            // No auto token available (all full?), force manual input
            setShowTokenInput(true)
        }
    }

    const handlePlaceOrder = async (tokenId: number, service: Service) => {
        // Create Pending Order
        const { error } = await supabase.from('orders').insert({
            token_id: tokenId,
            service_id: service.id,
            total_amount: 0, // 0 until Staff verifies vehicle type
            status: 'pending_verification',
            source: 'kiosk',
            is_verified: false
        })

        if (!error) {
            // Mark token as active
            await supabase.from('tokens').update({ status: 'active' }).eq('id', tokenId)

            setAssignedToken(tokenId)
            setSuccess(true)
            setShowTokenInput(false)
            setTimeout(() => {
                setSuccess(false)
                setSelectedService(null)
                setAssignedToken(null)
                setAutoToken(null) // Clear to force refetch
            }, 5000)
        } else {
            alert('Error placing order. Please ask staff.')
        }
    }

    if (success && assignedToken) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-6 text-white animate-in zoom-in duration-300">
                <div className="bg-green-500/20 p-8 rounded-full mb-6 text-green-400">
                    <Sparkles size={64} />
                </div>
                <h2 className="text-3xl font-black mb-2">Order Sent!</h2>
                <div className="my-8 bg-white text-slate-900 p-6 rounded-2xl w-full max-w-xs mx-auto shadow-2xl transform scale-110">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Your Token Number</p>
                    <p className="text-8xl font-black font-mono">{assignedToken}</p>
                </div>
                <p className="text-slate-400 text-lg max-w-md">Please wait for the <strong>Greeter</strong> to call your number for verification.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-20 relative">
            {/* Hero Section */}
            <header className="p-8 pt-12 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                        Jetz Carwash
                    </h1>
                    <p className="text-slate-400 text-lg">Select a service to start.</p>
                </div>
                {/* Auto Assign Indicator */}
                {autoToken ? (
                    <div className="text-right animate-in slide-in-from-right duration-500">
                        <p className="text-slate-500 text-sm font-medium mb-1">
                            {searchParams.get('token') ? 'Scanned Token' : 'Assigning Token'}
                        </p>
                        <div className={`
                            px-4 py-2 rounded-lg font-bold font-mono text-xl shadow-lg border 
                            ${searchParams.get('token') ? 'bg-indigo-600 border-indigo-400' : 'bg-blue-600 border-blue-400'}
                        `}>
                            #{autoToken}
                        </div>
                    </div>
                ) : (
                    <div className="text-right">
                        <p className="text-orange-400 text-sm font-bold animate-pulse">Wait for Token...</p>
                    </div>
                )}
            </header>

            {/* Service Grid */}
            <div className="px-6 space-y-4">
                {services.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => handleServiceSelect(s)}
                        disabled={!autoToken}
                        className="w-full relative group overflow-hidden bg-slate-800 hover:bg-slate-700 border border-slate-700 p-6 rounded-2xl text-left transition-all hover:scale-[1.02] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Manual Token Option (Hybrid) */}
            <div className="mt-8 px-6 text-center">
                <button
                    onClick={() => setShowTokenInput(true)}
                    className="text-slate-500 hover:text-white underline decoration-dotted underline-offset-4 text-sm transition-colors"
                >
                    I already have a physical token
                </button>
            </div>

            {/* Token Input Modal */}
            {showTokenInput && (
                <TokenInput
                    onConfirm={(tokenId) => selectedService && handlePlaceOrder(tokenId, selectedService)}
                    onCancel={() => setShowTokenInput(false)}
                />
            )}
        </div>
    )
}

export default function KioskLandingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Kiosk...</div>}>
            <KioskContent />
        </Suspense>
    )
}
