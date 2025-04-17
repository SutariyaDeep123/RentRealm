// app/payment/cancel/page.jsx
"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-lg mb-6">Your booking was not completed.</p>
            <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Try Again
            </button>
        </div>
    );
}