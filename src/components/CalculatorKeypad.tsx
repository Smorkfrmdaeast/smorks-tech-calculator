import React from 'react';
import { CalculatorMode, KeyCategory, KeyDefinition } from '../types/calculator';

interface CalculatorKeypadProps {
  mode: CalculatorMode;
  activeKeyId: string | null;
  onAdd: (val: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onCalculate: () => void;
}

const SCIENTIFIC_KEYS: KeyDefinition[] = [
  { id: 'sin', label: 'sin', value: 'Math.sin(rad(', category: 'scientific', ariaLabel: 'Sine in degrees' },
  { id: 'cos', label: 'cos', value: 'Math.cos(rad(', category: 'scientific', ariaLabel: 'Cosine in degrees' },
  { id: 'tan', label: 'tan', value: 'Math.tan(rad(', category: 'scientific', ariaLabel: 'Tangent in degrees' },
  { id: 'sqrt', label: '√', value: 'Math.sqrt(', category: 'scientific', ariaLabel: 'Square root' },

  { id: 'log', label: 'log', value: 'Math.log10(', category: 'scientific', ariaLabel: 'Base 10 logarithm' },
  { id: 'ln', label: 'ln', value: 'Math.log(', category: 'scientific', ariaLabel: 'Natural logarithm' },
  { id: 'sq', label: 'x²', value: '**2', category: 'scientific', ariaLabel: 'Square' },
  { id: 'pow', label: 'xʸ', value: '**', category: 'scientific', ariaLabel: 'Exponent', shortcutHint: '^' },

  { id: 'pi', label: 'π', value: 'Math.PI', category: 'scientific', ariaLabel: 'Pi constant' },
  { id: 'e', label: 'e', value: 'Math.E', category: 'scientific', ariaLabel: 'Euler constant' },
  { id: 'lparen', label: '(', value: '(', category: 'scientific', ariaLabel: 'Left parenthesis' },
  { id: 'rparen', label: ')', value: ')', category: 'scientific', ariaLabel: 'Right parenthesis' },
];

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  mode,
  activeKeyId,
  onAdd,
  onClear,
  onDelete,
  onCalculate,
}) => {
  const getButtonStyle = (category: KeyCategory, isPressed: boolean): string => {
    const base =
      'relative min-h-[50px] sm:min-h-[54px] px-3 py-3 rounded-lg font-mono-tabular text-base sm:text-lg font-medium select-none cursor-pointer transition-all duration-100 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] flex items-center justify-center whitespace-nowrap shrink-0';

    switch (category) {
      case 'number':
        return `${base} ${
          isPressed
            ? 'bg-[#232F63] text-white border border-white/20 translate-y-[1px]'
            : 'bg-[#172048] hover:bg-[#1E2959] active:bg-[#232F63] text-white border border-white/[0.07]'
        }`;
      case 'operator':
        return `${base} ${
          isPressed
            ? 'bg-[#263675] text-white border border-[#4169E1]/50 translate-y-[1px]'
            : 'bg-[#131C42] hover:bg-[#1B275A] active:bg-[#22316E] text-[#8CA8F9] border border-white/[0.09] font-semibold'
        }`;
      case 'scientific':
        return `${base} text-sm sm:text-[15px] min-h-[44px] sm:min-h-[46px] ${
          isPressed
            ? 'bg-[#1D2859] text-white border border-white/20 translate-y-[1px]'
            : 'bg-[#0F1636] hover:bg-[#16204B] active:bg-[#1B2759] text-slate-300 border border-white/[0.06]'
        }`;
      case 'danger':
        return `${base} text-sm sm:text-base font-semibold ${
          isPressed
            ? 'bg-[#3D2238] text-rose-200 border border-rose-400/40 translate-y-[1px]'
            : 'bg-[#23182E] hover:bg-[#2F1E3B] active:bg-[#382346] text-rose-300 border border-rose-500/20'
        }`;
      case 'equals':
        return `${base} font-semibold ${
          isPressed
            ? 'bg-[#3154C4] text-white translate-y-[1px]'
            : 'bg-[#4169E1] hover:bg-[#4E75E8] active:bg-[#3559C9] text-white border border-white/15 shadow-sm'
        }`;
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Scientific Extension Row Block */}
      {mode === 'scientific' && (
        <div
          id="scientific"
          aria-label="Scientific functions"
          className="grid grid-cols-4 gap-2 pb-2.5 border-b border-white/[0.07]"
        >
          {SCIENTIFIC_KEYS.map((key) => (
            <button
              key={key.id}
              type="button"
              aria-label={key.ariaLabel}
              onClick={() => onAdd(key.value)}
              className={getButtonStyle(key.category, activeKeyId === key.value)}
            >
              {key.label}
            </button>
          ))}
        </div>
      )}

      {/* Standard / Core Keypad Grid */}
      <div
        id="normal"
        aria-label="Calculator keypad"
        className="grid grid-cols-4 gap-2"
      >
        {/* Row 1: Clear, Delete, Modulo/Percent, Divide */}
        <button
          type="button"
          aria-label="All Clear"
          onClick={onClear}
          className={getButtonStyle('danger', activeKeyId === 'Escape')}
        >
          AC
        </button>
        <button
          type="button"
          aria-label="Delete last entry"
          onClick={onDelete}
          className={getButtonStyle('danger', activeKeyId === 'Backspace')}
        >
          DEL
        </button>
        <button
          type="button"
          aria-label="Modulo or remainder"
          onClick={() => onAdd('%')}
          className={getButtonStyle('operator', activeKeyId === '%')}
        >
          %
        </button>
        <button
          type="button"
          aria-label="Divide"
          onClick={() => onAdd('/')}
          className={getButtonStyle('operator', activeKeyId === '/')}
        >
          ÷
        </button>

        {/* Row 2: 7, 8, 9, Multiply */}
        <button
          type="button"
          onClick={() => onAdd('7')}
          className={getButtonStyle('number', activeKeyId === '7')}
        >
          7
        </button>
        <button
          type="button"
          onClick={() => onAdd('8')}
          className={getButtonStyle('number', activeKeyId === '8')}
        >
          8
        </button>
        <button
          type="button"
          onClick={() => onAdd('9')}
          className={getButtonStyle('number', activeKeyId === '9')}
        >
          9
        </button>
        <button
          type="button"
          aria-label="Multiply"
          onClick={() => onAdd('*')}
          className={getButtonStyle('operator', activeKeyId === '*')}
        >
          ×
        </button>

        {/* Row 3: 4, 5, 6, Subtract */}
        <button
          type="button"
          onClick={() => onAdd('4')}
          className={getButtonStyle('number', activeKeyId === '4')}
        >
          4
        </button>
        <button
          type="button"
          onClick={() => onAdd('5')}
          className={getButtonStyle('number', activeKeyId === '5')}
        >
          5
        </button>
        <button
          type="button"
          onClick={() => onAdd('6')}
          className={getButtonStyle('number', activeKeyId === '6')}
        >
          6
        </button>
        <button
          type="button"
          aria-label="Subtract"
          onClick={() => onAdd('-')}
          className={getButtonStyle('operator', activeKeyId === '-')}
        >
          −
        </button>

        {/* Row 4: 1, 2, 3, Add */}
        <button
          type="button"
          onClick={() => onAdd('1')}
          className={getButtonStyle('number', activeKeyId === '1')}
        >
          1
        </button>
        <button
          type="button"
          onClick={() => onAdd('2')}
          className={getButtonStyle('number', activeKeyId === '2')}
        >
          2
        </button>
        <button
          type="button"
          onClick={() => onAdd('3')}
          className={getButtonStyle('number', activeKeyId === '3')}
        >
          3
        </button>
        <button
          type="button"
          aria-label="Add"
          onClick={() => onAdd('+')}
          className={getButtonStyle('operator', activeKeyId === '+')}
        >
          +
        </button>

        {/* Row 5: 0 (2-col span for natural thumb ergonomics), Decimal, Equals */}
        <button
          type="button"
          onClick={() => onAdd('0')}
          className={`${getButtonStyle('number', activeKeyId === '0')} col-span-2`}
        >
          0
        </button>
        <button
          type="button"
          aria-label="Decimal point"
          onClick={() => onAdd('.')}
          className={getButtonStyle('number', activeKeyId === '.')}
        >
          .
        </button>
        <button
          type="button"
          aria-label="Equals"
          onClick={onCalculate}
          className={getButtonStyle('equals', activeKeyId === 'Enter')}
        >
          =
        </button>
      </div>
    </div>
  );
};
