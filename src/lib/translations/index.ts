
export * from './types';
import { Language, TranslationDictionary } from './types';
import { en } from './en';
import { sn } from './sn';
import { nd } from './nd';

export const translations: Record<Language, TranslationDictionary> = {
  en: en,
  sn: sn,
  nd: nd
};

export const defaultLanguage: Language = 'en';
