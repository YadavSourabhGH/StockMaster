import React, { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import axiosClient from '../../utils/axiosClient';
import { format } from 'date-fns';

const Ledger = () => {
    const [moves, setMoves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMoves();
    }, []);

    const fetchMoves = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/stock-moves');
            if (response.data.success) {
                setMoves(response.data);
            }
        } catch (error) {
            console.error("Error fetching moves", error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeBadge = (type) => {
        const styles = {
            'IN': 'bg-emerald-100 text-emerald-700',
            'OUT': 'bg-red-100 text-red-700',
            'TRANSFER': 'bg-blue-100 text-blue-700',
            'ADJUSTMENT': 'bg-amber-100 text-amber-700',
            'RECEIPT': 'bg-emerald-100 text-emerald-700',
            'DELIVERY': 'bg-red-100 text-red-700',
        };
        // Map document types to badge styles if needed
        const displayType = type === 'RECEIPT' ? 'IN' : type === 'DELIVERY' ? 'OUT' : type;

        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[type] || styles[displayType] || 'bg-slate-100 text-slate-800'}`}>
                {type}
            </span>
        );
    };

    const filteredMoves = moves.filter(move =>
        (move.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (move.documentId?.docType || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Stock Ledger</h1>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>

            <div className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow-sm border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search ledger..."
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
                <Table headers={['Timestamp', 'Type', 'Product', 'From', 'To', 'Qty', 'User']}>
                    {filteredMoves.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-slate-500">No stock moves found</TableCell>
                        </TableRow>
                    ) : (
                        filteredMoves.map((move) => (
                            <TableRow key={move.id}>
                                <TableCell>{format(new Date(move.timestamp), 'MMM d, yyyy HH:mm')}</TableCell>
                                <TableCell>{getTypeBadge(move.documentId?.docType)}</TableCell>
                                <TableCell className="font-medium">{move.product?.name || '-'}</TableCell>
                                <TableCell>{move.fromWarehouse?.name || '-'}</TableCell>
                                <TableCell>{move.toWarehouse?.name || '-'}</TableCell>
                                <TableCell className={move.quantityChange < 0 ? 'text-red-600' : 'text-emerald-600'}>
                                    {move.quantityChange > 0 ? '+' : ''}{move.quantityChange}
                                </TableCell>
                                <TableCell>{move.executedBy?.name || '-'}</TableCell>
                            </TableRow>
                        ))
                    )}
                </Table>
            )}
        </div>
    );
};

export default Ledger;
