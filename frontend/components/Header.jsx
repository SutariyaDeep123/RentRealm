import { useEffect, useState } from 'react';
import { Menu, UserCircle, ChevronDown, Star, Wifi, Coffee, Utensils, Dog, Goal, Beer, House, ParkingMeter, PenTool, WashingMachine } from 'lucide-react';
import axios from 'axios';
import InputWithIcon from './ui/InputWithIcon';
import { ThemeProvider } from '@mui/material';
import DualSlider  from './ui/DualSlider';
import { Slider } from '@radix-ui/themes';

function valuetext(value) {
    return `${value}°C`;
}

export default function Home() {
    const [value, setValue] = useState([500, 5000]);
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [products, setProducts] = useState();
    const [rangeValues, setRangeValues] = useState([25, 75]);

    const handleRangeChange = (newValues) => {
        setRangeValues(newValues);
        console.log('Selected range:', newValues);
    };
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/listing`).then(response => {
            setProducts(response.data.data);
            console.log(response.data.data)
        }).catch((e) => {
            console.log(e)
        })
    }, [])


    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000);
    const handleMinChange = (e) => {
        const value = Math.min(Number(e.target.value), maxPrice - 1);
        setMinPrice(value);
    };

    const handleMaxChange = (e) => {
        const value = Math.max(Number(e.target.value), minPrice + 1);
        setMaxPrice(value);
    };
    const toggleAmenity = (amenityName) => {
        setSelectedAmenities((prevSelected) =>
            prevSelected.includes(amenityName)
                ? prevSelected.filter((name) => name !== amenityName) // Remove if already selected
                : [...prevSelected, amenityName] // Add if not selected
        );
    };


    useEffect(() => {
        setName(localStorage.getItem('name'))
        setEmail(localStorage.getItem('email'))
    })
    return (
        <div className="flex min-h-screen bg-bg-primary">
            {/* Overlay for Sidebar */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={` z-20 bg-white w-72 scroll [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full p-6 h-full transition-transform duration-300 overflow-scroll ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col items-center mb-8">
                    <UserCircle className="w-20 h-20 text-blue-800 mb-2" />
                    {
                        name ?
                            <><h2 className="text-xl font-semibold">{name}</h2>
                                <p className="text-sm text-gray-500">{email}</p></>
                            : <div>
                                <button className='bg-blue-600 text-white py-2 px-4  rounded-md'><a href="/login">Login</a></button>
                            </div>
                    }
                </div>
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-blue-800">Filters</h3>
                    <div>
                        <label className="block text-sm mb-2">Rating</label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-6 h-6 text-yellow-400" />
                            ))}
                        </div>
                    </div>

                    {/* Stay Options */}
                    <div>
                        <label className="block text-sm mb-2">Stay Options</label>
                        <select className="w-full bg-gray-100 p-2 rounded border border-gray-300">
                            <option>Hotels</option>
                            <option>Homes</option>
                        </select>
                    </div>

                    {/* Amenities */}
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

                        {/* Debugging (Optional): Show Selected Amenities */}
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold">Selected Amenities:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700">
                                {selectedAmenities.map((name) => (
                                    <li key={name}>{name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>


                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-72">
                {/* Header */}
                <header className="bg-white shadow-md p-4 flex justify-between items-center">
                    {!isMenuOpen && (
                        <button onClick={() => setIsMenuOpen(true)} className="lg:hidden">
                            <Menu className="w-6 h-6 text-blue-800" />
                        </button>
                    )}
                    <h1 className="text-xl font-bold text-blue-800">RentRealm</h1>

                    {
                        name ? <div>
                            <a className='bg-blue-600 text-white py-2 inline-block mr-3 px-4  rounded-md' href='/add-listing'>+ Add</a>
                            <button className='bg-blue-600 text-white py-2 px-4  rounded-md' >Logout</button>
                        </div> :
                            <button className='bg-blue-600 text-white py-2 px-4  rounded-md'><a href="/login">Login</a></button>
                    }
                </header>

                {/* Main Section */}
                <main className="p-6">
                    {/* Search Panel */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Plan Your Trip</h2>
                        {/* Search Form */}
                        <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                                <input type="date" className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                <input type="date" className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
                                <InputWithIcon lable={"traveler"} Icon={ChevronDown} />
                                <div className="relative">
                                    <select className="w-full p-2 border rounded appearance-none">
                                        <option>1 Adult</option>
                                        <option>2 Adults</option>
                                        <option>2 Adults, 1 Child</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Add your main content here */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products && products.map(product => (
                            <Card
                                key={product.id}
                                image={process.env.NEXT_PUBLIC_BACKEND_URL + "/" + product.mainImage}
                                name={product.address.street + product.address.city + product.address.state}
                                price={product.price}
                                description={product.description}
                            />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

const Card = ({ image, name, price, description }) => {
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
            <img className="w-full h-48 object-cover" src={image} alt={name} />
            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{name}</div>
                <p className="text-gray-700 text-base font-semibold mb-2">${price}</p>
                <p className="text-gray-600 text-sm truncate">{description}</p>
            </div>
        </div>
    );
};

