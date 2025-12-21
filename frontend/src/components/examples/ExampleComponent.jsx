import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import './ExampleComponent.css';

/**
 * Example Component demonstrating i18n usage
 * Shows various translation patterns and best practices
 */
const ExampleComponent = () => {
  // Method 1: Using useTranslation hook directly
  const { t } = useTranslation();
  
  // Method 2: Using custom LanguageContext (also uses i18next under the hood)
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="example-component">
      <h1>{t('home.welcome')}</h1>
      <p>{t('common.tagline')}</p>
      
      {/* Simple translation */}
      <button>{t('common.submit')}</button>
      
      {/* Translation with interpolation */}
      <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
      
      {/* Nested object translation */}
      <h2>{t('home.hero.title')}</h2>
      <p>{t('home.hero.subtitle')}</p>
      
      {/* Conditional rendering based on language */}
      <p>Current language: {language}</p>
      
      {/* Language switcher */}
      <div className="lang-buttons">
        <button onClick={() => changeLanguage('en')}>
          {t('language.english')}
        </button>
        <button onClick={() => changeLanguage('bn')}>
          {t('language.bengali')}
        </button>
      </div>
    </div>
  );
};

export default ExampleComponent;
