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

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            // const { data } = await axiosClient.get('/products');
            // setProducts(data);

            // Mock data
            setProducts([
                { id: 1, name: 'Widget A', sku: 'SKU-001' },
                { id: 2, name: 'Gadget B', sku: 'SKU-002' },
            ]);
        } catch (error) {
            console.error("Error fetching products", error);
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
            // POST /documents
            // await axiosClient.post('/documents', { ...formData, type: 'DELIVERY' });
            toast.success('Delivery created successfully');
            navigate('/deliveries');
        } catch (error) {
            console.error("Error creating delivery", error);
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
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="">Select Warehouse</option>
                                <option value="Main Warehouse">Main Warehouse</option>
                                <option value="East Warehouse">East Warehouse</option>
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
                                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
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
