import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, MapPin, Phone, Mail, Building2, BarChart3, Package, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import axiosClient from '../../utils/axiosClient';
import toast from 'react-hot-toast';

const WarehouseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stockLevels, setStockLevels] = useState([]);
    const [recentMoves, setRecentMoves] = useState([]);

    useEffect(() => {
        fetchWarehouse();
        fetchStockData();
    }, [id]);

    const fetchWarehouse = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get(`/warehouses/${id}`);
            if (data.success) {
                setWarehouse(data.data);
            }
        } catch (error) {
            console.error("Error fetching warehouse", error);
            toast.error('Failed to load warehouse details');
            navigate('/warehouses');
        } finally {
            setLoading(false);
        }
    };

    const fetchStockData = async () => {
        try {
            // Fetch stock levels for this warehouse
            // This would need to be implemented in the backend
            // const { data } = await axiosClient.get(`/stock-levels?warehouse=${id}`);
            // setStockLevels(data.data);
        } catch (error) {
            console.error("Error fetching stock data", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!warehouse) {
        return (
            <div className="flex h-screen flex-col items-center justify-center">
                <Building2 className="h-16 w-16 text-slate-300 mb-4" />
                <p className="text-slate-600">Warehouse not found</p>
                <Button onClick={() => navigate('/warehouses')} className="mt-4">
                    Back to Warehouses
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/warehouses')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{warehouse.name}</h1>
                        <p className="text-sm text-slate-600 mt-1">
                            Code: <span className="font-mono font-medium">{warehouse.code}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(warehouse.status)}`}>
                        {warehouse.status}
                    </span>
                    <Button onClick={() => navigate('/warehouses')}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Warehouse
                    </Button>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                        Basic Information
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-slate-500">Warehouse Type</label>
                            <p className="text-slate-900 capitalize">{warehouse.type}</p>
                        </div>
                        {warehouse.address && (
                            <div>
                                <label className="text-sm font-medium text-slate-500 flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    Address
                                </label>
                                <p className="text-slate-900">{warehouse.address}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-slate-500">Capacity</label>
                            <p className="text-slate-900 text-xl font-semibold">
                                {warehouse.capacity ? warehouse.capacity.toLocaleString() : 'Not set'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
                    <div className="space-y-3">
                        {warehouse.contactPerson ? (
                            <div>
                                <label className="text-sm font-medium text-slate-500">Contact Person</label>
                                <p className="text-slate-900">{warehouse.contactPerson}</p>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm">No contact person specified</p>
                        )}
                        {warehouse.phone && (
                            <div>
                                <label className="text-sm font-medium text-slate-500 flex items-center">
                                    <Phone className="h-4 w-4 mr-1" />
                                    Phone
                                </label>
                                <p className="text-slate-900">{warehouse.phone}</p>
                            </div>
                        )}
                        {warehouse.email && (
                            <div>
                                <label className="text-sm font-medium text-slate-500 flex items-center">
                                    <Mail className="h-4 w-4 mr-1" />
                                    Email
                                </label>
                                <p className="text-slate-900">{warehouse.email}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-600">Total Products</h3>
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">0</p>
                    <p className="text-xs text-slate-500 mt-1">Product types in stock</p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-600">Total Stock</h3>
                        <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">0</p>
                    <p className="text-xs text-slate-500 mt-1">Total units in warehouse</p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-600">Stock Value</h3>
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">$0</p>
                    <p className="text-xs text-slate-500 mt-1">Estimated total value</p>
                </div>
            </div>

            {/* Stock Levels (Placeholder) */}
            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Stock Levels</h2>
                <div className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-600">No stock data available</p>
                    <p className="text-sm text-slate-400 mt-1">Stock levels will appear here once products are added to this warehouse</p>
                </div>
            </div>

            {/* Recent Movements (Placeholder) */}
            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Stock Movements</h2>
                <div className="flex flex-col items-center justify-center py-12">
                    <TrendingUp className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-600">No recent movements</p>
                    <p className="text-sm text-slate-400 mt-1">Stock movements will be tracked here</p>
                </div>
            </div>

            {/* Metadata */}
            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Metadata</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium text-slate-500">Created At</label>
                        <p className="text-slate-900">
                            {new Date(warehouse.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-500">Last Updated</label>
                        <p className="text-slate-900">
                            {new Date(warehouse.updatedAt || warehouse.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseDetail;
