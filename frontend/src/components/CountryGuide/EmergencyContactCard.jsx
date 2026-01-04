import PropTypes from 'prop-types';
import './EmergencyContactCard.css';

/**
 * EmergencyContactCard Component
 * Displays emergency contact information with click-to-call functionality
 * 
 * @param {Object} props - Component props
 * @param {Object} props.contact - Contact object with phone, email, address, etc.
 * @param {string} props.title - Card title
 * @param {string} props.icon - Icon emoji
 * @param {boolean} props.highlight - Whether to highlight the card (for embassy)
 * @param {string} props.language - Current language (en/bn)
 */
const EmergencyContactCard = ({ 
  contact, 
  title, 
  icon = '📞', 
  highlight = false,
  language = 'en' 
}) => {
  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handleCopyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
      alert(`${type} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getLocalizedText = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return value[language] || value.en || Object.values(value)[0];
  };

  const renderPhones = (phones) => {
    if (!phones) return null;
    const phoneList = Array.isArray(phones) ? phones : [phones];
    
    return phoneList.map((phone, idx) => (
      <a
        key={idx}
        href={`tel:${phone.replace(/\s/g, '')}`}
        className="phone-link"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {phone}
      </a>
    ));
  };

  return (
    <div className={`emergency-contact-card ${highlight ? 'emergency-contact-card--highlight' : ''}`}>
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <h3 className="card-title">{title}</h3>
      </div>

      <div className="card-body">
        {/* Phone Numbers */}
        {contact.phone && (
          <div className="contact-row">
            <span className="contact-icon">📞</span>
            <div className="contact-info">
              <span className="contact-label">Phone</span>
              <div className="contact-value phone-list">
                {renderPhones(contact.phone)}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Hotline */}
        {contact.emergencyHotline && (
          <div className="contact-row contact-row--emergency">
            <span className="contact-icon">🚨</span>
            <div className="contact-info">
              <span className="contact-label">Emergency Hotline</span>
              <a
                href={`tel:${contact.emergencyHotline.replace(/\s/g, '')}`}
                className="contact-value emergency-number"
              >
                {contact.emergencyHotline}
              </a>
            </div>
          </div>
        )}

        {/* Email */}
        {contact.email && (
          <div className="contact-row">
            <span className="contact-icon">✉️</span>
            <div className="contact-info">
              <span className="contact-label">Email</span>
              <a
                href={`mailto:${contact.email}`}
                className="contact-value email-link"
              >
                {contact.email}
              </a>
              <button
                className="copy-button"
                onClick={(e) => {
                  e.preventDefault();
                  handleCopyToClipboard(contact.email, 'Email');
                }}
                aria-label="Copy email"
              >
                📋
              </button>
            </div>
          </div>
        )}

        {/* Address */}
        {contact.address && (
          <div className="contact-row">
            <span className="contact-icon">📍</span>
            <div className="contact-info">
              <span className="contact-label">Address</span>
              <span className="contact-value address">
                {getLocalizedText(contact.address)}
              </span>
            </div>
          </div>
        )}

        {/* Website */}
        {contact.website && (
          <div className="contact-row">
            <span className="contact-icon">🌐</span>
            <div className="contact-info">
              <span className="contact-label">Website</span>
              <a
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-value website-link"
              >
                {contact.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
        )}

        {/* Working Hours */}
        {contact.hours && (
          <div className="contact-row">
            <span className="contact-icon">🕐</span>
            <div className="contact-info">
              <span className="contact-label">Hours</span>
              <span className="contact-value">{getLocalizedText(contact.hours)}</span>
            </div>
          </div>
        )}

        {/* Description/Notes */}
        {contact.notes && (
          <div className="contact-notes">
            {getLocalizedText(contact.notes)}
          </div>
        )}
      </div>
    </div>
  );
};

EmergencyContactCard.propTypes = {
  contact: PropTypes.shape({
    phone: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    emergencyHotline: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    website: PropTypes.string,
    hours: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    notes: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  highlight: PropTypes.bool,
  language: PropTypes.string,
};

export default EmergencyContactCard;
