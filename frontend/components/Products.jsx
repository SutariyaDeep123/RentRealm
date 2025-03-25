"use client"
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';

export default function Products({ data, type = 'listing' }) {
    const router = useRouter();

    const handleClick = (id) => {
        router.push(`/${type}/${id}`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {data?.map((item) => (
                <div 
                    key={item._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                    onClick={() => handleClick(item._id)}
                >
                    <div className="relative h-48 w-full">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.mainImage}`}
                            alt={item.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{item.address?.city}, {item.address?.country}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="text-lg font-semibold">
                                ${type === 'hotel' 
                                    ? `${item.rooms?.[0]?.price || 0} - ${item.rooms?.[item.rooms.length - 1]?.price || 0}`
                                    : item.price
                                }
                                <span className="text-sm text-gray-600">/night</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}