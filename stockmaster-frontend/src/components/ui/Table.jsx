import React from 'react';
import { cn } from '../../utils/cn';

const Table = ({ headers, children, className }) => {
    return (
        <div className={cn("w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 text-slate-500">
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} className="px-6 py-4 font-medium text-xs uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const TableRow = ({ children, className, onClick }) => {
    return (
        <tr
            className={cn("group hover:bg-slate-50/50 transition-colors", onClick && "cursor-pointer", className)}
            onClick={onClick}
        >
            {children}
        </tr>
    );
};

export const TableCell = ({ children, className }) => {
    return (
        <td className={cn("px-6 py-4 text-slate-700 group-hover:text-slate-900 transition-colors", className)}>
            {children}
        </td>
    );
};

export default Table;
