"use client"
import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign } from 'lucide-react';
import axios from 'axios';
import { getUser, isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';

export default function BookingForm({ type, propertyId, roomId, price, listingType, fullData }) {
    const router = useRouter();
    const [bookingData, setBookingData] = useState({
        checkIn: '',
        checkOut: '',
        checkInMonth: '',
        checkInYear: '',
        checkOutMonth: '',
        checkOutYear: '',
        guestCount: 1,
        specialRequests: ''
    });
    const [totalPrice, setTotalPrice] = useState(price);
    const [timePeriod, setTimePeriod] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [availability, setAvailability] = useState({
        available: false,
        message: 'Please select dates to check availability'
    });
    const [error, setError] = useState(null);
    const today = new Date().toISOString().split('T')[0];



    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i <= currentYear + 5; i++) {
        years.push(i);
    }

    const dateSelectionType = listingType === 'sell'
        ? 'none'
        : listingType === 'rent'
            ? 'monthly'
            : (listingType === 'temporary_rent' || type === 'hotel')
                ? 'daily'
                : 'none';

    useEffect(() => {
        console.log(bookingData, "=============")
    }, [bookingData])


    // Handle checkIn date calculation
    useEffect(() => {
        if (dateSelectionType === 'monthly' && bookingData.checkInMonth && bookingData.checkInYear) {
            const checkInDate = new Date(`${bookingData.checkInYear}-${bookingData.checkInMonth}-01`);
            setBookingData(prev => ({
                ...prev,
                checkIn: checkInDate.toISOString().split('T')[0]
            }));
        }
    }, [bookingData.checkInMonth, bookingData.checkInYear, dateSelectionType]);

    // Handle checkOut date calculation
    useEffect(() => {
        if (dateSelectionType === 'monthly' && bookingData.checkOutMonth && bookingData.checkOutYear) {
            const lastDay = new Date(bookingData.checkOutYear, bookingData.checkOutMonth, 0).getDate();
            const checkOutDate = new Date(`${bookingData.checkOutYear}-${bookingData.checkOutMonth}-${lastDay}`);
            setBookingData(prev => ({
                ...prev,
                checkOut: checkOutDate.toISOString().split('T')[0]
            }));
        }
    }, [bookingData.checkOutMonth, bookingData.checkOutYear, dateSelectionType]);



    useEffect(() => {
        // Date validation logic (based on checkIn and checkOut only)
        if (bookingData.checkIn && bookingData.checkOut) {
            const checkInDate = new Date(bookingData.checkIn);
            const checkOutDate = new Date(bookingData.checkOut);

            if (checkOutDate <= checkInDate) {
                setAvailability({
                    available: false,
                    message: 'Check-out date must be after check-in date'
                });
                setTimePeriod(0);
                setTotalPrice(0);
                return;
            }

            if (dateSelectionType === 'monthly') {
                const monthDiff = (checkOutDate.getFullYear() - checkInDate.getFullYear()) * 12 +
                    (checkOutDate.getMonth() - checkInDate.getMonth());

                setTimePeriod(monthDiff);
                setTotalPrice(monthDiff * price);
            } else if (dateSelectionType === 'daily') {
                const nightCount = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
                setTimePeriod(nightCount);
                setTotalPrice(nightCount * price);
            }

            checkAvailability();
        } else if (bookingData.checkOut && !bookingData.checkIn) {
            setAvailability({
                available: false,
                message: 'Please select check-in date first'
            });
            setTimePeriod(0);
            setTotalPrice(0);
        } else if (dateSelectionType !== 'none') {
            setAvailability({
                available: false,
                message: bookingData.checkIn
                    ? 'Please select check-out date'
                    : 'Please select dates to check availability'
            });
            setTimePeriod(0);
            setTotalPrice(0);
        }
    }, [bookingData.checkIn, bookingData.checkOut, price, dateSelectionType]);

    useEffect(() => {
        console.log(listingType, "==================fullData")
        if (listingType === 'sell') {
            const fallbackCheckIn = new Date();
            const fallbackCheckOut = new Date(fallbackCheckIn);
            fallbackCheckOut.setDate(fallbackCheckIn.getDate() + 7);

            const checkIn = fullData?.startDate
                ? new Date(fullData.startDate)
                : fallbackCheckIn;

            const checkOut = fullData?.endDate
                ? new Date(fullData.endDate)
                : fallbackCheckOut;
            console.log(checkIn, checkOut, "==================dates=")
            setBookingData(prev => ({
                ...prev,
                checkIn: checkIn.toISOString().split('T')[0],
                checkOut: checkOut.toISOString().split('T')[0]
            }));
        }
        console.log(bookingData,"=========")
    }, [listingType, fullData]);


    const checkAvailability = async () => {
        if (!bookingData.checkIn || !bookingData.checkOut) return;

        const checkInDate = new Date(bookingData.checkIn);
        const checkOutDate = new Date(bookingData.checkOut);

        // Don't check if dates are invalid
        if (checkOutDate <= checkInDate) return;

        setCheckingAvailability(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/check-availability`, {
                params: {
                    type,
                    propertyId,
                    roomId,
                    checkIn: bookingData.checkIn,
                    checkOut: bookingData.checkOut
                }
            });

            setAvailability(response.data.data);
        } catch (err) {
            setAvailability({
                available: false,
                message: err.response?.data?.error.message || 'Error checking availability'
            });
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
    };


    const handlePayment = async () => {
        if (!isAuthenticated()) {
            window.location.href = '/login';
            return;
        }

        if (!availability.available) {
            toast.error(availability.message);
            return;
        }
        if (listingType !== 'sell' && !availability.available) {
            toast.error(availability.message);
            return;
        }

        setLoading(true);

        try {
            const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

            // Create Checkout Session on your backend
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/create-checkout-session`, {
                amount: totalPrice * 100, // Convert to cents
                currency: 'cad',
                metadata: {
                    type,
                    propertyId,
                    roomId: type === 'hotel' ? roomId : undefined,
                    checkIn: bookingData.checkIn,
                    checkOut: bookingData.checkOut,
                    guestCount: bookingData.guestCount,
                    specialRequests: bookingData.specialRequests,
                    fullTitle: type === 'hotel'
                        ? `${fullData?.hotel?.name} - ${fullData?.room?.type} Room`
                        : fullData?.name || 'Property',
                    fullAddress: JSON.stringify(fullData?.address),
                },
            });

            const { sessionId } = response.data.data; // Get the Checkout Session ID

            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({ sessionId });

            if (result.error) {
                throw result.error;
            }
        } catch (err) {
            toast.error(err.message || 'Payment failed');
            setError(err.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            handlePayment();
        }} className="space-y-4">
            {/* Only show date selection if not 'sell' */}
            {dateSelectionType !== 'none' && (
                <>
                    {dateSelectionType === 'monthly' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Month</label>
                                    <select
                                        name="checkInMonth"
                                        value={bookingData.checkInMonth}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Month</option>
                                        {months.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Year</label>
                                    <select
                                        name="checkInYear"
                                        value={bookingData.checkInYear}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        {years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Move-out Month</label>
                                    <select
                                        name="checkOutMonth"
                                        value={bookingData.checkOutMonth}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Month</option>
                                        {months.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Move-out Year</label>
                                    <select
                                        name="checkOutYear"
                                        value={bookingData.checkOutYear}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        {years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                                <input
                                    type="date"
                                    name="checkIn"
                                    value={bookingData.checkIn}
                                    min={today}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                                <input
                                    type="date"
                                    name="checkOut"
                                    value={bookingData.checkOut}
                                    min={bookingData.checkIn || today}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="mt-2">
                        {checkingAvailability ? (
                            <p className="text-sm text-gray-500">Checking availability...</p>
                        ) : (
                            <p className={`text-sm ${availability.available ? 'text-green-600' : 'text-red-600'}`}>
                                {availability.message}
                            </p>
                        )}
                    </div>
                </>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                <input
                    type="number"
                    name="guestCount"
                    min="1"
                    value={bookingData.guestCount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                />
            </div>

            {/* Price Calculation */}
            {dateSelectionType !== 'none' && bookingData.checkIn && bookingData.checkOut &&
                new Date(bookingData.checkOut) > new Date(bookingData.checkIn) && (
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between mb-2">
                            <span>
                                ${price} x {timePeriod} {dateSelectionType === 'monthly' ? 'months' : 'nights'}
                            </span>
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
                disabled={loading || (dateSelectionType !== 'none' && !availability.available)}
                className={`w-full py-2 px-4 rounded-md text-white ${(dateSelectionType === 'none' || availability.available)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                    } disabled:opacity-50`}
            >
                {loading ? 'Processing...' :
                    dateSelectionType === 'none' ? 'Purchase Property' :
                        availability.available ? 'Proceed to Payment' : 'Not Available'}
            </button>

        </form>
    );
}