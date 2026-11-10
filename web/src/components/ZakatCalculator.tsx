import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ZAKAT_RULES } from '@/lib/zakat/rules';
import { calculateZakat, type ZakatInput } from '@/lib/zakat/calc';
import type { NisabBasis } from '@/lib/zakat/rules';

interface FormState {
  nisabBasis: NisabBasis;
  goldPricePerGram: string;
  silverPricePerGram: string;
  cashInHand: string;
  bankBalances: string;
  goldGrams: string;
  silverGrams: string;
  businessStock: string;
  receivables: string;
  personalGoldJewelryGrams: string;
  personalSilverJewelryGrams: string;
  includePersonalJewelry: boolean;
  debtsDueNow: string;
}

interface FieldError {
  field: keyof FormState;
  message: string;
}

const initialState: FormState = {
  nisabBasis: 'silver',
  goldPricePerGram: '',
  silverPricePerGram: '',
  cashInHand: '',
  bankBalances: '',
  goldGrams: '',
  silverGrams: '',
  businessStock: '',
  receivables: '',
  personalGoldJewelryGrams: '',
  personalSilverJewelryGrams: '',
  includePersonalJewelry: false,
  debtsDueNow: '',
};

function parseNumber(value: string): number | null {
  if (value === '') return null;
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || !isFinite(num)) return null;
  if (num < 0) return null;
  return num;
}

