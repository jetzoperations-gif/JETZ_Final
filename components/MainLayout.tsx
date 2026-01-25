import React from 'react';
import Link from 'next/link';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    role?: 'admin' | 'staff' | 'kiosk';
}

export default function MainLayout({ children, title, role }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-xl font-bold text-blue-600">
                            JETZ
                        </Link>
                        {title && (
                            <>
                                <span className="text-gray-300">|</span>
                                <h1 className="text-lg font-medium text-gray-900">{title}</h1>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Placeholder for user info or logout */}
                        {role && <span className="text-xs uppercase font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">{role}</span>}
                    </div>
                </div>
            </header>
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
