import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import './BottomNav.css';

/**
 * Bottom Navigation Component
 * Sticky bottom navigation for easy thumb reach on mobile devices
 * Shows most important 4-5 actions
 */
const BottomNav = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom navigation">
      <Link
        to="/"
        className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
        aria-label="Home"
        aria-current={isActive('/') ? 'page' : undefined}
      >
        <span className="bottom-nav-icon" aria-hidden="true">🏠</span>
        <span className="bottom-nav-label">Home</span>
      </Link>

      <Link
        to="/agencies"
        className={`bottom-nav-item ${isActive('/agencies') ? 'active' : ''}`}
        aria-label="Search agencies"
        aria-current={isActive('/agencies') ? 'page' : undefined}
      >
        <span className="bottom-nav-icon" aria-hidden="true">🔍</span>
        <span className="bottom-nav-label">Search</span>
      </Link>

      {isAuthenticated ? (
        <>
          <Link
            to="/saved"
            className={`bottom-nav-item ${isActive('/saved') ? 'active' : ''}`}
            aria-label="Saved agencies"
            aria-current={isActive('/saved') ? 'page' : undefined}
          >
            <span className="bottom-nav-icon" aria-hidden="true">⭐</span>
            <span className="bottom-nav-label">Saved</span>
          </Link>

          <Link
            to="/profile"
            className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}
            aria-label="My profile"
            aria-current={isActive('/profile') ? 'page' : undefined}
          >
            <span className="bottom-nav-icon" aria-hidden="true">👤</span>
            <span className="bottom-nav-label">Profile</span>
          </Link>
        </>
      ) : (
        <Link
          to="/login"
          className={`bottom-nav-item ${isActive('/login') ? 'active' : ''}`}
          aria-label="Login"
          aria-current={isActive('/login') ? 'page' : undefined}
        >
          <span className="bottom-nav-icon" aria-hidden="true">🔑</span>
          <span className="bottom-nav-label">Login</span>
        </Link>
      )}
    </nav>
  );
};

export default BottomNav;
