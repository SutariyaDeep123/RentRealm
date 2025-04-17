'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import Image from 'next/image';
import { FaTrash } from 'react-icons/fa';
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function EditHotel({ params }) {
  const router = useRouter();
  const { hotelId } = params;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      country: '',
      zip: '',
    },
    amenities: [],
    location: {
      coordinates: [0, 0]
    },
  });

  const [images, setImages] = useState({
    mainImage: null,
    additionalImages: []
  });

  const [preview, setPreview] = useState({
    mainImage: '',
    additionalImages: []
  });

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/hotels/${hotelId}`);
        const hotelData = response.data.data;

        setFormData({
          name: hotelData.name,
          description: hotelData.description,
          address: hotelData.address || {
            street: '',
            city: '',
            country: '',
            zip: '',
          },
          amenities: hotelData.amenities || [],
          location: hotelData.location || {
            coordinates: [0, 0]
          },
        });

        setPreview({
          mainImage: hotelData.mainImage ? `${BASE_URL}/${hotelData.mainImage}` : '',
          additionalImages: hotelData.images ? hotelData.images.map(img => `${BASE_URL}/${img}`) : []
        });
      } catch (error) {
        toast.error('Error fetching hotel details');
        console.error(error);
      }
    };

    fetchHotel();
  }, [hotelId]);

  const handleChange = (e) => {
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
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
    } else if (name === 'images') {
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
  const handleDeleteImage = (index) => {
    if (window.confirm("are you sure you want to delete this image")) {
      setPreview((prev) => ({
        ...prev,
        additionalImages: prev.additionalImages.filter((_, i) => i !== index),
      }));
      setImages((prev) => ({
        ...prev,
        additionalImages: prev.additionalImages.filter((_, i) => i !== index),
      }));
    }
  };
  const handleDeleteMainImage = () => {
    if (window.confirm("are you sure you want to delete this image")) {

      setPreview((prev) => ({
        ...prev,
        mainImage: '',
      }));
      setImages((prev) => ({
        ...prev,
        mainImage: null,
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      // Append basic hotel information
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', JSON.stringify(formData.address));
      formDataToSend.append('location', JSON.stringify(formData.location));
      formDataToSend.append('amenities', JSON.stringify(formData.amenities));

      // Append images
      if (images.mainImage) {
        formDataToSend.append('mainImage', images.mainImage);
      }
      if (images.additionalImages.length > 0) {
        images.additionalImages.forEach(image => {
          formDataToSend.append('images', image);
        });
      }

      const response = await axios.put(
        `${BASE_URL}/hotels/${hotelId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Hotel updated successfully');
      router.push(`/hotel/${hotelId}`);
    } catch (error) {
      toast.error('Error updating hotel');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Hotel</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">Hotel Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Street</label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">City</label>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Country</label>
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Postal Code</label>
            <input
              type="text"
              name="address.postalCode"
              value={formData.address.zip}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">Main Image</label>
          <input
            type="file"
            name="mainImage"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full p-2 border rounded"
          />
          {preview.mainImage && (
            <div className="mt-2">
              <div className="relative group w-full">
                <img
                  src={preview.mainImage}
                  alt="Main hotel image preview"
                  fill
                  className="object-cover rounded"
                  onError={(e) => {
                    console.error('Image load error:', e);
                  }}
                />

                <button
                  type="button"
                  onClick={handleDeleteMainImage}
                  className="absolute top-1 right-1  bg-red-500 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >                                                <FaTrash className="text-white-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block mb-2">Additional Images</label>
          <input
            type="file"
            name="images"
            onChange={handleImageChange}
            accept="image/*"
            multiple
            className="w-full p-2 border rounded"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            {preview.additionalImages.map((url, index) => (
              <div key={index} className="relative  group w-full">
                <img
                  src={url}
                  alt={`Hotel image ${index + 1}`}
                  fill
                  className="object-cover rounded"
                  onError={(e) => {
                    console.error('Image load error:', e);
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >                                                <FaTrash className="text-white-600" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Update Hotel
        </button>
      </form>
    </div>
  );
}