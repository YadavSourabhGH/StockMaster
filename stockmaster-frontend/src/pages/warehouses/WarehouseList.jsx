import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import axiosClient from '../../utils/axiosClient';
import toast from 'react-hot-toast';

const WarehouseList = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentWarehouse, setCurrentWarehouse] = useState(null);
    const [formData, setFormData] = useState({ name: '', location: '' });

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            // GET /warehouses
            // const { data } = await axiosClient.get('/warehouses');
            // setWarehouses(data);

            // Mock data
            setTimeout(() => {
                setWarehouses([
                    { id: 1, name: 'Main Warehouse', location: 'New York, NY' },
                    { id: 2, name: 'East Warehouse', location: 'Boston, MA' },
                ]);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error("Error fetching warehouses", error);
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (currentWarehouse) {
                // PUT /warehouses/:id
                // await axiosClient.put(`/warehouses/${currentWarehouse.id}`, formData);
                setWarehouses(warehouses.map(w => w.id === currentWarehouse.id ? { ...w, ...formData } : w));
                toast.success('Warehouse updated');
            } else {
                // POST /warehouses
                // const { data } = await axiosClient.post('/warehouses', formData);
                const newWarehouse = { id: Date.now(), ...formData };
                setWarehouses([...warehouses, newWarehouse]);
                toast.success('Warehouse created');
            }
            closeModal();
        } catch (error) {
            console.error("Error saving warehouse", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                // await axiosClient.delete(`/warehouses/${id}`);
                setWarehouses(warehouses.filter(w => w.id !== id));
                toast.success('Warehouse deleted');
            } catch (error) {
                console.error("Error deleting warehouse", error);
            }
        }
    };

    const openModal = (warehouse = null) => {
        setCurrentWarehouse(warehouse);
        setFormData(warehouse ? { name: warehouse.name, location: warehouse.location } : { name: '', location: '' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentWarehouse(null);
        setFormData({ name: '', location: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Warehouses</h1>
                <Button onClick={() => openModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Warehouse
                </Button>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {warehouses.map((warehouse) => (
                        <div key={warehouse.id} className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-full bg-blue-100 p-2">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{warehouse.name}</h3>
                                        <p className="text-sm text-slate-500">{warehouse.location}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => openModal(warehouse)}>
                                        <Edit className="h-4 w-4 text-slate-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(warehouse.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-bold">{currentWarehouse ? 'Edit Warehouse' : 'New Warehouse'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseList;
