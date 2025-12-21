import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import MobileNav from './MobileNav/MobileNav';
import BottomNav from './BottomNav/BottomNav';
import Footer from './Footer/Footer';
import './Layout.css';

/**
 * Responsive Layout Component
 * Desktop: Standard navbar + footer
 * Mobile: Top mobile nav + bottom nav + simplified footer
 */
const Layout = () => {
  return (
    <div className="app">
      {/* Desktop Navigation - Hidden on mobile */}
      <Navbar />
      
      {/* Mobile Navigation - Hidden on desktop */}
      <MobileNav />
      
      <main className="app-content">
        <Outlet />
      </main>
      
      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <BottomNav />
      
      <Footer />
    </div>
  );
};

export default Layout;
