"use client"
import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign } from 'lucide-react';
import axios from 'axios';
import { getUser, isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function BookingForm({ type, propertyId, roomId, price }) {
    const router = useRouter();
    const [bookingData, setBookingData] = useState({
        checkIn: '',
        checkOut: '',
        guestCount: 1,
        specialRequests: ''
    });
    const [totalPrice, setTotalPrice] = useState(price);
    const [nights, setNights] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (bookingData.checkIn && bookingData.checkOut) {
            const checkInDate = new Date(bookingData.checkIn);
            const checkOutDate = new Date(bookingData.checkOut);
            const nightCount = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            setNights(nightCount);
            setTotalPrice(nightCount * price);
        }
    }, [bookingData.checkIn, bookingData.checkOut, price]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated()) {
            window.location.href = '/login';
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const endpoint = type === 'hotel' 
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/hotel`
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/listing`;

            const payload = type === 'hotel' 
                ? {
                    hotelId: propertyId,
                    roomId: roomId,
                    checkIn: bookingData.checkIn,
                    checkOut: bookingData.checkOut,
                    guestCount: bookingData.guestCount,
                    specialRequests: bookingData.specialRequests
                }
                : {
                    listingId: propertyId,
                    checkIn: bookingData.checkIn,
                    checkOut: bookingData.checkOut,
                    guestCount: bookingData.guestCount,
                    specialRequests: bookingData.specialRequests
                };

            const response = await axios.post(endpoint, payload);
            window.location.href = '/bookings';
        } catch (err) {
            toast.error(err.response?.data?.error.message)
            setError(err.response?.data?.error?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                <input
                    type="date"
                    value={bookingData.checkIn}
                    min={today}
                    onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                <input
                    type="date"
                    value={bookingData.checkOut}
                    min={bookingData.checkIn || today}
                    onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                <input
                    type="number"
                    min="1"
                    value={bookingData.guestCount}
                    onChange={(e) => setBookingData({...bookingData, guestCount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                />
            </div>

            {/* Price Calculation */}
            {bookingData.checkIn && bookingData.checkOut && (
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between mb-2">
                        <span>${price} x {nights} nights</span>
                        <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${totalPrice}</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Booking...' : 'Book Now'}
            </button>
        </form>
    );
} 