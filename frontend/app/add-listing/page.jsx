"use client"
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    const [mainImageFile, setMainImageFile] = useState(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
    const [mapCenter, setMapCenter] = useState([0, 0]);
    const [showMap, setShowMap] = useState(false);

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
        const formDataToSend = new FormData();

        // Append all form fields
        Object.keys(formData).forEach(key => {
            if (key === 'location') {
                // Send location as a stringified JSON
                formDataToSend.append('location', JSON.stringify(formData[key]));
            } else if (typeof formData[key] === 'object' && !Array.isArray(formData[key])) {
                Object.keys(formData[key]).forEach(subKey => {
                    formDataToSend.append(`${key}[${subKey}]`, formData[key][subKey]);
                });
            } else {
                formDataToSend.append(key, formData[key]);
            }
        });

        // Append files
        if (mainImageFile) {
            formDataToSend.append('mainImage', mainImageFile);
        }
        additionalImageFiles.forEach(file => {
            formDataToSend.append('additionalImages', file);
        });

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/listing/add-listings`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Listing added successfully!");
            window.location.href = '/'
            // Reset form or redirect
        } catch (error) {
            console.error("Error adding listing:", error);
            toast.error("Failed to add listing. Please try again.");
        }
    };
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Add New Listing</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">Type</label>
                    <select name="type" onChange={handleInputChange} required className="w-full p-2 border rounded">
                        <option value="">Select Type</option>
                        <option value="sale">Sale</option>
                        <option value="rent">Rent</option>
                        <option value="temporary_rent">Temporary Rent</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1">Property Type</label>
                    <select name="propertyType" onChange={handleInputChange} required className="w-full p-2 border rounded">
                        <option value="">Select Property Type</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="condo">Condo</option>
                        <option value="hotel">Hotel</option>
                    </select>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="address.street" placeholder="Street" onChange={handleInputChange} required className="p-2 border rounded" />
                        <input type="text" name="address.city" placeholder="City" onChange={handleInputChange} required className="p-2 border rounded" />
                        <input type="text" name="address.state" placeholder="State" onChange={handleInputChange} required className="p-2 border rounded" />
                        <input type="text" name="address.zip" placeholder="ZIP" onChange={handleInputChange} required className="p-2 border rounded" />
                        <input type="text" name="address.country" placeholder="Country" onChange={handleInputChange} required className="p-2 border rounded" />
                    </div>
                    <button onClick={handleAddressSubmit} className="mt-2 bg-blue-500 text-white p-2 rounded">Verify Address</button>
                </div>

                {showMap && (
                    <div className="h-96 w-full">
                        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationMarker />
                        </MapContainer>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block mb-1">Bedrooms</label>
                        <input type="number" name="bedrooms" onChange={handleInputChange} required className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block mb-1">Bathrooms</label>
                        <input type="number" name="bathrooms" onChange={handleInputChange} required className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block mb-1">Area (sq ft)</label>
                        <input type="number" name="area" onChange={handleInputChange} required className="w-full p-2 border rounded" />
                    </div>
                </div>

                <div>
                    <label className="block mb-1">Description</label>
                    <textarea name="description" onChange={handleInputChange} required className="w-full p-2 border rounded"></textarea>
                </div>

                <div>
                    <label className="block mb-1">Main Image</label>
                    <input type="file" onChange={handleMainImageChange} accept="image/*" className="w-full p-2 border rounded" />
                    {mainImagePreview && <img src={mainImagePreview} alt="Main Image Preview" className="mt-2 max-w-xs" />}
                </div>

                <div>
                    <label className="block mb-1">Additional Images</label>
                    <input type="file" multiple onChange={handleAdditionalImagesChange} accept="image/*" className="w-full p-2 border rounded" />
                    <div className="flex flex-wrap mt-2">
                        {additionalImagePreviews.map((preview, index) => (
                            <img key={index} src={preview} alt={`Additional Image ${index + 1}`} className="mr-2 mb-2 max-w-xs" />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block mb-1">Price</label>
                    <input type="number" name="price" onChange={handleInputChange} required className="w-full p-2 border rounded" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1">Available From</label>
                        <input type="date" name="availability.startDate" onChange={handleInputChange} required className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block mb-1">Available To</label>
                        <input type="date" name="availability.endDate" onChange={handleInputChange} required className="w-full p-2 border rounded" />
                    </div>
                </div>

                <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Listing</button>
            </form>
        </div>
    );
}
