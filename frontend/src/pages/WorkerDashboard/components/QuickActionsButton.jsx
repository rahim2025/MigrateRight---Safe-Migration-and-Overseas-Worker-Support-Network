import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './QuickActionsButton.css';

/**
 * Quick Actions Floating Button
 * Floating action button with quick action menu
 */
const QuickActionsButton = ({ language = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const translations = {
    en: {
      quickActions: 'Quick Actions',
      emergency: 'Emergency Helpline',
      complaint: 'File Complaint',
      calculate: 'Calculate Fees',
      findAgency: 'Find Agency'
    },
    bn: {
      quickActions: 'দ্রুত কার্য',
      emergency: 'জরুরি হেল্পলাইন',
      complaint: 'অভিযোগ দাখিল',
      calculate: 'ফি গণনা',
      findAgency: 'এজেন্সি খুঁজুন'
    }
  };

  const txt = translations[language] || translations.en;

  const actions = [
    {
      id: 'emergency',
      icon: '🚨',
      label: txt.emergency,
      href: 'tel:+8801234567890',
      isExternal: true,
      color: 'red'
    },
    {
      id: 'complaint',
      icon: '📝',
      label: txt.complaint,
      to: '/complaints/new',
      color: 'orange'
    },
    {
      id: 'calculate',
      icon: '🧮',
      label: txt.calculate,
      to: '/calculator',
      color: 'purple'
    },
    {
      id: 'findAgency',
      icon: '🔍',
      label: txt.findAgency,
      to: '/agencies',
      color: 'blue'
    }
  ];

  return (
    <div className={`quick-actions-wrapper ${isOpen ? 'open' : ''}`}>
      {/* Action Menu */}
      <div className="quick-actions-menu">
        {actions.map((action, index) => (
          action.isExternal ? (
            <a
              key={action.id}
              href={action.href}
              className={`quick-action-item quick-action--${action.color}`}
              style={{ transitionDelay: isOpen ? `${index * 50}ms` : '0ms' }}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </a>
          ) : (
            <Link
              key={action.id}
              to={action.to}
              className={`quick-action-item quick-action--${action.color}`}
              style={{ transitionDelay: isOpen ? `${index * 50}ms` : '0ms' }}
              onClick={() => setIsOpen(false)}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </Link>
          )
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        className={`quick-actions-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={txt.quickActions}
        aria-expanded={isOpen}
      >
        <span className="fab-icon">{isOpen ? '✕' : '⚡'}</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="quick-actions-backdrop" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

QuickActionsButton.propTypes = {
  language: PropTypes.string
};

export default QuickActionsButton;
