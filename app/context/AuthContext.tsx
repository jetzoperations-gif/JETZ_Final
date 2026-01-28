'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface StaffSession {
    name: string
    role: string
}

interface AuthContextType {
    staffSession: StaffSession | null
    login: (session: StaffSession) => void
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [staffSession, setStaffSession] = useState<StaffSession | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Hydrate from localStorage on mount (optional for refresh persistence)
        const stored = localStorage.getItem('jetz_staff_session')
        if (stored) {
            try {
                setStaffSession(JSON.parse(stored))
            } catch (e) {
                console.error('Failed to parse session', e)
                localStorage.removeItem('jetz_staff_session')
            }
        }
        setIsLoading(false)
    }, [])

    const login = (session: StaffSession) => {
        setStaffSession(session)
        localStorage.setItem('jetz_staff_session', JSON.stringify(session))
    }

    const logout = () => {
        setStaffSession(null)
        localStorage.removeItem('jetz_staff_session')
        router.refresh() // Reset state
    }

    return (
        <AuthContext.Provider value={{ staffSession, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
