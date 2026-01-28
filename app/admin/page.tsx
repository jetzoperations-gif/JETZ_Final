'use client'

import { useState } from 'react'
import MainLayout from '@/components/MainLayout'
import MenuManagement from './components/MenuManagement'
import TokenManagement from './components/TokenManagement'
import SalesReports from './components/SalesReports'
import DailySummary from './components/DailySummary'
import WasherLeaderboard from './components/WasherLeaderboard'
import StaffManagement from './components/StaffManagement'
import { LayoutDashboard, Coffee, Receipt, Ticket, Users } from 'lucide-react'

import SalesChart from './components/SalesChart'
import ServiceMixChart from './components/ServiceMixChart'

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'tokens' | 'reports' | 'team'>('dashboard')

    return (
        <MainLayout title="Admin Dashboard" role="admin">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation (Desktop) / Horizontal (Mobile) */}
                <nav className="flex md:flex-col gap-2 md:w-64">
                    {/* Dashboard Tab */}
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors
              ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}
            `}
                    >
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </button>

                    {/* Menu Tab */}
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors
              ${activeTab === 'menu' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}
            `}
                    >
                        <Coffee size={20} />
                        <span>Menu & Inventory</span>
                    </button>

                    {/* Tokens Tab */}
                    <button
                        onClick={() => setActiveTab('tokens')}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors
              ${activeTab === 'tokens' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}
            `}
                    >
                        <Ticket size={20} />
                        <span>Token Status</span>
                    </button>

                    {/* Reports Tab */}
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors
              ${activeTab === 'reports' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}
            `}
                    >
                        <Receipt size={20} />
                        <span>Sales Reports</span>
                    </button>

                    {/* Team Tab */}
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors
              ${activeTab === 'team' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}
            `}
                    >
                        <Users size={20} />
                        <span>Team Management</span>
                    </button>
                </nav>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <h2 className="text-2xl font-bold">Today's Station</h2>
                                <DailySummary />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <SalesChart />
                                <ServiceMixChart />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <WasherLeaderboard />
                                {/* Placeholder for other widgets */}
                            </div>
                        </div>
                    )}
                    {activeTab === 'menu' && <MenuManagement />}
                    {activeTab === 'tokens' && <TokenManagement />}
                    {activeTab === 'reports' && <SalesReports />}
                    {activeTab === 'team' && <StaffManagement />}
                </div>
            </div>
        </MainLayout>
    )
}
