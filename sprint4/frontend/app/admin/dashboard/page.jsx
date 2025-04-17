// app/admin/dashboard/page.jsx
"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
export default function AdminDashboard() {
    const [userData, setUserData] = useState([]);
    const [bookingData, setBookingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [usersRes, bookingsRes] = await Promise.all([
                    axios.get(BASE_URL+'/admin/dashboard/users', { params: { year } }),
                    axios.get(BASE_URL+'/admin/dashboard/bookings', { params: { year } })
                ]);
                console.log(usersRes,bookingsRes)
                setUserData(usersRes?.data?.data?.users?.registrations);
                setBookingData(bookingsRes?.data?.data?.bookings?.bookingsByMonth);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formatChartData = (data) => {
        return data.map(item => ({
            ...item,
            name: monthNames[item.month - 1]
        }));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <select 
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="px-4 py-2 border rounded"
                >
                    {[2023, 2024, 2025].map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">User Registrations ({year})</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={formatChartData(userData)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name="Registrations" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Bookings ({year})</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formatChartData(bookingData)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Bookings" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}