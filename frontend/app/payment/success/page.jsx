"use client";

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasFetched = useRef(false); // Track if the API call has been made

    useEffect(() => {
        const session_id = searchParams.get('session_id');
        if (!session_id || hasFetched.current) return;

        const processBooking = async () => {
            try {
                hasFetched.current = true;

                const { data: { data: session } } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/session/${session_id}`);
                const meta = session.metadata;
                console.log(meta, "==============meta")
                const payload = meta.type === 'hotel'
                    ? { hotelId: meta.propertyId, roomId: meta.roomId, checkIn: meta.checkIn, checkOut: meta.checkOut, guestCount: meta.guestCount, specialRequests: meta.specialRequests }
                    : { listingId: meta.propertyId, checkIn: meta.checkIn, checkOut: meta.checkOut, guestCount: meta.guestCount, specialRequests: meta.specialRequests };

                const endpoint = meta.type === 'hotel'
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/hotel`
                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/listing`;

                await axios.post(endpoint, payload); // Booking Created ✅
                toast.success('Booking confirmed!');
                router.push('/bookings');

            } catch (err) {
                toast.error('Booking failed. Refunding...');
                axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/refund`, { session_id }).then((response) => {
                    router.push('/payment/cancel')
                }).catch(async (err) => {
                    console.log(err)
                    toast.error(err?.response?.data?.error?.status);
                    router.push('/')
                });

            }
        };

        processBooking();
    }, [searchParams]);


    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-20 w-20 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-3">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6">We are processing your booking...</p>

                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full animate-pulse"></div>
                    </div>

                    <p className="text-sm text-gray-500 mt-6">
                        You'll be redirected automatically. Please don't close this page.
                    </p>
                </div>
            </div>
        </Suspense>
    );
}