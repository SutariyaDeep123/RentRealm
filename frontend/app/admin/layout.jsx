// app/admin/layout.jsx
"use client"
import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import Navbar from '@/components/Headers';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Don't show layout for auth pages
    if (pathname === '/admin/login') {
        return children;
    }

    return (
        <div className=" flex  bg-gray-100">

            <div className="flex-1 flex flex-col ">
                <Navbar />

                <div className="lg:hidden fixed top-4 left-4 z-50">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-md bg-gray-800 text-white"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                <div className='flex'>
                    <AdminSidebar open={sidebarOpen} />

                    <main className="flex-1 p-4 bg-gray-100">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}