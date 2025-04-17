import { useUser } from "./ui/UserContext"
import { FaCircleUser } from "react-icons/fa6";
import DualSlider from "./ui/DualSlider";
import { useState } from "react";
import Button from "./ui/Button";
import { Menu, UserCircle, ChevronDown, Star, Wifi, Coffee, Utensils, Dog, Goal, Beer, House, ParkingMeter, PenTool, WashingMachine } from 'lucide-react';


export default function Sidebar({ open, onClose }) {
    const { user, setUser } = useUser();
    const [rangeValues, setRangeValues] = useState([500, 4500]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    const handleRangeChange = (newValues) => {
        setRangeValues(newValues);
        console.log('Selected range:', newValues);
    };

    const toggleAmenity = (amenityName) => {
        setSelectedAmenities((prevSelected) =>
            prevSelected.includes(amenityName)
                ? prevSelected.filter((name) => name !== amenityName) // Remove if already selected
                : [...prevSelected, amenityName] // Add if not selected
        );
    };

    return (
        <>
            <div className={`fixed h-full lg:w-72 w-[50vw] shadow-xl shadow-gray-500 px-5 pb-16 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full p-6 transition-transform duration-300 overflow-scroll ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}>
                <div>
                    <p className="text-text-primary text-lg">Filters</p>
                    <p className="">Price Range</p>
                    <DualSlider
                        className={"my-8"}
                        defaultValue={rangeValues}
                        max={5000}
                        min={100}
                        step={1}
                        onValueChange={handleRangeChange}
                    />
                </div>
                <div>
                    <label className="block text-sm mb-2">Rating</label>
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-6 h-6 text-yellow-400" />
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm mb-2">Amenities</label>
                    <div className="grid grid-cols-2  gap-y-4 gap-x-2">
                        {[
                            { name: 'Wi-Fi', icon: Wifi },
                            { name: 'Pool', icon: PenTool },
                            { name: 'Ocean View', icon: Coffee },
                            { name: 'Restaurant', icon: Utensils },
                            { name: 'Hot Tub', icon: House },
                            { name: 'Parking', icon: ParkingMeter },
                            { name: 'Pet Friendly', icon: Dog },
                            { name: 'Golf', icon: Goal },
                            { name: 'Bar', icon: Beer },
                            { name: 'Washer/Dryer', icon: WashingMachine },
                        ].map((amenity) => (
                            <div
                                key={amenity.name}
                                className={`flex flex-col items-center justify-center space-x-2 p-2 h-18 rounded-lg border ${selectedAmenities.includes(amenity.name)
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-300'
                                    } cursor-pointer`}
                                onClick={() => toggleAmenity(amenity.name)}
                            >
                                <amenity.icon className="w-10 h-10 text-blue-800" />
                                <span className=' text-xs'>{amenity.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </>
    )
}