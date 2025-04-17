"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import Headers from "@/components/Headers";
import SearchBar from "@/components/SearchBar";
import ListingSidebar from "@/components/ListingSidebar";
import HotelSidebar from "@/components/HotelSidebar";
import Products from "@/components/Products";

export default function Home() {
  const [activeTab, setActiveTab] = useState('listing'); 
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, filters]);

  const fetchData = async () => {
    try {
      let endpoint = activeTab === 'listing'
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/listing`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotels`;

      // Construct query parameters based on filters
      const params = new URLSearchParams();

      if (filters.priceRange) {
        params.append('minPrice', filters.priceRange[0]);
        params.append('maxPrice', filters.priceRange[1]);
      }

      if (filters.amenities?.length) {
        filters.amenities.forEach(amenity => {
          params.append('amenities', amenity);
        });
      }

      if (activeTab === 'hotel' && filters.roomTypes?.length) {
        filters.roomTypes.forEach(type => {
          params.append('roomTypes', type);
        });
      }

      if (filters.rating) {
        params.append('rating', filters.rating);
      }

      const response = await axios.get(`${endpoint}?${params.toString()}`);
      setItems(response.data.data.listings || response.data.data.hotels);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="bg-gray-200">
      <Headers className="sticky top-0 w-full z-10" />

      <div className="flex justify-center space-x-4 my-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'listing'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('listing')}
        >
          Listings
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'hotel'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('hotel')}
        >
          Hotels
        </button>
      </div>

      <div className="relative">
        {activeTab === 'listing' ? (
          <ListingSidebar
            open={sidebarOpen}
            onFiltersChange={setFilters}
          />
        ) : (
          <HotelSidebar
            open={sidebarOpen}
            onFiltersChange={setFilters}
          />
        )}

        <div className="lg:ml-72">
          <SearchBar className="py-6 border border-b-2" />
          <div>
            <Products data={items} type={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );
}
