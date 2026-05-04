import { useState } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Desktop Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      {/* Mobile Bottom Nav */}
      <BottomNav />

      <main 
        className={`transition-all duration-300 min-h-screen pt-16 md:pt-0 pb-20 md:pb-0 
          ${collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
