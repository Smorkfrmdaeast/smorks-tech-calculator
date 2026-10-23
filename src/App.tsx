import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CalculationHistoryItem, CalculatorMode } from './types/calculator';
import {
  deleteLastToken,
  evaluateExpression,
} from './utils/mathEngine';
import { Header } from './components/Header';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { CalculatorKeypad } from './components/CalculatorKeypad';
import { CurrencyConverter } from './components/CurrencyConverter';
import { KeyboardShortcutsPanel } from './components/KeyboardShortcutsPanel';

const BINARY_OPERATORS = ['+', '-', '*', '/', '%', '**'];

export default function App() {
  const [mode, setMode] = useState<CalculatorMode>('normal');
  const [screen, setScreen] = useState<string>('0');
  const [previousExpression, setPreviousExpression] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [justEvaluated, setJustEvaluated] = useState<boolean>(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);

  const triggerKeyFeedback = useCallback((keyId: string) => {
    setActiveKeyId(keyId);
    const timer = window.setTimeout(() => {
      setActiveKeyId((prev) => (prev === keyId ? null : prev));
    }, 130);
    return () => window.clearTimeout(timer);
  }, []);

  const add = useCallback(
    (val: string) => {
      setErrorMessage(null);

      setScreen((prev) => {
        const isBinaryOp = BINARY_OPERATORS.includes(val) || val === '**2';

        // If the previous state was an Error, reset before appending
        if (prev === 'Error') {
          setJustEvaluated(false);
          return isBinaryOp ? '0' + val : val;
        }

        // If user just pressed '=', continuing with an operator chains onto the result;
        // typing a number or function starts a fresh calculation.
        if (justEvaluated) {
          setJustEvaluated(false);
          if (isBinaryOp) {
            return prev + val;
          }
          return val;
        }

        if (prev === '0') {
          if (val === '.') return '0.';
          if (isBinaryOp) return '0' + val;
          return val;
        }

        // Prevent duplicate consecutive decimal points in the same number segment
        if (val === '.') {
          const segments = prev.split(/[+\-*/%()]/);
          const currentSegment = segments[segments.length - 1] || '';
          if (currentSegment.includes('.')) {
            return prev;
          }
        }

        return prev + val;
      });
    },
    [justEvaluated]
  );

  const clearScreen = useCallback(() => {
    setScreen('0');
    setPreviousExpression('');
    setErrorMessage(null);
    setJustEvaluated(false);
  }, []);

  const del = useCallback(() => {
    setErrorMessage(null);
    setJustEvaluated(false);
    setScreen((prev) => deleteLastToken(prev));
  }, []);

  const calculate = useCallback(() => {
    setScreen((prev) => {
      if (prev === 'Error' || !prev.trim()) {
        return '0';
      }

      const outcome = evaluateExpression(prev);
      if (!outcome.ok) {
        setErrorMessage(outcome.error || 'Calculation error');
        setJustEvaluated(true);
        return 'Error';
      }

      setErrorMessage(null);
      setPreviousExpression(`${prev}`);
      setJustEvaluated(true);

      // Record to session history tape if the expression actually transformed
      if (prev !== outcome.value) {
        const newItem: CalculationHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          expression: prev,
          result: outcome.value,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setHistory((old) => [newItem, ...old].slice(0, 20));
      }

      return outcome.value;
    });
  }, []);

  // Compute non-intrusive live preview when expression contains operators or functions
  const livePreview = useMemo(() => {
    if (!screen || screen === '0' || screen === 'Error' || justEvaluated) {
      return '';
    }
    const hasOperatorOrFunc = /[+\-*/%()]|Math\.|\*\*/.test(screen);
    if (!hasOperatorOrFunc) return '';

    const outcome = evaluateExpression(screen);
    return outcome.ok ? outcome.value : '';
  }, [screen, justEvaluated]);

  // Global keyboard handler when user is not typing inside an input/select
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (
        (tagName === 'input' && target?.id !== 'screen') ||
        tagName === 'select' ||
        tagName === 'textarea'
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      if (/^[0-9.]$/.test(e.key)) {
        e.preventDefault();
        triggerKeyFeedback(e.key);
        add(e.key);
      } else if (['+', '-', '*', '/', '%', '(', ')'].includes(e.key)) {
        e.preventDefault();
        triggerKeyFeedback(e.key);
        add(e.key);
      } else if (e.key === '^') {
        e.preventDefault();
        triggerKeyFeedback('**');
        add('**');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        triggerKeyFeedback('Enter');
        calculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        triggerKeyFeedback('Backspace');
        del();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        triggerKeyFeedback('Escape');
        clearScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [add, calculate, clearScreen, del, triggerKeyFeedback]);

  const handleSelectHistoryItem = (item: CalculationHistoryItem) => {
    setErrorMessage(null);
    setPreviousExpression(item.expression);
    setScreen(item.result);
    setJustEvaluated(true);
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#0A0F2C] text-slate-100">
      {/* Top Bar */}
      <Header
        mode={mode}
        onSelectMode={setMode}
        onOpenTape={() => setIsHistoryOpen(true)}
        onToggleShortcuts={() => setShowShortcuts((prev) => !prev)}
        showShortcuts={showShortcuts}
      />

      {/* Main Responsive Workspace Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {showShortcuts && (
          <KeyboardShortcutsPanel onClose={() => setShowShortcuts(false)} />
        )}

        {/* Responsive Grid: Stacked on mobile, 12-column balanced split on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Focus: Calculator Chassis (7 of 12 columns on desktop) */}
          <section
            id="calculator-section"
            aria-label="Calculator"
            className="lg:col-span-7 bg-[#0F1638] border border-white/[0.08] rounded-xl p-4 sm:p-6"
          >
            {/* Segmented Mode Control Bar */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div
                role="tablist"
                aria-label="Calculator mode"
                className="grid grid-cols-2 w-full sm:w-auto sm:min-w-[260px] p-1 bg-[#0A0F2C] border border-white/[0.08] rounded-lg"
              >
                <button
                  id="normalBtn"
                  type="button"
                  role="tab"
                  aria-selected={mode === 'normal'}
                  onClick={() => setMode('normal')}
                  className={`min-h-[38px] px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] ${
                    mode === 'normal'
                      ? 'bg-[#4169E1] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Normal
                </button>
                <button
                  id="sciBtn"
                  type="button"
                  role="tab"
                  aria-selected={mode === 'scientific'}
                  onClick={() => setMode('scientific')}
                  className={`min-h-[38px] px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] ${
                    mode === 'scientific'
                      ? 'bg-[#4169E1] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Scientific
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                <span>Trig unit</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular text-slate-300">Degrees (DEG)</span>
              </div>
            </div>

            {/* Calculator Readout Display */}
            <CalculatorDisplay
              screen={screen}
              previousExpression={previousExpression}
              livePreview={livePreview}
              errorMessage={errorMessage}
              mode={mode}
              history={history}
              isHistoryOpen={isHistoryOpen}
              onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
              onSelectHistoryItem={handleSelectHistoryItem}
              onClearHistory={() => setHistory([])}
            />

            {/* Tactile Keypad */}
            <CalculatorKeypad
              mode={mode}
              activeKeyId={activeKeyId}
              onAdd={add}
              onClear={clearScreen}
              onDelete={del}
              onCalculate={calculate}
            />
          </section>

          {/* Secondary Utility: Currency Converter (5 of 12 columns on desktop) */}
          <div className="lg:col-span-5">
            <CurrencyConverter calculatorValue={screen} />
          </div>
        </div>
      </main>

      {/* Quiet, Authentic Footer */}
      <footer className="w-full border-t border-white/[0.06] py-5 mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>SMORK&apos;S TECH © All Rights Reserved 2026</span>
          <div className="flex items-center gap-2">
            <span>Standard &amp; Scientific Calculator</span>
            <span aria-hidden="true">·</span>
            <span>Live Currency Exchange</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
