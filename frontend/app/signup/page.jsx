"use client"
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Image from 'next/image';
import GoogleLogo from '@/public/google-color-svgrepo-com.svg'

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Please enter the same password in both fields");
            return;
        }

        axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/signup", formData).then((data) => {
            console.log(data, "=================")
            if (data.data) {
                toast.success("Sign up successful")
                localStorage.setItem("name", data?.data?.data?.name)
                localStorage.setItem("email", data?.data?.data?.email)
                window.location.href = '/'
            }
        }).catch((e) => {
            console.log(e)
            toast.error(e.response.data.error.message)
        })
    };
    function formChange(e){
        console.log(e.target)
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                <h1 className="text-3xl font-semibold text-center text-gray-700 mb-6">
                    Sign Up <span className="text-blue-500"></span>
                </h1>
                <form onSubmit={handleSubmit} className='text-center flex flex-col gap-3' onChange={formChange}>
                    <div className='text-left'>
                        <label className="p-2">
                            <span className="text-base label-text">Full Name</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full input input-bordered h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div className='text-left'>
                        <label className="p-2">
                            <span className="text-base label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full input input-bordered h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div className='text-left'>
                        <label className="p-2">
                            <span className="text-base label-text">Password</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full input input-bordered h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div className='text-left'>
                        <label className="p-2">
                            <span className="text-base label-text">Confirm Password</span>
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className="w-full input input-bordered h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    <div className='flex flex-col'>
                        <a href="/login" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                            Already have an account?
                        </a>
                    </div>
                    <a href={process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/google"} className='border border-gray-500 rounded-md px-4 py-2 w-full flex items-center justify-center'>
                        <div className='flex items-center'>
                            <Image src={GoogleLogo} height={20} width={20} alt="Google Logo" />
                            <span className='ml-2'>Sign up with Google</span>
                        </div>
                    </a>
                    <div className='w-full'>
                        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all">
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
