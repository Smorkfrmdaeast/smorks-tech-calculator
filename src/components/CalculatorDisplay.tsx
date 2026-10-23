import React, { useState } from 'react';
import { CalculationHistoryItem, CalculatorMode } from '../types/calculator';
import {
  downloadHistoryTapeText,
  formatExpressionForDisplay,
  formatHistoryTapeAsText,
} from '../utils/mathEngine';

interface CalculatorDisplayProps {
  screen: string;
  previousExpression: string;
  livePreview: string;
  errorMessage: string | null;
  mode: CalculatorMode;
  history: CalculationHistoryItem[];
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  onSelectHistoryItem: (item: CalculationHistoryItem) => void;
  onClearHistory: () => void;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  screen,
  previousExpression,
  livePreview,
  errorMessage,
  mode,
  history,
  isHistoryOpen,
  onToggleHistory,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const [copied, setCopied] = useState(false);
  const [tapeCopied, setTapeCopied] = useState(false);

  const formattedScreen = formatExpressionForDisplay(screen);

  // Dynamically scale font size based on display character count so long expressions stay legible
  const getDisplaySizeClass = (length: number): string => {
    if (length > 22) return 'text-xl sm:text-2xl';
    if (length > 14) return 'text-2xl sm:text-3xl';
    return 'text-3xl sm:text-4xl';
  };

  const handleCopy = async () => {
    const valueToCopy = screen === 'Error' ? '0' : screen;
    try {
      await navigator.clipboard.writeText(valueToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  const handleCopyTape = async () => {
    if (history.length === 0) return;
    try {
      await navigator.clipboard.writeText(formatHistoryTapeAsText(history));
      setTapeCopied(true);
      setTimeout(() => setTapeCopied(false), 1500);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  const handleDownloadTape = () => {
    downloadHistoryTapeText(history);
  };

  return (
    <div className="mb-3.5">
      {/* Main Readout Chassis */}
      <div className="bg-[#0D1333] border border-white/[0.09] rounded-xl p-4 sm:p-5 transition-colors">
        {/* Top Metadata Row: Unboxed text with middle-dot separators */}
        <div className="flex items-center justify-between gap-2 mb-2.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-300">
              {mode === 'scientific' ? 'Scientific' : 'Standard'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">DEG</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              id="history-toggle"
              aria-expanded={isHistoryOpen}
              onClick={onToggleHistory}
              className="text-slate-300 hover:text-white underline underline-offset-2 cursor-pointer transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4169E1] rounded"
            >
              {isHistoryOpen ? 'Hide tape' : `Tape (${history.length})`}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy current value"
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4169E1] rounded px-1"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Collapsible Calculation History Audit Trail Panel */}
        {isHistoryOpen && (
          <div
            id="history-section"
            aria-label="Calculation history panel"
            className="mb-3.5 pb-3.5 border-b border-white/[0.08]"
          >
            {/* Audit Trail Header & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-medium text-slate-300">
                  Calculation Tape
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="text-[11px] text-slate-400 font-mono-tabular">
                  {history.length} {history.length === 1 ? 'record' : 'records'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  id="exportTapeBtn"
                  onClick={handleDownloadTape}
                  disabled={history.length === 0}
                  title="Download calculation history as a .txt file"
                  className="px-2.5 py-1 rounded bg-[#16204B] hover:bg-[#1E2C66] disabled:opacity-45 disabled:pointer-events-none text-slate-100 font-medium border border-white/[0.1] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4169E1]"
                >
                  Export Tape
                </button>
                {history.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopyTape}
                      title="Copy formatted calculation tape to clipboard"
                      className="px-2 py-1 rounded bg-[#121A3D] hover:bg-[#1A2554] text-slate-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4169E1]"
                    >
                      {tapeCopied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={onClearHistory}
                      className="px-1.5 py-1 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400 rounded"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Audit Trail Ledger Container */}
            <div className="bg-[#090E26] border border-white/[0.09] rounded-lg overflow-hidden">
              {history.length === 0 ? (
                <div className="px-3.5 py-3 flex items-center justify-between text-xs text-slate-500 border-t border-b border-white/[0.05]">
                  <span>No entries logged in current session.</span>
                  <span className="font-mono-tabular text-[11px] text-slate-600">
                    Press = to record
                  </span>
                </div>
              ) : (
                <ul
                  aria-label="Recorded calculations"
                  className="max-h-52 overflow-y-auto overflow-x-hidden scroll-smooth overscroll-contain divide-y divide-white/[0.08]"
                >
                  {history.map((item, index) => {
                    const entryNumber = String(history.length - index).padStart(
                      2,
                      '0'
                    );
                    const readableExpression = formatExpressionForDisplay(
                      item.expression
                    );
                    return (
                      <li
                        key={item.id}
                        className="border-t border-b border-white/[0.08] first:border-t-0 last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectHistoryItem(item)}
                          title={`Recall ${readableExpression} = ${item.result}`}
                          className="w-full px-3.5 py-2.5 flex items-center justify-between gap-4 hover:bg-white/[0.04] active:bg-white/[0.07] text-left transition-colors cursor-pointer group focus-visible:outline-none focus-visible:bg-white/[0.06]"
                        >
                          {/* Left Column: Audit Index, Timestamp & Small Muted Expression */}
                          <div className="min-w-0 flex-1 flex flex-col gap-0.5 overflow-hidden">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono-tabular">
                              <span className="text-slate-400">
                                #{entryNumber}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{item.timestamp}</span>
                            </div>
                            <span className="text-xs font-normal text-slate-400 group-hover:text-slate-300 font-mono-tabular truncate">
                              {readableExpression} =
                            </span>
                          </div>

                          {/* Right Column: Large High-Contrast Evaluated Result */}
                          <div className="shrink-0 max-w-[55%] overflow-x-auto text-right font-mono-tabular">
                            <span className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#8CA8F9] tracking-tight whitespace-nowrap transition-colors">
                              {item.result}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Previous Expression Line */}
        <div className="min-h-[20px] flex items-center justify-end text-right overflow-x-auto scroll-smooth">
          {previousExpression ? (
            <span className="text-xs sm:text-sm text-slate-400 font-mono-tabular whitespace-nowrap">
              {formatExpressionForDisplay(previousExpression)} =
            </span>
          ) : (
            <span className="text-xs text-slate-600 font-mono-tabular select-none">
              Ready
            </span>
          )}
        </div>

        {/* Primary Screen Readout (Preserves #screen input for DOM compatibility) */}
        <div className="mt-1 flex items-baseline justify-end overflow-x-auto scroll-smooth">
          <input
            type="text"
            id="screen"
            readOnly
            value={formattedScreen}
            aria-label="Calculator display"
            className={`w-full bg-transparent border-none text-right font-mono-tabular font-semibold tracking-tight outline-none selection:bg-[#4169E1]/40 ${
              screen === 'Error' ? 'text-rose-400' : 'text-white'
            } ${getDisplaySizeClass(formattedScreen.length)}`}
          />
        </div>

        {/* Secondary Live Preview / Error Notice Footer */}
        <div className="mt-1.5 min-h-[18px] flex items-center justify-between gap-2 text-right">
          {errorMessage ? (
            <span className="text-xs text-rose-300/90 truncate ml-auto">
              {errorMessage}
            </span>
          ) : livePreview && livePreview !== screen && livePreview !== 'Error' ? (
            <span className="text-xs text-slate-400 font-mono-tabular ml-auto">
              = {livePreview}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 ml-auto">
              Use keypad or keyboard
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
