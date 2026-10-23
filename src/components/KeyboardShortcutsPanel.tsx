import React from 'react';

interface KeyboardShortcutsPanelProps {
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: '0 – 9, .', action: 'Number and decimal entry' },
  { keys: '+, −, *, /, %', action: 'Basic arithmetic operators' },
  { keys: '( , ) , ^', action: 'Parentheses and exponentiation' },
  { keys: 'Enter or =', action: 'Evaluate current expression' },
  { keys: 'Backspace', action: 'Delete last character or function' },
  { keys: 'Escape', action: 'Clear calculator screen (AC)' },
];

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({
  onClose,
}) => {
  return (
    <section
      aria-label="Keyboard shortcuts reference"
      className="mb-6 bg-[#0F1638] border border-white/[0.1] rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-4 mb-3 pb-2.5 border-b border-white/[0.07]">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Physical Keyboard Shortcuts
          </h2>
          <p className="text-xs text-slate-400">
            Active whenever focus is outside the currency input fields
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-[#17214B] rounded-md cursor-pointer transition-colors whitespace-nowrap shrink-0"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {SHORTCUTS.map((item) => (
          <div
            key={item.keys}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[#0B102B] border border-white/[0.06]"
          >
            <span className="text-xs text-slate-300">{item.action}</span>
            <kbd className="px-2 py-0.5 text-xs font-mono-tabular font-medium text-[#8CA8F9] bg-[#151F49] border border-white/[0.1] rounded shrink-0">
              {item.keys}
            </kbd>
          </div>
        ))}
      </div>
    </section>
  );
};
