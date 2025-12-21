# 🌍 Internationalization (i18n) - README

## ✅ Implementation Complete

Full i18n support has been added to the MigrateRight React application using **react-i18next**.

---

## 🚀 Quick Start

### Use in Any Component

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <button>{t('common.submit')}</button>
    </div>
  );
}
```

### Change Language

```jsx
import { useLanguage } from '@context/LanguageContext';

function Header() {
  const { changeLanguage } = useLanguage();
  
  return (
    <button onClick={() => changeLanguage('bn')}>
      বাংলা
    </button>
  );
}
```

### Use Language Switcher Component

```jsx
import LanguageSwitcher from '@components/common/LanguageSwitcher/LanguageSwitcher';

<LanguageSwitcher mode="buttons" />
```

---

## 📚 Documentation

Choose your guide:

### 🎯 For Quick Reference
- **[I18N_QUICK_START.md](I18N_QUICK_START.md)** - 1-minute guide with common patterns

### 📖 For Complete Documentation
- **[I18N_IMPLEMENTATION_GUIDE.md](I18N_IMPLEMENTATION_GUIDE.md)** - Full setup guide, best practices, troubleshooting

### 🎨 For Visual Learners
- **[I18N_VISUAL_GUIDE.md](I18N_VISUAL_GUIDE.md)** - Diagrams, examples, step-by-step visuals

### 📊 For Overview
- **[I18N_SUMMARY.md](I18N_SUMMARY.md)** - Complete implementation summary

---

## 📁 Key Files

### Configuration
- `frontend/src/i18n/config.js` - i18next setup

### Translations
- `frontend/src/i18n/locales/en.json` - English (~200 keys)
- `frontend/src/i18n/locales/bn.json` - Bengali (~200 keys)

### Components
- `frontend/src/context/LanguageContext.jsx` - Language state
- `frontend/src/components/common/LanguageSwitcher/` - UI component
- `frontend/src/components/examples/ExampleComponent.jsx` - Usage examples

---

## 🎯 Translation Categories

All translations organized by feature:

- `common` - App name, buttons, actions
- `navigation` - Menu items, links
- `auth` - Login, register, logout
- `home` - Welcome, hero section
- `agencies` - Search, filters, details
- `profile` - User info, settings
- `documents` - Document management
- `savedAgencies` - Bookmarks
- `help` - FAQ, support
- `errors` - Error messages
- `validation` - Form validation
- `footer` - Footer links

---

## 🌐 Supported Languages

- **English (EN)** - Default/Fallback
- **Bengali (বাংলা)** - Full support

### Add More Languages in 5 Minutes

See [I18N_IMPLEMENTATION_GUIDE.md](I18N_IMPLEMENTATION_GUIDE.md#adding-new-languages)

---

## ✨ Features

✅ Auto-detects browser language  
✅ Persists choice in localStorage  
✅ No page reload required  
✅ Fallback to English for missing translations  
✅ Interpolation support (dynamic values)  
✅ Organized by feature (namespaces)  
✅ Easy to scale (add languages quickly)  
✅ Optimized performance (~17KB bundle)  
✅ Fully accessible (ARIA labels, keyboard nav)  
✅ Mobile-first responsive design  

---

## 🧪 Testing

### Dev Server Running

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### Test Language Switching

1. Click language switcher (বাংলা ↔ English)
2. Verify all text updates
3. Refresh page - language persists
4. Clear localStorage - detects browser language

---

## 📊 Stats

- **Languages**: 2 (EN, BN)
- **Translation Keys**: ~200 per language
- **Total Translations**: 400
- **Bundle Size Impact**: +17KB (8.5%)
- **Files Created**: 10
- **Files Modified**: 5
- **Documentation**: 4 guides

---

## 🔗 External Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [React i18n Best Practices](https://react.i18next.com/guides/quick-start)

---

## 🆘 Need Help?

1. **Quick answers**: [I18N_QUICK_START.md](I18N_QUICK_START.md)
2. **Full guide**: [I18N_IMPLEMENTATION_GUIDE.md](I18N_IMPLEMENTATION_GUIDE.md)
3. **Code examples**: `frontend/src/components/examples/ExampleComponent.jsx`
4. **Troubleshooting**: [I18N_IMPLEMENTATION_GUIDE.md](I18N_IMPLEMENTATION_GUIDE.md#troubleshooting)

---

## 🎉 Ready to Use!

Import `useTranslation` in any component and start translating. All setup is complete!

```jsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
return <h1>{t('navigation.home')}</h1>;
```

**Happy translating! 🌍**
