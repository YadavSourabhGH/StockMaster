import React, { useEffect, useState } from 'react';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import axiosClient from '../../../utils/axiosClient';

const KPICards = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        totalValue: 0,
        monthlyMovement: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosClient.get('/dashboard/summary');
                if (response.data.success) {
                    setStats({
                        totalProducts: response.data.data.totalProducts,
                        lowStock: response.data.data.lowStockCount,
                        totalValue: 0, // Backend doesn't provide value yet
                        monthlyMovement: response.data.data.pendingReceipts + response.data.data.pendingDeliveries // Approximation
                    });
                }
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', trend: '' },
        { title: 'Low Stock Items', value: stats.lowStock, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', trend: '' },
        { title: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '' },
        { title: 'Pending Moves', value: stats.monthlyMovement, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: '' },
    ];

    if (loading) {
        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <div key={index} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">{card.title}</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                        </div>
                        <div className={`rounded-lg p-3 ${card.bg}`}>
                            <card.icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                    </div>
                    {card.trend && (
                        <div className="mt-4 flex items-center text-sm">
                            <span className={card.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}>
                                {card.trend}
                            </span>
                            <span className="ml-2 text-slate-400">from last month</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default KPICards;
