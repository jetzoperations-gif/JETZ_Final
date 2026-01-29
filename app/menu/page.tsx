import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import CafeMenu from './components/CafeMenu'
import { Suspense } from 'react'

export default function MenuPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/barista" className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-black text-blue-600 tracking-tighter">JETZ<span className="text-gray-800 font-bold">CAFE</span></h1>
                </div>
                <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Self-Service
                </div>
            </header>

            <main className="max-w-md mx-auto p-4">
                <div className="mb-6">
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">Order Snacks & Drinks</h2>
                </div>

                <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" /></div>}>
                    <CafeMenu />
                </Suspense>
            </main>
        </div>
    )
}
