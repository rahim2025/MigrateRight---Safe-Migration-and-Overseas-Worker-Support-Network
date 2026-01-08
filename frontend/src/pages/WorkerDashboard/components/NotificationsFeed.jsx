import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './NotificationsFeed.css';

/**
 * Notifications Feed Component
 * Displays recent notifications with actions
 */
const NotificationsFeed = ({
  notifications = [],
  loading = false,
  error = null,
  onDismiss,
  onRetry,
  language = 'en'
}) => {
  const translations = {
    en: {
      title: 'Notifications',
      viewAll: 'View All',
      noNotifications: 'No new notifications',
      allCaughtUp: "You're all caught up!",
      errorMessage: 'Unable to load notifications',
      retry: 'Retry',
      dismiss: 'Dismiss',
      actions: {
        profile: 'Complete Now',
        document: 'Update Document',
        country: 'View Guide',
        review: 'Write Review',
        announcement: 'Read More'
      },
      timeAgo: {
        justNow: 'Just now',
        minutes: 'minutes ago',
        hours: 'hours ago',
        days: 'days ago'
      }
    },
    bn: {
      title: 'বিজ্ঞপ্তি',
      viewAll: 'সব দেখুন',
      noNotifications: 'কোনো নতুন বিজ্ঞপ্তি নেই',
      allCaughtUp: 'সব দেখা হয়ে গেছে!',
      errorMessage: 'বিজ্ঞপ্তি লোড করতে অক্ষম',
      retry: 'আবার চেষ্টা করুন',
      dismiss: 'বাতিল করুন',
      actions: {
        profile: 'এখনই সম্পূর্ণ করুন',
        document: 'ডকুমেন্ট আপডেট করুন',
        country: 'গাইড দেখুন',
        review: 'রিভিউ লিখুন',
        announcement: 'আরও পড়ুন'
      },
      timeAgo: {
        justNow: 'এইমাত্র',
        minutes: 'মিনিট আগে',
        hours: 'ঘন্টা আগে',
        days: 'দিন আগে'
      }
    }
  };

  const txt = translations[language] || translations.en;

  const getNotificationIcon = (type) => {
    const icons = {
      profile: '⚠️',
      document: '📅',
      country: '🌍',
      review: '⭐',
      announcement: '📢',
      default: 'ℹ️'
    };
    return icons[type] || icons.default;
  };

  const getNotificationAction = (type) => {
    return txt.actions[type] || txt.actions.announcement;
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return txt.timeAgo.justNow;
    if (diffMins < 60) return `${diffMins} ${txt.timeAgo.minutes}`;
    if (diffHours < 24) return `${diffHours} ${txt.timeAgo.hours}`;
    return `${diffDays} ${txt.timeAgo.days}`;
  };

  if (loading) {
    return (
      <div className="notifications-feed dashboard-section">
        <div className="section-header">
          <h2 className="section-title">{txt.title}</h2>
        </div>
        <div className="notifications-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="notification-item skeleton-notification">
              <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '8px' }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-feed dashboard-section">
        <div className="section-header">
          <h2 className="section-title">{txt.title}</h2>
        </div>
        <div className="section-error">
          <p>❌ {txt.errorMessage}</p>
          <button className="retry-btn" onClick={onRetry}>{txt.retry}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-feed dashboard-section">
      <div className="section-header">
        <h2 className="section-title">{txt.title}</h2>
        {notifications.length > 0 && (
          <Link to="/notifications" className="section-link">
            {txt.viewAll} →
          </Link>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <span className="empty-icon">✅</span>
            <p className="empty-title">{txt.noNotifications}</p>
            <p className="empty-subtitle">{txt.allCaughtUp}</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification._id || notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                {notification.metadata?.description && (
                  <p className="notification-detail">{notification.metadata.description}</p>
                )}
                <span className="notification-time">
                  {formatTimeAgo(notification.timestamp || notification.createdAt)}
                </span>
              </div>

              <div className="notification-actions">
                {notification.action && (
                  <Link 
                    to={notification.action} 
                    className="notification-action-btn"
                  >
                    {getNotificationAction(notification.type)}
                  </Link>
                )}
                <button 
                  className="notification-dismiss"
                  onClick={() => onDismiss(notification._id || notification.id)}
                  aria-label={txt.dismiss}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

NotificationsFeed.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    type: PropTypes.string,
    message: PropTypes.string,
    action: PropTypes.string,
    timestamp: PropTypes.string,
    read: PropTypes.bool
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onDismiss: PropTypes.func,
  onRetry: PropTypes.func,
  language: PropTypes.string
};

export default NotificationsFeed;
