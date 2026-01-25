import MainLayout from '@/components/MainLayout';

export default function BaristaPage() {
    return (
        <MainLayout title="Barista Station" role="staff">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold">Ready to Order</h2>
                    {/* Order taking interface */}
                </div>
                <div className="bg-white p-4 rounded-lg shadow h-fit">
                    <h2 className="text-lg font-semibold mb-4">Active Orders</h2>
                    {/* Order queue */}
                    <div className="text-gray-500 text-sm">No active drink orders.</div>
                </div>
            </div>
        </MainLayout>
    );
}
