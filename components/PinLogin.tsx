'use client'

import { useState, useEffect } from 'react'
import { Check, Delete, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface PinLoginProps {
    onSuccess: (user: { name: string; role: string }) => void
    requiredRole?: string // Optional: if we want to enforce role-specific login here
}

export default function PinLogin({ onSuccess, requiredRole }: PinLoginProps) {
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleNumClick = (num: number) => {
        if (pin.length < 4) {
            setPin(prev => prev + num.toString())
            setError('')
        }
    }

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1))
        setError('')
    }

    const handleSubmit = async () => {
        if (pin.length !== 4) return

        setLoading(true)
        setError('')

        try {
            // Verify PIN against Supabase
            const { data, error: dbError } = await supabase
                .from('staff_profiles')
                .select('name, role')
                .eq('pin_code', pin)
                .single()

            if (dbError) {
                if (dbError.code === 'PGRST116') {
                    setError('Invalid PIN')
                } else {
                    setError('System Error')
                    console.error(dbError)
                }
            } else if (data) {
                // Optional: Check role if required
                if (requiredRole && data.role !== requiredRole && data.role !== 'admin') {
                    setError(`Access Denied: ${requiredRole}s only`)
                } else {
                    onSuccess(data)
                }
            }
        } catch (err) {
            setError('Login Failed')
            console.error(err)
        } finally {
            setLoading(false)
            setPin('') // Clear PIN for security usually, or keep it? Clearing is safer on fail.
        }
    }

    // Auto-submit on 4 digits? Or manual enter? 
    // Let's do auto-trigger checking when 4 digits reached for better UX
    useEffect(() => {
        if (pin.length === 4) {
            handleSubmit()
        }
    }, [pin])


    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200">
                <div className="text-center mb-8">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Security Check</h2>
                    <p className="text-gray-500 text-sm mt-1">Enter PIN to access System</p>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length >= i ? 'bg-blue-600 scale-110' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {error && (
                    <div className="text-red-500 text-center font-medium mb-6 animate-pulse bg-red-50 p-2 rounded">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumClick(num)}
                            disabled={loading}
                            className="h-16 rounded-xl bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition-colors border border-gray-200 shadow-sm"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="col-span-1"></div>
                    <button
                        onClick={() => handleNumClick(0)}
                        disabled={loading}
                        className="h-16 rounded-xl bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition-colors border border-gray-200 shadow-sm"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="h-16 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 active:bg-red-200 transition-colors border border-red-100 shadow-sm"
                    >
                        <Delete size={24} />
                    </button>
                </div>

                {loading && <p className="text-center text-gray-400 mt-4 text-sm">Verifying...</p>}
            </div>
        </div>
    )
}
