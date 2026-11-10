import { describe, it, expect } from 'vitest';
import { calculateZakat } from './calc';
import { ZAKAT_RULES } from './rules';
import type { ZakatInput } from './calc';

const TEST_GOLD_PRICE = 10000;
const TEST_SILVER_PRICE = 100;

function createInput(overrides: Partial<ZakatInput> = {}): ZakatInput {
  return {
    nisabBasis: 'silver',
    goldPricePerGram: TEST_GOLD_PRICE,
    silverPricePerGram: TEST_SILVER_PRICE,
    cashInHand: 0,
    bankBalances: 0,
    goldGrams: 0,
    silverGrams: 0,
    businessStock: 0,
    receivables: 0,
    personalGoldJewelryGrams: 0,
    personalSilverJewelryGrams: 0,
    includePersonalJewelry: false,
    debtsDueNow: 0,
    ...overrides,
  };
}

describe('calculateZakat', () => {
  it('case 1: silver basis, cash 20000, bank 30000 - below nisab, zakat 0', () => {
    const input = createInput({
      cashInHand: 20000,
      bankBalances: 30000,
    });
    const result = calculateZakat(input, ZAKAT_RULES);

    expect(result.totalAssets).toBe(50000);
    expect(result.netWealth).toBe(50000);
    expect(result.thresholdMet).toBe(false);
    expect(result.zakatEstimate).toBe(0);
  });

  it('case 2: silver basis, cash 50000, bank 150000, debts 20000 - net 180000, zakat 4500', () => {
    const input = createInput({
      cashInHand: 50000,
      bankBalances: 150000,
      debtsDueNow: 20000,
    });
    const result = calculateZakat(input, ZAKAT_RULES);

    expect(result.totalAssets).toBe(200000);
    expect(result.debts).toBe(20000);
    expect(result.netWealth).toBe(180000);
    expect(result.thresholdMet).toBe(true);
    expect(result.zakatEstimate).toBe(4500);
  });

  it('case 3a: silver basis, gold 10g, silver 100g - total 110000, zakat 2750', () => {
    const input = createInput({
      goldGrams: 10,
      silverGrams: 100,
    });
    const result = calculateZakat(input, ZAKAT_RULES);

    expect(result.totalAssets).toBe(110000);
    expect(result.netWealth).toBe(110000);
    expect(result.thresholdMet).toBe(true);
    expect(result.zakatEstimate).toBe(2750);
  });

  it('case 3b: gold basis, gold 10g, silver 100g - below nisab (874800), zakat 0', () => {
    const input = createInput({
      nisabBasis: 'gold',
      goldGrams: 10,
      silverGrams: 100,
    });
    const result = calculateZakat(input, ZAKAT_RULES);

    expect(result.totalAssets).toBe(110000);
    expect(result.netWealth).toBe(110000);
    expect(result.nisabUsed).toBe(874800);
    expect(result.thresholdMet).toBe(false);
    expect(result.zakatEstimate).toBe(0);
  });

  it('case 4a: silver basis, cash 100000, personal gold jewelry 50g, jewelry NOT included - total 100000, zakat 2500', () => {
    const input = createInput({
      cashInHand: 100000,
      personalGoldJewelryGrams: 50,
      includePersonalJewelry: false,
    });
    const result = calculateZakat(input, ZAKAT_RULES);

    expect(result.totalAssets).toBe(100000);
    expect(result.netWealth).toBe(100000);
    expect(result.thresholdMet).toBe(true);
    expect(result.zakatEstimate).toBe(2500);
  });

  it('case 4b: silver basis, cash 100000, personal gold jewelry 50g, jewelry included - total 600000, zakat 15000', () => {
    const input = createInput({
      cashInHand: 100000,
      personalGoldJewelryGrams: 50,
      includePersonalJewelry: true,
    });
    const result = calculateZakat(input, ZAKAT_RULES);

    expect(result.totalAssets).toBe(600000);
    expect(result.netWealth).toBe(600000);
    expect(result.thresholdMet).toBe(true);
    expect(result.zakatEstimate).toBe(15000);
  });

  it('case 5: silver basis, stock 300000, receivables 100000, cash 50000, debts 150000 - net 300000, zakat 7500', () => {
    const input = createInput({
      businessStock: 300000,
      receivables: 100000,
      cashInHand: 50000,
      debtsDueNow: 150000,
    });
    const result = calculateZakat(input, ZAKAT_RULES);

    expect(result.totalAssets).toBe(450000);
    expect(result.debts).toBe(150000);
    expect(result.netWealth).toBe(300000);
    expect(result.thresholdMet).toBe(true);
    expect(result.zakatEstimate).toBe(7500);
  });

  it('case 6: silver basis, net wealth exactly 61236 - at threshold, zakat 1530.90', () => {
    const input = createInput({
      cashInHand: 61236,
    });
    const result = calculateZakat(input, ZAKAT_RULES);

    expect(result.totalAssets).toBe(61236);
    expect(result.netWealth).toBe(61236);
    expect(result.nisabUsed).toBe(61236);
    expect(result.thresholdMet).toBe(true);
    expect(result.zakatEstimate).toBe(1530.9);
  });

  it('case 7: silver basis, cash 10000, debts 50000 - net 0, zakat 0', () => {
    const input = createInput({
      cashInHand: 10000,
      debtsDueNow: 50000,
    });
    const result = calculateZakat(input, ZAKAT_RULES);

    expect(result.totalAssets).toBe(10000);
    expect(result.debts).toBe(50000);
    expect(result.netWealth).toBe(0);
    expect(result.thresholdMet).toBe(false);
    expect(result.zakatEstimate).toBe(0);
  });

  it('case 8: negative input should throw error', () => {
    const input = createInput({
      cashInHand: -1000,
    });
    expect(() => calculateZakat(input, ZAKAT_RULES)).toThrow('Cash in hand cannot be negative');
  });

  it('case 8b: non-finite input should throw error', () => {
    const input = createInput({
      cashInHand: NaN,
    });
    expect(() => calculateZakat(input, ZAKAT_RULES)).toThrow('Cash in hand must be a finite number');
  });
});
