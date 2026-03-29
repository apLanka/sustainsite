const Footer = () => {
  return (
    <footer className="w-full py-12 flex flex-col sm:flex-row justify-between items-center px-6 lg:px-12 bg-white font-body text-[10px] uppercase tracking-[0.2em] text-primary/60 border-t border-surface-container">
      <div className="mb-6 sm:mb-0">
        <span className="font-bold">© 2026 SustainSite Corp</span>
      </div>
      <div className="flex gap-8 font-bold">
        <a className="hover:text-primary transition-colors" href="#">Help Center</a>
        <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
        <a className="hover:text-primary transition-colors" href="#">Terms</a>
      </div>
    </footer>
  );
};

export default Footer;
