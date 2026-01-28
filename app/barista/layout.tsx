'use client'

import ProtectedRoute from '@/components/ProtectedRoute'

export default function BaristaLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute requiredRole="barista">
            {children}
        </ProtectedRoute>
    )
}
