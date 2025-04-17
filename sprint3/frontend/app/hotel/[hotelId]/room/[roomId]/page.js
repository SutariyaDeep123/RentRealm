"use client"
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Headers from '@/components/Headers';
import Image from 'next/image';
import { MapPin, Users, Calendar, DollarSign } from 'lucide-react';
import BookingForm from '@/components/BookingForm';

export default function RoomDetailPage() {
    const params = useParams();
    const [room, setRoom] = useState(null);
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both room and hotel details
                const [roomResponse, hotelResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/${params.roomId}`),
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hotels/${params.hotelId}`)
                ]);

                setRoom(roomResponse.data.data);
                setHotel(hotelResponse.data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.roomId, params.hotelId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!room || !hotel) return <div>No data found</div>;

    return (
        <div>
            <Headers />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{room.type} Room at {hotel.name}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-1" />
                            <span>{`${hotel?.address?.city}, ${hotel?.address?.country}`}</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="w-5 h-5 mr-1" />
                            <span>Max {room.type === 'single' ? '1' : room.type === 'double' ? '2' : '4'} guests</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2">
                        {/* Room Images */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {room.images?.map((image, index) => (
                                <div key={index} className="relative h-64">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${image}`}
                                        alt={`Room image ${index + 1}`}
                                        fill
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Room Description */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Room Details</h2>
                            <p className="text-gray-600">{room.description}</p>
                        </div>

                        {/* Room Amenities */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Room Amenities</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {room.amenities?.map((amenity) => (
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
                    </div>

                    {/* Booking Sidebar */}
                    <div className="col-span-1">
                        <div className="sticky top-24 bg-white rounded-lg shadow-lg p-6">
                            <BookingForm 
                                type="hotel"
                                propertyId={params.hotelId}
                                roomId={params.roomId}
                                price={room.price}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 