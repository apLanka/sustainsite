import type { ResourceExpense } from '@/types/resources';

const mockExpenses: ResourceExpense[] = [
  {
    id: 'e1',
    projectId: 'p1',
    title: 'Batch 402 Cement Delivery',
    amount: 15400,
    category: 'Materials',
    date: '2026-03-25',
    supplierId: 's1'
  },
  {
    id: 'e2',
    projectId: 'p1',
    title: 'Excavator Weekly Rental',
    amount: 3200,
    category: 'Equipment',
    date: '2026-03-26',
    supplierId: 's3'
  },
  {
    id: 'e3',
    projectId: 'p1',
    title: 'Site Safety Permits',
    amount: 1200,
    category: 'Permits',
    date: '2026-03-20'
  },
  {
    id: 'e4',
    projectId: 'p1',
    title: 'Steel Rebar Reinforcement',
    amount: 8900,
    category: 'Materials',
    date: '2026-03-28',
    supplierId: 's2'
  }
];

export default function CostTracker() {
  const totalSpend = mockExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const budget = 50000;
  const percentage = (totalSpend / budget) * 100;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 opacity-50"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Fiscal Overview</p>
              <h3 className="text-4xl font-black text-primary tracking-tighter">
                ${totalSpend.toLocaleString()}
                <span className="text-slate-300 text-lg font-bold ml-2">/ ${budget.toLocaleString()}</span>
              </h3>
            </div>
            <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 ring-4 ring-emerald-50/50">
              <span className="material-symbols-outlined text-[18px] font-bold">verified</span>
              <span className="text-xs font-black uppercase tracking-widest">On Track</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-100">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
                style={{ width: `${percentage}%` }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Project Commencement</span>
              <span className="text-primary bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{percentage.toFixed(1)}% Budget Utilized</span>
              <span className="text-slate-400">Buffer Remaining</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Allocation Mix</p>
            <div className="space-y-5">
              {[
                { label: 'Materials', value: 78, color: 'bg-primary' },
                { label: 'Equipment', value: 15, color: 'bg-sky-500' },
                { label: 'Regulatory', value: 7, color: 'bg-slate-400' }
              ].map((item) => (
                <div key={item.label} className="group cursor-help">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color} group-hover:scale-125 transition-transform`} />
                      <span className="text-primary text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-primary font-black text-xs tabular-nums">{item.value}%</span>
                  </div>
                  <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} opacity-20 group-hover:opacity-100 transition-all duration-500`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-8 py-3 w-full border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-primary transition-all">
            Configuration
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden border-t-4 border-t-primary">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-xl">receipt_long</span>
            </div>
            <div>
              <h4 className="text-primary font-black tracking-tight">Financial Ledger</h4>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Transaction History</p>
            </div>
          </div>
          <button className="bg-white border border-slate-100 p-3 rounded-2xl text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">download</span>
            Statement
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Transaction Details</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Value Date</th>
                <th className="px-8 py-5 text-right">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {mockExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-primary font-bold text-base group-hover:text-primary-dark transition-colors">{expense.title}</p>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-0.5">Reference: {expense.id.toUpperCase()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-bold tabular-nums">{expense.date}</td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-primary font-black text-lg tracking-tight tabular-nums animate-in fade-in zoom-in duration-1000">
                      ${expense.amount.toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/50 text-center">
          <button className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 mx-auto">
            View Full Audit Trail
            <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
          </button>
        </div>
      </div>
    </div>
  );
}

