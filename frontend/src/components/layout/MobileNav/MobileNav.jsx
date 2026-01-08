import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@context/AuthContext';
import { useLanguage } from '@context/LanguageContext';
import './MobileNav.css';

/**
 * Mobile-First Navigation Component
 * Optimized for low-end smartphones with touch targets and accessibility
 */
const MobileNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const isActive = (path) => location.pathname === path;
  
  // Hide mobile nav on agency dashboard
  if (location.pathname === '/agency-dashboard') {
    return null;
  }

  return (
    <nav className="mobile-nav" role="navigation" aria-label="Main navigation">
      {/* Top Bar */}
      <div className="mobile-nav-header">
        <Link to="/" className="mobile-nav-logo" onClick={closeMenu}>
          <span className="logo-text">MigrateRight</span>
        </Link>

        {/* Language Toggle - Simple Button */}
        <button
          onClick={() => changeLanguage(language === 'en' ? 'bn' : 'en')}
          className="lang-btn"
          aria-label={language === 'en' ? 'Switch to Bengali' : 'Switch to English'}
        >
          {language === 'en' ? 'বাংলা' : 'EN'}
        </button>

        {/* Hamburger Menu Button */}
        <button
          className={`menu-btn ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          <span className="menu-icon"></span>
        </button>
      </div>

      {/* Full Screen Menu Overlay */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={closeMenu}>
          <div className="menu-content" onClick={(e) => e.stopPropagation()}>
            <ul className="menu-list" role="menu">
              <li role="none">
                <Link
                  to="/"
                  className={`menu-item ${isActive('/') ? 'active' : ''}`}
                  onClick={closeMenu}
                  role="menuitem"
                >
                  <span className="menu-icon">🏠</span>
                  <span>{t('navigation.home')}</span>
                </Link>
              </li>

              <li role="none">
                <Link
                  to="/agencies"
                  className={`menu-item ${isActive('/agencies') ? 'active' : ''}`}
                  onClick={closeMenu}
                  role="menuitem"
                >
                  <span className="menu-icon">🔍</span>
                  <span>{t('navigation.searchAgencies')}</span>
                </Link>
              </li>

              {isAuthenticated ? (
                <>
                  <li role="none">
                    <Link
                      to="/profile"
                      className={`menu-item ${isActive('/profile') ? 'active' : ''}`}
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <span className="menu-icon">👤</span>
                      <span>{t('navigation.profile')}</span>
                    </Link>
                  </li>

                  {/* Placeholder routes for future features */}
                  <li role="none">
                    <Link
                      to="/saved"
                      className="menu-item"
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <span className="menu-icon">⭐</span>
                      <span>{t('navigation.savedAgencies')}</span>
                    </Link>
                  </li>

                  <li role="none">
                    <Link
                      to="/documents"
                      className="menu-item"
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <span className="menu-icon">📄</span>
                      <span>{t('navigation.documents')}</span>
                    </Link>
                  </li>

                  <li role="none">
                    <Link
                      to="/help"
                      className="menu-item"
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <span className="menu-icon">❓</span>
                      <span>{t('navigation.help')}</span>
                    </Link>
                  </li>

                  <li role="none">
                    <button
                      className="menu-item logout-btn"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <span className="menu-icon">🚪</span>
                      <span>{t('auth.logout')}</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li role="none">
                    <Link
                      to="/login"
                      className={`menu-item ${isActive('/login') ? 'active' : ''}`}
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <span className="menu-icon">🔑</span>
                      <span>{t('auth.login')}</span>
                    </Link>
                  </li>

                  <li role="none">
                    <Link
                      to="/register"
                      className={`menu-item ${isActive('/register') ? 'active' : ''}`}
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      <span className="menu-icon">📝</span>
                      <span>{t('auth.register')}</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* User Info at Bottom */}
            {isAuthenticated && user && (
              <div className="menu-footer">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.fullName?.firstName?.[0] || 'U'}
                  </div>
                  <div className="user-details">
                    <p className="user-name">
                      {user.fullName?.firstName} {user.fullName?.lastName}
                    </p>
                    <p className="user-email">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default MobileNav;
