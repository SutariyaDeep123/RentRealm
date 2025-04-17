// components/AdminSidebar.jsx
"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Hotel, Home, BookOpen } from 'lucide-react';

export default function AdminSidebar({ open }) {
    const pathname = usePathname();
    
    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
       
    ];

    return (
        <div className={` sticky z-0 top-0 lg:w-64 w-[50vw] bg-gray-800 text-white px-4 py-8  transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-40`}>
            <div className="mb-8 px-4">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <nav>
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname.startsWith(item.href) ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}