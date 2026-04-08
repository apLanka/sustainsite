import { Zap } from 'lucide-react';
import { motion } from 'motion/react';
const Stats = () => {
    return (<section className="py-24 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <div className="grid grid-cols-2 gap-12 lg:w-1/2">
          {[
            { label: 'Tons of CO2 Saved', value: '2.4M' },
            { label: 'Global Projects', value: '450+' },
            { label: 'Cost Efficiency Gain', value: '15%' },
            { label: 'Net Zero Sites', value: '92' }
        ].map((stat, i) => (<div key={i} className="space-y-2">
              <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-5xl font-headline font-extrabold text-primary block">
                {stat.value}
              </motion.span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">{stat.label}</p>
            </div>))}
        </div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="lg:w-1/2 p-12 bg-surface-container-low rounded-[2.5rem] relative">
          <div className="absolute -top-6 -right-6 bg-on-tertiary-container text-white p-5 rounded-2xl shadow-xl">
            <Zap className="w-8 h-8 fill-current"/>
          </div>
          <blockquote className="text-2xl font-headline italic text-primary leading-tight font-medium">
            "SustainSite has transformed how we approach infrastructure. It's no longer just about building taller, but building smarter and kinder to the planet."
          </blockquote>
          <div className="mt-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
              SJ
            </div>
            <div>
              <p className="font-bold text-primary text-lg">Sarah Jenkins</p>
              <p className="text-sm text-on-surface-variant font-medium">Director of Innovation, Sustainable Infrastructure Corp</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>);
};
export default Stats;
