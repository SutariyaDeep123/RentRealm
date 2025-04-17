'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { FaBed, FaBath, FaRulerCombined, FaDollarSign, FaMapMarkerAlt, FaImages, FaHome, FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// Leaflet icon setup
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function EditListing({ params }) {
    const router = useRouter();
    const { listingId } = params;
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        type: '',
        propertyType: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        },
        bedrooms: 0,
        bathrooms: 0,
        area: 0,
        description: '',
        price: 0,
        availability: {
            startDate: '',
            endDate: ''
        },
        location: {
            type: 'Point',
            coordinates: [0, 0]
        }
    });

    const [images, setImages] = useState({
        mainImage: null,
        additionalImages: []
    });

    const [preview, setPreview] = useState({
        mainImage: '',
        additionalImages: []
    });

    const [mapCenter, setMapCenter] = useState([0, 0]);
    const [showMap, setShowMap] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [amenities, setAmenities] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    // Fetch listing data
    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/listing/${listingId}`);
                const listingData = response.data.data;

                setFormData({
                    type: listingData.type,
                    propertyType: listingData.propertyType,
                    address: listingData.address || {
                        street: '',
                        city: '',
                        state: '',
                        zip: '',
                        country: ''
                    },
                    bedrooms: listingData.bedrooms,
                    bathrooms: listingData.bathrooms,
                    area: listingData.area,
                    description: listingData.description,
                    price: listingData.price,
                    availability: listingData.availability || {
                        startDate: '',
                        endDate: ''
                    },
                    location: listingData.location || {
                        type: 'Point',
                        coordinates: [0, 0]
                    }
                });
                console.log(listingData, "========================")
                setSelectedAmenities(listingData.amenities?.map(amenity => amenity._id) || []);

                setPreview({
                    mainImage: listingData.mainImage ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${listingData.mainImage}` : '',
                    additionalImages: listingData.additionalImages ?
                        listingData.additionalImages.map(img => `${process.env.NEXT_PUBLIC_BACKEND_URL}/${img}`) : []
                });

                if (listingData.location?.coordinates?.length === 2) {
                    setMapCenter([listingData.location.coordinates[1], listingData.location.coordinates[0]]);
                    setShowMap(true);
                }
            } catch (error) {
                toast.error('Error fetching listing details');
                console.error(error);
            }
        };

        fetchListing();
    }, [listingId]);

    // Fetch amenities
    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/amenities`)
            .then(response => {
                setAmenities(response.data.data);
            })
            .catch(error => console.error('Error fetching amenities:', error));
    }, []);

    const toggleAmenity = (amenityId) => {
        setSelectedAmenities(prev => {
            const updatedAmenities = prev.includes(amenityId)
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId];
            console.log("Updated Amenities:", updatedAmenities);
            return updatedAmenities;
        });
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
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e) => {
        const { name, files } = e.target;
        if (name === 'mainImage') {
            setImages(prev => ({
                ...prev,
                mainImage: files[0]
            }));
            setPreview(prev => ({
                ...prev,
                mainImage: URL.createObjectURL(files[0])
            }));
        } else if (name === 'additionalImages') {
            const fileArray = Array.from(files);
            setImages(prev => ({
                ...prev,
                additionalImages: fileArray
            }));
            setPreview(prev => ({
                ...prev,
                additionalImages: fileArray.map(file => URL.createObjectURL(file))
            }));
        }
    };

    const handleDeleteMainImage = () => {
        if (window.confirm("Are you sure you want to delete this image?")) {
            setPreview(prev => ({
                ...prev,
                mainImage: ''
            }));
            setImages(prev => ({
                ...prev,
                mainImage: null
            }));
        }
    };

    const handleDeleteAdditionalImage = (index) => {
        if (window.confirm("Are you sure you want to delete this image?")) {
            setPreview(prev => ({
                ...prev,
                additionalImages: prev.additionalImages.filter((_, i) => i !== index)
            }));
            setImages(prev => ({
                ...prev,
                additionalImages: prev.additionalImages.filter((_, i) => i !== index)
            }));
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        const { street, city, state, country, zip } = formData.address;
        const addressString = `${street}, ${city}, ${state} ${country}`;

        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: addressString,
                    format: 'json',
                    limit: 1
                }
            });

            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                setFormData(prev => ({
                    ...prev,
                    location: {
                        type: 'Point',
                        coordinates: [parseFloat(lon), parseFloat(lat)]
                    }
                }));
                setMapCenter([parseFloat(lat), parseFloat(lon)]);
                setShowMap(true);
            } else {
                toast.error("Location not found. Please check the address.");
            }
        } catch (error) {
            console.error("Error geocoding address:", error);
            toast.error("Error finding location. Please try again.");
        }
    };

    const LocationMarker = () => {
        const map = useMapEvents({
            click(e) {
                setFormData(prev => ({
                    ...prev,
                    location: {
                        type: 'Point',
                        coordinates: [e.latlng.lng, e.latlng.lat]
                    }
                }));
            },
        });

        return formData.location.coordinates[0] !== 0 ? (
            <Marker position={[formData.location.coordinates[1], formData.location.coordinates[0]]} />
        ) : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formDataObj = new FormData();

            // Append all form data fields
            Object.keys(formData).forEach(key => {
                if (key === 'address' || key === 'location' || key === 'availability') {
                    formDataObj.append(key, JSON.stringify(formData[key]));
                } else {
                    formDataObj.append(key, formData[key]);
                }
            });

            // Append images
            if (images.mainImage) {
                formDataObj.append('mainImage', images.mainImage);
            }
            images.additionalImages.forEach(file => {
                formDataObj.append('additionalImages', file);
            });

            // Append amenities
            formDataObj.append('amenities', JSON.stringify(selectedAmenities));

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/listing/${listingId}`,
                formDataObj,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            toast.success('Listing updated successfully');
            router.push(`/listing/${listingId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update listing');
            toast.error(err.response?.data?.message || 'Failed to update listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center mb-6">
                        <FaHome className="text-blue-600 w-8 h-8 mr-3" />
                        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Property Type Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Listing Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Select Type</option>
                                    <option value="sell">For sell</option>
                                    <option value="rent">For Rent</option>
                                    <option value="temporary_rent">Temporary Rent</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                                <select
                                    name="propertyType"
                                    value={formData.propertyType}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Select Property Type</option>
                                    <option value="house">House</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="condo">Condo</option>
                                </select>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center mb-4">
                                <FaMapMarkerAlt className="text-blue-600 w-5 h-5 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-900">Location Details</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    placeholder="Street Address"
                                    onChange={handleInputChange}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="address.city"
                                    value={formData.address.city}
                                    placeholder="City"
                                    onChange={handleInputChange}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="address.state"
                                    value={formData.address.state}
                                    placeholder="State"
                                    onChange={handleInputChange}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="address.zip"
                                    value={formData.address.zip}
                                    placeholder="ZIP Code"
                                    onChange={handleInputChange}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="address.country"
                                    value={formData.address.country}
                                    placeholder="Country"
                                    onChange={handleInputChange}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddressSubmit}
                                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                >
                                    <FaMapMarkerAlt className="mr-2" />
                                    Verify Location
                                </button>
                            </div>
                        </div>

                        {showMap && (
                            <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
                                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <LocationMarker />
                                </MapContainer>
                            </div>
                        )}

                        {/* Property Details Section */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700">
                                        <FaBed className="mr-2" /> Bedrooms
                                    </label>
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        value={formData.bedrooms}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700">
                                        <FaBath className="mr-2" /> Bathrooms
                                    </label>
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        value={formData.bathrooms}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700">
                                        <FaRulerCombined className="mr-2" /> Area (sq ft)
                                    </label>
                                    <input
                                        type="number"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows="4"
                                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm mb-2">Amenities</label>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                {amenities.map((amenity) => (
                                    <div
                                        key={amenity._id}
                                        className={`flex flex-col items-center justify-center p-2 h-18 rounded-lg border ${selectedAmenities.includes(amenity.id)
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-300'
                                            } cursor-pointer`}
                                        onClick={() => toggleAmenity(amenity.id)}
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

                        {/* Images Section */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <FaImages className="mr-2" /> Main Image
                                </label>
                                <input
                                    type="file"
                                    name="mainImage"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                {preview.mainImage && (
                                    <div className="mt-2 relative group">
                                        <img
                                            src={preview.mainImage}
                                            alt="Main Image Preview"
                                            className="max-h-48 rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleDeleteMainImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <FaImages className="mr-2" /> Additional Images
                                </label>
                                <input
                                    type="file"
                                    name="additionalImages"
                                    multiple
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                    {preview.additionalImages.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={img}
                                                alt={`Additional Image ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAdditionalImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/*  In the Price & Availability Section of EditListing.js */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Price & Availability</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700">
                                        <FaDollarSign className="mr-2" /> Price
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                                    />
                                </div>

                                {formData.type !== 'sell' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Available From
                                            </label>
                                            {formData.type === 'rent' ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <select
                                                        name="availability.startMonth"
                                                        value={formData.availability.startDate?.split('-')[1] || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                                                    >
                                                        <option value="">Month</option>
                                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                                    </select>
                                                    <select
                                                        name="availability.startYear"
                                                        value={formData.availability.startDate?.split('-')[0] || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                                                    >
                                                        <option value="">Year</option>
                                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </div>
                                            ) : (
                                                <input
                                                    type="date"
                                                    name="availability.startDate"
                                                    value={formData.availability.startDate}
                                                    onChange={handleInputChange}
                                                    min={today}
                                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Available To
                                            </label>
                                            {formData.type === 'rent' ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <select
                                                        name="availability.endMonth"
                                                        value={formData.availability.endDate?.split('-')[1] || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                                                    >
                                                        <option value="">Month</option>
                                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                                    </select>
                                                    <select
                                                        name="availability.endYear"
                                                        value={formData.availability.endDate?.split('-')[0] || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                                                    >
                                                        <option value="">Year</option>
                                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </div>
                                            ) : (
                                                <input
                                                    type="date"
                                                    name="availability.endDate"
                                                    value={formData.availability.endDate}
                                                    onChange={handleInputChange}
                                                    min={today}
                                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                                                />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white p-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Updating Property...' : 'Update Property'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}