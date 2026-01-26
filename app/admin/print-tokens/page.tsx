'use client'

import { useState, useEffect } from 'react'
import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrintTokensPage() {
    const [origin, setOrigin] = useState('')

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const tokens = Array.from({ length: 50 }, (_, i) => i + 1)

    if (!origin) return <div className="p-8">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            {/* No-Print Header */}
            <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Printable Token Cards</h1>
                        <p className="text-gray-500">Print these and attach them to your physical tokens.</p>
                    </div>
                </div>
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                    <Printer size={20} />
                    Print Tokens
                </button>
            </div>

            {/* Printable Grid */}
            <div className="max-w-[210mm] mx-auto bg-white p-8 shadow-xl print:shadow-none print:w-full print:max-w-none print:p-0 grid grid-cols-3 gap-4 print:grid-cols-3">
                {tokens.map((id) => (
                    <div
                        key={id}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center aspect-[3/4] page-break-inside-avoid"
                    >
                        <div className="font-black text-slate-900 text-xl mb-2 tracking-tighter">JETZ Operations</div>

                        <div className="bg-blue-600 text-white font-mono text-4xl font-black w-20 h-20 flex items-center justify-center rounded-full mb-4 shadow-sm">
                            {id}
                        </div>

                        {/* QR Code */}
                        <div className="bg-white p-1 rounded-lg border border-gray-100 mb-2">
                            {/* Using public QR API for simplicity without dependencies */}
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${origin}/kiosk?token=${id}`)}`}
                                alt={`Token ${id}`}
                                className="w-32 h-32"
                            />
                        </div>

                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scan to Order</p>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0.5cm;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    )
}
