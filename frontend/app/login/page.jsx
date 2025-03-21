"use client"
import icon from '@/public/google-icon-logo-svgrepo-com.svg'
import axios from 'axios';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import GoogleLogo from '@/public/google-color-svgrepo-com.svg'
import Image from 'next/image';
import Input from '@/components/ui/Input';
import { useUser } from '@/components/ui/UserContext';
function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { user, setUser } = useUser()


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(process.env.NEXT_PUBLIC_BACKEND_URL)
        axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/login", formData).then((data) => {
            console.log(data, "=================")
            if (data.data) {
                toast("Login successfull")
                setUser({ email: data.data.data.email, name: data.data.data.firstName })
                localStorage.setItem("name", data?.data?.data?.name ? data?.data?.data?.name : data?.data?.data?.firstName)
                localStorage.setItem("email", data?.data?.data?.email)
                window.location.href = '/'
            }
        }).catch((e) => {
            console.log(e)
            toast.error(e.response.data.error.message)
        })
        console.log(user,"======================")
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                <h1 className="text-3xl font-semibold text-center text-gray-700">
                    Login <span className="text-blue-500"></span>
                </h1>
                <form onSubmit={handleSubmit} className='text-center flex flex-col gap-3'>

                    <div className='text-left flex flex-col gap-3'>
                        <Input lable='Username' placeholder='Enter your username' name="email" value={formData.email} onChange={handleChange} />
                        <Input lable='Password' type='password' placeholder='Enter your password' name="password" value={formData.password} onChange={handleChange} />
                    </div>
                    <div className='flex flex-col'>
                        <a href="/signup" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                            Dont  have an account?
                        </a>
                        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                            forgot password?
                        </a>
                    </div>
                    <a href={process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/google"} className='border border-gray-500 rounded-md px-4 py-2 w-full flex items-center justify-center'>
                        <div className='flex items-center'>
                            <Image src={GoogleLogo} height={20} width={20} alt="Google Logo" />
                            <span className='ml-2'>Sign in with Google</span>
                        </div>
                    </a>
                    <div className='w-full'>
                        <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;