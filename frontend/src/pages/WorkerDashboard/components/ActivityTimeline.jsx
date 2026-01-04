import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './ActivityTimeline.css';

/**
 * Activity Timeline Component
 * Displays recent user activities in a timeline format
 */
const ActivityTimeline = ({
  activities = [],
  loading = false,
  error = null,
  onRetry,
  language = 'en'
}) => {
  const translations = {
    en: {
      title: 'Recent Activity',
      viewAll: 'View All',
      noActivity: 'No recent activity',
      startExploring: 'Start exploring to see your activity here',
      errorMessage: 'Unable to load activity',
      retry: 'Retry',
      types: {
        profile_update: 'Profile Updated',
        review: 'Review Posted',
        agency_contact: 'Agency Contacted',
        country_view: 'Country Viewed',
        calculator: 'Calculator Used',
        document_upload: 'Document Uploaded',
        login: 'Logged In',
        default: 'Activity'
      },
      timeAgo: {
        justNow: 'Just now',
        minutes: 'min ago',
        hours: 'hr ago',
        days: 'd ago'
      }
    },
    bn: {
      title: 'সাম্প্রতিক কার্যকলাপ',
      viewAll: 'সব দেখুন',
      noActivity: 'কোনো সাম্প্রতিক কার্যকলাপ নেই',
      startExploring: 'এখানে আপনার কার্যকলাপ দেখতে অন্বেষণ শুরু করুন',
      errorMessage: 'কার্যকলাপ লোড করতে অক্ষম',
      retry: 'আবার চেষ্টা করুন',
      types: {
        profile_update: 'প্রোফাইল আপডেট',
        review: 'রিভিউ পোস্ট',
        agency_contact: 'এজেন্সিতে যোগাযোগ',
        country_view: 'দেশ দেখা হয়েছে',
        calculator: 'ক্যালকুলেটর ব্যবহার',
        document_upload: 'ডকুমেন্ট আপলোড',
        login: 'লগইন করেছেন',
        default: 'কার্যকলাপ'
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

  const getActivityIcon = (type) => {
    const icons = {
      profile_update: '👤',
      review: '⭐',
      agency_contact: '📞',
      country_view: '🌍',
      calculator: '🧮',
      document_upload: '📄',
      login: '🔐',
      default: '📋'
    };
    return icons[type] || icons.default;
  };

  const getActivityTypeLabel = (type) => {
    return txt.types[type] || txt.types.default;
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
      <div className="activity-timeline dashboard-section">
        <div className="section-header">
          <h2 className="section-title">{txt.title}</h2>
        </div>
        <div className="timeline-list">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="timeline-item skeleton-item">
              <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
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
      <div className="activity-timeline dashboard-section">
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
    <div className="activity-timeline dashboard-section">
      <div className="section-header">
        <h2 className="section-title">{txt.title}</h2>
        {activities.length > 0 && (
          <Link to="/profile#activity" className="section-link">
            {txt.viewAll} →
          </Link>
        )}
      </div>

      <div className="timeline-list">
        {activities.length === 0 ? (
          <div className="empty-timeline">
            <span className="empty-icon">📝</span>
            <p className="empty-title">{txt.noActivity}</p>
            <p className="empty-subtitle">{txt.startExploring}</p>
          </div>
        ) : (
          activities.slice(0, 10).map((activity, index) => (
            <div 
              key={activity._id || activity.id || index} 
              className="timeline-item"
            >
              <div className="timeline-marker">
                <span className="timeline-icon">{getActivityIcon(activity.type)}</span>
                {index < activities.length - 1 && <div className="timeline-line"></div>}
              </div>
              
              <div className="timeline-content">
                <span className="activity-type">{getActivityTypeLabel(activity.type)}</span>
                <p className="activity-description">{activity.description}</p>
                <span className="activity-time">
                  {formatTimeAgo(activity.timestamp || activity.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

ActivityTimeline.propTypes = {
  activities: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    timestamp: PropTypes.string
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  language: PropTypes.string
};

export default ActivityTimeline;
