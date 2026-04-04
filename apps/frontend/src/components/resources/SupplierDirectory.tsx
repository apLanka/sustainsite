import type { Supplier } from '@/types/resources';

const mockSuppliers: Supplier[] = [
  {
    id: 's1',
    name: 'EcoBuild Supplies',
    category: 'Construction Materials',
    rating: 4.8,
    isGreen: true,
    contactEmail: 'orders@ecobuild.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Sustainability Way, Portland, OR'
  },
  {
    id: 's2',
    name: 'SteelCycle Corp',
    category: 'Metal Fabrications',
    rating: 4.2,
    isGreen: true,
    contactEmail: 'sales@steelcycle.io',
    contactPhone: '+1 (555) 987-6543',
    address: '45 Industrial Blvd, Chicago, IL'
  },
  {
    id: 's3',
    name: 'Global Heavy Logistics',
    category: 'Equipment Rental',
    rating: 3.5,
    isGreen: false,
    contactEmail: 'info@ghl-rentals.com',
    contactPhone: '+1 (555) 444-5555',
    address: '88 Port Rd, Houston, TX'
  }
];

export default function SupplierDirectory() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-primary uppercase tracking-widest">Global Partners</h3>
          <p className="text-slate-400 text-xs font-bold mt-1">Verified sustainable supply chain network</p>
        </div>
        <div className="flex gap-3">
          <button className="w-12 h-12 border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center">
            <span className="material-symbols-outlined text-xl font-bold">filter_list</span>
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-sm font-bold">person_add</span>
            Add Partner
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {mockSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            {supplier.isGreen && (
              <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm animate-pulse">
                  <span className="material-symbols-outlined text-[14px]">eco</span>
                  Green Certified
                </div>
              </div>
            )}

            <div className="flex items-start gap-6 mb-8">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-primary font-black text-3xl group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                {supplier.name.charAt(0)}
              </div>
              <div className="pt-2">
                <h4 className="text-primary font-black text-2xl tracking-tight mb-1">{supplier.name}</h4>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{supplier.category}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`material-symbols-outlined text-sm ${s <= Math.floor(supplier.rating) ? 'text-amber-400 font-variation-fill' : 'text-slate-200'}`}>
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-primary font-black text-xs tabular-nums">{supplier.rating}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl ring-4 ring-transparent group-hover:ring-primary/5 transition-all">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Service Level</p>
                <p className="text-primary font-bold text-xs">Tier 1 Strategic</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl ring-4 ring-transparent group-hover:ring-emerald-500/5 transition-all">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Last Audit</p>
                <p className="text-emerald-600 font-bold text-xs">Mar 2026 • Verified</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 group/info">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/info:bg-primary group-hover/info:text-white transition-all">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Channel</p>
                  <p className="text-xs font-bold text-primary truncate">{supplier.contactEmail}</p>
                </div>
                <button className="material-symbols-outlined text-slate-300 hover:text-primary transition-colors cursor-pointer">content_copy</button>
              </div>
              
              <div className="flex items-center gap-3 group/info">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/info:bg-emerald-500 group-hover/info:text-white transition-all">
                  <span className="material-symbols-outlined text-lg">call</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hotline</p>
                  <p className="text-xs font-bold text-primary">{supplier.contactPhone}</p>
                </div>
              </div>
            </div>

            <button className="w-full py-4 bg-slate-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 group/btn shadow-xl shadow-slate-900/10">
              Procurement Profile
              <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

