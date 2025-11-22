import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import axiosClient from '../../utils/axiosClient';
import toast from 'react-hot-toast';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axiosClient.get('/products');
            if (response.success) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error("Error fetching products", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axiosClient.delete(`/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
                toast.success('Product deleted');
            } catch (error) {
                console.error("Error deleting product", error);
                toast.error("Failed to delete product");
            }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'OK': 'bg-emerald-100 text-emerald-700',
            'Low': 'bg-yellow-100 text-yellow-700',
            'Out': 'bg-red-100 text-red-700',
        };
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
                {status}
            </span>
        );
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Products</h1>
                <Link to="/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow-sm border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search products..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            ) : (
                <Table headers={['SKU', 'Product Name', 'Category', 'Total Stock', 'Status', 'Actions']}>
                    {filteredProducts.map((product) => (
                        <TableRow key={product._id || product.id}>
                            <TableCell className="font-medium">{product.sku}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.categoryId?.name || product.category || '-'}</TableCell>
                            <TableCell>{product.totalStock || 0}</TableCell>
                            <TableCell>{getStatusBadge(product.status || (product.totalStock === 0 ? 'Out' : product.totalStock < 10 ? 'Low' : 'OK'))}</TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => navigate(`/products/${product._id || product.id}`)}>
                                        <Edit className="h-4 w-4 text-slate-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product._id || product.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </Table>
            )}
        </div>
    );
};

export default ProductList;
