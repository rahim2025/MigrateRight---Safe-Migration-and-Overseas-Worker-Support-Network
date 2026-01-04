import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './QuickAccessGrid.css';

/**
 * Quick Access Grid Component
 * 6 feature cards for quick navigation
 */
const QuickAccessGrid = ({ language = 'en' }) => {
  const translations = {
    en: {
      sectionTitle: 'Quick Access',
      cards: [
        {
          id: 'emergency',
          icon: '🚨',
          title: 'Emergency Contacts',
          description: 'Access embassy and helpline numbers',
          button: 'View Contacts',
          link: '/emergency-contacts',
          color: 'red'
        },
        {
          id: 'salary',
          icon: '💰',
          title: 'Track Your Salary',
          description: 'Monitor payments and track earnings',
          button: 'Open Tracker',
          link: '/salary-tracker',
          color: 'green'
        },
        {
          id: 'agencies',
          icon: '🔍',
          title: 'Search Agencies',
          description: 'Find trustworthy migration agencies',
          button: 'Search Now',
          link: '/agencies',
          color: 'blue'
        },
        {
          id: 'calculator',
          icon: '🧮',
          title: 'Fee Calculator',
          description: 'Compare agency fees with legal limits',
          button: 'Calculate',
          link: '/calculator',
          color: 'purple'
        },
        {
          id: 'countries',
          icon: '🌍',
          title: 'Destination Guides',
          description: 'Learn about working abroad',
          button: 'Explore Countries',
          link: '/countries',
          color: 'orange'
        },
        {
          id: 'profile',
          icon: '👤',
          title: 'My Profile',
          description: 'Update your information and documents',
          button: 'View Profile',
          link: '/profile',
          color: 'gray'
        }
      ]
    },
    bn: {
      sectionTitle: 'দ্রুত অ্যাক্সেস',
      cards: [
        {
          id: 'emergency',
          icon: '🚨',
          title: 'জরুরি যোগাযোগ',
          description: 'দূতাবাস এবং হেল্পলাইন নম্বর অ্যাক্সেস করুন',
          button: 'যোগাযোগ দেখুন',
          link: '/emergency-contacts',
          color: 'red'
        },
        {
          id: 'salary',
          icon: '💰',
          title: 'বেতন ট্র্যাক করুন',
          description: 'পেমেন্ট মনিটর এবং আয় ট্র্যাক করুন',
          button: 'ট্র্যাকার খুলুন',
          link: '/salary-tracker',
          color: 'green'
        },
        {
          id: 'agencies',
          icon: '🔍',
          title: 'এজেন্সি খুঁজুন',
          description: 'বিশ্বস্ত মাইগ্রেশন এজেন্সি খুঁজুন',
          button: 'এখনই খুঁজুন',
          link: '/agencies',
          color: 'blue'
        },
        {
          id: 'calculator',
          icon: '🧮',
          title: 'ফি ক্যালকুলেটর',
          description: 'এজেন্সি ফি বৈধ সীমার সাথে তুলনা করুন',
          button: 'গণনা করুন',
          link: '/calculator',
          color: 'purple'
        },
        {
          id: 'countries',
          icon: '🌍',
          title: 'গন্তব্য গাইড',
          description: 'বিদেশে কাজ সম্পর্কে জানুন',
          button: 'দেশ অন্বেষণ করুন',
          link: '/countries',
          color: 'orange'
        },
        {
          id: 'profile',
          icon: '👤',
          title: 'আমার প্রোফাইল',
          description: 'আপনার তথ্য এবং ডকুমেন্ট আপডেট করুন',
          button: 'প্রোফাইল দেখুন',
          link: '/profile',
          color: 'gray'
        }
      ]
    }
  };

  const txt = translations[language] || translations.en;

  return (
    <div className="quick-access-section dashboard-section">
      <div className="section-header">
        <h2 className="section-title">{txt.sectionTitle}</h2>
      </div>

      <div className="quick-access-grid">
        {txt.cards.map(card => (
          <Link 
            key={card.id} 
            to={card.link} 
            className={`quick-access-card quick-access-card--${card.color}`}
          >
            <div className="card-icon">{card.icon}</div>
            <h3 className="card-title">{card.title}</h3>
            <p className="card-description">{card.description}</p>
            <span className="card-button">{card.button}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

QuickAccessGrid.propTypes = {
  language: PropTypes.string
};

export default QuickAccessGrid;
