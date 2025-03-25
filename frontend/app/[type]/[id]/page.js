"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Headers from '@/components/Headers';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import RoomCard from '@/components/RoomCard';
import BookingForm from '@/components/BookingForm';

export default function DetailPage() {
    const params = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = params.type === 'hotel' 
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotels/${params.id}`
                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/listing/${params.id}`;
                
                const response = await axios.get(endpoint);
                setData(response.data?.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id, params.type]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>No data found</div>;

    return (
        <div>
            <Headers />
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{data?.name}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-1" />
                            <span>{`${data?.address?.city}, ${data?.address?.country}`}</span>
                        </div>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="relative h-96">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${data?.mainImage}`}
                            alt={data?.name}
                            fill
                            className="rounded-lg object-cover"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {data?.images?.slice(0, 4).map((image, index) => (
                            <div key={index} className="relative h-44">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${image}`}
                                    alt={`${data?.name} ${index + 1}`}
                                    fill
                                    className="rounded-lg object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`grid ${params.type === 'listing' ? 'grid-cols-3 gap-8' : 'grid-cols-1'}`}>
                    {/* Main Content */}
                    <div className={params.type === 'listing' ? 'col-span-2' : 'w-full'}>
                        {/* Description */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">About this place</h2>
                            <p className="text-gray-600">{data?.description}</p>
                        </div>

                        {/* Amenities */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {data?.amenities?.map((amenity) => (
                                    <div key={amenity._id} className="flex items-center gap-2">
                                        <img 
                                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${amenity.icon}`}
                                            alt={amenity.name}
                                            className="w-6 h-6"
                                        />
                                        <span>{amenity.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rooms Section (Only for Hotels) */}
                        {params.type === 'hotel' && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4">Available Rooms</h2>
                                <div className="space-y-4">
                                    {data?.rooms?.map((room) => (
                                        <RoomCard 
                                            key={room._id} 
                                            room={room} 
                                            hotelId={data?._id}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Booking Sidebar (Only for Listings) */}
                    {params.type === 'listing' && (
                        <div className="col-span-1">
                            <div className="sticky top-24 bg-white rounded-lg shadow-lg p-6">
                                <BookingForm 
                                    type={params.type}
                                    propertyId={params.id}
                                    price={data?.price}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 