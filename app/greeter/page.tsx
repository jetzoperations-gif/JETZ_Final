'use client'

import { useState } from 'react'
import MainLayout from '@/components/MainLayout'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import TokenScanner from './components/TokenScanner'
import VehicleSelector from './components/VehicleSelector'
import ServiceMenu from './components/ServiceMenu'
import VerificationModal from './components/VerificationModal'
import { CheckCircle } from 'lucide-react'

type VehicleType = Database['public']['Tables']['vehicle_types']['Row']
type Service = Database['public']['Tables']['services']['Row']

export default function GreeterPage() {
    // State Machine: 'scan' -> 'vehicle' -> 'service' -> 'confirm' -> 'success'
    const [step, setStep] = useState<'scan' | 'vehicle' | 'service' | 'confirm' | 'success'>('scan')

    // Selection Data
    const [selectedToken, setSelectedToken] = useState<number | null>(null)
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [currentPrice, setCurrentPrice] = useState(0)

    const [loading, setLoading] = useState(false)

    // Handlers
    const handleTokenVerified = (tokenId: number) => {
        setSelectedToken(tokenId)
        setStep('vehicle')
    }

    const handleVehicleSelect = (vehicle: VehicleType) => {
        setSelectedVehicle(vehicle)
        setStep('service')
    }

    const handleServiceSelect = (service: Service, price: number) => {
        setSelectedService(service)
        setCurrentPrice(price)
        setStep('confirm')
    }

    const handleConfirm = async () => {
        if (!selectedToken || !selectedVehicle || !selectedService) return
        setLoading(true)

        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                token_id: selectedToken,
                vehicle_type_id: selectedVehicle.id,
                service_id: selectedService.id,
                total_amount: currentPrice,
                status: 'queued',
                source: 'staff',
                is_verified: true
            })
            .select()
            .single()

        if (orderError) {
            alert('Error creating order: ' + orderError.message)
            setLoading(false)
            return
        }

        // 2. Create Order Item (The service itself)
        const { error: itemError } = await supabase
            .from('order_items')
            .insert({
                order_id: order.id,
                item_type: 'service',
                item_id: selectedService.id,
                item_name: selectedService.name,
                price_snapshot: currentPrice,
                quantity: 1
            })

        // 3. Update Token Status
        const { error: tokenError } = await supabase
            .from('tokens')
            .update({ status: 'active', current_job_id: order.id })
            .eq('id', selectedToken)

        setLoading(false)
        setStep('success')

        // Reset after success
        setTimeout(() => {
            setStep('scan')
            setSelectedToken(null)
            setSelectedVehicle(null)
            setSelectedService(null)
        }, 2500)
    }

    return (
        <MainLayout title="Greeter Station" role="staff">
            <div className="max-w-md mx-auto relative min-h-[60vh]">

                {/* Step 1: Scan Token */}
                {step === 'scan' && (
                    <TokenScanner onTokenVerified={handleTokenVerified} />
                )}

                {/* Step 2: Select Vehicle */}
                {step === 'vehicle' && (
                    <VehicleSelector onSelect={handleVehicleSelect} />
                )}

                {/* Step 3: Select Service */}
                {step === 'service' && selectedVehicle && (
                    <ServiceMenu
                        vehicleTypeId={selectedVehicle.id}
                        onSelect={handleServiceSelect}
                        onBack={() => setStep('vehicle')}
                    />
                )}

                {/* Step 4: Confirm Modal */}
                {step === 'confirm' && selectedToken && selectedVehicle && selectedService && (
                    <VerificationModal
                        token={selectedToken}
                        vehicle={selectedVehicle.name}
                        service={selectedService.name}
                        price={currentPrice}
                        loading={loading}
                        onConfirm={handleConfirm}
                        onCancel={() => setStep('service')}
                    />
                )}

                {/* Step 5: Success Message */}
                {step === 'success' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-lg animate-in zoom-in duration-300">
                        <CheckCircle size={80} className="text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Assigned!</h2>
                        <p className="text-gray-500">Token #{selectedToken} is now active.</p>
                    </div>
                )}

                {/* Progress Dots (Optional visualization) */}
                {step !== 'success' && (
                    <div className="flex justify-center gap-2 mt-8 opacity-30">
                        <div className={`w-2 h-2 rounded-full ${step === 'scan' ? 'bg-blue-600' : 'bg-gray-400'}`} />
                        <div className={`w-2 h-2 rounded-full ${step === 'vehicle' ? 'bg-blue-600' : 'bg-gray-400'}`} />
                        <div className={`w-2 h-2 rounded-full ${step === 'service' ? 'bg-blue-600' : 'bg-gray-400'}`} />
                    </div>
                )}

            </div>
        </MainLayout>
    )
}
