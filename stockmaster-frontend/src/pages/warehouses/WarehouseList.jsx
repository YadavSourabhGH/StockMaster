import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, MapPin, Building2, Phone, Mail, Search, Filter, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import axiosClient from '../../utils/axiosClient';
import toast from 'react-hot-toast';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mb-6 text-sm text-slate-600">{message}</p>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        variant={type === 'danger' ? 'destructive' : 'primary'}
                        onClick={onConfirm}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};

const WarehouseList = () => {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);
    const [filteredWarehouses, setFilteredWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [warehouseToDelete, setWarehouseToDelete] = useState(null);
    const [currentWarehouse, setCurrentWarehouse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [stats, setStats] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
        type: 'main',
        capacity: '',
        status: 'active'
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchWarehouses();
        fetchStats();
    }, []);

    useEffect(() => {
        filterWarehouses();
    }, [searchTerm, filterStatus, filterType, warehouses]);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/warehouses');
            if (response.success) {
                setWarehouses(response.data);
            }
        } catch (error) {
            console.error("Error fetching warehouses", error);
            toast.error(error.message || 'Failed to fetch warehouses');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axiosClient.get('/warehouses/stats');
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };

    const filterWarehouses = () => {
        let filtered = warehouses;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(w =>
                w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (w.address && w.address.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(w => w.status === filterStatus);
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(w => w.type === filterType);
        }

        setFilteredWarehouses(filtered);
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.code.trim()) {
            errors.code = 'Code is required';
        }

        if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }

        if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            errors.phone = 'Invalid phone number format';
        }

        if (formData.capacity && (isNaN(formData.capacity) || formData.capacity < 0)) {
            errors.capacity = 'Capacity must be a positive number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix form errors');
            return;
        }

        try {
            const payload = {
                ...formData,
                capacity: formData.capacity ? Number(formData.capacity) : 0
            };

            if (currentWarehouse) {
                const response = await axiosClient.put(`/warehouses/${currentWarehouse._id}`, payload);
                if (response.success) {
                    setWarehouses(warehouses.map(w => w._id === currentWarehouse._id ? response.data : w));
                    toast.success('Warehouse updated successfully');
                }
            } else {
                const response = await axiosClient.post('/warehouses', payload);
                if (response.success) {
                    setWarehouses([...warehouses, response.data]);
                    toast.success('Warehouse created successfully');
                }
            }
            closeModal();
            fetchStats();
        } catch (error) {
            console.error("Error saving warehouse", error);
            toast.error(error.message || 'Failed to save warehouse');
        }
    };

    const handleDeleteClick = (warehouse) => {
        setWarehouseToDelete(warehouse);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await axiosClient.delete(`/warehouses/${warehouseToDelete._id}`);
            if (response.success) {
                setWarehouses(warehouses.filter(w => w._id !== warehouseToDelete._id));
                toast.success('Warehouse deleted successfully');
                fetchStats();
            }
        } catch (error) {
            console.error("Error deleting warehouse", error);
            toast.error(error.message || 'Failed to delete warehouse');
        } finally {
            setShowDeleteConfirm(false);
            setWarehouseToDelete(null);
        }
    };

    const openModal = (warehouse = null) => {
        setCurrentWarehouse(warehouse);
        setFormData(warehouse ? {
            name: warehouse.name,
            code: warehouse.code,
            address: warehouse.address || '',
            contactPerson: warehouse.contactPerson || '',
            phone: warehouse.phone || '',
            email: warehouse.email || '',
            type: warehouse.type || 'main',
            capacity: warehouse.capacity || '',
            status: warehouse.status || 'active'
        } : {
            name: '',
            code: '',
            address: '',
            contactPerson: '',
            phone: '',
            email: '',
            type: 'main',
            capacity: '',
            status: 'active'
        });
        setFormErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentWarehouse(null);
        setFormData({
            name: '',
            code: '',
            address: '',
            contactPerson: '',
            phone: '',
            email: '',
            type: 'main',
            capacity: '',
            status: 'active'
        });
        setFormErrors({});
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'main': return '🏢';
            case 'regional': return '🏪';
            case 'distribution': return '📦';
            case 'storage': return '🗄️';
            default: return '🏗️';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Warehouses</h1>
                    <p className="text-sm text-slate-600 mt-1">Manage your warehouse locations</p>
                </div>
                <Button onClick={() => openModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Warehouse
                </Button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Warehouses</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.byStatus.active}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <div className="h-3 w-3 rounded-full bg-green-600"></div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Inactive</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.byStatus.inactive}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <div className="h-3 w-3 rounded-full bg-gray-600"></div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Capacity</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.totalCapacity.toLocaleString()}</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search warehouses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="all">All Types</option>
                        <option value="main">Main</option>
                        <option value="regional">Regional</option>
                        <option value="distribution">Distribution</option>
                        <option value="storage">Storage</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            {/* Warehouse Grid */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            ) : filteredWarehouses.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-white border border-slate-100">
                    <Building2 className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-600">No warehouses found</p>
                    <p className="text-sm text-slate-400 mt-1">
                        {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first warehouse to get started'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredWarehouses.map((warehouse) => (
                        <div key={warehouse._id} className="rounded-lg bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-2xl">{getTypeIcon(warehouse.type)}</div>
                                    <div>
                                        <h3
                                            className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600"
                                            onClick={() => navigate(`/warehouses/${warehouse._id}`)}
                                        >
                                            {warehouse.name}
                                        </h3>
                                        <p className="text-xs font-mono text-slate-500">{warehouse.code}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(warehouse.status)}`}>
                                    {warehouse.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                {warehouse.address && (
                                    <div className="flex items-start space-x-2 text-sm">
                                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-slate-600">{warehouse.address}</span>
                                    </div>
                                )}
                                {warehouse.contactPerson && (
                                    <div className="flex items-center space-x-2 text-sm">
                                        <div className="h-4 w-4 text-slate-400 flex items-center justify-center">👤</div>
                                        <span className="text-slate-600">{warehouse.contactPerson}</span>
                                    </div>
                                )}
                                {warehouse.phone && (
                                    <div className="flex items-center space-x-2 text-sm">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-600">{warehouse.phone}</span>
                                    </div>
                                )}
                                {warehouse.email && (
                                    <div className="flex items-center space-x-2 text-sm">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-600">{warehouse.email}</span>
                                    </div>
                                )}
                            </div>

                            {warehouse.capacity > 0 && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                                        <span>Capacity</span>
                                        <span className="font-medium">{warehouse.capacity.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <span className="text-xs text-slate-400 capitalize">{warehouse.type} warehouse</span>
                                <div className="flex space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => openModal(warehouse)}>
                                        <Edit className="h-4 w-4 text-slate-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(warehouse)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg my-8">
                        <h2 className="mb-6 text-xl font-bold">{currentWarehouse ? 'Edit Warehouse' : 'New Warehouse'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Name */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Main Warehouse"
                                        className={formErrors.name ? 'border-red-500' : ''}
                                    />
                                    {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                                </div>

                                {/* Code */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Code <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="WH001"
                                        disabled={!!currentWarehouse}
                                        className={formErrors.code ? 'border-red-500' : ''}
                                    />
                                    {formErrors.code && <p className="mt-1 text-xs text-red-500">{formErrors.code}</p>}
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="123 Main St, City, Country"
                                    />
                                </div>

                                {/* Contact Person */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Contact Person</label>
                                    <Input
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 234 567 8900"
                                        className={formErrors.phone ? 'border-red-500' : ''}
                                    />
                                    {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="warehouse@example.com"
                                        className={formErrors.email ? 'border-red-500' : ''}
                                    />
                                    {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="main">Main</option>
                                        <option value="regional">Regional</option>
                                        <option value="distribution">Distribution</option>
                                        <option value="storage">Storage</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Capacity */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Capacity</label>
                                    <Input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        placeholder="10000"
                                        min="0"
                                        className={formErrors.capacity ? 'border-red-500' : ''}
                                    />
                                    {formErrors.capacity && <p className="mt-1 text-xs text-red-500">{formErrors.capacity}</p>}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                                <Button type="submit">
                                    {currentWarehouse ? 'Update' : 'Create'} Warehouse
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setWarehouseToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Warehouse"
                message={`Are you sure you want to delete "${warehouseToDelete?.name}"? This action cannot be undone.`}
                type="danger"
            />
        </div>
    );
};

export default WarehouseList;
