import { ExchangeRateApiResponse } from '../types/calculator';

export const FALLBACK_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'NGN',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
  'INR',
  'ZAR',
  'BRL',
  'MXN',
  'SGD',
  'HKD',
  'NZD',
  'SEK',
  'NOK',
  'KRW',
  'AED',
];

export const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  NGN: 'Nigerian Naira',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  ZAR: 'South African Rand',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  NZD: 'New Zealand Dollar',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  KRW: 'South Korean Won',
  AED: 'UAE Dirham',
  GHS: 'Ghanaian Cedi',
  KES: 'Kenyan Shilling',
  EGP: 'Egyptian Pound',
  SAR: 'Saudi Riyal',
  TRY: 'Turkish Lira',
  PLN: 'Polish Zloty',
  DKK: 'Danish Krone',
  THB: 'Thai Baht',
  MYR: 'Malaysian Ringgit',
  IDR: 'Indonesian Rupiah',
  PHP: 'Philippine Peso',
};

// Baseline fallback USD exchange rates if network is unreachable
const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1580.0,
  JPY: 154.5,
  CAD: 1.38,
  AUD: 1.52,
  CHF: 0.88,
  CNY: 7.24,
  INR: 84.1,
  ZAR: 18.1,
  BRL: 5.7,
  MXN: 20.1,
  SGD: 1.34,
  HKD: 7.78,
  NZD: 1.66,
  SEK: 10.6,
  NOK: 10.9,
  KRW: 1385.0,
  AED: 3.67,
};

const ratesCache: Record<
  string,
  { rates: Record<string, number>; updatedAt: string; isFallback: boolean }
> = {};

export interface RateFetchResult {
  rates: Record<string, number>;
  currencies: string[];
  updatedAt: string;
  isFallback: boolean;
}

export async function fetchExchangeRates(
  baseCurrency: string,
  forceRefresh = false
): Promise<RateFetchResult> {
  const upperBase = baseCurrency.toUpperCase();

  if (!forceRefresh && ratesCache[upperBase]) {
    const cached = ratesCache[upperBase];
    return {
      rates: cached.rates,
      currencies: Object.keys(cached.rates),
      updatedAt: cached.updatedAt,
      isFallback: cached.isFallback,
    };
  }

  try {
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${encodeURIComponent(upperBase)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data: ExchangeRateApiResponse = await response.json();
    if (!data || !data.rates || typeof data.rates !== 'object') {
      throw new Error('Malformed exchange rate payload');
    }

    const updatedAt = data.time_last_update_utc
      ? new Date(data.time_last_update_utc).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Live';

    ratesCache[upperBase] = {
      rates: data.rates,
      updatedAt,
      isFallback: false,
    };

    return {
      rates: data.rates,
      currencies: Object.keys(data.rates),
      updatedAt,
      isFallback: false,
    };
  } catch {
    // Compute relative fallback rates from FALLBACK_USD_RATES
    const baseUsdRate = FALLBACK_USD_RATES[upperBase] || 1;
    const derivedRates: Record<string, number> = {};
    for (const [code, usdRate] of Object.entries(FALLBACK_USD_RATES)) {
      derivedRates[code] = usdRate / baseUsdRate;
    }

    return {
      rates: derivedRates,
      currencies: FALLBACK_CURRENCIES,
      updatedAt: 'Offline reference rates',
      isFallback: true,
    };
  }
}
