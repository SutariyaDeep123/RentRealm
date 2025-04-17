"use client"
import { useState } from 'react';
import { UserCircle, Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/forgot-password", { email });
            toast.success("Password reset email sent successfully");
            setEmail('');
        } catch (error) {
            toast.error("Failed to send reset email. Please try again.");
            console.error("Error sending reset email:", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <h2 className="text-2xl font-semibold text-blue-800">Forgot Password</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                className="w-full p-2 pl-10 border rounded focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                    >
                        Reset Password
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <a href="/login" className="text-sm text-blue-600 hover:underline">
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
}
