import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    FileText,
    Warehouse,
    Settings,
    LogOut,
    Layers,
    ArrowLeftRight,
    ClipboardCheck,
    History,
    Bot,
    User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'staff'] },
        { name: 'Products', href: '/products', icon: Package, roles: ['admin', 'manager', 'staff'] },
        { name: 'Receipts', href: '/receipts', icon: ClipboardCheck, roles: ['admin', 'manager'] },
        { name: 'Deliveries', href: '/deliveries', icon: ArrowLeftRight, roles: ['admin', 'manager'] },
        { name: 'Transfers', href: '/transfers', icon: ArrowLeftRight, roles: ['admin', 'manager'] },
        { name: 'Adjustments', href: '/adjustments', icon: FileText, roles: ['admin', 'manager'] },
        { name: 'Warehouses', href: '/warehouses', icon: Warehouse, roles: ['admin'] },
        { name: 'Ledger', href: '/ledger', icon: History, roles: ['admin', 'manager'] },
        { name: 'AI Assistant', href: '/ai-assistant', icon: Bot, roles: ['admin', 'manager', 'staff'] },
        { name: 'Profile', href: '/profile', icon: User, roles: ['admin', 'manager', 'staff'] },
        { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
    ];

    const userRole = user?.role || 'admin'; // Mock role
    const filteredNavigation = navigation.filter(item => item.roles.includes(userRole));

    return (
        <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white text-slate-900 shadow-sm">
            <div className="flex h-16 items-center px-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-600 p-1.5">
                        <Layers className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">StockMaster</span>
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto py-4">
                <nav className="flex-1 space-y-1 px-3">
                    {filteredNavigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-slate-100 p-4">
                <button
                    onClick={logout}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500" />
                    Sign out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
