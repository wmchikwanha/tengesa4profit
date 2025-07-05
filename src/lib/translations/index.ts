
export * from './types/index';
import { Language, TranslationDictionary } from './types/index';
import { en } from './en';
import { sn } from './sn';
import { nd } from './nd';

export const translations: Record<Language, TranslationDictionary> = {
  en: en,
  sn: sn,
  nd: nd
};

export const defaultLanguage: Language = 'en';
