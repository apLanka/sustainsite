import { TreePine, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
const CTA = () => {
    return (<section className="py-32 px-6 lg:px-12 text-center bg-surface">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center">
            <TreePine className="text-secondary w-10 h-10 fill-secondary/20"/>
          </div>
        </motion.div>
        <h2 className="text-4xl lg:text-7xl font-headline font-extrabold text-primary tracking-tight leading-none">
          Ready to lead the <br /> sustainable revolution?
        </h2>
        <p className="text-xl text-on-surface-variant font-medium max-w-2xl mx-auto">
          Join hundreds of industry leaders using SustainSite to build the next generation of infrastructure.
        </p>
        <div className="flex justify-center pt-4">
          <Link to="/register" className="group signature-gradient text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-all cursor-pointer flex items-center gap-3 justify-center">
            Get Started Now
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>
      </div>
    </section>);
};
export default CTA;
