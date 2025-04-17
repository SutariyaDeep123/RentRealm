"use client"
import Headers from '@/components/Headers';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AddListingLayout({ children }) {
    return (
        <ProtectedRoute>
            <Headers/>
            {children}
        </ProtectedRoute>
    );
} 