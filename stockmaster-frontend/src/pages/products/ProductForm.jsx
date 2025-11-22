import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ImageUpload from '../../components/ui/ImageUpload';
import axiosClient from '../../utils/axiosClient';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const ProductForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        uom: '',
        reorderLevel: 0,
        initialStock: 0,
        defaultWarehouse: '',
        image: '',
    });
    const [categories, setCategories] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
        fetchMetadata();
    }, [id]);

    const fetchMetadata = async () => {
        try {
            const catRes = await axiosClient.get('/categories');
            if (catRes?.data) setCategories(catRes.data);
            const whRes = await axiosClient.get('/warehouses');
            if (whRes?.data) setWarehouses(whRes.data);
        } catch (err) {
            console.error('Failed to load categories/warehouses', err);
        }
    };

    const fetchProduct = async () => {
        try {
            const res = await axiosClient.get(`/products/${id}`);
            if (res?.data) {
                const p = res.data;
                setFormData({
                    name: p.name || '',
                    sku: p.sku || '',
                    category: p.category || '',
                    uom: p.uom || '',
                    reorderLevel: p.reorderLevel || 0,
                    initialStock: 0,
                    defaultWarehouse: p.defaultWarehouse || '',
                    image: p.image || '',
                });
            }
        } catch (error) {
            console.error("Error fetching product", error);
            toast.error("Failed to load product details");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // If there's an image (data URL) or a file selected, submit as FormData
            const hasImage = formData.image && typeof formData.image === 'string' && formData.image.startsWith('data:');
            // If category is new, try to create it first
            if (formData.category && !categories.find(c => (c.name || c) === formData.category)) {
                try {
                    await axiosClient.post('/categories', { name: formData.category });
                } catch (err) {
                    // ignore duplicate or creation errors and continue
                    console.warn('Could not create category', err);
                }
            }

            if (hasImage) {
                const fd = new FormData();
                fd.append('name', formData.name);
                fd.append('sku', formData.sku);
                fd.append('category', formData.category);
                fd.append('uom', formData.uom);
                fd.append('reorderLevel', formData.reorderLevel);
                fd.append('initialStock', formData.initialStock);
                fd.append('defaultWarehouse', formData.defaultWarehouse);

                // convert dataURL to Blob
                const blob = await (async () => {
                    const res = await fetch(formData.image);
                    return await res.blob();
                })();
                fd.append('image', blob, formData.sku ? `${formData.sku}.png` : 'image.png');

                if (isEditMode) {
                    await axiosClient.put(`/products/${id}`, fd, { headers: { 'Content-Type': undefined } });
                    toast.success('Product updated successfully');
                } else {
                    await axiosClient.post('/products', fd, { headers: { 'Content-Type': undefined } });
                    toast.success('Product created successfully');
                }
            } else {
                // send JSON payload
                if (isEditMode) {
                    await axiosClient.put(`/products/${id}`, formData);
                    toast.success('Product updated successfully');
                } else {
                    await axiosClient.post('/products', formData);
                    toast.success('Product created successfully');
                }
            }
            navigate('/products');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to save product';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-slate-900">
                    {isEditMode ? 'Edit Product' : 'New Product'}
                </h1>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Product Name</label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Wireless Mouse"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">SKU</label>
                            <Input
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="e.g. MOU-001"
                                required
                                disabled={isEditMode} // Usually SKU is unique and not changeable
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                            <input
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Type or select category"
                                list="category-list"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            />
                            <datalist id="category-list">
                                {categories.map((c) => (
                                    <option key={c._id || c} value={c.name || c} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Unit of Measure (UOM)</label>
                            <select
                                name="uom"
                                value={formData.uom}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="">Select UOM</option>
                                <option value="pcs">Pieces (pcs)</option>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="l">Liters (l)</option>
                                <option value="box">Box</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Reorder Level</label>
                            <Input
                                type="number"
                                name="reorderLevel"
                                value={formData.reorderLevel}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>
                        {!isEditMode && (
                            <>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Initial Stock</label>
                                    <Input
                                        type="number"
                                        name="initialStock"
                                        value={formData.initialStock}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Default Warehouse</label>
                                            <select
                                                name="defaultWarehouse"
                                                value={formData.defaultWarehouse}
                                                onChange={handleChange}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="">Select Warehouse</option>
                                                {warehouses.map((w) => (
                                                    <option key={w._id} value={w._id}>{w.name}</option>
                                                ))}
                                            </select>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Product Image</label>
                        <ImageUpload
                            value={formData.image}
                            onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/products')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isEditMode ? 'Update Product' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
