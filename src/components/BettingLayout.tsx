import React, { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MatchList from './MatchList';
import BetSlip from './BetSlip';
import MobileNav from './MobileNav';

interface BettingLayoutProps {
  children: ReactNode;
}

export const BettingLayout: React.FC<BettingLayoutProps> = ({ children }) => {
  const [mobileView, setMobileView] = useState<'matches' | 'sports' | 'betslip'>('matches');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleMobileViewChange = (view: 'matches' | 'sports' | 'betslip') => {
    setMobileView(view);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <Header onMenuClick={toggleSidebar} />
      
      {/* Mobile View Container */}
      <div className="md:hidden flex-1 relative">
        {/* Sidebar - Slides in from left when menu is clicked */}
        <div 
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-0 z-50 w-[80%] h-[calc(100vh-4rem)] bg-white transition-transform duration-300 ease-in-out overflow-y-auto pb-16 shadow-lg`}
        >
          <Sidebar />
        </div>

        {/* Overlay - Only visible when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Main content - Always visible on mobile */}
        <div className="relative z-20 h-[calc(100vh-8rem)] bg-white overflow-y-auto pb-16">
          {children}
        </div>
        
        {/* BetSlip - Slides up from bottom on mobile when active */}
        <div 
          className={`${
            mobileView === 'betslip' ? 'translate-y-0' : 'translate-y-full'
          } fixed bottom-16 left-0 right-0 z-40 h-[80vh] bg-white transition-transform duration-300 ease-in-out shadow-lg rounded-t-2xl overflow-y-auto`}
        >
          <div className="sticky top-0 w-full h-1 flex justify-center bg-white pt-2">
            <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
          </div>
          <BetSlip />
        </div>
      </div>
      
      {/* Desktop View Container */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Sidebar - always visible on desktop */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200">
          <Sidebar />
        </div>
        
        {/* Main content - always visible on desktop */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        
        {/* BetSlip - always visible on desktop */}
        <div className="w-80 flex-shrink-0">
          <BetSlip />
        </div>
      </div>
      
      {/* Mobile navigation */}
      <MobileNav onSelectView={handleMobileViewChange} activeBets={2} />
    </div>
  );
};

export default BettingLayout; 