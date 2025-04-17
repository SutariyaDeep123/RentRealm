"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import Headers from "@/components/Headers";
import SearchBar from "@/components/SearchBar";
import ListingSidebar from "@/components/ListingSidebar";
import HotelSidebar from "@/components/HotelSidebar";
import Products from "@/components/Products";
import Pagination from "@/components/Pagination";

export default function Home() {
  const [activeTab, setActiveTab] = useState('listing'); 
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, filters, pagination.page]);

  const fetchData = async () => {
    try {
      let endpoint = activeTab === 'listing'
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/listing`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotels`;

      // Construct query parameters based on filters and pagination
      const params = new URLSearchParams();

      // Pagination params
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);

      // Filter params
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

      if (filters.city) {
        params.append('city', filters.city);
      }

      const response = await axios.get(`${endpoint}?${params.toString()}`);
      
      console.log(response.data, "=================data")
      if (activeTab === 'listing') {
        setItems(response.data.data.listings || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages
        }));
      } else {
        setItems(response.data.data.hotels || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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
          onClick={() => {
            setActiveTab('listing');
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
        >
          Listings
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'hotel'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
          onClick={() => {
            setActiveTab('hotel');
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
        >
          Hotels
        </button>
      </div>

      <div className="relative">
        {activeTab === 'listing' ? (
          <ListingSidebar
            open={sidebarOpen}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          />
        ) : (
          <HotelSidebar
            open={sidebarOpen}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          />
        )}

        <div className="lg:ml-72">
          <div>
            <Products data={items} type={activeTab} />
            <Pagination 
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}