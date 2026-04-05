import React from 'react';
export type StatusType = 'Approved' | 'Draft' | 'Under Review' | 'Rejected' | 'Low' | 'Medium' | 'High' | 'Completed' | 'Pending' | 'In Stock' | 'Low Stock' | 'In Transit' | 'Operational' | 'Maintenance' | 'Available' | 'In Use';
interface StatusBadgeProps {
    status: StatusType;
}
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getStyles = () => {
        switch (status) {
            case 'Approved':
            case 'Completed':
            case 'In Stock':
            case 'Operational':
            case 'Available':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Under Review':
            case 'Medium':
            case 'In Transit':
            case 'In Use':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Rejected':
            case 'High':
            case 'Low Stock':
            case 'Maintenance':
                return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Low':
            case 'Draft':
            case 'Pending':
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };
    return (<span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStyles()}`}>
      {status}
    </span>);
};
export default StatusBadge;
