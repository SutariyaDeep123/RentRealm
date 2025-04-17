"use client"

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AddListing = dynamic(() => import('@/components/Addlisting'), {
    ssr: false,
    loading: () => <div>Loading Add Listing...</div>,
  });
  
export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddListing />
        </Suspense>
    );
}