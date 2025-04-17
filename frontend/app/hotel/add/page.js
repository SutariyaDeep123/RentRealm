// app/hotel/add/page.js
"use client"

import dynamic from 'next/dynamic';

const AddHotelForm = dynamic(() => import('@/components/AddHotelForm'), { ssr: false });

export default function AddHotelPage() {
  return <AddHotelForm />;
}
