import PropTypes from 'prop-types';
import './TabNavigation.css';

/**
 * TabNavigation Component
 * Reusable tab navigation with horizontal scroll on mobile
 * 
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab objects { id, label, icon? }
 * @param {string} props.activeTab - Currently active tab id
 * @param {function} props.onTabChange - Callback when tab changes
 * @param {boolean} props.sticky - Whether tabs should be sticky on scroll
 */
const TabNavigation = ({ tabs, activeTab, onTabChange, sticky = false }) => {
  const handleKeyDown = (e, tabId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange(tabId);
    }
    
    // Arrow key navigation
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
      onTabChange(tabs[currentIndex + 1].id);
    }
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      onTabChange(tabs[currentIndex - 1].id);
    }
  };

  return (
    <nav 
      className={`tab-navigation ${sticky ? 'tab-navigation--sticky' : ''}`}
      role="tablist"
      aria-label="Content sections"
    >
      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`tab-button ${activeTab === tab.id ? 'tab-button--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  sticky: PropTypes.bool,
};

export default TabNavigation;
