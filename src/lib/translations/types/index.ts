
import { CoreTranslations } from './core';
import { ProductTranslations } from './product';
import { SalesTranslations } from './sales';
import { FormTranslations } from './forms';
import { AuthTranslations } from './auth';
import { SubscriptionTranslations } from './subscription';
import { PaymentTranslations } from './payment';
import { MarketplaceTranslations } from './marketplace';
import { UITranslations } from './ui';

export type Language = 'en' | 'sn' | 'nd';

export interface TranslationDictionary extends 
  CoreTranslations,
  ProductTranslations,
  SalesTranslations,
  FormTranslations,
  AuthTranslations,
  SubscriptionTranslations,
  PaymentTranslations,
  MarketplaceTranslations,
  UITranslations {}

// Re-export all individual interfaces for flexibility
export type {
  CoreTranslations,
  ProductTranslations,
  SalesTranslations,
  FormTranslations,
  AuthTranslations,
  SubscriptionTranslations,
  PaymentTranslations,
  MarketplaceTranslations,
  UITranslations
};
