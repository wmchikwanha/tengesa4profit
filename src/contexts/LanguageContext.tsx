
import * as React from 'react';
import { Language, TranslationDictionary, translations, defaultLanguage } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  t: TranslationDictionary;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = React.createContext<LanguageContextType>({
  language: defaultLanguage,
  t: translations[defaultLanguage],
  changeLanguage: () => {},
});

export const useLanguage = () => React.useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with default language first, then update from localStorage in useEffect
  const [language, setLanguage] = React.useState<Language>(defaultLanguage);

  React.useEffect(() => {
    // Load language preference from localStorage after component mounts
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sn' || savedLanguage === 'nd')) {
      setLanguage(savedLanguage);
    }
  }, []);

  React.useEffect(() => {
    // Save the language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const value = {
    language,
    t: translations[language],
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
