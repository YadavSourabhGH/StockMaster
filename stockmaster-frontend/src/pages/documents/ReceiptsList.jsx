import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import axiosClient from '../../utils/axiosClient';
import { format } from 'date-fns';

const ReceiptsList = () => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/documents?type=RECEIPT');
            console.log('Receipts API response:', response);
            // axiosClient interceptor already returns response.data
            if (response.success) {
                setReceipts(response.data);
            }
        } catch (error) {
            console.error("Error fetching receipts", error);
        } finally {
            setLoading(false);
        }
    };

    const openReceipt = async (id) => {
        try {
            const res = await axiosClient.get(`/documents/${id}`);
            if (res?.success) setSelectedReceipt(res.data);
        } catch (err) {
            console.error('Failed to load receipt', err);
        }
    };

    const downloadReceiptImage = (receipt) => {
        try {
            const url = receipt.receiptImage;
            if (!url) return;
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${receipt._id}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            console.error('Download failed', err);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'DONE': 'bg-emerald-100 text-emerald-700',
            'VALIDATED': 'bg-emerald-100 text-emerald-700',
            'DRAFT': 'bg-slate-100 text-slate-700',
            'CANCELLED': 'bg-red-100 text-red-700',
            'READY': 'bg-blue-100 text-blue-700',
        };
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
                {status}
            </span>
        );
    };

    const filteredReceipts = receipts.filter(receipt =>
        (receipt.counterparty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(receipt._id).includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Receipts (Incoming)</h1>
                <Link to="/receipts/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Receipt
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow-sm border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search receipts..."
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
                <Table headers={['ID', 'Supplier', 'Warehouse', 'Status', 'Date', 'Actions']}>
                    {filteredReceipts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-slate-500">No receipts found</TableCell>
                        </TableRow>
                    ) : (
                        filteredReceipts.map((receipt) => (
                            <TableRow key={receipt._id}>
                                <TableCell className="font-medium">#{receipt._id.slice(-6)}</TableCell>
                                <TableCell>{receipt.counterparty || '-'}</TableCell>
                                <TableCell>{receipt.toWarehouse?.name || '-'}</TableCell>
                                <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                                <TableCell>{format(new Date(receipt.createdAt), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => openReceipt(receipt._id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </Table>
            )}
            {/* Receipt modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="w-11/12 max-w-2xl rounded-lg bg-white p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold">Receipt #{selectedReceipt._id.slice(-8)}</h2>
                            <div className="space-x-2">
                                <Button variant="outline" onClick={() => downloadReceiptImage(selectedReceipt)}>
                                    Download
                                </Button>
                                <Button onClick={() => setSelectedReceipt(null)}>Close</Button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div><strong>Supplier:</strong> {selectedReceipt.counterparty}</div>
                            <div><strong>Warehouse:</strong> {selectedReceipt.toWarehouse?.name}</div>
                            <div><strong>Status:</strong> {selectedReceipt.status}</div>
                            <div>
                                <strong>Lines:</strong>
                                <ul className="list-disc ml-5">
                                    {selectedReceipt.lines?.map((l, i) => (
                                        <li key={i}>{l.productId?.name || l.productId} — {l.quantity}</li>
                                    ))}
                                </ul>
                            </div>
                            {selectedReceipt.receiptImage && (
                                <div>
                                    <img src={selectedReceipt.receiptImage} alt="receipt" className="w-full rounded" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceiptsList;
