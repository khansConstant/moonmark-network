import type { ZakatRules, NisabBasis } from './rules';

export interface ZakatInput {
  nisabBasis: NisabBasis;
  goldPricePerGram: number;
  silverPricePerGram: number;
  cashInHand: number;
  bankBalances: number;
  goldGrams: number;
  silverGrams: number;
  businessStock: number;
  receivables: number;
  personalGoldJewelryGrams: number;
  personalSilverJewelryGrams: number;
  includePersonalJewelry: boolean;
  debtsDueNow: number;
}

export interface AssetBreakdown {
  name: string;
  value: number;
  included: boolean;
}

export interface ZakatResult {
  assets: AssetBreakdown[];
  totalAssets: number;
  debts: number;
  netWealth: number;
  nisabSilverValue: number;
  nisabGoldValue: number;
  nisabUsed: number;
  nisabBasis: NisabBasis;
  thresholdMet: boolean;
  zakatEstimate: number;
  assumptions: string[];
}

function validateNumber(value: number, fieldName: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number`);
  }
  if (value < 0) {
    throw new Error(`${fieldName} cannot be negative`);
  }
}

function parseInputValue(value: number | undefined | null): number {
  if (value === undefined || value === null || value === 0) {
    return 0;
  }
  return value;
}

export function calculateZakat(input: ZakatInput, rules: ZakatRules): ZakatResult {
  // Validate all numeric inputs
  const validatedInput: ZakatInput = {
    nisabBasis: input.nisabBasis,
    goldPricePerGram: parseInputValue(input.goldPricePerGram),
    silverPricePerGram: parseInputValue(input.silverPricePerGram),
    cashInHand: parseInputValue(input.cashInHand),
    bankBalances: parseInputValue(input.bankBalances),
    goldGrams: parseInputValue(input.goldGrams),
    silverGrams: parseInputValue(input.silverGrams),
    businessStock: parseInputValue(input.businessStock),
    receivables: parseInputValue(input.receivables),
    personalGoldJewelryGrams: parseInputValue(input.personalGoldJewelryGrams),
    personalSilverJewelryGrams: parseInputValue(input.personalSilverJewelryGrams),
    includePersonalJewelry: input.includePersonalJewelry,
    debtsDueNow: parseInputValue(input.debtsDueNow),
  };

  // Validate each field
  validateNumber(validatedInput.goldPricePerGram, 'Gold price per gram');
  validateNumber(validatedInput.silverPricePerGram, 'Silver price per gram');
  validateNumber(validatedInput.cashInHand, 'Cash in hand');
  validateNumber(validatedInput.bankBalances, 'Bank balances');
  validateNumber(validatedInput.goldGrams, 'Gold grams');
  validateNumber(validatedInput.silverGrams, 'Silver grams');
  validateNumber(validatedInput.businessStock, 'Business stock');
  validateNumber(validatedInput.receivables, 'Receivables');
  validateNumber(validatedInput.personalGoldJewelryGrams, 'Personal gold jewelry grams');
  validateNumber(validatedInput.personalSilverJewelryGrams, 'Personal silver jewelry grams');
  validateNumber(validatedInput.debtsDueNow, 'Debts due now');

  // Calculate asset values
  const goldValue = validatedInput.goldGrams * validatedInput.goldPricePerGram;
  const silverValue = validatedInput.silverGrams * validatedInput.silverPricePerGram;
  const personalGoldJewelryValue = validatedInput.includePersonalJewelry
    ? validatedInput.personalGoldJewelryGrams * validatedInput.goldPricePerGram
    : 0;
  const personalSilverJewelryValue = validatedInput.includePersonalJewelry
    ? validatedInput.personalSilverJewelryGrams * validatedInput.silverPricePerGram
    : 0;

  const assets: AssetBreakdown[] = [
    { name: 'Cash in hand', value: validatedInput.cashInHand, included: true },
    { name: 'Bank balances', value: validatedInput.bankBalances, included: true },
    { name: 'Gold', value: goldValue, included: true },
    { name: 'Silver', value: silverValue, included: true },
    { name: 'Business stock', value: validatedInput.businessStock, included: true },
    { name: 'Receivables', value: validatedInput.receivables, included: true },
  ];

  if (validatedInput.includePersonalJewelry) {
    assets.push(
      { name: 'Personal-use gold jewelry', value: personalGoldJewelryValue, included: true },
      { name: 'Personal-use silver jewelry', value: personalSilverJewelryValue, included: true }
    );
  } else {
    assets.push(
      { name: 'Personal-use gold jewelry', value: personalGoldJewelryValue, included: false },
      { name: 'Personal-use silver jewelry', value: personalSilverJewelryValue, included: false }
    );
  }

  const totalAssets = assets
    .filter((a) => a.included)
    .reduce((sum, a) => sum + a.value, 0);

  const debts = validatedInput.debtsDueNow;
  const netWealth = Math.max(0, totalAssets - debts);

  // Calculate nisab values
  const nisabSilverValue = rules.nisabSilverGrams * validatedInput.silverPricePerGram;
  const nisabGoldValue = rules.nisabGoldGrams * validatedInput.goldPricePerGram;
  const nisabUsed = validatedInput.nisabBasis === 'silver' ? nisabSilverValue : nisabGoldValue;

  // Check threshold
  const thresholdMet = rules.thresholdComparison === 'gte'
    ? netWealth >= nisabUsed
    : netWealth > nisabUsed;

  // Calculate zakat
  const zakatEstimate = thresholdMet
    ? Math.round(netWealth * rules.rate * Math.pow(10, rules.roundingDecimals)) / Math.pow(10, rules.roundingDecimals)
    : 0;

  // Build assumptions list
  const assumptions: string[] = [
    'Hawl (one lunar year) is not calculated; this assumes wealth has been held for a full lunar year.',
    'Personal-use jewelry is excluded unless explicitly included.',
    'Debts due now are deducted from total wealth.',
    'Net wealth is floored at zero (cannot be negative).',
    'Zakat is estimated only when net wealth meets or exceeds the nisab.',
    'Rounding is applied once at the end to 2 decimal places.',
  ];

  if (validatedInput.includePersonalJewelry) {
    assumptions.push('Personal-use jewelry is included in this estimate.');
  }

  return {
    assets,
    totalAssets,
    debts,
    netWealth,
    nisabSilverValue,
    nisabGoldValue,
    nisabUsed,
    nisabBasis: validatedInput.nisabBasis,
    thresholdMet,
    zakatEstimate,
    assumptions,
  };
}
