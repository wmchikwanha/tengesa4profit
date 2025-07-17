import { TranslationDictionary } from './translations/types/index';
import { ProductCategory, PRODUCT_CATEGORIES } from './marketplace-types';

export const getCategoryTranslation = (category: ProductCategory, t: TranslationDictionary): string => {
  switch (category) {
    case 'vegetables':
      return t.vegetables;
    case 'fruits':
      return t.fruits;
    case 'grains':
      return t.grains;
    case 'dairy':
      return t.dairy;
    case 'meat':
      return t.meat;
    case 'beverages':
      return t.beverages;
    case 'snacks':
      return t.snacks;
    case 'household':
      return t.household;
    case 'clothing':
      return t.clothing;
    case 'electronics':
      return t.electronics;
    case 'tools':
      return t.tools;
    case 'books':
      return t.books;
    case 'livestock':
      return t.livestock;
    case 'produce':
      return t.produce;
    case 'other':
      return t.other;
    default:
      return PRODUCT_CATEGORIES[category] || category;
  }
};

export const getAllCategoryTranslations = (t: TranslationDictionary): Record<ProductCategory, string> => {
  return {
    vegetables: t.vegetables,
    fruits: t.fruits,
    grains: t.grains,
    dairy: t.dairy,
    meat: t.meat,
    beverages: t.beverages,
    snacks: t.snacks,
    household: t.household,
    clothing: t.clothing,
    electronics: t.electronics,
    tools: t.tools,
    books: t.books,
    livestock: t.livestock,
    produce: t.produce,
    other: t.other,
  };
};