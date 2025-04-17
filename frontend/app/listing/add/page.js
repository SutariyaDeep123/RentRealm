"use client"
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { isAuthenticated, getUser } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { FaBed, FaBath, FaRulerCombined, FaDollarSign, FaMapMarkerAlt, FaImages, FaHome } from 'react-icons/fa';

// You might need to adjust the icon import based on your project structure
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function AddListing() {
    const router = useRouter();
    const user = getUser();
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
        },
    });
    const [mainImageFile, setMainImageFile] = useState(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
    const [mapCenter, setMapCenter] = useState([0, 0]);
    const [showMap, setShowMap] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [amenities, setAmenities] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    // Check authentication on mount
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, []);
    useEffect(() => {
        // Fetch amenities from backend
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

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        setMainImageFile(file);
        setMainImagePreview(URL.createObjectURL(file));
    };

    const handleAdditionalImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setAdditionalImageFiles(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setAdditionalImagePreviews(previews);
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

            // Append all form data fields directly
            Object.keys(formData).forEach(key => {
                if (key === 'address' || key === 'location' || key === 'availability') {
                    formDataObj.append(key, JSON.stringify(formData[key]));
                } else {
                    formDataObj.append(key, formData[key]);
                }
            });

            // Append images
            if (mainImageFile) {
                formDataObj.append('mainImage', mainImageFile);
            }

            additionalImageFiles.forEach(file => {
                formDataObj.append('additionalImages', file);
            });
            formDataObj.append('amenities', selectedAmenities)

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/listing`,
                formDataObj,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            router.push('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add listing');
            toast.error(err.response?.data?.message || 'Failed to add listing');
        } finally {
            setLoading(false);
        }
    };

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
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center mb-6">
                        <FaHome className="text-blue-600 w-8 h-8 mr-3" />
                        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Property Type Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Listing Type</label>
                                <select
                                    name="type"
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Select Type</option>
                                    <option value="sale">For Sale</option>
                                    <option value="rent">For Rent</option>
                                    <option value="temporary_rent">Temporary Rent</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                                <select
                                    name="propertyType"
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
                                    placeholder="Street Address"
                                    onChange={handleInputChange}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="address.city"
                                    placeholder="City"
                                    onChange={handleInputChange}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="address.state"
                                    placeholder="State"
                                    onChange={handleInputChange}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="address.zip"
                                    placeholder="ZIP Code"
                                    onChange={handleInputChange}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="address.country"
                                    placeholder="Country"
                                    onChange={handleInputChange}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <button
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
                                    onChange={handleMainImageChange}
                                    accept="image/*"
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                {mainImagePreview && (
                                    <img src={mainImagePreview} alt="Main Image Preview" className="mt-2 max-h-48 rounded-lg" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <FaImages className="mr-2" /> Additional Images
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleAdditionalImagesChange}
                                    accept="image/*"
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                    {additionalImagePreviews.map((preview, index) => (
                                        <img
                                            key={index}
                                            src={preview}
                                            alt={`Additional Image ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* In the Price & Availability Section of AddListing.js */}
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
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                {formData.type !== 'sale' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Available From
                                            </label>
                                            {formData.type === 'rent' ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <select
                                                        name="availability.startMonth"
                                                        onChange={handleInputChange}
                                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                                                    >
                                                        <option value="">Month</option>
                                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                                    </select>
                                                    <select
                                                        name="availability.startYear"
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
                                                        onChange={handleInputChange}
                                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                                                    >
                                                        <option value="">Month</option>
                                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                                    </select>
                                                    <select
                                                        name="availability.endYear"
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
                            {loading ? 'Adding Property...' : 'Add Property'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
} 