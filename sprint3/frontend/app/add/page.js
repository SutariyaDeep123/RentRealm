"use client"
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';
import { useEffect } from 'react';
import { FaHotel, FaHome } from 'react-icons/fa';

const AddPropertyChoice = () => {
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 p-4">
            {/* Hotel Button */}
            <button
                onClick={() => router.push('/hotel/add')}
                className="flex flex-col items-center border border-gray-600 justify-center w-64 h-64 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:scale-105"
            >
                <FaHotel className="w-20 h-20 text-blue-600 mb-4" />
                <span className="text-2xl font-bold text-gray-900">Add Hotel</span>
            </button>

            {/* Property Button */}
            <button
                onClick={() => router.push('/listing/add')}
                className="flex flex-col items-center justify-center border border-gray-600 w-64 h-64 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:scale-105"
            >
                <FaHome className="w-20 h-20 text-green-600 mb-4" />
                <span className="text-2xl font-bold text-gray-900">Add Property</span>
            </button>
        </div>
    );
};

export default AddPropertyChoice;
