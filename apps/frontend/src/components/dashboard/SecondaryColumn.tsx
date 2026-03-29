const activities = [
  {
    user: 'Marcus L.',
    action: "uploaded 'Q3 Structural Audit' to ",
    project: 'Eco-Hub',
    time: '14 mins ago',
    type: 'upload'
  },
  {
    user: 'Alert:',
    action: ' LEED Certification for ',
    project: 'Harbor Park',
    details: ' requires final document set.',
    time: '2 hours ago',
    type: 'alert'
  },
  {
    user: 'System',
    action: ' generated monthly carbon offset projection report.',
    time: '5 hours ago',
    type: 'system'
  }
];

const SecondaryColumn = () => {
  return (
    <div className="space-y-6">
      {/* Global ESG Score Card */}
      <div className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-2xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-6">
            <span className="material-symbols-outlined !text-sm text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Global ESG Score</span>
          </div>
          <h4 className="text-3xl font-black tracking-tighter mb-2 font-headline">Lead the Way.</h4>
          <p className="text-sm text-emerald-100/70 mb-8 leading-relaxed">Your current portfolio is outperforming 85% of North American sustainable infrastructure benchmarks.</p>
          <button className="w-full py-3 bg-secondary-container text-on-secondary-container font-bold text-sm rounded-lg hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer font-headline">Download ESG Report</button>
        </div>
        {/* Decorative element */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-surface-container-low p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 font-headline">Recent Activity</h3>
        <div className="space-y-6">
          {activities.map((item, index) => (
            <div key={index} className="flex gap-4 group">
              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                item.type === 'upload' ? 'bg-secondary shadow-[0_0_8px_rgba(14,108,74,0.4)]' : 
                item.type === 'alert' ? 'bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.4)]' : 
                'bg-slate-300'
              }`}></div>
              <div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  <strong className="text-primary">{item.user}</strong> 
                  {item.action} 
                  {item.project && <em className="text-secondary font-semibold not-italic">{item.project}</em>}
                  {item.details && <span>{item.details}</span>}
                </p>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 block tracking-wider">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecondaryColumn;
