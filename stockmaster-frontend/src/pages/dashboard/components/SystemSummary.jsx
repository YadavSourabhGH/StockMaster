import React, { useEffect, useState } from 'react';
import { Warehouse, FileText, Truck, RefreshCw, ClipboardCheck } from 'lucide-react';
import axiosClient from '../../../utils/axiosClient';

const SystemSummary = () => {
    const [stats, setStats] = useState({
        warehouses: 0,
        receipts: 0,
        deliveries: 0,
        transfers: 0,
        adjustments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosClient.get('/dashboard/summary');
                if (response.success) {
                    setStats({
                        warehouses: response.data.totalWarehouses || 0,
                        receipts: response.data.totalReceipts || 0,
                        deliveries: response.data.totalDeliveries || 0,
                        transfers: response.data.totalTransfers || 0,
                        adjustments: response.data.totalAdjustments || 0
                    });
                }
            } catch (error) {
                console.error("Error fetching system summary", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const items = [
        { label: 'Warehouses', value: stats.warehouses, icon: Warehouse, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Receipts', value: stats.receipts, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Deliveries', value: stats.deliveries, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Transfers', value: stats.transfers, icon: RefreshCw, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Adjustments', value: stats.adjustments, icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-slate-900">System Overview</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {items.map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-center rounded-lg border border-slate-50 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-sm">
                        <div className={`mb-2 rounded-full p-2 ${item.bg}`}>
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{item.value}</span>
                        <span className="text-xs font-medium text-slate-500">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SystemSummary;
