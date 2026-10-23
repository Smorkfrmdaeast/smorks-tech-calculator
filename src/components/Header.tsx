import React from 'react';
import { CalculatorMode } from '../types/calculator';

interface HeaderProps {
  mode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
  onOpenTape: () => void;
  onToggleShortcuts: () => void;
  showShortcuts: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSelectMode,
  onOpenTape,
  onToggleShortcuts,
  showShortcuts,
}) => {
  return (
    <header className="w-full border-b border-white/[0.08] bg-[#0A0F2C]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title */}
        <a
          href="#top"
          className="text-sm sm:text-base font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          SMORK&apos;S TECH CALCULATOR
        </a>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav
          aria-label="Workspace navigation"
          className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400"
        >
          <a
            href="#calculator-section"
            onClick={() => onSelectMode('normal')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              mode === 'normal' ? 'text-white underline underline-offset-4 decoration-[#4169E1]' : ''
            }`}
          >
            Standard
          </a>
          <a
            href="#calculator-section"
            onClick={() => onSelectMode('scientific')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              mode === 'scientific' ? 'text-white underline underline-offset-4 decoration-[#4169E1]' : ''
            }`}
          >
            Scientific
          </a>
          <a
            href="#converter-section"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Currency Converter
          </a>
          <a
            href="#history-section"
            onClick={onOpenTape}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Recent Tape
          </a>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleShortcuts}
            aria-expanded={showShortcuts}
            className="px-3 py-1.5 min-h-[36px] text-xs font-medium text-slate-200 bg-[#141D46] hover:bg-[#1B275C] border border-white/[0.1] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1]"
          >
            {showShortcuts ? 'Hide Shortcuts' : 'Keyboard Guide'}
          </button>
        </div>
      </div>
    </header>
  );
};
