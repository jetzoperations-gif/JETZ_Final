import MainLayout from '@/components/MainLayout';

export default function CashierPage() {
    return (
        <MainLayout title="Cashier Station" role="staff">
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Open Orders</h2>
                {/* List of unpaid orders */}
                <div className="p-8 text-center text-gray-500">
                    No unpaid orders pending.
                </div>
            </div>
        </MainLayout>
    );
}
