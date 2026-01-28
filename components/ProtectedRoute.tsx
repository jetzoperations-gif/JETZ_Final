'use client'

import { useAuth } from '@/app/context/AuthContext'
import PinLogin from './PinLogin'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { staffSession, login, logout, isLoading } = useAuth()
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Prevent hydration mismatch or flash
    if (!isClient || isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>

    if (!staffSession) {
        return (
            <PinLogin
                onSuccess={(user) => login(user)}
                requiredRole={requiredRole}
            />
        )
    }

    // Role check if needed, though PinLogin handles the initial check. 
    // Double check here if we want strict page-level enforcement after login.
    if (requiredRole && staffSession.role !== requiredRole && staffSession.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-100">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p>You need to be a {requiredRole} to view this page.</p>
                <button
                    onClick={() => {
                        logout() // Clear session
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Switch User
                </button>
            </div>
        )
    }

    return <>{children}</>
}
