import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Stats from '@/components/landing/Stats';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
export default function LandingPage() {
    return (<div className="min-h-screen selection:bg-secondary-container selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>);
}
