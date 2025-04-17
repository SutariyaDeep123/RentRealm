"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { isAuthenticated } from '@/utils/auth';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaEdit, FaTrash, FaCalendar, FaUser, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function MyListings() {
    const router = useRouter();
    const [listings, setListings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'bookings'

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [listingsResponse, bookingsResponse] = await Promise.all([
                axios.get(`${BASE_URL}/listing/my-listings`),
                axios.get(`${BASE_URL}/listing/my/bookings`),
            ]);
            setListings(listingsResponse.data.data.listings);
            setBookings(bookingsResponse.data.data);
            console.log(bookingsResponse.data.data, "=================")
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to fetch data');
            toast.error(err.response?.data?.error?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (listingId) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;

        try {
            await axios.delete(`${BASE_URL}/listing/${listingId}`);
            setListings(listings.filter(listing => listing._id !== listingId));
            toast.success('Listing deleted successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete listing');
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
                    <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('listings')}
                            className={`px-4 py-2 rounded-lg ${
                                activeTab === 'listings'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            My Listings
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`px-4 py-2 rounded-lg ${
                                activeTab === 'bookings'
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

                {/* Listings Tab Content */}
                {activeTab === 'listings' && (
                    listings.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <h3 className="text-lg text-gray-500">No properties listed yet</h3>
                            <p className="mt-2 text-gray-400">Start by adding your first property</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((listing) => (
                                <div key={listing._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                    <div className="relative h-48">
                                        <img
                                            src={`${BASE_URL}/${listing.mainImage}`}
                                            alt={listing.propertyType}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-property.jpg';
                                                e.target.onerror = null;
                                            }}
                                        />
                                        <div className="absolute top-2 right-2 space-x-2">
                                            <button
                                                onClick={() => router.push(`/listing/edit/${listing._id}`)}
                                                className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                                                title="Edit Listing"
                                            >
                                                <FaEdit className="text-blue-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(listing._id)}
                                                className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                                                title="Delete Listing"
                                            >
                                                <FaTrash className="text-red-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Gallery Preview */}
                                    {listing.additionalImages && listing.additionalImages.length > 0 && (
                                        <div className="px-4 py-2 border-t border-gray-200">
                                            <div className="flex gap-2 overflow-x-auto">
                                                {listing.additionalImages.map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={`${BASE_URL}/uploads/${image}`}
                                                        alt={`Additional view ${index + 1}`}
                                                        className="h-16 w-16 object-cover rounded"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-property.jpg';
                                                            e.target.onerror = null;
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                {listing.propertyType} for {listing.type}
                                            </h2>
                                            <span className="text-lg font-bold text-blue-600">
                                                ${listing.price}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-gray-600 mb-2">
                                            <FaMapMarkerAlt className="mr-1" />
                                            <span>{`${listing.address?.city}, ${listing.address?.state}`}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <div className="flex items-center">
                                                <FaBed className="mr-1" />
                                                <span>{listing.bedrooms} Beds</span>
                                            </div>
                                            <div className="flex items-center">
                                                <FaBath className="mr-1" />
                                                <span>{listing.bathrooms} Baths</span>
                                            </div>
                                            <div className="flex items-center">
                                                <FaRulerCombined className="mr-1" />
                                                <span>{listing.area} sq ft</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <span className={`px-3 py-1 rounded-full ${
                                                listing.status === 'available' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {listing.status}
                                            </span>
                                            <button
                                                onClick={() => router.push(`/listing/${listing._id}`)}
                                                className="text-blue-600 hover:text-blue-800"
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
                                <p className="mt-2 text-gray-400">Your property bookings will appear here</p>
                            </div>
                        ) : (
                            bookings.map((booking) => (
                                <div key={booking._id} className="bg-white rounded-lg shadow-lg p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {booking?.listing?.propertyType}
                                            </h3>
                                            <div className="mt-2 space-y-2">
                                                <p className="flex items-center text-gray-600">
                                                    <FaUser className="mr-2" />
                                                    Guest: {booking?.user?.email || 'N/A'}
                                                </p>
                                                <p className="flex items-center text-gray-600">
                                                    <FaCalendar className="mr-2" />
                                                    Check-in: {formatDate(booking?.checkIn)} 
                                                </p>
                                                <p className="flex items-center text-gray-600">
                                                    <FaCalendar className="mr-2" />
                                                    Check-out: {formatDate(booking?.checkOut)}
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