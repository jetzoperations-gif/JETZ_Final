import Link from 'next/link';
import Image from 'next/image';
import { Shield, User, Coffee, Banknote } from 'lucide-react';
import ActiveTokensWidget from '@/components/ActiveTokensWidget';

export default function Home() {
  const roles = [
    { name: 'Admin', href: '/admin', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-50 group-hover:bg-rose-100' },
    { name: 'Greeter', href: '/greeter', icon: User, color: 'text-blue-500', bg: 'bg-blue-50 group-hover:bg-blue-100' },
    { name: 'MiniCafe', href: '/barista', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-50 group-hover:bg-amber-100' },
    { name: 'Collection', href: '/collection', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-50 group-hover:bg-emerald-100' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full relative z-10">

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-48 h-48 relative mb-6 flex items-center justify-center p-2 animate-in fade-in zoom-in duration-700">
            {/* Using the user provided updated round logo */}
            <Image
              src="/images/logo.png"
              alt="JETZ Carwash"
              width={200}
              height={200}
              className="object-contain w-full h-full drop-shadow-2xl"
              priority
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Operations Portal</h1>
          <p className="text-slate-400 font-medium">Select your access level</p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {roles.map((role) => (
            <Link
              key={role.name}
              href={role.href}
              className="group bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 p-6 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 hover:bg-white/10"
            >
              <div className={`p-4 rounded-xl mb-4 transition-colors ${role.bg}`}>
                <role.icon size={32} className={`${role.color}`} strokeWidth={1.5} />
              </div>
              <span className="font-bold text-lg text-slate-200 group-hover:text-white">{role.name}</span>
            </Link>
          ))}
        </div>

        {/* Widget Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-1 border border-white/5">
          <ActiveTokensWidget />
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600">© 2026 Jetz Carwash & Auto Detailing</p>
        </div>

      </div>
    </div>
  );
}
