import React, { useEffect, useState, useCallback } from 'react';
import {
  CURRENCY_NAMES,
  FALLBACK_CURRENCIES,
  fetchExchangeRates,
} from '../utils/currencyService';

interface CurrencyConverterProps {
  calculatorValue: string;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  calculatorValue,
}) => {
  const [currencies, setCurrencies] = useState<string[]>(FALLBACK_CURRENCIES);
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [explicitResultText, setExplicitResultText] = useState<string>('');

  const loadRatesForBase = useCallback(
    async (base: string, forceRefresh = false) => {
      setIsLoading(true);
      setError(null);

      const result = await fetchExchangeRates(base, forceRefresh);
      setRates(result.rates);
      if (result.currencies.length > 0) {
        setCurrencies(result.currencies);
      }
      setUpdatedAt(result.updatedAt);
      setIsFallback(result.isFallback);
      setIsLoading(false);
      return result.rates;
    },
    []
  );

  useEffect(() => {
    loadRatesForBase(fromCurrency);
  }, [fromCurrency, loadRatesForBase]);

  // Compute live conversion values
  const numericAmount = parseFloat(amount);
  const isValidAmount = amount.trim() !== '' && !Number.isNaN(numericAmount) && numericAmount >= 0;
  const activeRate = rates[toCurrency];
  const convertedValue =
    isValidAmount && typeof activeRate === 'number'
      ? (numericAmount * activeRate).toFixed(2)
      : null;

  // Keep #result synchronized for both live typing and explicit Convert button clicks
  useEffect(() => {
    if (amount.trim() === '') {
      setExplicitResultText('');
      return;
    }
    if (!isValidAmount) {
      setExplicitResultText('Enter a valid positive amount');
      return;
    }
    if (typeof activeRate === 'number') {
      setExplicitResultText(
        `${amount} ${fromCurrency} = ${(numericAmount * activeRate).toFixed(2)} ${toCurrency}`
      );
    }
  }, [amount, fromCurrency, toCurrency, activeRate, isValidAmount, numericAmount]);

  const handleConvertClick = async () => {
    if (!isValidAmount) {
      setError('Please enter a valid numeric amount.');
      return;
    }
    setError(null);
    const freshRates = await loadRatesForBase(fromCurrency, true);
    const rate = freshRates[toCurrency];
    if (typeof rate === 'number') {
      setExplicitResultText(
        `${amount} ${fromCurrency} = ${(numericAmount * rate).toFixed(2)} ${toCurrency}`
      );
    } else {
      setError('Exchange rate unavailable for selected pair.');
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleUseCalculatorValue = () => {
    const parsed = parseFloat(calculatorValue);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      setAmount(String(Math.abs(parsed)));
      setError(null);
    }
  };

  const canUseCalcValue =
    calculatorValue !== '0' &&
    calculatorValue !== 'Error' &&
    !Number.isNaN(parseFloat(calculatorValue));

  const formatCurrencyOption = (code: string): string => {
    const name = CURRENCY_NAMES[code];
    return name ? `${code} — ${name}` : code;
  };

  return (
    <section
      id="converter-section"
      aria-labelledby="converter-heading"
      className="bg-[#0F1638] border border-white/[0.08] rounded-xl p-5 sm:p-6 flex flex-col justify-between"
    >
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-white/[0.07]">
          <div>
            <h2
              id="converter-heading"
              className="text-base font-semibold text-white tracking-tight"
            >
              Currency Converter
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              <span>open.er-api.com</span>
              <span aria-hidden="true"> · </span>
              <span>{isLoading ? 'Syncing rates...' : updatedAt}</span>
              {isFallback && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="text-amber-300">Fallback mode</span>
                </>
              )}
            </p>
          </div>

          {canUseCalcValue && (
            <button
              type="button"
              onClick={handleUseCalculatorValue}
              className="px-2.5 py-1.5 min-h-[34px] text-xs font-medium text-slate-200 bg-[#17214B] hover:bg-[#1E2B61] border border-white/[0.09] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1]"
              title="Copy current calculator result into amount"
            >
              Use calc result
            </button>
          )}
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="amount"
              className="text-xs font-medium text-slate-300"
            >
              Amount
            </label>
            {amount !== '' && (
              <button
                type="button"
                onClick={() => setAmount('')}
                className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              id="amount"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="Enter amount (e.g. 100)"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError(null);
              }}
              className="w-full min-h-[46px] px-3.5 py-2.5 pr-16 rounded-lg bg-[#0B102B] border border-white/[0.1] text-white font-mono-tabular text-base placeholder:text-slate-500 focus:outline-none focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] transition-colors"
            />
            <span className="absolute right-3.5 text-xs font-mono-tabular font-medium text-slate-400 pointer-events-none">
              {fromCurrency}
            </span>
          </div>
        </div>

        {/* Currency Selectors + Swap Control */}
        <div className="space-y-2.5 mb-5">
          <div>
            <label
              htmlFor="from"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              From
            </label>
            <select
              id="from"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full min-h-[46px] px-3 py-2.5 rounded-lg bg-[#0B102B] border border-white/[0.1] text-slate-100 text-sm font-medium focus:outline-none focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] transition-colors cursor-pointer"
            >
              {currencies.map((code) => (
                <option key={code} value={code} className="bg-[#0F1638] text-white">
                  {formatCurrencyOption(code)}
                </option>
              ))}
            </select>
          </div>

          {/* Centered Tactile Swap Button with Divider Hairline */}
          <div className="relative flex items-center justify-center py-0.5">
            <div className="w-full border-t border-white/[0.06]" />
            <button
              type="button"
              onClick={handleSwapCurrencies}
              aria-label="Swap From and To currencies"
              className="absolute px-3 py-1.5 min-h-[36px] rounded-lg bg-[#18224F] hover:bg-[#212E68] active:translate-y-[1px] border border-white/[0.12] text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1]"
            >
              <span aria-hidden="true" className="font-mono-tabular text-sm">
                ⇅
              </span>
              <span>Swap</span>
            </button>
          </div>

          <div>
            <label
              htmlFor="to"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              To
            </label>
            <select
              id="to"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full min-h-[46px] px-3 py-2.5 rounded-lg bg-[#0B102B] border border-white/[0.1] text-slate-100 text-sm font-medium focus:outline-none focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] transition-colors cursor-pointer"
            >
              {currencies.map((code) => (
                <option key={code} value={code} className="bg-[#0F1638] text-white">
                  {formatCurrencyOption(code)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Converted Readout Box */}
        <div className="bg-[#0B102B] border border-white/[0.08] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Converted Amount</span>
            {typeof activeRate === 'number' && (
              <span className="font-mono-tabular text-slate-400">
                1 {fromCurrency} = {activeRate.toFixed(4)} {toCurrency}
              </span>
            )}
          </div>

          {error ? (
            <p className="text-sm text-rose-300 py-1">{error}</p>
          ) : isLoading && !convertedValue ? (
            <p className="text-sm text-slate-400 py-1 font-mono-tabular">
              Fetching exchange rate...
            </p>
          ) : convertedValue !== null ? (
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-white font-mono-tabular tracking-tight break-all">
                {convertedValue}{' '}
                <span className="text-base font-medium text-[#8CA8F9]">
                  {toCurrency}
                </span>
              </div>
              <p
                id="result"
                className="text-xs text-slate-400 font-mono-tabular mt-1"
              >
                {explicitResultText}
              </p>
            </div>
          ) : (
            <p
              id="result"
              className="text-sm text-slate-500 py-1 font-mono-tabular"
            >
              {explicitResultText || 'Enter an amount above to convert'}
            </p>
          )}

          {typeof activeRate === 'number' && activeRate > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono-tabular">
              <span>Inverse rate</span>
              <span>
                1 {toCurrency} = {(1 / activeRate).toFixed(4)} {fromCurrency}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Explicit Convert / Refresh Action Button */}
      <button
        type="button"
        onClick={handleConvertClick}
        disabled={isLoading}
        className="w-full min-h-[48px] px-4 py-3 rounded-lg bg-[#4169E1] hover:bg-[#4E75E8] active:bg-[#3559C9] active:translate-y-[1px] disabled:opacity-60 disabled:pointer-events-none text-white text-sm font-semibold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap shrink-0"
      >
        {isLoading ? 'Updating Exchange Rates...' : 'Convert'}
      </button>
    </section>
  );
};
