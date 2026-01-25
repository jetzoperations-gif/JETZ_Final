import Link from 'next/link';
import { Shield, User, Coffee, Banknote } from 'lucide-react';

export default function Home() {
  const roles = [
    { name: 'Admin', href: '/admin', icon: Shield, color: 'bg-red-100 text-red-600' },
    { name: 'Greeter', href: '/greeter', icon: User, color: 'bg-blue-100 text-blue-600' },
    { name: 'Barista', href: '/barista', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
    { name: 'Cashier', href: '/cashier', icon: Banknote, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JETZ Operations</h1>
          <p className="text-gray-500">Select your role to continue</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {roles.map((role) => (
            <Link
              key={role.name}
              href={role.href}
              className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-transparent hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className={`p-4 rounded-full mb-3 ${role.color} group-hover:scale-110 transition-transform`}>
                <role.icon size={32} />
              </div>
              <span className="font-semibold text-gray-700">{role.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
