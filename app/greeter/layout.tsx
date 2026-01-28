'use client'

import ProtectedRoute from '@/components/ProtectedRoute'

export default function GreeterLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute requiredRole="greeter">
            {children}
        </ProtectedRoute>
    )
}
