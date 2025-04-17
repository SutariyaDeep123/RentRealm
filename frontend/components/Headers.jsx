"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, logoutUser } from '@/utils/auth';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            if (isAuthenticated()) {
                const userData = getUser();
                setUser(userData);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        logoutUser();
        setUser(null);
        // The redirect will be handled by logoutUser()
    };

    if (isLoading) {
        return null; // or a loading spinner
    }

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex text-blue-600 font-bold text-3xl items-center">
                            RentRealm
                        </Link>
                    </div>

                    <div className="flex items-center">
                        {isAuthenticated() && user ? (
                            <>

                                <span className="text-gray-700 px-3">
                                    Welcome, {user.name}
                                </span>
                                {user.role === 'admin' && (
                                    <a
                                        href='/admin/dashboard'
                                        className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        Admin
                                    </a>
                                )}
                                {
                                    user.role === 'user' && (

                                        <>
                                            <a
                                                href='/my-hotels'
                                                className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                MY Hotels
                                            </a>
                                            <a
                                                href='/my-listings'
                                                className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                MY Property
                                            </a>
                                            <a
                                                href='/add'
                                                className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                + ADD
                                            </a>
                                            <a
                                                href='/bookings'
                                                className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                My Bookings
                                            </a>
                                        </>
                                    )
                                }

                                <button
                                    onClick={handleLogout}
                                    className="ml-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="ml-4 px-4 py-2 rounded border border-blue-500 text-blue-500 hover:bg-blue-50"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 