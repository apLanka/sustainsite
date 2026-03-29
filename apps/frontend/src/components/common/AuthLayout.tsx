import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  imageUrl?: string;
}

export default function AuthLayout({ children, title, subtitle, imageUrl }: AuthLayoutProps) {
  const defaultImage = "/auth-brand-anchor.png";

  return (
    <main className="flex min-h-screen w-full bg-surface">
      {/* Left Section: Visual Brand Anchor */}
      <section className="relative hidden lg:flex lg:w-3/5 h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Sustainable Architecture" 
            className="w-full h-full object-cover" 
            src={imageUrl || defaultImage}
          />
          {/* Dark Emerald Overlay with slight transparency */}
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 signature-gradient opacity-40"></div>
        </div>

        {/* Brand Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-20 w-full h-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary-container rounded-lg flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <span className="font-headline text-2xl font-extrabold tracking-tight">SustainSite</span>
          </div>

          <div className="max-w-md">
            <h1 className="font-headline text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Building the <span className="text-secondary-container">Future</span> of Green Infrastructure.
            </h1>
            <p className="text-lg text-secondary-container/80 leading-relaxed font-body">
              Join the ecosystem of contractors and architects committed to sustainable urban development through precision data and ecological harmony.
            </p>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <span className="text-3xl font-headline font-bold text-secondary-container">12k+</span>
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">Projects Tracked</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-headline font-bold text-secondary-container">4.8M</span>
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">CO2 Tons Saved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section: Form Container */}
      <section className="w-full lg:w-2/5 h-screen bg-surface-container-lowest overflow-y-auto flex flex-col items-center justify-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 lg:hidden mb-12">
            <span className="material-symbols-outlined text-secondary !text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <span className="font-headline text-2xl font-bold text-primary">SustainSite</span>
          </div>

          <div className="mb-10">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-2">{title}</h2>
            <p className="text-on-surface-variant font-medium">{subtitle}</p>
          </div>

          {children}

          <div className="mt-16 flex justify-center gap-8 border-t border-outline-variant/10 pt-8">
            <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant/40">Sustainability First</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant/40">Data Driven</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant/40">Carbon Neutral</span>
          </div>
        </div>
      </section>
    </main>
  );
}
