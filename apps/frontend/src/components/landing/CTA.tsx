import { TreePine } from 'lucide-react';
import { motion } from 'motion/react';

const CTA = () => {
  return (
    <section className="py-32 px-6 lg:px-12 text-center bg-surface">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center">
            <TreePine className="text-secondary w-10 h-10 fill-secondary/20" />
          </div>
        </motion.div>
        <h2 className="text-4xl lg:text-7xl font-headline font-extrabold text-primary tracking-tight leading-none">
          Ready to lead the <br/> sustainable revolution?
        </h2>
        <p className="text-xl text-on-surface-variant font-medium max-w-2xl mx-auto">
          Join hundreds of industry leaders using SustainSite to build the next generation of infrastructure.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
          <button className="signature-gradient text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-transform cursor-pointer">
            Schedule a Consultation
          </button>
          <button className="bg-white text-primary px-12 py-5 rounded-2xl font-bold text-xl border-2 border-outline-variant/20 hover:bg-surface-container transition-colors cursor-pointer">
            View Product Tour
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
