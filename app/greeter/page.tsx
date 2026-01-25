import MainLayout from '@/components/MainLayout';

export default function GreeterPage() {
    return (
        <MainLayout title="Greeter Station" role="staff">
            <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-6">New Customer Arrival</h2>
                {/* Token assignment form will go here */}
                <div className="space-y-4">
                    <div className="p-4 border border-dashed border-gray-300 rounded text-center text-gray-500">
                        Scan QR Token
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                        Assign Token Manually
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}
