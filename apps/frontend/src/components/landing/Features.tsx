import { Cloud, ShieldCheck, Package, BarChart3, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
const Features = () => {
    const navigate = useNavigate();
    return (<section className="py-24 px-6 lg:px-12 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 space-y-4 text-center lg:text-left">
          <h2 className="text-4xl font-headline font-bold text-primary">Advanced Sustainable Intelligence</h2>
          <p className="text-on-surface-variant max-w-2xl font-medium">Every module in SustainSite is engineered to balance structural integrity with ecological responsibility.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-surface-container-lowest p-8 rounded-3xl shadow-sm transition-all flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                <Cloud className="text-secondary w-6 h-6"/>
              </div>
              <h3 className="text-2xl font-headline font-bold text-primary mb-3">Real-time Carbon Tracking</h3>
              <p className="text-on-surface-variant font-medium">Monitor embodied carbon across your supply chain in real-time. Automated reporting for ESG compliance and local regulations.</p>
            </div>
            <div className="mt-6 flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Project Average</span>
                <span className="text-lg font-bold text-primary">12.4t CO2e/sqm</span>
              </div>
              <div className="ml-auto flex -space-x-2">
                {[1, 2].map(i => (<img key={i} alt="Team member" className="w-8 h-8 rounded-full border-2 border-surface-container-lowest" src={`https://picsum.photos/seed/user${i}/100/100`} referrerPolicy="no-referrer"/>))}
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-primary p-8 rounded-3xl flex flex-col justify-between text-white min-h-[320px]">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="text-secondary-container w-6 h-6"/>
            </div>
            <div>
              <h3 className="text-2xl font-headline font-bold mb-3">Document Compliance</h3>
              <p className="text-white/70 text-sm font-medium">Automated LEED and BREEAM certification workflows with smart contract triggers.</p>
            </div>
            <button onClick={() => navigate('/register')} className="mt-4 text-secondary-container font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all cursor-pointer">
              Get Started <ArrowRight className="w-4 h-4"/>
            </button>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm transition-all min-h-[320px] flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-tertiary-container/10 flex items-center justify-center mb-6">
              <Package className="text-tertiary-container w-6 h-6"/>
            </div>
            <h3 className="text-xl font-headline font-bold text-primary mb-3">Material Inventory</h3>
            <p className="text-on-surface-variant text-sm font-medium mb-auto">End-to-end transparency for circular economy materials and sustainable sourcing.</p>
            <div className="space-y-2 mt-6">
              <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                <span>Recycled Steel</span>
                <span className="text-secondary">82%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: '82%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-secondary"></motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="md:col-span-1 lg:col-span-1 bg-secondary-container p-8 rounded-3xl min-h-[320px] flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <BarChart3 className="text-secondary w-6 h-6"/>
            </div>
            <div>
              <h3 className="text-xl font-headline font-bold text-primary mb-3">Financial Analytics</h3>
              <p className="text-primary/70 text-sm font-medium">Link green performance directly to financial incentives and tax credits.</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }} onClick={() => navigate('/register')} className="md:col-span-2 lg:col-span-3 h-[320px] rounded-3xl overflow-hidden relative group cursor-pointer">
            <img alt="Sustainable Architecture" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src="/case-study-building.png" referrerPolicy="no-referrer"/>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent flex items-end p-8">
              <div className="text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block text-secondary-container">Case Study</span>
                <h4 className="text-2xl font-headline font-bold">The Verdant Tower Project</h4>
                <p className="text-white/70 text-sm font-medium">34% reduction in site emissions during the foundation phase.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);
};
export default Features;
