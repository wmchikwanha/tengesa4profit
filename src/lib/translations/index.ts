
export * from './types';
import { Language, TranslationDictionary } from './types';
import { enTranslations } from './en';
import { snTranslations } from './sn';
import { ndTranslations } from './nd';

export const translations: Record<Language, TranslationDictionary> = {
  en: enTranslations,
  sn: snTranslations,
  nd: ndTranslations
};

export const defaultLanguage: Language = 'en';
