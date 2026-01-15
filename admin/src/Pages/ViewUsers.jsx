import React from 'react';
import Navbar from '../components/Navbar';

const ViewUsers = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-20">
                <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">User List</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">Details of all registered users.</p>
                        </div>
                        <div className="border-t border-gray-200">
                            <div className="p-4">
                                <p className="text-gray-500">User list will be displayed here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewUsers;
