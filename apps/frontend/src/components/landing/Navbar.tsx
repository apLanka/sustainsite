import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from '../common/Logo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full flex justify-between items-center px-6 lg:px-12 h-16 transition-all duration-300 z-50 font-headline tracking-tight border-b ${isScrolled ? 'bg-white/80 backdrop-blur-md border-surface-container shadow-sm' : 'bg-transparent border-transparent'}`}>
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo size="md" />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 ml-4">
          <Link 
            to="/login"
            className="hidden sm:flex text-[11px] font-bold uppercase tracking-widest text-primary hover:bg-surface-container-low px-6 py-2.5 rounded-xl transition-all"
          >
            Sign In
          </Link>
          <Link 
            to="/register"
            className="signature-gradient text-white text-[11px] font-bold uppercase tracking-widest px-8 py-2.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
          >
            SIgn Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
