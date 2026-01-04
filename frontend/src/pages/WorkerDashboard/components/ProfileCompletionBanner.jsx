import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './ProfileCompletionBanner.css';

/**
 * Profile Completion Banner Component
 * Prominent banner for incomplete profiles
 */
const ProfileCompletionBanner = ({
  completeness = 0,
  missingSections = [],
  onDismiss,
  language = 'en'
}) => {
  const translations = {
    en: {
      title: 'Complete your profile to get better job matches',
      subtitle: 'Fill in the missing information to improve your chances',
      completeProfile: 'Complete Profile',
      sections: {
        personal: 'Personal Info',
        contact: 'Contact Info',
        experience: 'Work Experience (add at least 1)',
        skills: 'Skills (add at least 3)',
        documents: 'Documents (upload passport)'
      },
      complete: 'Complete',
      incomplete: 'Missing'
    },
    bn: {
      title: 'আরও ভালো চাকরির মিল পেতে আপনার প্রোফাইল সম্পূর্ণ করুন',
      subtitle: 'আপনার সম্ভাবনা উন্নত করতে অনুপস্থিত তথ্য পূরণ করুন',
      completeProfile: 'প্রোফাইল সম্পূর্ণ করুন',
      sections: {
        personal: 'ব্যক্তিগত তথ্য',
        contact: 'যোগাযোগের তথ্য',
        experience: 'কাজের অভিজ্ঞতা (কমপক্ষে ১টি যোগ করুন)',
        skills: 'দক্ষতা (কমপক্ষে ৩টি যোগ করুন)',
        documents: 'ডকুমেন্ট (পাসপোর্ট আপলোড করুন)'
      },
      complete: 'সম্পূর্ণ',
      incomplete: 'অনুপস্থিত'
    }
  };

  const txt = translations[language] || translations.en;

  return (
    <div className="profile-completion-banner">
      <div className="banner-container">
        <button 
          className="banner-dismiss" 
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>

        <div className="banner-content">
          <div className="banner-icon">📋</div>
          
          <div className="banner-text">
            <h2 className="banner-title">{txt.title}</h2>
            <p className="banner-subtitle">{txt.subtitle}</p>
          </div>

          <div className="banner-progress">
            <div className="progress-circle">
              <svg viewBox="0 0 36 36" className="circular-progress">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle-fill"
                  strokeDasharray={`${completeness}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="progress-text">{completeness}%</span>
            </div>
          </div>
        </div>

        <div className="banner-sections">
          {missingSections.map(section => (
            <div 
              key={section.key} 
              className={`section-item ${section.complete ? 'complete' : 'incomplete'}`}
            >
              <span className="section-icon">
                {section.complete ? '✓' : '✗'}
              </span>
              <span className="section-name">
                {txt.sections[section.key] || section.key}
              </span>
            </div>
          ))}
        </div>

        <div className="banner-action">
          <Link to="/profile" className="complete-profile-btn">
            {txt.completeProfile} →
          </Link>
        </div>
      </div>
    </div>
  );
};

ProfileCompletionBanner.propTypes = {
  completeness: PropTypes.number,
  missingSections: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    complete: PropTypes.bool
  })),
  onDismiss: PropTypes.func,
  language: PropTypes.string
};

export default ProfileCompletionBanner;
