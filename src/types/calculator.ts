export type CalculatorMode = 'normal' | 'scientific';

export type KeyCategory =
  | 'number'
  | 'operator'
  | 'scientific'
  | 'danger'
  | 'equals';

export interface KeyDefinition {
  id: string;
  label: string;
  value: string;
  category: KeyCategory;
  ariaLabel: string;
  shortcutHint?: string;
  colSpan?: number;
}

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export interface ExchangeRateApiResponse {
  result: string;
  base_code?: string;
  time_last_update_utc?: string;
  rates: Record<string, number>;
}
