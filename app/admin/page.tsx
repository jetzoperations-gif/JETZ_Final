'use client'

import { useState } from 'react'
import MainLayout from '@/components/MainLayout'
import MenuManagement from './components/MenuManagement'
import TokenManagement from './components/TokenManagement'
import SalesReports from './components/SalesReports'
import { LayoutDashboard, Coffee, Receipt, Ticket } from 'lucide-react'

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'menu' | 'tokens' | 'reports'>('menu')

    return (
        <MainLayout title="Admin Dashboard" role="admin">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation (Desktop) / Horizontal (Mobile) */}
                <nav className="flex md:flex-col gap-2 md:w-64">
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
                </nav>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'menu' && <MenuManagement />}
                    {activeTab === 'tokens' && <TokenManagement />}
                    {activeTab === 'reports' && <SalesReports />}
                </div>
            </div>
        </MainLayout>
    )
}
