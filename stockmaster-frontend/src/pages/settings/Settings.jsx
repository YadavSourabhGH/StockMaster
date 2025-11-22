import React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const Settings = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Categories Section */}
                <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Categories</h2>
                    <div className="space-y-4">
                        <div className="flex space-x-2">
                            <Input placeholder="New Category" />
                            <Button>Add</Button>
                        </div>
                        <div className="space-y-2">
                            {['Electronics', 'Home', 'Hardware', 'Office'].map((cat, i) => (
                                <div key={i} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                                    <span className="text-sm font-medium text-slate-700">{cat}</span>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Remove</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* UOM Section */}
                <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Units of Measure</h2>
                    <div className="space-y-4">
                        <div className="flex space-x-2">
                            <Input placeholder="New UOM" />
                            <Button>Add</Button>
                        </div>
                        <div className="space-y-2">
                            {['Pieces (pcs)', 'Kilograms (kg)', 'Liters (l)', 'Box'].map((uom, i) => (
                                <div key={i} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                                    <span className="text-sm font-medium text-slate-700">{uom}</span>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Remove</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
