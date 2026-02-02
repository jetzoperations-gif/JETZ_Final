'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Edit2, Save, X, Eye, EyeOff, Shield, Users, Banknote, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Staff {
    id: string
    name: string
    role: 'admin' | 'staff' | 'collection' | 'greeter' | 'barista'
    pin_code: string
}

export default function StaffManagement() {
    const [staff, setStaff] = useState<Staff[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<Partial<Staff>>({})
    const [isAdding, setIsAdding] = useState(false)
    const [newStaff, setNewStaff] = useState<Partial<Staff>>({ role: 'greeter', pin_code: '' })
    const [showPin, setShowPin] = useState<Record<string, boolean>>({})

    const fetchStaff = async () => {
        const { data } = await supabase
            .from('staff_profiles')
            .select('*')
            .order('name')
        if (data) setStaff(data as any)
        setLoading(false)
    }

    useEffect(() => {
        fetchStaff()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this staff member?')) return
        await supabase.from('staff_profiles').delete().eq('id', id)
        fetchStaff()
    }

    const handleSaveEdit = async (id: string) => {
        await supabase.from('staff_profiles').update(editForm).eq('id', id)
        setIsEditing(null)
        setEditForm({})
        fetchStaff()
    }

    const handleAdd = async () => {
        if (!newStaff.name || !newStaff.pin_code) return
        await supabase.from('staff_profiles').insert(newStaff)
        setIsAdding(false)
        setNewStaff({ role: 'greeter', pin_code: '' })
        fetchStaff()
    }

    const togglePinVisibility = (id: string) => {
        setShowPin(prev => ({ ...prev, [id]: !prev[id] }))
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Staff...</div>

    return (
        <div className="space-y-6">
            {/* Quick Actions for Washers & Payroll */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/staff" className="bg-blue-600 text-white p-6 rounded-xl shadow-md hover:bg-blue-700 transition-colors flex items-center justify-between group">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <Users /> Manage Washers
                        </h3>
                        <p className="text-blue-100 text-sm">Add/Remove Staff for Commissions</p>
                    </div>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link href="/admin/payroll" className="bg-indigo-600 text-white p-6 rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-between group">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <Banknote /> Weekly Payroll
                        </h3>
                        <p className="text-indigo-100 text-sm">View Commission Payouts</p>
                    </div>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Shield className="text-gray-500" /> System Access
                        </h3>
                        <p className="text-gray-400 text-sm">Manage PIN codes for Kiosk/Collection Login</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                        <Plus size={18} /> Add User
                    </button>
                </div>

                {isAdding && (
                    <div className="p-6 bg-blue-50 border-b border-blue-100 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-bold text-blue-900 mb-4">New Staff Member</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-bold text-blue-800 mb-1">Name</label>
                                <input
                                    className="w-full p-2 rounded border border-blue-200"
                                    placeholder="Full Name"
                                    value={newStaff.name || ''}
                                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-800 mb-1">Role</label>
                                <select
                                    className="w-full p-2 rounded border border-blue-200"
                                    value={newStaff.role}
                                    onChange={e => setNewStaff({ ...newStaff, role: e.target.value as any })}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="collection">Collection</option>
                                    <option value="greeter">Greeter</option>
                                    <option value="barista">Barista</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-800 mb-1">PIN (4-digits)</label>
                                <input
                                    className="w-full p-2 rounded border border-blue-200 font-mono"
                                    placeholder="0000"
                                    maxLength={4}
                                    value={newStaff.pin_code || ''}
                                    onChange={e => setNewStaff({ ...newStaff, pin_code: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Save</button>
                                <button onClick={() => setIsAdding(false)} className="bg-white text-blue-600 border border-blue-200 p-2 rounded hover:bg-blue-50">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Name</th>
                                <th className="p-4 font-semibold text-gray-600">Role</th>
                                <th className="p-4 font-semibold text-gray-600">PIN Code</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staff.map(member => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    {isEditing === member.id ? (
                                        <>
                                            <td className="p-4">
                                                <input
                                                    className="w-full p-1 border rounded"
                                                    value={editForm.name || ''}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    className="w-full p-1 border rounded"
                                                    value={editForm.role}
                                                    onChange={e => setEditForm({ ...editForm, role: e.target.value as any })}
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="collection">Collection</option>
                                                    <option value="greeter">Greeter</option>
                                                    <option value="barista">Barista</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    className="w-20 p-1 border rounded font-mono"
                                                    value={editForm.pin_code || ''}
                                                    maxLength={4}
                                                    onChange={e => setEditForm({ ...editForm, pin_code: e.target.value })}
                                                />
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleSaveEdit(member.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={18} /></button>
                                                    <button onClick={() => setIsEditing(null)} className="text-gray-400 hover:bg-gray-100 p-1 rounded"><X size={18} /></button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-4 font-medium text-gray-900">{member.name}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                                                    ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        member.role === 'collection' ? 'bg-green-100 text-green-700' :
                                                            member.role === 'greeter' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}
                                                `}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-gray-500 flex items-center gap-2">
                                                {showPin[member.id] ? member.pin_code : '••••'}
                                                <button onClick={() => togglePinVisibility(member.id)} className="text-gray-300 hover:text-blue-500">
                                                    {showPin[member.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setIsEditing(member.id); setEditForm(member) }}
                                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(member.id)}
                                                        className="text-red-400 hover:bg-red-50 p-2 rounded transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
