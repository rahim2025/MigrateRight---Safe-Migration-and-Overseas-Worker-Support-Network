import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import bnTranslations from './locales/bn.json';

/**
 * i18next Configuration
 * 
 * Features:
 * - Automatic language detection from browser/localStorage
 * - Fallback to English if translation missing
 * - Dynamic language switching
 * - Namespace support for organizing translations
 * - Interpolation for dynamic values
 */

const resources = {
  en: {
    translation: enTranslations,
  },
  bn: {
    translation: bnTranslations,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    
    // Default language
    fallbackLng: 'en',
    
    // Default namespace
    defaultNS: 'translation',
    
    // Debugging (disable in production)
    debug: false,
    
    // Language detection options
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator'],
      // Keys to look for in localStorage
      lookupLocalStorage: 'language',
      // Cache user language
      caches: ['localStorage'],
    },
    
    // Interpolation options
    interpolation: {
      // React already escapes values
      escapeValue: false,
    },
    
    // React-specific options
    react: {
      // Wait for translations to load before rendering
      useSuspense: false,
    },
  });

export default i18n;