function formatCurrency(value: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ZakatCalculator() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldError[]>([]);

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    setErrors((prev) => prev.filter((e) => e.field !== field));
  };

  const validateAndCalculate = useMemo(() => {
    const newErrors: FieldError[] = [];
    const numericFields: (keyof FormState)[] = [
      'goldPricePerGram',
      'silverPricePerGram',
      'cashInHand',
      'bankBalances',
      'goldGrams',
      'silverGrams',
      'businessStock',
      'receivables',
      'personalGoldJewelryGrams',
      'personalSilverJewelryGrams',
      'debtsDueNow',
    ];

    for (const field of numericFields) {
      const value = form[field] as string;
      if (value !== '') {
        const parsed = parseNumber(value);
        if (parsed === null) {
          newErrors.push({ field, message: 'Please enter a valid non-negative number' });
        }
      }
    }

    setErrors(newErrors);

    if (newErrors.length > 0) {
      return null;
    }

    const input: ZakatInput = {
      nisabBasis: form.nisabBasis,
      goldPricePerGram: parseNumber(form.goldPricePerGram) ?? 0,
      silverPricePerGram: parseNumber(form.silverPricePerGram) ?? 0,
      cashInHand: parseNumber(form.cashInHand) ?? 0,
      bankBalances: parseNumber(form.bankBalances) ?? 0,
      goldGrams: parseNumber(form.goldGrams) ?? 0,
      silverGrams: parseNumber(form.silverGrams) ?? 0,
      businessStock: parseNumber(form.businessStock) ?? 0,
      receivables: parseNumber(form.receivables) ?? 0,
      personalGoldJewelryGrams: parseNumber(form.personalGoldJewelryGrams) ?? 0,
      personalSilverJewelryGrams: parseNumber(form.personalSilverJewelryGrams) ?? 0,
      includePersonalJewelry: form.includePersonalJewelry,
      debtsDueNow: parseNumber(form.debtsDueNow) ?? 0,
    };

    try {
      return calculateZakat(input, ZAKAT_RULES);
    } catch {
      return null;
    }
  }, [form]);

  const resetForm = () => {
    setForm(initialState);
    setErrors([]);
  };

  const getError = (field: keyof FormState) => {
    return errors.find((e) => e.field === field)?.message;
  };

  const hasError = (field: keyof FormState) => {
    return errors.some((e) => e.field === field);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      {/* Form Section */}
      <div className="space-y-8">
        {/* Nisab Basis */}
        <section>
          <h2 className="font-heading text-lg font-semibold mb-4">Nisab basis</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="nisabBasis"
                value="silver"
                checked={form.nisabBasis === 'silver'}
                onChange={() => updateField('nisabBasis', 'silver')}
                className="h-4 w-4"
              />
              <span className="text-sm">Silver</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="nisabBasis"
                value="gold"
                checked={form.nisabBasis === 'gold'}
                onChange={() => updateField('nisabBasis', 'gold')}
                className="h-4 w-4"
              />
              <span className="text-sm">Gold</span>
            </label>
          </div>
        </section>

        <Separator />

        {/* Prices */}
        <section>
          <h2 className="font-heading text-lg font-semibold mb-4">Prices per gram</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="goldPricePerGram" className="block text-sm font-medium mb-1">
                Gold price per gram (INR)
              </label>
              <Input
                id="goldPricePerGram"
                type="text"
                inputMode="decimal"
                value={form.goldPricePerGram}
                onChange={(e) => updateField('goldPricePerGram', e.target.value)}
                placeholder="e.g., 7,500"
                aria-invalid={hasError('goldPricePerGram')}
                aria-describedby={hasError('goldPricePerGram') ? 'goldPricePerGram-error' : undefined}
                className="h-11"
              />
              {hasError('goldPricePerGram') && (
                <p id="goldPricePerGram-error" className="mt-1 text-sm text-destructive">
                  {getError('goldPricePerGram')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="silverPricePerGram" className="block text-sm font-medium mb-1">
                Silver price per gram (INR)
              </label>
              <Input
                id="silverPricePerGram"
                type="text"
                inputMode="decimal"
                value={form.silverPricePerGram}
                onChange={(e) => updateField('silverPricePerGram', e.target.value)}
                placeholder="e.g., 95"
                aria-invalid={hasError('silverPricePerGram')}
                aria-describedby={hasError('silverPricePerGram') ? 'silverPricePerGram-error' : undefined}
                className="h-11"
              />
              {hasError('silverPricePerGram') && (
                <p id="silverPricePerGram-error" className="mt-1 text-sm text-destructive">
                  {getError('silverPricePerGram')}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Use current local prices. Check a reliable source before calculating.
            </p>
          </div>
        </section>

        <Separator />

        {/* Assets */}
        <section>
          <h2 className="font-heading text-lg font-semibold mb-4">Assets</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="cashInHand" className="block text-sm font-medium mb-1">
                Cash in hand (INR)
              </label>
              <Input
                id="cashInHand"
                type="text"
                inputMode="decimal"
                value={form.cashInHand}
                onChange={(e) => updateField('cashInHand', e.target.value)}
                placeholder="0"
                aria-invalid={hasError('cashInHand')}
                aria-describedby={hasError('cashInHand') ? 'cashInHand-error' : undefined}
                className="h-11"
              />
              {hasError('cashInHand') && (
                <p id="cashInHand-error" className="mt-1 text-sm text-destructive">
                  {getError('cashInHand')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="bankBalances" className="block text-sm font-medium mb-1">
                Bank balances (INR)
              </label>
              <Input
                id="bankBalances"
                type="text"
                inputMode="decimal"
                value={form.bankBalances}
                onChange={(e) => updateField('bankBalances', e.target.value)}
                placeholder="0"
                aria-invalid={hasError('bankBalances')}
                aria-describedby={hasError('bankBalances') ? 'bankBalances-error' : undefined}
                className="h-11"
              />
              {hasError('bankBalances') && (
                <p id="bankBalances-error" className="mt-1 text-sm text-destructive">
                  {getError('bankBalances')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="goldGrams" className="block text-sm font-medium mb-1">
                Gold (grams)
              </label>
              <Input
                id="goldGrams"
                type="text"
                inputMode="decimal"
                value={form.goldGrams}
                onChange={(e) => updateField('goldGrams', e.target.value)}
                placeholder="0"
                aria-invalid={hasError('goldGrams')}
                aria-describedby={hasError('goldGrams') ? 'goldGrams-error' : undefined}
                className="h-11"
              />
              {hasError('goldGrams') && (
                <p id="goldGrams-error" className="mt-1 text-sm text-destructive">
                  {getError('goldGrams')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="silverGrams" className="block text-sm font-medium mb-1">
                Silver (grams)
              </label>
              <Input
                id="silverGrams"
                type="text"
                inputMode="decimal"
                value={form.silverGrams}
                onChange={(e) => updateField('silverGrams', e.target.value)}
                placeholder="0"
                aria-invalid={hasError('silverGrams')}
                aria-describedby={hasError('silverGrams') ? 'silverGrams-error' : undefined}
                className="h-11"
              />
              {hasError('silverGrams') && (
                <p id="silverGrams-error" className="mt-1 text-sm text-destructive">
                  {getError('silverGrams')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="businessStock" className="block text-sm font-medium mb-1">
                Business stock (current market value, INR)
              </label>
              <Input
                id="businessStock"
                type="text"
                inputMode="decimal"
                value={form.businessStock}
                onChange={(e) => updateField('businessStock', e.target.value)}
                placeholder="0"
                aria-invalid={hasError('businessStock')}
                aria-describedby={hasError('businessStock') ? 'businessStock-error' : undefined}
                className="h-11"
              />
              {hasError('businessStock') && (
                <p id="businessStock-error" className="mt-1 text-sm text-destructive">
                  {getError('businessStock')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="receivables" className="block text-sm font-medium mb-1">
                Receivables expected to be paid (INR)
              </label>
              <Input
                id="receivables"
                type="text"
                inputMode="decimal"
                value={form.receivables}
                onChange={(e) => updateField('receivables', e.target.value)}
                placeholder="0"
                aria-invalid={hasError('receivables')}
                aria-describedby={hasError('receivables') ? 'receivables-error' : undefined}
                className="h-11"
              />
              {hasError('receivables') && (
                <p id="receivables-error" className="mt-1 text-sm text-destructive">
                  {getError('receivables')}
                </p>
              )}
            </div>
          </div>
        </section>

        <Separator />

        {/* Personal Jewelry */}
        <section>
          <h2 className="font-heading text-lg font-semibold mb-4">Personal-use jewelry</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="personalGoldJewelryGrams" className="block text-sm font-medium mb-1">
                Personal-use gold jewelry (grams)
              </label>
              <Input
                id="personalGoldJewelryGrams"
                type="text"
                inputMode="decimal"
                value={form.personalGoldJewelryGrams}
                onChange={(e) => updateField('personalGoldJewelryGrams', e.target.value)}
                placeholder="0"
                aria-invalid={hasError('personalGoldJewelryGrams')}
                aria-describedby={hasError('personalGoldJewelryGrams') ? 'personalGoldJewelryGrams-error' : undefined}
                className="h-11"
              />
              {hasError('personalGoldJewelryGrams') && (
                <p id="personalGoldJewelryGrams-error" className="mt-1 text-sm text-destructive">
                  {getError('personalGoldJewelryGrams')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="personalSilverJewelryGrams" className="block text-sm font-medium mb-1">
                Personal-use silver jewelry (grams)
              </label>
              <Input
                id="personalSilverJewelryGrams"
                type="text"
                inputMode="decimal"
                value={form.personalSilverJewelryGrams}
                onChange={(e) => updateField('personalSilverJewelryGrams', e.target.value)}
                placeholder="0"
                aria-invalid={hasError('personalSilverJewelryGrams')}
                aria-describedby={hasError('personalSilverJewelryGrams') ? 'personalSilverJewelryGrams-error' : undefined}
                className="h-11"
              />
              {hasError('personalSilverJewelryGrams') && (
                <p id="personalSilverJewelryGrams-error" className="mt-1 text-sm text-destructive">
                  {getError('personalSilverJewelryGrams')}
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.includePersonalJewelry}
                onChange={(e) => updateField('includePersonalJewelry', e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">Include my personal-use jewelry in this estimate</span>
            </label>
          </div>
        </section>

        <Separator />

        {/* Debts */}
        <section>
          <h2 className="font-heading text-lg font-semibold mb-4">Debts</h2>
          <div>
            <label htmlFor="debtsDueNow" className="block text-sm font-medium mb-1">
              Debts due now (INR)
            </label>
            <Input
              id="debtsDueNow"
              type="text"
              inputMode="decimal"
              value={form.debtsDueNow}
              onChange={(e) => updateField('debtsDueNow', e.target.value)}
              placeholder="0"
              aria-invalid={hasError('debtsDueNow')}
              aria-describedby={hasError('debtsDueNow') ? 'debtsDueNow-error' : undefined}
              className="h-11"
            />
            {hasError('debtsDueNow') && (
              <p id="debtsDueNow-error" className="mt-1 text-sm text-destructive">
                {getError('debtsDueNow')}
              </p>
            )}
          </div>
        </section>

        <Separator />

        {/* Reset Button */}
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="h-11"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div aria-live="polite" aria-atomic="true">
          {validateAndCalculate ? (
            <div className="space-y-6">
              {/* Asset Breakdown */}
              <div>
                <h3 className="font-heading text-base font-semibold mb-3">Assets</h3>
                <dl className="space-y-2">
                  {validateAndCalculate.assets
                    .filter((a) => a.included)
                    .map((asset) => (
                      <div key={asset.name} className="flex justify-between text-sm">
                        <dt className="text-muted-foreground">{asset.name}</dt>
                        <dd className="font-medium">
                          {formatCurrency(asset.value, ZAKAT_RULES.currencyLocale, ZAKAT_RULES.currency)}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total assets</span>
                  <span className="font-medium">
                    {formatCurrency(validateAndCalculate.totalAssets, ZAKAT_RULES.currencyLocale, ZAKAT_RULES.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Debts</span>
                  <span className="font-medium">
                    {formatCurrency(validateAndCalculate.debts, ZAKAT_RULES.currencyLocale, ZAKAT_RULES.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Net wealth</span>
                  <span className="font-medium">
                    {formatCurrency(validateAndCalculate.netWealth, ZAKAT_RULES.currencyLocale, ZAKAT_RULES.currency)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Nisab */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nisab ({validateAndCalculate.nisabBasis})</span>
                  <span className="font-medium">
                    {formatCurrency(validateAndCalculate.nisabUsed, ZAKAT_RULES.currencyLocale, ZAKAT_RULES.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">{(ZAKAT_RULES.rate * 100).toFixed(1)}%</span>
                </div>
              </div>

              <Separator />

              {/* Result */}
              <div>
                {validateAndCalculate.thresholdMet ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">Estimated zakat</p>
                    <p className="font-heading text-4xl font-bold text-foreground">
                      {formatCurrency(validateAndCalculate.zakatEstimate, ZAKAT_RULES.currencyLocale, ZAKAT_RULES.currency)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Based on these figures, your net wealth is below the nisab you selected, so no zakat is estimated.
                  </p>
                )}
              </div>

              {/* Assumptions */}
              <div>
                <h3 className="font-heading text-base font-semibold mb-3">Assumptions</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {validateAndCalculate.assumptions.map((assumption, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{assumption}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>Enter your details to see an estimate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
