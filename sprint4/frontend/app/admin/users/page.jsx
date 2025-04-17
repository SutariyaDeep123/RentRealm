"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/admin/users?page=${pagination.page}&limit=${pagination.limit}`);
                setUsers(response.data.data.users);
                setPagination(response.data.data.pagination);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [pagination.page, pagination.limit]);

    const handleDelete = async (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`${BASE_URL}/admin/users/${userId}`);
                // Refresh the current page after deletion
                const response = await axios.get(`${BASE_URL}/admin/users?page=${pagination.page}&limit=${pagination.limit}`);
                setUsers(response.data.users);
                setPagination(response.data.pagination);
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Users Management</h1>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded"
                />
            </div>

            <div className="bg-white rounded-lg shadow mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="text-red-600 hover:text-red-900 mr-4"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> users
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage}
                        className={`px-4 py-2 border rounded ${!pagination.hasPreviousPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    >
                        Previous
                    </button>
                    <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.page >= pagination.totalPages - 2) {
                                pageNum = pagination.totalPages - 4 + i;
                            } else {
                                pageNum = pagination.page - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-4 py-2 border rounded ${pagination.page === pageNum ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className={`px-4 py-2 border rounded ${!pagination.hasNextPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}