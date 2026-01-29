'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface Setting {
    key: string
    value: string
    description: string
}

export default function SystemSettings() {
    const [settings, setSettings] = useState<Setting[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSettings = async () => {
        const { data } = await supabase.from('system_settings').select('*').order('key')
        if (data) setSettings(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const handleSave = async (key: string, newValue: string) => {
        const { error } = await supabase
            .from('system_settings')
            .update({ value: newValue })
            .eq('key', key)

        if (error) {
            toast.error('Failed to update setting')
        } else {
            toast.success('Setting updated!')
            fetchSettings()
        }
    }

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Configuration...</div>

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="text-gray-500" /> System Configuration
                </h3>
            </div>

            <div className="divide-y divide-gray-100">
                {settings.map((setting) => (
                    <div key={setting.key} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 uppercase tracking-wide text-sm">{setting.key.replace('_', ' ')}</h4>
                            <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                className="border font-mono border-gray-300 rounded-lg px-3 py-2 w-32 text-center font-bold text-gray-900"
                                defaultValue={setting.value}
                                onBlur={(e) => {
                                    if (e.target.value !== setting.value) {
                                        handleSave(setting.key, e.target.value)
                                    }
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
