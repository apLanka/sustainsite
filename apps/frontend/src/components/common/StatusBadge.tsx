import React from 'react';

type StatusType = 'Approved' | 'Draft' | 'Under Review' | 'Rejected' | 'Low' | 'Medium' | 'High' | 'Completed' | 'Pending';

interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Under Review':
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Rejected':
      case 'High':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Low':
      case 'Draft':
      case 'Pending':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStyles()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
