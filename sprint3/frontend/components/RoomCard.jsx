"use client"
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, DollarSign } from 'lucide-react';

export default function RoomCard({ room, hotelId }) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/hotel/${hotelId}/room/${room?._id}`);
    };

    return (
        <div 
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleClick}
        >
            <div className="flex gap-4">
                <div className="relative w-48 h-32">
                    {room?.images?.[0] && (
                        <Image
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${room?.images[0]}`}
                            alt={room?.type}
                            fill
                            className="rounded-lg object-cover"
                        />
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-semibold capitalize mb-2">{room?.type} Room</h3>
                    <div className="flex items-center gap-4 text-gray-600 mb-2">
                        <div className="flex items-center">
                            <Users className="w-5 h-5 mr-1" />
                            <span>Max {room?.type === 'single' ? '1' : room?.type === 'double' ? '2' : '4'} guests</span>
                        </div>
                        <div className="flex items-center">
                            <DollarSign className="w-5 h-5 mr-1" />
                            <span>${room?.price}/night</span>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-4">{room?.description}</p>
                    <div className="flex gap-2">
                        {room?.amenities?.map((amenity) => (
                            <span 
                                key={amenity?._id}
                                className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                            >
                                {amenity?.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 