"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { isAuthenticated } from '@/utils/auth';
import { FaBed, FaBath, FaMapMarkerAlt, FaEdit, FaTrash, FaPlus, FaCalendar, FaUser, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function MyHotels() {
    const router = useRouter();
    const [hotels, setHotels] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('hotels'); // 'hotels' or 'bookings'

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [hotelsResponse, bookingsResponse] = await Promise.all([
                axios.get(`${BASE_URL}/hotels/my-hotels`),
                axios.get(`${BASE_URL}/hotels/my/bookings`),
            ]);
            setHotels(hotelsResponse.data.data);
            console.log(hotelsResponse, "======================")
            setBookings(bookingsResponse.data.data);
        } catch (err) {
            console.log(err)
            toast.error(err.response?.data?.error?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (hotelId) => {
        if (!confirm('Are you sure you want to delete this hotel?')) return;

        try {
            await axios.delete(`${BASE_URL}/hotels/${hotelId}`);
            setHotels(hotels.filter(hotel => hotel._id !== hotelId));
            toast.success('Hotel deleted successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete hotel');
        }
    };

    const handleRoomDelete = async (RoomId) => {
        if (!confirm('Are you sure you want to delete this room?')) return;
    
        try {
            await axios.delete(`${BASE_URL}/rooms/${RoomId}`);
            setHotels(prevHotels => 
                prevHotels.map(hotel => ({
                    ...hotel,
                    rooms: hotel.rooms.filter(room => room._id !== RoomId)
                }))
            );
            toast.success('Room deleted successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete room');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('hotels')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'hotels'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            My Hotels
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'bookings'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Bookings
                        </button>
                    </div>

                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Hotels Tab Content */}
                {activeTab === 'hotels' && (
                    hotels.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <h3 className="text-lg text-gray-500">No hotels listed yet</h3>
                            <p className="mt-2 text-gray-400">Start by adding your first hotel</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hotels.map((hotel) => (
                                <div key={hotel._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                    <div className="relative h-48">
                                        <img
                                            src={`${BASE_URL}/hotels/${hotel.mainImage}`}
                                            alt={hotel.mainImage}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-hotel.jpg';
                                                e.target.onerror = null;
                                            }}
                                        />
                                        <div className="absolute top-2 right-2 space-x-2">
                                            <button
                                                onClick={() => router.push(`/hotel/${hotel._id}/add-room`)}
                                                className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                                                title="Add Room"
                                            >
                                                <FaPlus className="text-green-600" />
                                            </button>
                                            <button
                                                onClick={() => router.push(`/hotel/${hotel._id}/edit`)}
                                                className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                                                title="Edit Hotel"
                                            >
                                                <FaEdit className="text-blue-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(hotel._id)}
                                                className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                                                title="Delete Hotel"
                                            >
                                                <FaTrash className="text-red-600" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                            {hotel.name}
                                        </h2>

                                        <div className="flex items-center text-gray-600 mb-2">
                                            <FaMapMarkerAlt className="mr-1" />
                                            <span>{`${hotel.address?.city}, ${hotel.address?.state}`}</span>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-gray-600 line-clamp-2">{hotel.description}</p>
                                        </div>

                                        {/* Rooms Summary */}
                                        <div className="border-t pt-4">
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Rooms Available</h3>
                                            <div className={`flex flex-wrap items-center justify-between gap-2 border  hover:bg-gray-300/90 p-3 rounded-md  ${(!hotel.rooms || hotel.rooms.length === 0)? "border-red-600":"border-gray-400"}`}>
                                                {hotel.rooms && hotel.rooms.map((room, index) => (
                                                    <>
                                                        <div className='flex items-center'>
                                                            <img
                                                                key={room._id}
                                                                src={`${BASE_URL}/rooms/${room.images[0]}`}
                                                                alt={`View ${room._id}`}
                                                                className="h-16 w-16 object-cover rounded"

                                                            />
                                                            <span
                                                                className="px-2 py-1 rounded-full  text-gray-600"
                                                            >
                                                                {room?.type} - ${room?.price}
                                                            </span>

                                                        </div>
                                                        <div>
                                                            <button
                                                                onClick={() => router.push(`/hotel/${hotel._id}/room/${room._id}/edit`)}
                                                                className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                                                                title="Edit Hotel"
                                                            >
                                                                <FaEdit className="text-blue-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRoomDelete(room._id)}
                                                                className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                                                                title="Delete Hotel"
                                                            >
                                                                <FaTrash className="text-red-600" />
                                                            </button>
                                                        </div>
                                                    </>
                                                ))}
                                                {(!hotel.rooms || hotel.rooms.length === 0) && (
                                                    <span className="text-sm text-red-600">No rooms added yet and this hotel will not be listed till you add any room</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Additional Images Preview */}
                                        {hotel.images && hotel.images.length > 0 && (
                                            <div className="mt-4 border-t pt-4">
                                                <div className="flex gap-2 overflow-x-auto">
                                                    {hotel.images.map((image, index) => (
                                                        <img
                                                            key={image}
                                                            src={`${BASE_URL}/hotels/${image}`}
                                                            alt={`View ${image}`}
                                                            className="h-16 w-16 object-cover rounded"
                                                            onError={(e) => {
                                                                e.target.src = '/placeholder-hotel.jpg';
                                                                e.target.onError = null;
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="text-sm text-gray-500">
                                                {hotel.rooms ? hotel.rooms.length : 0} Rooms
                                            </span>
                                            <button
                                                onClick={() => router.push(`/hotel/${hotel._id}/add-room`)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Add Room
                                            </button>
                                            <button
                                                onClick={() => router.push(`/hotel/${hotel._id}`)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* Bookings Tab Content */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6">
                        {bookings.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <h3 className="text-lg text-gray-500">No bookings yet</h3>
                                <p className="mt-2 text-gray-400">Your bookings will appear here</p>
                            </div>
                        ) : (
                            bookings?.map((booking) => (
                                <div key={booking?._id} className="bg-white rounded-lg shadow-lg p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {booking?.room?.hotel?.name} - {booking?.room?.type}
                                            </h3>
                                            <div className="mt-2 space-y-2">
                                                <p className="flex items-center text-gray-600">
                                                    <FaUser className="mr-2" />
                                                    Guest: {booking?.user.email}
                                                </p>
                                                <p className="flex items-center text-gray-600">
                                                    <FaCalendar className="mr-2" />
                                                    Check-in: {formatDate(booking?.checkIn)}
                                                </p>
                                                <p className="flex items-center text-gray-600">
                                                    <FaCalendar className="mr-2" />
                                                    Check-out: {formatDate(booking?.checkOut)}
                                                </p>
                                                <p className="flex items-center text-gray-600">
                                                    <FaUser className="mr-2" />
                                                    Guests: {booking?.guestCount}
                                                </p>
                                                {booking?.specialRequests && (
                                                    <div className="mt-4">
                                                        <h4 className="text-sm font-medium text-gray-900">Special Requests:</h4>
                                                        <p className="mt-1 text-gray-600">{booking?.specialRequests}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium
                                                ${booking?.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    booking?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}
                                            >
                                                {booking?.status}
                                            </span>
                                            <p className="mt-2 text-xl font-bold text-blue-600">
                                                ${booking?.totalPrice}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 