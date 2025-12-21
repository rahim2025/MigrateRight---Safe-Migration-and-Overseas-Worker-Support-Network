import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

/**
 * Language Provider Component
 * Manages language/locale state for internationalization using i18next
 * 
 * Features:
 * - Integration with react-i18next for robust i18n
 * - Automatic language persistence in localStorage
 * - RTL support (for future languages like Arabic)
 * - Namespace support for organized translations
 */
export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation();

  /**
   * Change the current language
   * @param {string} lang - Language code (e.g., 'en', 'bn')
   */
  const changeLanguage = async (lang) => {
    if (['en', 'bn'].includes(lang)) {
      await i18n.changeLanguage(lang);
      // Update HTML lang attribute for accessibility
      document.documentElement.lang = lang;
      // Update dir attribute for RTL support (future-proof)
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  /**
   * Get available languages
   * @returns {Array} Array of language objects
   */
  const getLanguages = () => [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  ];

  const value = {
    language: i18n.language, // Current language code
    changeLanguage,
    t, // Translation function
    i18n, // Full i18next instance for advanced usage
    getLanguages,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to use language context
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageContext;
