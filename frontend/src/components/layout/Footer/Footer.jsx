import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import './Footer.css';

/**
 * Footer Component
 * Site-wide footer with links and information
 */
const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>MigrateRight</h3>
          <p>{t('tagline')}</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/agencies">Search Agencies</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li>
              <Link to="/help">Help Center</Link>
            </li>
            <li>
              <Link to="/safety">Safety Guidelines</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: support@migrateright.bd</p>
          <p>Phone: +880-1711-123456</p>
          <p>Hotline: 16111</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} MigrateRight. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
