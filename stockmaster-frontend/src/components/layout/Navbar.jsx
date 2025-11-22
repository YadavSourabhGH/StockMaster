import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, User } from 'lucide-react';
import { Input } from '../ui/Input';
import Notifications from '../common/Notifications';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm">
            <div className="flex flex-1 items-center">
                <div className="w-full max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search anything..."
                            className="h-9 border-slate-200 bg-slate-50 pl-10 focus:bg-white"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Notifications />

                <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role || 'Admin'}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 ring-2 ring-white shadow-sm">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
