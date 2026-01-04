import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './SearchBar.css';

/**
 * SearchBar Component
 * Debounced search input with clear functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current search value
 * @param {function} props.onChange - Callback when search value changes
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.debounceMs - Debounce delay in milliseconds (default: 300)
 */
const SearchBar = ({ 
  value = '', 
  onChange, 
  placeholder = 'Search countries...', 
  debounceMs = 300 
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Sync input value with external value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced onChange callback
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [inputValue, debounceMs, onChange, value]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClear = useCallback(() => {
    setInputValue('');
    onChange('');
  }, [onChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          className="search-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search countries"
        />
        {inputValue && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  debounceMs: PropTypes.number,
};

export default SearchBar;
