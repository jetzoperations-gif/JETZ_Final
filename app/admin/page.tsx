import MainLayout from '@/components/MainLayout';

export default function AdminPage() {
    return (
        <MainLayout title="Admin Dashboard" role="admin">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Dashboard Cards will go here */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Menu Management</h2>
                    <p className="text-gray-600">Manage services and cafe items.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Token Management</h2>
                    <p className="text-gray-600">Reset tokens and generate QR codes.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Sales Reports</h2>
                    <p className="text-gray-600">View daily transactions.</p>
                </div>
            </div>
        </MainLayout>
    );
}
