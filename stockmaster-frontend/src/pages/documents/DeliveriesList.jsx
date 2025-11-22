import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import axiosClient from '../../utils/axiosClient';
import { format } from 'date-fns';

const DeliveriesList = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/documents?type=DELIVERY');
            if (response.data.success) {
                setDeliveries(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching deliveries", error);
        } finally {
            setLoading(false);
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

    const filteredDeliveries = deliveries.filter(delivery =>
        (delivery.counterparty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(delivery._id).includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Deliveries (Outgoing)</h1>
                <Link to="/deliveries/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Delivery
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow-sm border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search deliveries..."
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
                <Table headers={['ID', 'Customer', 'From Warehouse', 'Status', 'Date', 'Actions']}>
                    {filteredDeliveries.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-slate-500">No deliveries found</TableCell>
                        </TableRow>
                    ) : (
                        filteredDeliveries.map((delivery) => (
                            <TableRow key={delivery._id}>
                                <TableCell className="font-medium">#{delivery._id.slice(-6)}</TableCell>
                                <TableCell>{delivery.counterparty || '-'}</TableCell>
                                <TableCell>{delivery.fromWarehouse?.name || '-'}</TableCell>
                                <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                                <TableCell>{format(new Date(delivery.createdAt), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/deliveries/${delivery._id}`)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </Table>
            )}
        </div>
    );
};

export default DeliveriesList;
