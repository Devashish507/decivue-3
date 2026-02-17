import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

const statusColors = {
    'Draft': 'bg-slate-50 text-slate-700 border-slate-100/50',
    'Pending Approval': 'bg-amber-50 text-amber-700 border-amber-100/50',
    'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
    'Rejected': 'bg-rose-50 text-rose-700 border-rose-100/50',
};

const statusIcons = {
    'Draft': Shield,
    'Pending Approval': ShieldAlert,
    'Approved': ShieldCheck,
    'Rejected': ShieldAlert,
};

const GovernanceBadge = ({ status, required }) => {
    if (!required) return null;

    const colorClass = statusColors[status] || statusColors['Draft'];
    const Icon = statusIcons[status] || statusIcons['Draft'];

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${colorClass}`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={3} />
            {status || 'Draft'}
        </div>
    );
};

export default GovernanceBadge;
