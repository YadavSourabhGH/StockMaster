import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ImageUpload from '../../components/ui/ImageUpload';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import axiosClient from '../../utils/axiosClient';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const ReceiptForm = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState([]); // Available products
    const [warehouses, setWarehouses] = useState([]);
    const [formData, setFormData] = useState({
        supplier: '',
        warehouse: '',
        lines: [{ productId: '', qty: 1 }],
        image: '',
    });

    useEffect(() => {
        fetchProducts();
        fetchWarehouses();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axiosClient.get('/products');
            if (res?.data) setProducts(res.data);
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const res = await axiosClient.get('/warehouses');
            if (res?.data) setWarehouses(res.data);
        } catch (err) {
            console.error('Error fetching warehouses', err);
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

    const handleExtractOCR = async () => {
        if (!formData.image) {
            toast.error("Please upload an image first.");
            return;
        }
        setIsLoading(true);
        try {
            // If image is a data URL, send as multipart/form-data
            let res;
            if (typeof formData.image === 'string' && formData.image.startsWith('data:')) {
                const fd = new FormData();
                const resp = await fetch(formData.image);
                const blob = await resp.blob();
                fd.append('image', blob, 'receipt.png');
                res = await axiosClient.post('/documents/ocr/extract-receipt', fd);
            } else {
                res = await axiosClient.post('/documents/ocr/extract-receipt', { image: formData.image });
            }

            console.log('OCR Full Response:', res);
            console.log('res.data:', res.data);
            console.log('res.data.extracted:', res.data?.extracted);

            // Access extracted data - axiosClient already unwraps response.data
            const extracted = res.data?.extracted || res.data || {};
            console.log('Final extracted:', extracted);

            // Auto-fill form fields with extracted data
            const newFormData = { ...formData };

            // Fill supplier if vendor name is extracted (check both snake_case and camelCase)
            const vendorName = extracted.vendor_name || extracted.vendorName || extracted.vendor || extracted.supplier;
            if (vendorName) {
                console.log('Setting supplier to:', vendorName);
                newFormData.supplier = vendorName;
            }

            // Fill line items if extracted (check both snake_case and camelCase)
            const lineItems = extracted.line_items || extracted.lineItems;
            if (lineItems && Array.isArray(lineItems) && lineItems.length > 0) {
                console.log('Setting line items:', lineItems);

                // Smart product matching function
                const findMatchingProduct = (extractedName) => {
                    if (!extractedName) return null;

                    const searchTerm = extractedName.toLowerCase().trim();

                    // Try exact match first (name or SKU)
                    let match = products.find(p =>
                        p.name.toLowerCase() === searchTerm ||
                        p.sku.toLowerCase() === searchTerm
                    );

                    if (match) return match._id;

                    // Try partial match (name contains or SKU contains)
                    match = products.find(p =>
                        p.name.toLowerCase().includes(searchTerm) ||
                        searchTerm.includes(p.name.toLowerCase()) ||
                        p.sku.toLowerCase().includes(searchTerm)
                    );

                    if (match) return match._id;

                    // Try fuzzy match (remove special chars and spaces)
                    const cleanSearch = searchTerm.replace(/[^a-z0-9]/g, '');
                    match = products.find(p => {
                        const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const cleanSku = p.sku.toLowerCase().replace(/[^a-z0-9]/g, '');
                        return cleanName === cleanSearch || cleanSku === cleanSearch;
                    });

                    return match ? match._id : null;
                };

                newFormData.lines = lineItems.map(item => {
                    const extractedName = item.name || item.description;
                    const matchedProductId = findMatchingProduct(extractedName);

                    console.log(`Matching "${extractedName}":`, matchedProductId ? 'Found' : 'Not found');

                    return {
                        productId: matchedProductId || '', // Auto-select if match found
                        qty: item.quantity || 1,
                        _extractedName: extractedName, // Keep for reference
                    };
                });

                const matchedCount = newFormData.lines.filter(l => l.productId).length;
                console.log(`Auto-matched ${matchedCount} of ${lineItems.length} products`);
            } else {
                console.log('No line items found or invalid structure');
            }

            console.log('Setting form data to:', newFormData);
            setFormData(newFormData);

            const matchedCount = newFormData.lines.filter(l => l.productId).length;
            toast.success(`OCR extracted! ${vendorName ? `Vendor: ${vendorName}. ` : ''}Found ${lineItems?.length || 0} items (${matchedCount} auto-matched).`);
        } catch (error) {
            console.error("Error extracting OCR", error);
            const errorMsg = error?.response?.data?.message || error?.message || 'Failed to extract OCR';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = new FormData();
            payload.append('docType', 'RECEIPT');
            payload.append('toWarehouse', formData.warehouse);
            payload.append('counterparty', formData.supplier || '');
            payload.append('lines', JSON.stringify(formData.lines.map(l => ({ productId: l.productId, quantity: Number(l.qty) }))));
            if (formData.image && typeof formData.image === 'string' && formData.image.startsWith('data:')) {
                const resp = await fetch(formData.image);
                const blob = await resp.blob();
                payload.append('image', blob, 'receipt.png');
            }

            const res = await axiosClient.post('/documents', payload);

            // Auto-validate to update stock immediately
            if (res.success && res.data?._id) {
                try {
                    await axiosClient.post(`/documents/${res.data._id}/validate`);
                    toast.success('Receipt created and stock updated successfully');
                } catch (valError) {
                    console.error("Validation error", valError);
                    toast.warning('Receipt created but failed to validate automatically. Please validate from the list.');
                }
            } else {
                toast.success('Receipt created successfully');
            }

            navigate('/receipts');
        } catch (error) {
            console.error("Error creating receipt", error);
            const errorMsg = error?.response?.data?.message || error?.message || 'Failed to create receipt';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/receipts')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-slate-900">New Receipt</h1>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Supplier</label>
                            <Input
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                placeholder="Supplier Name"
                                required
                            />
                        </div>
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
                                {warehouses.map((w) => (
                                    <option key={w._id} value={w._id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Receipt Image</label>
                            <ImageUpload
                                value={formData.image}
                                onChange={(val) => setFormData(prev => ({ ...prev, image: val }))}
                            />
                        </div>
                        <div className="flex items-center">
                            <Button type="button" variant="outline" onClick={handleExtractOCR} disabled={!formData.image || isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Extract OCR
                            </Button>
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
                                                <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
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
                        <Button type="button" variant="outline" onClick={() => navigate('/receipts')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Receipt
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReceiptForm;
