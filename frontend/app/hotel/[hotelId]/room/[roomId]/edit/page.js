'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function EditRoom({ params }) {
  const router = useRouter();
  const { hotelId, roomId } = params;

  const [formData, setFormData] = useState({
    type: '',
    price: '',
    description: '',
    images: [],
  });
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const roomTypes = [
    { value: 'single', label: 'Single Room' },
    { value: 'double', label: 'Double Room' },
    { value: 'suite', label: 'Suite' },
  ];

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const roomResponse = await axios.get(`${BASE_URL}/rooms/${roomId}`);
        if (!roomResponse.data) throw new Error('Failed to fetch room details');
        const roomData = roomResponse.data.data;
        console.log(roomData, "roomData")
        setFormData({
          type: roomData.type,
          price: roomData.price,
          description: roomData.description,
          images: roomData.images || [],
        });
        setSelectedAmenities(roomData.amenities.map(a=>a._id) || []); // Initialize selected amenities
      } catch (error) {
        toast.error('Error fetching room details');
        console.error(error);
      }
    };
  
    const fetchAmenities = async () => {
      try {
        const amenitiesResponse = await axios.get(`${BASE_URL}/amenities`);
        setAmenities(amenitiesResponse.data.data || []);
      } catch (error) {
        toast.error('Error fetching amenities');
        console.error(error);
      }
    };
  
    fetchRoomDetails();
    fetchAmenities();
  }, [roomId]);
  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('amenities', JSON.stringify(selectedAmenities));

      // Append new images to the form data
      newImages.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await axios.put(
        `${BASE_URL}/rooms/${roomId}`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.status !== 200) throw new Error('Failed to update room');
      toast.success('Room updated successfully');
      router.push(`/hotel/${hotelId}/room/${roomId}`);
    } catch (error) {
      toast.error('Error updating room');
      console.error(error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle amenity selection toggle
  const toggleAmenity = (amenityId) => {
    setSelectedAmenities(prev => {
      // Create a new array based on the previous selected amenities
      const updatedAmenities = prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)  // If it’s already selected, remove it
        : [...prev, amenityId];  // If it’s not selected, add it
  
      console.log("Updated Amenities:", updatedAmenities); // You can check this in the console
      return updatedAmenities;  // Return the new state array
    });
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    setNewImages([...newImages, ...e.target.files]);
  };

  // Handle image deletion
  const deleteImage = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageUrl),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Room</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Room Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            {roomTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block mb-2">Price per Night</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
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


        {/* Existing Images */}
        <div>
          <label className="block text-sm mb-2">Existing Images</label>
          <div className="flex flex-wrap gap-4">
            {formData.images.map((imageUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={`${BASE_URL}/${imageUrl}`}
                  alt={`Room Image ${index + 1}`}
                  className="w-32 h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => deleteImage(imageUrl)}
                  className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full"
                >
                  <FaTrash className="text-white-600" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload New Images */}
        <div>
          <label className="block text-sm mb-2">Upload New Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Update Room
        </button>
      </form>
    </div>
  );
}
