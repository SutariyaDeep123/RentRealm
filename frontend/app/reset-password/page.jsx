"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from 'react';
import { UserCircle, Lock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    async function delay(time) {
        await new Promise((resolve) => setTimeout(resolve, time));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/reset-password", {
                token,
                newPassword: password
            });
            toast.success("Password reset successfully");
            await delay(1000)
            window.location.href = '/login';
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.error.message || "Failed to reset password. Please try again.");
            console.error("Error resetting password:", error);
        }
    };

    return (
        <Suspense fallback="Loading...">
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <div className="flex flex-col items-center mb-6">
                        <UserCircle className="w-20 h-20 text-blue-800 mb-2" />
                        <h2 className="text-2xl font-semibold text-blue-800">Reset Password</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    id="password"
                                    className="w-full p-2 pl-10 border rounded focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="w-full p-2 pl-10 border rounded focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </Suspense>
    );
}
