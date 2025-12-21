# 🌍 Internationalization (i18n) Guide

## Overview

This guide documents the internationalization implementation for the MigrateRight React application using **react-i18next**, the industry-standard i18n library for React.

### Features

✅ **Multi-language Support**: English (EN) and Bengali (বাংলা)  
✅ **Auto-detection**: Detects browser/system language preference  
✅ **Persistence**: Saves language choice in localStorage  
✅ **Dynamic Switching**: Change language without page reload  
✅ **Scalable**: Easy to add new languages  
✅ **Type-safe**: Full TypeScript support (optional)  
✅ **Performance**: Lazy-loaded translations, minimal bundle impact  

---

## 📦 Installation

Packages are already installed:

```json
{
  "dependencies": {
    "i18next": "^23.7.0",
    "react-i18next": "^13.5.0",
    "i18next-browser-languagedetector": "^7.2.0"
  }
}
```

---

## 🏗️ Project Structure

```
frontend/src/
├── i18n/
│   ├── config.js              # i18next configuration
│   └── locales/
│       ├── en.json            # English translations
│       └── bn.json            # Bengali translations
├── context/
│   └── LanguageContext.jsx    # Language context provider
└── components/
    ├── common/
    │   └── LanguageSwitcher/  # Language switcher component
    └── examples/
        └── ExampleComponent.jsx # Usage examples
```

---

## ⚙️ Configuration

### 1. i18n Config ([frontend/src/i18n/config.js](frontend/src/i18n/config.js))

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      bn: { translation: bnTranslations },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });
```

### 2. Initialize in App ([frontend/src/main.jsx](frontend/src/main.jsx))

```javascript
import './i18n/config'; // Import BEFORE App component
import App from './App';
```

---

## 📝 Translation Files

### English ([frontend/src/i18n/locales/en.json](frontend/src/i18n/locales/en.json))

```json
{
  "common": {
    "appName": "MigrateRight",
    "loading": "Loading...",
    "submit": "Submit"
  },
  "navigation": {
    "home": "Home",
    "agencies": "Agencies",
    "profile": "My Profile"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "register": "Register"
  }
}
```

### Bengali ([frontend/src/i18n/locales/bn.json](frontend/src/i18n/locales/bn.json))

```json
{
  "common": {
    "appName": "মাইগ্রেটরাইট",
    "loading": "লোড হচ্ছে...",
    "submit": "জমা দিন"
  },
  "navigation": {
    "home": "হোম",
    "agencies": "এজেন্সি",
    "profile": "আমার প্রোফাইল"
  },
  "auth": {
    "login": "লগইন",
    "logout": "লগআউট",
    "register": "নিবন্ধন"
  }
}
```

---

## 🎯 Usage

### Method 1: Using `useTranslation` Hook (Recommended)

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <button>{t('auth.login')}</button>
    </div>
  );
}
```

### Method 2: Using Custom LanguageContext

```jsx
import { useLanguage } from '@context/LanguageContext';

function MyComponent() {
  const { t, language, changeLanguage } = useLanguage();
  
  return (
    <div>
      <p>{t('navigation.home')}</p>
      <button onClick={() => changeLanguage('bn')}>
        Switch to Bengali
      </button>
    </div>
  );
}
```

### Method 3: Translation with Interpolation

```jsx
// Translation file
{
  "welcome": "Welcome, {{name}}!",
  "copyright": "© {{year}} MigrateRight"
}

// Component
const { t } = useTranslation();

<p>{t('welcome', { name: user.name })}</p>
<p>{t('copyright', { year: new Date().getFullYear() })}</p>
```

### Method 4: Nested Object Access

```jsx
// Translation file
{
  "home": {
    "hero": {
      "title": "Your Trusted Partner",
      "subtitle": "Find verified agencies"
    }
  }
}

// Component
<h1>{t('home.hero.title')}</h1>
<p>{t('home.hero.subtitle')}</p>
```

---

## 🔄 Language Switcher Component

### Basic Usage

```jsx
import LanguageSwitcher from '@components/common/LanguageSwitcher/LanguageSwitcher';

function Header() {
  return (
    <header>
      <LanguageSwitcher mode="buttons" />
    </header>
  );
}
```

### Available Modes

#### 1. Buttons Mode (Default)

```jsx
<LanguageSwitcher mode="buttons" />
```
Renders separate buttons for each language.

#### 2. Dropdown Mode

```jsx
<LanguageSwitcher mode="dropdown" />
```
Renders a `<select>` dropdown.

#### 3. Toggle Mode

```jsx
<LanguageSwitcher mode="toggle" />
```
Renders a single button that cycles through languages.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'buttons' \| 'dropdown' \| 'toggle'` | `'buttons'` | Display mode |
| `showFlags` | `boolean` | `false` | Show flag icons |
| `className` | `string` | `''` | Additional CSS classes |

---

## 🎨 Styling

The LanguageSwitcher component includes complete CSS with:
- Mobile-first responsive design
- Dark mode support
- High contrast mode support
- Reduced motion support
- Accessibility features (ARIA labels, focus states)

---

## 📱 Mobile Integration

The language switcher is already integrated in:

- **MobileNav** ([MobileNav.jsx](frontend/src/components/layout/MobileNav/MobileNav.jsx)): Top right corner
- Can be added to **BottomNav** if needed
- **Desktop Navbar**: Ready to integrate

---

## 🌐 Adding New Languages

### Step 1: Create Translation File

```bash
# Create new translation file
frontend/src/i18n/locales/ar.json  # Arabic example
```

### Step 2: Add Translations

```json
{
  "common": {
    "appName": "مايجريت رايت",
    "loading": "جار التحميل...",
    "submit": "إرسال"
  }
}
```

### Step 3: Import in Config

```javascript
// frontend/src/i18n/config.js
import arTranslations from './locales/ar.json';

