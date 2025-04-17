"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MyBookings() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/my-bookings`);
            console.log(response)
            setBookings(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
            
            {bookings?.length === 0 ? (
                <div className="text-center py-12">
                    <h3 className="text-lg text-gray-500">No bookings found</h3>
                    <button 
                        onClick={() => router.push('/')}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Browse Properties
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex flex-col md:flex-row justify-between">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold">
                                        {booking.bookingType === 'hotel' 
                                            ? booking.hotel?.name 
                                            : booking.listing?.name}
                                    </h2>
                                    
                                    <div className="mt-2 space-y-2">
                                        <p className="text-gray-600">
                                            <span className="font-medium">Check-in:</span> {formatDate(booking.checkIn)}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Check-out:</span> {formatDate(booking.checkOut)}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Guests:</span> {booking.guestCount}
                                        </p>
                                        {booking.bookingType === 'hotel' && (
                                            <p className="text-gray-600">
                                                <span className="font-medium">Room Type:</span> {booking.room?.type}
                                            </p>
                                        )}
                                        <p className="text-gray-600">
                                            <span className="font-medium">Total Price:</span> ${booking.totalPrice}
                                        </p>
                                    </div>

                                    {booking.specialRequests && (
                                        <div className="mt-4">
                                            <p className="font-medium">Special Requests:</p>
                                            <p className="text-gray-600">{booking.specialRequests}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                    
                                    <button 
                                        onClick={() => router.push(
                                            booking.bookingType === 'hotel' 
                                                ? `/hotel/${booking.hotel?._id}`
                                                : `/listing/${booking.listing?._id}`
                                        )}
                                        className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        View Property
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 