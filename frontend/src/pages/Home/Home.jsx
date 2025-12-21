import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import './Home.css';

/**
 * Home Page Component
 * Landing page with hero section and key features
 */
const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">{t('welcome')}</h1>
          <p className="hero-subtitle">{t('tagline')}</p>
          <div className="hero-actions">
            <Link to="/agencies" className="btn btn-primary btn-lg">
              {t('searchAgencies')}
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              {t('register')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose MigrateRight?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Verified Agencies</h3>
              <p>Search and compare BMET-licensed recruitment agencies with transparent ratings</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Fee Transparency</h3>
              <p>View detailed fee structures by country and job category before committing</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Real Reviews</h3>
              <p>Read authentic reviews from workers who have used these agencies</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Find Nearby</h3>
              <p>Locate recruitment agencies near your location with our map feature</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Safe Migration</h3>
              <p>Access resources and guidelines for safe overseas employment</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Multi-Language</h3>
              <p>Available in Bengali and English for your convenience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container text-center">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of workers who found their path to safe migration</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
