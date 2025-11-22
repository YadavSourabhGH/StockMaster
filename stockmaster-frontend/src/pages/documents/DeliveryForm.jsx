import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import axiosClient from '../../utils/axiosClient';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const DeliveryForm = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState([]); // Available products
    const [formData, setFormData] = useState({
        customer: '',
        warehouse: '',
        lines: [{ productId: '', qty: 1 }],
    });

    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const warehousesRes = await axiosClient.get('/warehouses');
            if (warehousesRes.success) {
                setWarehouses(warehousesRes.data);
            }
        } catch (error) {
            console.error("Error fetching initial data", error);
            toast.error("Failed to load warehouses");
        }
    };

    const handleWarehouseChange = async (e) => {
        const warehouseId = e.target.value;
        setFormData(prev => ({ ...prev, warehouse: warehouseId, lines: [{ productId: '', qty: 1 }] }));

        if (!warehouseId) {
            setProducts([]);
            return;
        }

        try {
            const res = await axiosClient.get(`/warehouses/${warehouseId}/stock`);
            if (res.success) {
                // Filter products with positive stock and map to product format
                const availableProducts = res.data
                    .filter(item => item.quantity > 0)
                    .map(item => ({
                        _id: item.productId._id,
                        name: item.productId.name,
                        sku: item.productId.sku,
                        stock: item.quantity
                    }));
                setProducts(availableProducts);
            }
        } catch (error) {
            console.error("Error fetching warehouse stock", error);
            toast.error("Failed to load warehouse stock");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...formData.lines];
        newLines[index][field] = value;
        setFormData(prev => ({ ...prev, lines: newLines }));
    };

    const addLine = () => {
        setFormData(prev => ({ ...prev, lines: [...prev.lines, { productId: '', qty: 1 }] }));
    };

    const removeLine = (index) => {
        if (formData.lines.length > 1) {
            setFormData(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                fromWarehouse: formData.warehouse,
                docType: 'DELIVERY',
                lines: formData.lines.map(line => ({
                    productId: line.productId,
                    quantity: Number(line.qty)
                }))
            };

            const res = await axiosClient.post('/documents', payload);

            // Auto-validate to update stock immediately
            if (res.success && res.data?._id) {
                try {
                    await axiosClient.post(`/documents/${res.data._id}/validate`);
                    toast.success('Delivery created and stock updated successfully');
                } catch (valError) {
                    console.error("Validation error", valError);
                    toast.warning('Delivery created but failed to validate automatically. Please validate from the list.');
                }
            } else {
                toast.success('Delivery created successfully');
            }

            navigate('/deliveries');
        } catch (error) {
            console.error("Error creating delivery", error);
            toast.error(error.response?.data?.message || "Failed to create delivery");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/deliveries')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-slate-900">New Delivery</h1>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Customer</label>
                            <Input
                                name="customer"
                                value={formData.customer}
                                onChange={handleChange}
                                placeholder="Customer Name"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">From Warehouse</label>
                            <select
                                name="warehouse"
                                value={formData.warehouse}
                                onChange={handleWarehouseChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="">Select Warehouse</option>
                                {warehouses.map(w => (
                                    <option key={w._id} value={w._id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-slate-900">Products</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addLine}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Line
                            </Button>
                        </div>
                        <Table headers={['Product', 'Quantity', 'Action']}>
                            {formData.lines.map((line, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <select
                                            value={line.productId}
                                            onChange={(e) => handleLineChange(index, 'productId', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Select Product</option>
                                            {products.map(p => (
                                                <option key={p._id} value={p._id}>
                                                    {p.name} ({p.sku}) - Stock: {p.stock}
                                                </option>
                                            ))}
                                        </select>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.qty}
                                            onChange={(e) => handleLineChange(index, 'qty', e.target.value)}
                                            min="1"
                                            required
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(index)} disabled={formData.lines.length === 1}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </Table>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/deliveries')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Delivery
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeliveryForm;