const resources = {
  en: { translation: enTranslations },
  bn: { translation: bnTranslations },
  ar: { translation: arTranslations }, // Add new language
};
```

### Step 4: Update LanguageContext

```javascript
// frontend/src/context/LanguageContext.jsx
const getLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' }, // Add new language
];
```

### Step 5: Update Validation (if needed)

```javascript
const changeLanguage = async (lang) => {
  if (['en', 'bn', 'ar'].includes(lang)) { // Add to validation
    await i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; // RTL support
  }
};
```

---

## 🔍 Best Practices

### 1. **Organize Translations by Feature**

```json
{
  "navigation": { ... },
  "auth": { ... },
  "agencies": { ... },
  "profile": { ... }
}
```

### 2. **Use Semantic Keys**

❌ Bad: `"text1": "Click here"`  
✅ Good: `"cta.findAgencies": "Find Agencies"`

### 3. **Keep Keys Consistent**

Use the same structure across all language files:

```json
// en.json
{ "auth": { "login": "Login" } }

// bn.json
{ "auth": { "login": "লগইন" } }
```

### 4. **Avoid Hardcoded Text**

❌ Bad:
```jsx
<button>Login</button>
```

✅ Good:
```jsx
<button>{t('auth.login')}</button>
```

### 5. **Use Interpolation for Dynamic Content**

```json
{
  "greeting": "Hello, {{name}}!",
  "itemCount": "You have {{count}} items"
}
```

### 6. **Test with Long Translations**

Bengali text can be 2-3x longer than English. Ensure UI doesn't break:

```css
.button {
  min-width: 100px; /* Prevent text overflow */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

## 🧪 Testing

### Manual Testing

1. **Switch Languages**: Use language switcher and verify all text updates
2. **Browser Detection**: Clear localStorage and refresh - should detect browser language
3. **Persistence**: Refresh page - language choice should persist
4. **Missing Translations**: Remove a key from one language file - should fallback to English

### Automated Testing (Optional)

```javascript
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

test('renders translated text', () => {
  render(
    <I18nextProvider i18n={i18n}>
      <MyComponent />
    </I18nextProvider>
  );
  
  expect(screen.getByText('Login')).toBeInTheDocument();
});
```

---

## 🐛 Troubleshooting

### Issue: Translations not loading

**Solution**: Ensure i18n config is imported before App component in `main.jsx`:

```javascript
import './i18n/config'; // MUST be before App
import App from './App';
```

### Issue: `t is not a function`

**Solution**: Ensure component is wrapped in LanguageProvider:

```jsx
<LanguageProvider>
  <App />
</LanguageProvider>
```

### Issue: Language doesn't persist

**Solution**: Check localStorage is enabled and not blocked:

```javascript
// Test in browser console
localStorage.setItem('test', '1');
localStorage.getItem('test'); // Should return '1'
```

### Issue: Bengali text appears as boxes/squares

**Solution**: Ensure proper font with Bengali support:

```css
body {
  font-family: 'Noto Sans Bengali', 'Roboto', sans-serif;
}
```

---

## 📊 Performance

### Bundle Size Impact

- **i18next**: ~7KB (gzipped)
- **react-i18next**: ~3KB (gzipped)
- **i18next-browser-languagedetector**: ~2KB (gzipped)
- **Translation files**: ~5KB total (gzipped)
- **Total**: ~17KB (8.5% of 200KB budget)

### Optimization Tips

1. **Code Splitting** (for larger apps):
```javascript
i18n.init({
  backend: {
    loadPath: '/locales/{{lng}}.json',
  },
});
```

2. **Lazy Loading**: Only load current language
3. **Namespace Splitting**: Split translations by feature

---

## 🔗 Resources

- **react-i18next Docs**: https://react.i18next.com/
- **i18next Docs**: https://www.i18next.com/
- **Translation Files**: [frontend/src/i18n/locales/](frontend/src/i18n/locales/)
- **Language Context**: [LanguageContext.jsx](frontend/src/context/LanguageContext.jsx)
- **Example Component**: [ExampleComponent.jsx](frontend/src/components/examples/ExampleComponent.jsx)

---

## ✅ Quick Reference

### Import & Use

```jsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();
  
  return (
    <>
      {t('key')}                           {/* Simple */}
      {t('key', { var: value })}           {/* Interpolation */}
      {t('nested.key.here')}               {/* Nested */}
      <button onClick={() => i18n.changeLanguage('bn')}>
        Switch
      </button>
    </>
  );
}
```

### Change Language

```javascript
// Method 1: Using useLanguage hook
const { changeLanguage } = useLanguage();
changeLanguage('bn');

// Method 2: Direct i18next
i18n.changeLanguage('bn');
```

### Get Current Language

```javascript
const { language } = useLanguage();
// or
const { i18n } = useTranslation();
console.log(i18n.language);
```

---

**Need help?** Check [ExampleComponent.jsx](frontend/src/components/examples/ExampleComponent.jsx) for more usage patterns!
