// SCHOLAR REVIEW REQUIRED
// All rules below are placeholders pending scholar confirmation.

export type NisabBasis = 'silver' | 'gold';
export type PersonalJewelryMode = 'include' | 'exclude' | 'user-choice';

export interface ZakatRules {
  nisabBasis: NisabBasis;
  nisabSilverGrams: number;
  nisabGoldGrams: number;
  rate: number;
  includedAssets: string[];
  excludedAssets: string[];
  personalJewelry: PersonalJewelryMode;
  debtsDeducted: boolean;
  hawlCalculated: boolean;
  currency: string;
  currencyLocale: string;
  madhab: string;
  thresholdComparison: 'gte' | 'gt';
  roundingDecimals: number;
}

export const ZAKAT_RULES: ZakatRules = {
  // SCHOLAR REVIEW REQUIRED
  nisabBasis: 'silver',
  // SCHOLAR REVIEW REQUIRED
  nisabSilverGrams: 612.36,
  // SCHOLAR REVIEW REQUIRED
  nisabGoldGrams: 87.48,
  // SCHOLAR REVIEW REQUIRED
  rate: 0.025,
  // SCHOLAR REVIEW REQUIRED
  includedAssets: [
    'cash-in-hand',
    'bank-balances',
    'gold-grams',
    'silver-grams',
    'business-stock',
    'receivables',
  ],
  // SCHOLAR REVIEW REQUIRED
  excludedAssets: [
    'shares',
    'property',
    'cryptocurrency',
    'retirement-funds',
    'livestock',
    'crops',
  ],
  // SCHOLAR REVIEW REQUIRED
  personalJewelry: 'user-choice',
  // SCHOLAR REVIEW REQUIRED
  debtsDeducted: true,
  // SCHOLAR REVIEW REQUIRED
  hawlCalculated: false,
  // SCHOLAR REVIEW REQUIRED
  currency: 'INR',
  // SCHOLAR REVIEW REQUIRED
  currencyLocale: 'en-IN',
  // SCHOLAR REVIEW REQUIRED
  madhab: 'hanafi',
  // SCHOLAR REVIEW REQUIRED
  thresholdComparison: 'gte',
  // SCHOLAR REVIEW REQUIRED
  roundingDecimals: 2,
};
