import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface selection:bg-secondary-container selection:text-on-secondary-container">
      <Sidebar />

      <TopNav />

      <main className="ml-64 pt-16 min-h-screen px-10 pb-12 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
};
export default DashboardLayout;
