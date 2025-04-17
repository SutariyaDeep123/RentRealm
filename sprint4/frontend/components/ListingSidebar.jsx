import { useState, useEffect } from "react";
import DualSlider from "./ui/DualSlider";
import axios from "axios";

export default function ListingSidebar({ open, onFiltersChange }) {
    const [rangeValues, setRangeValues] = useState([0, 5000]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [amenities, setAmenities] = useState([]);

    useEffect(() => {
        // Fetch amenities from backend
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/amenities`)
            .then(response => {
                setAmenities(response.data.data);
            })
            .catch(error => console.error('Error fetching amenities:', error));
    }, []);

    useEffect(() => {
        // Update parent component with filter values
        onFiltersChange({
            priceRange: rangeValues,
            amenities: selectedAmenities,
        });
    }, [rangeValues, selectedAmenities]);

    const toggleAmenity = (amenityId) => {
        setSelectedAmenities(prev =>
            prev.includes(amenityId)
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId]
        );
    };

    return (
        <div className={`fixed h-full lg:w-72 w-[50vw] shadow-xl shadow-gray-500 px-5 pb-16 overflow-scroll transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div>
                <p className="text-text-primary text-lg">Listing Filters</p>
                <p>Price Range</p>
                <DualSlider
                    className="my-8"
                    defaultValue={rangeValues}
                    max={5000}
                    min={0}
                    step={1}
                    onValueChange={setRangeValues}
                />
            </div>
            

            <div>
                <label className="block text-sm mb-2">Amenities</label>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    {amenities.map((amenity) => (
                        <div
                            key={amenity.id}
                            className={`flex flex-col items-center justify-center p-2 h-18 rounded-lg border ${
                                selectedAmenities.includes(amenity.id)
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
        </div>
    );
} 