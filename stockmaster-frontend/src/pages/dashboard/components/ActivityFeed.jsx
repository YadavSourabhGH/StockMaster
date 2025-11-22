import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import axiosClient from '../../../utils/axiosClient';


const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await axiosClient.get('/dashboard/activity');
                if (response.success) {
                    const formattedActivities = response.data.map(item => ({
                        id: item.id,
                        type: item.documentType || 'ADJUST', // Fallback
                        product: item.product?.name || 'Unknown Product',
                        qty: item.quantityChange,
                        time: new Date(item.timestamp)
                    }));
                    setActivities(formattedActivities);
                }
            } catch (error) {
                console.error("Error fetching activity", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'RECEIPT': return <ArrowLeft className="h-4 w-4 text-emerald-600" />;
            case 'DELIVERY': return <ArrowRight className="h-4 w-4 text-red-600" />;
            case 'TRANSFER': return <RefreshCw className="h-4 w-4 text-blue-600" />;
            default: return <AlertCircle className="h-4 w-4 text-amber-600" />;
        }
    };

    const getBg = (type) => {
        switch (type) {
            case 'RECEIPT': return 'bg-emerald-100';
            case 'DELIVERY': return 'bg-red-100';
            case 'TRANSFER': return 'bg-blue-100';
            default: return 'bg-amber-100';
        }
    };

    return (
        <div className="flex h-full flex-col rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-50" />)}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center text-slate-500 py-4">No recent activity</div>
                ) : (
                    <div className="space-y-6">
                        {activities.map((item) => (
                            <div key={item.id} className="flex items-start gap-4">
                                <div className={`mt-1 rounded-full p-2 ${getBg(item.type)}`}>
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-slate-900">
                                        {item.type === 'RECEIPT' ? 'Stock Received' :
                                            item.type === 'DELIVERY' ? 'Stock Delivered' :
                                                item.type === 'TRANSFER' ? 'Transferred' : 'Adjustment'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        <span className="font-medium text-slate-700">{item.product}</span>
                                        {' • '}
                                        {Math.abs(item.qty)} units
                                    </p>
                                </div>
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                    {format(item.time, 'HH:mm')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
