import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileNav from '../MobileNav/MobileNav';
import BottomNav from '../BottomNav/BottomNav';
import './MobileLayout.css';

/**
 * Mobile-Optimized Layout Component
 * Uses both top and bottom navigation for optimal mobile UX
 */
const MobileLayout = () => {
  return (
    <div className="mobile-layout">
      <MobileNav />
      
      <main className="mobile-main" role="main">
        <Outlet />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default MobileLayout;
