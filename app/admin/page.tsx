'use client'

import { useState } from 'react'
import MainLayout from '@/components/MainLayout'
import MenuManagement from './components/MenuManagement'
import TokenManagement from './components/TokenManagement'
import RevenueReports from './components/RevenueReports'
import DailySummary from './components/DailySummary'
import WasherLeaderboard from './components/WasherLeaderboard'
import StaffManagement from './components/StaffManagement'
import SystemSettings from './components/SystemSettings'
import { LayoutDashboard, Coffee, Receipt, Ticket, Users, Settings, Menu, X, LogOut } from 'lucide-react'

import RevenueChart from './components/RevenueChart'
import ServiceMixChart from './components/ServiceMixChart'

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'tokens' | 'reports' | 'team' | 'settings'>('dashboard')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
        { id: 'menu', icon: Coffee, label: 'Menu & Inventory' },
        { id: 'tokens', icon: Ticket, label: 'Token Status' },
        { id: 'reports', icon: Receipt, label: 'Revenue Reports' },
        { id: 'team', icon: Users, label: 'Team Management' },
        { id: 'settings', icon: Settings, label: 'Configuration' },
    ]

    const handleTabChange = (tabId: any) => {
        setActiveTab(tabId)
        setIsMobileMenuOpen(false) // Close drawer on selection
    }

    return (
        <MainLayout title="Admin Dashboard" role="admin">
            {/* Mobile Header & Toggle */}
            <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <span className="font-bold text-gray-700">Menu</span>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 bg-gray-50 rounded-lg active:bg-gray-100 text-gray-600"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Navigation Drawer (Overlay) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-xs bg-white shadow-2xl p-6 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-xl text-gray-800">Navigation</h3>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200
                                        ${activeTab === item.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-gray-400'} />
                                    <span className="font-medium text-lg">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="absolute bottom-8 left-6 right-6">
                            <p className="text-xs text-center text-gray-400">JETZ Operations v1.0</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
                {/* Desktop Sidebar Navigation (Hidden on Mobile) */}
                <nav className="hidden md:flex flex-col gap-3 w-64 bg-white p-4 rounded-2xl shadow-sm h-fit sticky top-24">
                    <div className="text-xs font-bold text-gray-400 uppercase px-3 mb-2 tracking-wider">Main Menu</div>

                    {menuItems.map((item) => (
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
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                        {activeTab === 'dashboard' && (
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Dashboard</h2>
                                        <p className="text-slate-500">Welcome back, Admin</p>
                                    </div>
                                    <div className="w-full md:w-auto">
                                        <DailySummary />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100 overflow-hidden">
                                        <RevenueChart />
                                    </div>
                                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100 overflow-hidden">
                                        <ServiceMixChart />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <WasherLeaderboard />
                                    {/* Placeholder for other widgets */}
                                </div>
                            </div>
                        )}
                        {activeTab === 'menu' && <div className="overflow-x-auto"><MenuManagement /></div>}
                        {activeTab === 'tokens' && <div className="overflow-x-auto"><TokenManagement /></div>}
                        {activeTab === 'reports' && <div className="overflow-x-auto"><RevenueReports /></div>}
                        {activeTab === 'team' && <div className="overflow-x-auto"><StaffManagement /></div>}
                        {activeTab === 'settings' && <SystemSettings />}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
