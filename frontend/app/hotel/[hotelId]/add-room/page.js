"use client"
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { isAuthenticated } from '@/utils/auth';

export default function AddRoom() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [amenities, setAmenities] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);


    const [formData, setFormData] = useState({
        type: 'single', // default room type
        price: '',
        description: '',
        amenities: [],
        capacity: 1
    });
    const [images, setImages] = useState([]);

    const roomTypes = [
        { value: 'single', label: 'Single Room' },
        { value: 'double', label: 'Double Room' },
        { value: 'suite', label: 'Suite' },
    ];



    useEffect(() => {
        // Fetch amenities from backend
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/amenities`)
            .then(response => {
                setAmenities(response.data.data);
            })
            .catch(error => console.error('Error fetching amenities:', error));
    }, []);
    const toggleAmenity = (amenityId) => {
        setSelectedAmenities(prev =>
            prev.includes(amenityId)
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId]
        );
        console.log(amenities)
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAmenityChange = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleImageChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formDataObj = new FormData();

            // Append room data
            Object.keys(formData).forEach(key => {
                if (key !== "amenities") { // Skip amenities as we'll handle them separately
                    formDataObj.append(key, formData[key]);
                }
            });

            // Append selected amenities as a JSON string
            formDataObj.append('amenities', JSON.stringify(selectedAmenities));

            // Append images
            images.forEach(image => {
                formDataObj.append('images', image);
            });

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/${params.hotelId}`,
                formDataObj,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            router.push(`/hotel/${params.hotelId}`);
        } catch (err) {
            setError(err.response?.data?.error.message || 'Failed to add room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Add New Room</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Room Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        {roomTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Night</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Capacity (Max Guests)</label>
                    <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm mb-2">Amenities</label>
                    <div className="grid grid-cols-6 gap-y-4 gap-x-2">
                        {amenities.map((amenity) => (
                            <div
                                key={amenity._id}
                                className={`flex flex-col items-center justify-center p-2 h-18 rounded-lg border ${selectedAmenities.includes(amenity._id)
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-300'
                                    } cursor-pointer`}
                                onClick={() => toggleAmenity(amenity._id)}
                            >
                                <img
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${amenity.icon}`}
                                    alt={amenity.name}
                                    className="w-10 h-10"
                                />
                                <span className='text-xs'>{amenity.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Room Images</label>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        multiple
                        className="mt-1 block w-full"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Adding Room...' : 'Add Room'}
                </button>
            </form>
        </div>
    );
} 