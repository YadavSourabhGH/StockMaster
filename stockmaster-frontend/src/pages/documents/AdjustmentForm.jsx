import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import axiosClient from '../../utils/axiosClient';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const AdjustmentForm = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState([]); // Available products
    const [formData, setFormData] = useState({
        warehouse: '',
        lines: [{ productId: '', systemQty: 0, countedQty: 0, reason: '' }],
    });

    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [productsRes, warehousesRes] = await Promise.all([
                axiosClient.get('/products'),
                axiosClient.get('/warehouses')
            ]);

            if (productsRes.success) {
                setProducts(productsRes.data);
            }

            if (warehousesRes.success) {
                setWarehouses(warehousesRes.data);
            }
        } catch (error) {
            console.error("Error fetching initial data", error);
            toast.error("Failed to load products or warehouses");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...formData.lines];
        newLines[index][field] = value;

        // If product selected, update system qty
        if (field === 'productId') {
            const product = products.find(p => p._id === value);
            if (product) {
                // Ideally we should fetch stock for specific warehouse, but for now use global stock or 0
                newLines[index].systemQty = product.stock || 0;
                newLines[index].countedQty = product.stock || 0; // Default to system qty
            }
        }

        setFormData(prev => ({ ...prev, lines: newLines }));
    };

    const addLine = () => {
        setFormData(prev => ({ ...prev, lines: [...prev.lines, { productId: '', systemQty: 0, countedQty: 0, reason: '' }] }));
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
                toWarehouse: formData.warehouse,
                docType: 'ADJUSTMENT',
                lines: formData.lines.map(line => ({
                    productId: line.productId,
                    quantity: Number(line.countedQty)
                }))
            };

            const res = await axiosClient.post('/documents', payload);

            // Auto-validate to update stock immediately
            if (res.success && res.data?._id) {
                try {
                    await axiosClient.post(`/documents/${res.data._id}/validate`);
                    toast.success('Adjustment created and stock updated successfully');
                } catch (valError) {
                    console.error("Validation error", valError);
                    toast.warning('Adjustment created but failed to validate automatically. Please validate from the list.');
                }
            } else {
                toast.success('Adjustment created successfully');
            }

            navigate('/adjustments');
        } catch (error) {
            console.error("Error creating adjustment", error);
            toast.error(error.response?.data?.message || "Failed to create adjustment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/adjustments')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-slate-900">New Adjustment</h1>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Warehouse</label>
                        <select
                            name="warehouse"
                            value={formData.warehouse}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            <option value="">Select Warehouse</option>
                            {warehouses.map(w => (
                                <option key={w._id} value={w._id}>{w.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-slate-900">Products</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addLine}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Line
                            </Button>
                        </div>
                        <Table headers={['Product', 'System Qty', 'Counted Qty', 'Difference', 'Reason', 'Action']}>
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
                                                <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                                            ))}
                                        </select>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-slate-500">{line.systemQty}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.countedQty}
                                            onChange={(e) => handleLineChange(index, 'countedQty', e.target.value)}
                                            required
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <span className={line.countedQty - line.systemQty < 0 ? 'text-red-500' : 'text-emerald-500'}>
                                            {line.countedQty - line.systemQty > 0 ? '+' : ''}{line.countedQty - line.systemQty}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="text"
                                            value={line.reason}
                                            onChange={(e) => handleLineChange(index, 'reason', e.target.value)}
                                            placeholder="Reason"
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
                        <Button type="button" variant="outline" onClick={() => navigate('/adjustments')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Adjustment
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdjustmentForm;
