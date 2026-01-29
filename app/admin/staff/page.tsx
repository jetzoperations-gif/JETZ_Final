'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, User, Save } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Define the shape of our Staff data
// Note: We might not have this in database.types.ts yet if we just added the SQL.
// So we define it locally for now or rely on 'any' if lazy, but interface is better.
interface StaffMember {
    id: string
    name: string
    role: string
    active: boolean
}

export default function StaffPage() {
    const [staff, setStaff] = useState<StaffMember[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState('')

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = async () => {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .order('name')

        if (error) {
            console.error(error) // Handle "table not found" if migration not run
        } else if (data) {
            setStaff(data)
        }
        setLoading(false)
    }

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        const { error } = await supabase
            .from('staff')
            .insert({ name: newName, role: 'washer', active: true })

        if (error) {
            alert('Error adding staff: ' + error.message)
        } else {
            setNewName('')
            fetchStaff()
        }
    }

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        await supabase.from('staff').update({ active: !currentStatus }).eq('id', id)
        fetchStaff()
    }

    // Soft delete (or toggle active)
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this staff member?')) return
        await supabase.from('staff').delete().eq('id', id)
        fetchStaff()
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-sm border">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-wide">Staff Management</h1>
                </div>

                {/* Add New Staff */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <User size={20} /> Add New Washer
                    </h2>
                    <form onSubmit={handleAddStaff} className="flex gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Full Name (e.g. Juan De La Cruz)"
                            className="flex-1 border-2 border-slate-200 p-3 rounded-lg focus:border-blue-500 outline-none font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!newName.trim()}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Plus size={20} />
                        </button>
                    </form>
                </div>

                {/* Staff List */}
                <div className="space-y-3">
                    {loading ? (
                        <p className="text-center text-gray-400">Loading staff...</p>
                    ) : staff.length === 0 ? (
                        <p className="text-center text-gray-400">No staff found. Please add one.</p>
                    ) : (
                        staff.map((member) => (
                            <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${member.active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${member.active ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                                            {member.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 uppercase font-bold">{member.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(member.id, member.active)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border ${member.active ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
                                    >
                                        {member.active ? 'Active' : 'Inactive'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
