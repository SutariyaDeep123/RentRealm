'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function EditRoom({ params }) {
  const router = useRouter();
  const { hotelId, roomId } = params;
  
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: '',
    price: '',
    capacity: '',
    description: '',
    amenities: [],
    // Add other relevant room fields
  });

  useEffect(() => {
    // Fetch room data
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomId}`);
        if (!response.ok) throw new Error('Failed to fetch room');
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        toast.error('Error fetching room details');
        console.error(error);
      }
    };

    fetchRoom();
  }, [hotelId, roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update room');
      toast.success('Room updated successfully');
      router.push(`/hotel/${hotelId}/room/${roomId}`);
    } catch (error) {
      toast.error('Error updating room');
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Room</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Room Number</label>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Room Type</label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
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
        <div>
          <label className="block mb-2">Capacity</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
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