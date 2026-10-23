/**
 * Evaluates calculator expressions with degree-based trigonometry,
 * clean human-readable formatting, and floating-point precision handling.
 */

export interface EvaluationOutcome {
  ok: boolean;
  value: string;
  error?: string;
}

/**
 * Formats an internal expression into a clean, readable mathematical string
 * for the calculator display while also supporting raw JS expressions like Math.sin(rad(.
 */
export function formatExpressionForDisplay(expr: string): string {
  if (!expr) return '0';

  return expr
    .replace(/Math\.sin\(rad\(/g, 'sin(')
    .replace(/Math\.cos\(rad\(/g, 'cos(')
    .replace(/Math\.tan\(rad\(/g, 'tan(')
    .replace(/Math\.sqrt\(/g, '√(')
    .replace(/Math\.log10\(/g, 'log(')
    .replace(/Math\.log\(/g, 'ln(')
    .replace(/Math\.PI/g, 'π')
    .replace(/Math\.E/g, 'e')
    .replace(/\*\*2/g, '²')
    .replace(/\*\*/g, '^')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−');
}

/**
 * Converts a display or hybrid expression string into executable JS math syntax.
 */
export function normalizeExpressionForEval(expr: string): string {
  let normalized = expr.trim();

  // Replace display symbols with JS equivalents if present
  normalized = normalized
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, '(Math.PI)')
    .replace(/(?<![a-zA-Z0-9_])e(?![a-zA-Z0-9_])/g, '(Math.E)')
    .replace(/²/g, '**2')
    .replace(/\^/g, '**')
    .replace(/√\(/g, 'Math.sqrt(')
    .replace(/(?<![a-zA-Z0-9_.])sin\(/g, 'Math.sin(rad(')
    .replace(/(?<![a-zA-Z0-9_.])cos\(/g, 'Math.cos(rad(')
    .replace(/(?<![a-zA-Z0-9_.])tan\(/g, 'Math.tan(rad(')
    .replace(/(?<![a-zA-Z0-9_.])log\(/g, 'Math.log10(')
    .replace(/(?<![a-zA-Z0-9_.])ln\(/g, 'Math.log(');

  // Insert implicit multiplication before parentheses or constants: e.g. 2(3) -> 2*(3), 2Math.PI -> 2*Math.PI
  normalized = normalized
    .replace(/(\d|\))\s*(?=\()/g, '$1*')
    .replace(/(\d|\))\s*(?=Math\.)/g, '$1*')
    .replace(/(\))\s*(?=\d)/g, '$1*');

  // Auto-close any unclosed opening parentheses so expressions like sin(30 evaluate cleanly
  const openCount = (normalized.match(/\(/g) || []).length;
  const closeCount = (normalized.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    normalized += ')'.repeat(openCount - closeCount);
  }

  return normalized;
}

/**
 * Cleans floating point inaccuracies (e.g., 0.1 + 0.2 -> 0.3, sin(180) -> 0)
 */
export function formatNumericResult(num: number): string {
  if (!Number.isFinite(num) || Number.isNaN(num)) {
    return 'Error';
  }

  // Handle near-zero trig residuals like Math.sin(Math.PI) = 1.2246e-16
  if (Math.abs(num) < 1e-12 && num !== 0) {
    return '0';
  }

  // Round to 10 significant decimal places to eliminate IEEE 754 noise
  const rounded = Number(Math.round(Number(num + 'e10')) + 'e-10');
  if (Number.isFinite(rounded)) {
    const absVal = Math.abs(rounded);
    if (absVal >= 1e12 || (absVal > 0 && absVal < 1e-7)) {
      return rounded.toExponential(6).replace(/\.?0+e/, 'e');
    }
    return String(rounded);
  }

  return String(Number(num.toPrecision(12)));
}

/**
 * Evaluates a mathematical expression string safely using degree-mode trigonometry.
 */
export function evaluateExpression(rawExpr: string): EvaluationOutcome {
  const trimmed = rawExpr.trim();
  if (!trimmed || trimmed === '0') {
    return { ok: true, value: '0' };
  }

  try {
    const jsExpr = normalizeExpressionForEval(trimmed)
      .replace(/Math\.sin\(rad\(/g, 'sinDeg(')
      .replace(/Math\.cos\(rad\(/g, 'cosDeg(')
      .replace(/Math\.tan\(rad\(/g, 'tanDeg(');

    const rad = (deg: number): number => (deg * Math.PI) / 180;
    const sinDeg = (deg: number): number => {
      const mod = ((deg % 360) + 360) % 360;
      if (mod === 0 || mod === 180) return 0;
      if (mod === 90) return 1;
      if (mod === 270) return -1;
      return Math.sin(rad(deg));
    };
    const cosDeg = (deg: number): number => {
      const mod = ((deg % 360) + 360) % 360;
      if (mod === 90 || mod === 270) return 0;
      if (mod === 0) return 1;
      if (mod === 180) return -1;
      return Math.cos(rad(deg));
    };
    const tanDeg = (deg: number): number => {
      const mod = ((deg % 180) + 180) % 180;
      if (mod === 90) return NaN;
      if (mod === 0) return 0;
      if (mod === 45) return 1;
      if (mod === 135) return -1;
      return Math.tan(rad(deg));
    };

    const result = new Function(
      'rad',
      'sinDeg',
      'cosDeg',
      'tanDeg',
      `"use strict"; return (${jsExpr});`
    )(rad, sinDeg, cosDeg, tanDeg);

    if (typeof result !== 'number' || Number.isNaN(result)) {
      return {
        ok: false,
        value: 'Error',
        error: 'Undefined value or invalid expression',
      };
    }

    if (!Number.isFinite(result)) {
      return {
        ok: false,
        value: 'Error',
        error: 'Cannot divide by zero',
      };
    }

    return {
      ok: true,
      value: formatNumericResult(result),
    };
  } catch {
    return {
      ok: false,
      value: 'Error',
      error: 'Syntax error in expression',
    };
  }
}

/**
 * Deletes the last logical token from the expression (e.g., removes an entire
 * 'sin(' or 'Math.sin(rad(' token rather than leaving broken characters).
 */
export function deleteLastToken(expr: string): string {
  if (!expr || expr === '0' || expr === 'Error') {
    return '0';
  }

  const compoundTokens = [
    'Math.sin(rad(',
    'Math.cos(rad(',
    'Math.tan(rad(',
    'Math.log10(',
    'Math.sqrt(',
    'Math.log(',
    'Math.PI',
    'Math.E',
    'sin(',
    'cos(',
    'tan(',
    'log(',
    'ln(',
    '√(',
    '**2',
    '**',
  ];

  for (const token of compoundTokens) {
    if (expr.endsWith(token)) {
      const sliced = expr.slice(0, -token.length);
      return sliced.length > 0 ? sliced : '0';
    }
  }

  const sliced = expr.slice(0, -1);
  return sliced.length > 0 ? sliced : '0';
}

/**
 * Formats calculation history entries into a simple text representation
 * with expression and result per line.
 */
export function formatHistoryTapeAsText(
  items: { expression: string; result: string; timestamp?: string }[]
): string {
  if (items.length === 0) {
    return '';
  }

  return [...items]
    .reverse()
    .map((item) => `${formatExpressionForDisplay(item.expression)} = ${item.result}`)
    .join('\n');
}

/**
 * Triggers a browser download of the calculation tape as a .txt file.
 */
export function downloadHistoryTapeText(
  items: { expression: string; result: string; timestamp?: string }[]
): void {
  const content = formatHistoryTapeAsText(items);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const dateStamp = new Date().toISOString().split('T')[0];

  const link = document.createElement('a');
  link.href = url;
  link.download = `calculation-tape-${dateStamp}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

