import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useLanguage } from '@context/LanguageContext';
import LanguageSwitcher from '@components/common/LanguageSwitcher/LanguageSwitcher';
import './Navbar.css';

/**
 * Navbar Component
 * Main navigation bar with authentication and language switching
 */
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">MigrateRight</span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          <Link to="/" className="nav-link">
            {t('navigation.home')}
          </Link>
          <Link to="/agencies" className="nav-link">
            {t('navigation.agencies')}
          </Link>
          <Link to="/countries" className="nav-link">
            {t('navigation.countryGuides')}
          </Link>
          <Link to="/calculator" className="nav-link">
            {t('navigation.calculator')}
          </Link>


          {isAuthenticated && (
            <>
              {/* Agency Dashboard - only for agency users */}
              {user?.role === 'agency' && (
                <Link to="/agency-dashboard" className="nav-link">
                  🏢 My Agency Dashboard
                </Link>
              )}
              
              <Link to="/records" className="nav-link">
                📁 My Records
              </Link>
              <Link to="/salary-tracker" className="nav-link">
                💰 Salary Tracker
              </Link>
              <Link to="/admin/dashboard" className="nav-link">
                Admin Panel
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-link">
                {t('navigation.profile')}
              </Link>
              <button onClick={handleLogout} className="nav-link btn-link">
                {t('auth.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                {t('auth.login')}
              </Link>
              <Link to="/register" className="nav-link btn-primary">
                {t('auth.register')}
              </Link>
            </>
          )}

          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <span className="hamburger"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-nav-link" onClick={toggleMobileMenu}>
            {t('navigation.home')}
          </Link>
          <Link to="/agencies" className="mobile-nav-link" onClick={toggleMobileMenu}>
            {t('navigation.agencies')}
          </Link>
          <Link to="/countries" className="mobile-nav-link" onClick={toggleMobileMenu}>
            {t('navigation.countryGuides')}
          </Link>
          <Link to="/calculator" className="mobile-nav-link" onClick={toggleMobileMenu}>
            {t('navigation.calculator')}
          </Link>


          {isAuthenticated && (
            <>
              {/* Agency Dashboard - only for agency users */}
              {user?.role === 'agency' && (
                <Link to="/agency-dashboard" className="mobile-nav-link" onClick={toggleMobileMenu}>
                  🏢 My Agency Dashboard
                </Link>
              )}
              
              <Link to="/records" className="mobile-nav-link" onClick={toggleMobileMenu}>
                📁 My Records
              </Link>
              <Link to="/salary-tracker" className="mobile-nav-link" onClick={toggleMobileMenu}>
                💰 Salary Tracker
              </Link>
              <Link to="/admin/dashboard" className="mobile-nav-link" onClick={toggleMobileMenu}>
                Admin Panel
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="mobile-nav-link" onClick={toggleMobileMenu}>
                {t('navigation.profile')}
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMobileMenu();
                }}
                className="mobile-nav-link btn-link"
              >
                {t('auth.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={toggleMobileMenu}>
                {t('auth.login')}
              </Link>
              <Link to="/register" className="mobile-nav-link" onClick={toggleMobileMenu}>
                {t('auth.register')}
              </Link>
            </>
          )}

          <div className="mobile-language-switcher">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
