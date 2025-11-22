import React from 'react';
import KPICards from './components/KPICards';
import StockChart from './components/StockChart';
import ActivityFeed from './components/ActivityFeed';
import { Button } from '../../components/ui/Button';
import { Download, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Overview of your inventory performance.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                    <Link to="/products/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            <KPICards />

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <StockChart />
                </div>
                <div>
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
