"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icon in Next.js
const icon = L.icon({
    iconUrl: '/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Map marker component
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? (
        <Marker position={position} icon={icon} />
    ) : null;
}

export default function AddHotel() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [position, setPosition] = useState([28.6139, 77.2090]); // Default to Delhi
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zip: ''
        },
        location: {
            type: 'Point',
            coordinates: [77.2090, 28.6139] // [longitude, latitude]
        }
    });
    const [images, setImages] = useState({
        mainImage: null,
        additionalImages: []
    });

    // Update coordinates when map position changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            location: {
                type: 'Point',
                coordinates: [position[1], position[0]] // Convert to [longitude, latitude]
            }
        }));
    }, [position]);

    // Reverse geocoding function
    const updateAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const address = response.data.address;
            
            setFormData(prev => ({
                ...prev,
                address: {
                    street: address.road || address.street || '',
                    city: address.city || address.town || '',
                    state: address.state || '',
                    country: address.country || '',
                    zip: address.postcode || ''
                }
            }));
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };

    // Handle map click
    const handleMapClick = async (newPosition) => {
        setPosition(newPosition);
        await updateAddressFromCoordinates(newPosition[0], newPosition[1]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
        const { name, files } = e.target;
        if (name === 'mainImage') {
            setImages(prev => ({
                ...prev,
                mainImage: files[0]
            }));
        } else {
            setImages(prev => ({
                ...prev,
                additionalImages: Array.from(files)
            }));
        }
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
            
            // Append hotel data
            Object.keys(formData).forEach(key => {
                if (typeof formData[key] === 'object') {
                    formDataObj.append(key, JSON.stringify(formData[key]));
                } else {
                    formDataObj.append(key, formData[key]);
                }
            });

            // Append images
            if (images.mainImage) {
                formDataObj.append('mainImage', images.mainImage);
            }
            
            if (images.additionalImages.length > 0) {
                images.additionalImages.forEach(image => {
                    formDataObj.append('images', image);
                });
            }

            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hotels`, formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            router.push('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add hotel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Add New Hotel</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hotel Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
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
                    <label className="block text-sm font-medium text-gray-700">Base Price per Night</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Map Section */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Select Location (Click on the map to set location)
                    </label>
                    <div className="h-[400px] w-full rounded-lg overflow-hidden">
                        <MapContainer
                            center={position}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationMarker position={position} setPosition={handleMapClick} />
                        </MapContainer>
                    </div>
                </div>

                {/* Address Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                        <input
                            type="text"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                            type="text"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                            type="text"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <input
                            type="text"
                            name="address.zip"
                            value={formData.address.zip}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Image Upload Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Main Image</label>
                    <input
                        type="file"
                        name="mainImage"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="mt-1 block w-full"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Images</label>
                    <input
                        type="file"
                        name="additionalImages"
                        onChange={handleImageChange}
                        accept="image/*"
                        multiple
                        className="mt-1 block w-full"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Adding Hotel...' : 'Add Hotel'}
                </button>
            </form>
        </div>
    );
} 