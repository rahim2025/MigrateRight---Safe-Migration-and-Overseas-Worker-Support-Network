import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './DashboardHeader.css';

/**
 * Dashboard Header Component
 * Shows welcome message, profile completeness, last login, notifications
 */
const DashboardHeader = ({
  userName,
  profileCompleteness,
  lastLogin,
  unreadNotifications = 0,
  loading = false,
  language = 'en'
}) => {
  const translations = {
    en: {
      welcomeBack: 'Welcome back',
      profileComplete: 'Profile',
      complete: 'complete',
      completeProfile: 'Complete Profile',
      lastLogin: 'Last login',
      notifications: 'Notifications',
      noNotifications: 'No new notifications',
      viewAll: 'View All'
    },
    bn: {
      welcomeBack: 'স্বাগতম',
      profileComplete: 'প্রোফাইল',
      complete: 'সম্পূর্ণ',
      completeProfile: 'প্রোফাইল সম্পূর্ণ করুন',
      lastLogin: 'শেষ লগইন',
      notifications: 'বিজ্ঞপ্তি',
      noNotifications: 'কোনো নতুন বিজ্ঞপ্তি নেই',
      viewAll: 'সব দেখুন'
    }
  };

  const txt = translations[language] || translations.en;

  const formatLastLogin = (date) => {
    if (!date) return null;
    
    const loginDate = new Date(date);
    const now = new Date();
    const diffMs = now - loginDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (language === 'bn') {
      if (diffMins < 60) return `${diffMins} মিনিট আগে`;
      if (diffHours < 24) return `${diffHours} ঘন্টা আগে`;
      if (diffDays < 7) return `${diffDays} দিন আগে`;
      return loginDate.toLocaleDateString('bn-BD');
    }

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return loginDate.toLocaleDateString();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'bn') {
      if (hour < 12) return 'সুপ্রভাত';
      if (hour < 17) return 'শুভ অপরাহ্ন';
      return 'শুভ সন্ধ্যা';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-left">
            <div className="skeleton skeleton-text" style={{ width: '250px', height: '32px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '150px', height: '20px' }}></div>
          </div>
          <div className="header-right">
            <div className="skeleton" style={{ width: '180px', height: '50px' }}></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="dashboard-header">
      <div className="header-container">
        {/* Left: Welcome Message */}
        <div className="header-left">
          <h1 className="welcome-message">
            {getGreeting()}, <span className="user-name">{userName}</span>! 👋
          </h1>
          {lastLogin && (
            <p className="last-login">
              {txt.lastLogin}: {formatLastLogin(lastLogin)}
            </p>
          )}
        </div>

        {/* Right: Profile & Notifications */}
        <div className="header-right">
          {/* Profile Completeness */}
          <div className="profile-completeness">
            <div className="completeness-info">
              <span className="completeness-label">{txt.profileComplete}</span>
              <span className="completeness-value">{profileCompleteness}% {txt.complete}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${profileCompleteness}%` }}
              ></div>
            </div>
            {profileCompleteness < 100 && (
              <Link to="/profile" className="complete-profile-link">
                {txt.completeProfile} →
              </Link>
            )}
          </div>

          {/* Notification Bell */}
          <button className="notification-bell" aria-label={txt.notifications}>
            <span className="bell-icon">🔔</span>
            {unreadNotifications > 0 && (
              <span className="notification-badge">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

DashboardHeader.propTypes = {
  userName: PropTypes.string.isRequired,
  profileCompleteness: PropTypes.number,
  lastLogin: PropTypes.string,
  unreadNotifications: PropTypes.number,
  loading: PropTypes.bool,
  language: PropTypes.string
};

export default DashboardHeader;
