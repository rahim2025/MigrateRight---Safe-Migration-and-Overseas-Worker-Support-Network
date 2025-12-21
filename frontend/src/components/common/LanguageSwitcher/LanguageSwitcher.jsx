import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import './LanguageSwitcher.css';

/**
 * Language Switcher Component
 * 
 * Allows users to switch between available languages.
 * Supports multiple display modes: buttons, dropdown, or toggle.
 * 
 * @param {Object} props
 * @param {string} props.mode - Display mode: 'buttons' | 'dropdown' | 'toggle' (default: 'buttons')
 * @param {boolean} props.showFlags - Show flag icons (default: false)
 * @param {string} props.className - Additional CSS classes
 */
const LanguageSwitcher = ({ mode = 'buttons', showFlags = false, className = '' }) => {
  const { language, changeLanguage, getLanguages } = useLanguage();
  const languages = getLanguages();

  const handleLanguageChange = async (langCode) => {
    await changeLanguage(langCode);
  };

  // Button mode - separate button for each language
  if (mode === 'buttons') {
    return (
      <div className={`language-switcher language-switcher--buttons ${className}`} role="group" aria-label="Language Switcher">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`lang-btn ${language === lang.code ? 'lang-btn--active' : ''}`}
            aria-label={`Switch to ${lang.name}`}
            aria-pressed={language === lang.code}
            type="button"
          >
            {showFlags && <span className={`flag flag--${lang.code}`} aria-hidden="true" />}
            <span className="lang-btn__text">{lang.nativeName}</span>
          </button>
        ))}
      </div>
    );
  }

  // Dropdown mode - select element
  if (mode === 'dropdown') {
    return (
      <div className={`language-switcher language-switcher--dropdown ${className}`}>
        <label htmlFor="language-select" className="sr-only">
          Select Language
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="lang-select"
          aria-label="Select Language"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Toggle mode - single button that cycles through languages
  if (mode === 'toggle') {
    const currentIndex = languages.findIndex((lang) => lang.code === language);
    const nextLanguage = languages[(currentIndex + 1) % languages.length];

    return (
      <div className={`language-switcher language-switcher--toggle ${className}`}>
        <button
          onClick={() => handleLanguageChange(nextLanguage.code)}
          className="lang-toggle"
          aria-label={`Switch to ${nextLanguage.name}`}
          type="button"
        >
          <span className="lang-toggle__current">{languages[currentIndex].nativeName}</span>
          <span className="lang-toggle__arrow" aria-hidden="true">
            ⇄
          </span>
          <span className="lang-toggle__next">{nextLanguage.nativeName}</span>
        </button>
      </div>
    );
  }

  return null;
};

export default LanguageSwitcher;
