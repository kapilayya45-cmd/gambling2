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
  
  const handleMobileViewChange = (view: 'matches' | 'sports' | 'betslip') => {
    setMobileView(view);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - always visible on desktop, conditionally on mobile */}
        <div className={`${mobileView === 'sports' ? 'block' : 'hidden'} md:block`}>
          <Sidebar />
        </div>
        
        {/* Main content - always visible on desktop, conditionally on mobile */}
        <div className={`${mobileView === 'matches' ? 'block' : 'hidden'} md:block flex-1`}>
          {children}
        </div>
        
        {/* BetSlip - always visible on desktop, conditionally on mobile */}
        <div className={`${mobileView === 'betslip' ? 'block' : 'hidden'} lg:block`}>
          <BetSlip />
        </div>
      </div>
      
      {/* Mobile navigation */}
      <MobileNav onSelectView={handleMobileViewChange} activeBets={2} />
      
      {/* Padding bottom for mobile to account for the nav bar */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
};

export default BettingLayout; 