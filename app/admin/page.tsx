'use client'

import { useState } from 'react'
import MainLayout from '@/components/MainLayout'
import MenuManagement from './components/MenuManagement'
import TokenManagement from './components/TokenManagement'
import SalesReports from './components/SalesReports'
import DailySummary from './components/DailySummary'
import WasherLeaderboard from './components/WasherLeaderboard'
import StaffManagement from './components/StaffManagement'
import SystemSettings from './components/SystemSettings'
import { LayoutDashboard, Coffee, Receipt, Ticket, Users, Settings } from 'lucide-react'

import SalesChart from './components/SalesChart'
import ServiceMixChart from './components/ServiceMixChart'

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'tokens' | 'reports' | 'team' | 'settings'>('dashboard')

    return (
        <MainLayout title="Admin Dashboard" role="admin">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation (Desktop) / Horizontal (Mobile) */}
                <nav className="flex md:flex-col gap-3 md:w-64 bg-white p-4 rounded-2xl shadow-sm h-fit sticky top-24">
                    <div className="text-xs font-bold text-gray-400 uppercase px-3 mb-2 tracking-wider">Main Menu</div>

                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'menu', icon: Coffee, label: 'Menu & Inventory' },
                        { id: 'tokens', icon: Ticket, label: 'Token Status' },
                        { id: 'reports', icon: Receipt, label: 'Sales Reports' },
                        { id: 'team', icon: Users, label: 'Team Management' },
                        { id: 'settings', icon: Settings, label: 'Configuration' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 group
                                ${activeTab === item.id
                                    ? 'bg-slate-900 text-white shadow-lg shadow-purple-900/20 transform scale-105'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-600'} />
                            <span className="font-semibold">{item.label}</span>
                            {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                        </button>
                    ))}
                </nav>

                {/* Content Area */}
                <div className="flex-1 min-h-[500px]">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'dashboard' && (
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h2>
                                        <p className="text-slate-500">Welcome back, Admin</p>
                                    </div>
                                    <DailySummary />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <SalesChart />
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <ServiceMixChart />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <WasherLeaderboard />
                                    {/* Placeholder for other widgets */}
                                </div>
                            </div>
                        )}
                        {activeTab === 'menu' && <MenuManagement />}
                        {activeTab === 'tokens' && <TokenManagement />}
                        {activeTab === 'reports' && <SalesReports />}
                        {activeTab === 'team' && <StaffManagement />}
                        {activeTab === 'settings' && <SystemSettings />}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
