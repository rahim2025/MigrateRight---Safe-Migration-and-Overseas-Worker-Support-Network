# 🌍 i18n Quick Start

## 1-Minute Setup

Already installed and configured! Just use it:

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('navigation.home')}</h1>;
}
```

## Available Translations

### English & Bengali (বাংলা)

```jsx
t('common.appName')           // MigrateRight / মাইগ্রেটরাইট
t('common.loading')           // Loading... / লোড হচ্ছে...
t('navigation.home')          // Home / হোম
t('navigation.agencies')      // Agencies / এজেন্সি
t('auth.login')               // Login / লগইন
t('auth.register')            // Register / নিবন্ধন
```

## Change Language

```jsx
import { useLanguage } from '@context/LanguageContext';

function LanguageButton() {
  const { changeLanguage } = useLanguage();
  
  return (
    <button onClick={() => changeLanguage('bn')}>
      বাংলা
    </button>
  );
}
```

## Or Use the Component

```jsx
import LanguageSwitcher from '@components/common/LanguageSwitcher/LanguageSwitcher';

<LanguageSwitcher mode="buttons" />
```

## Files

- 📁 Translations: `frontend/src/i18n/locales/`
- ⚙️ Config: `frontend/src/i18n/config.js`
- 📖 Full Guide: `docs/I18N_IMPLEMENTATION_GUIDE.md`

## Add Translation

1. Open `frontend/src/i18n/locales/en.json`
2. Add key: `"myKey": "My Text"`
3. Open `frontend/src/i18n/locales/bn.json`
4. Add same key: `"myKey": "আমার টেক্সট"`
5. Use: `{t('myKey')}`

Done! 🎉
