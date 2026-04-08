import { Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
const Hero = () => {
    const navigate = useNavigate();
    return (<section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-20">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-surface-container-low -skew-x-12 translate-x-1/4 hidden lg:block"></div>
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-secondary/5 rounded-full blur-[80px]"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid lg:grid-cols-12 gap-12 lg:gap-20 items-center relative z-10 py-12 lg:py-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 text-secondary text-[11px] font-bold tracking-[0.15em] uppercase border border-secondary/10">
            <Leaf className="w-3 h-3 fill-current"/>
            Decarbonizing Construction
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl xl:text-7xl font-headline font-extrabold tracking-tight text-primary leading-[1.05] lg:leading-[0.98]">
              Building a <br />
              <span className="text-gradient">Greener Future</span> <br />
              with SustainSite.
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed font-medium">
              Empowering infrastructure leaders with precision-engineered carbon intelligence and real-time sustainability insights.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <button onClick={() => navigate('/register')} className="w-full sm:w-auto signature-gradient text-white px-12 py-5 rounded-2xl font-bold text-lg shadow-[0_20px_40px_rgba(1,45,29,0.25)] hover:translate-y-1 transition-all duration-300 cursor-pointer">
              Get Started
            </button>
          </div>
          <div className="pt-8 flex items-center gap-10">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary">450+</span>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Global Projects</span>
            </div>
            <div className="h-10 w-px bg-outline-variant/30"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary">2.4M</span>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Tons CO2 Saved</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-5 relative">
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-tertiary-container/20 rounded-full blur-2xl"></div>
            <div className="rounded-[2.5rem] overflow-hidden shadow-[0_48px_80px_-16px_rgba(0,0,0,0.15)] bg-white border-8 border-white group">
              <img alt="Modern Sustainable Building" className="w-full aspect-[4/5] object-cover hover:scale-105 transition-transform duration-1000" src="/hero-building.png" referrerPolicy="no-referrer"/>
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">Live Impact Feed</span>
                  </div>
                  <span className="text-[10px] font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded-full">VERIFIED</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="block text-3xl font-headline font-extrabold text-primary tracking-tighter leading-none">98.4%</span>
                    <span className="text-[10px] text-on-surface-variant font-medium">Site Efficiency Score</span>
                  </div>
                  <div className="w-32 h-12 bg-surface-container-low rounded-xl overflow-hidden relative">
                    <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                      <path d="M0 40 Q 25 35, 50 30 T 100 10 L 100 40 L 0 40 Z" fill="#a0f4c8" opacity="0.3"></path>
                      <path d="M0 40 Q 25 35, 50 25 T 100 5" fill="none" stroke="#0e6c4a" strokeWidth="2"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>);
};
export default Hero;
