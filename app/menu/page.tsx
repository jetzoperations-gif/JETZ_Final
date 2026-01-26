import CafeMenu from './components/CafeMenu'

export default function MenuPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-black text-blue-600 tracking-tighter">JETZ<span className="text-gray-800 font-bold">CAFE</span></h1>
                <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Self-Service
                </div>
            </header>

            <main className="max-w-md mx-auto p-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">Hungry?<br />Grab a bite while you wait.</h2>
                    <p className="text-gray-500 text-sm mt-1">We'll bring it to your car.</p>
                </div>

                <CafeMenu />
            </main>
        </div>
    )
}
