import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Flip flashcard front and back' },
    { key: '←', desc: 'Previous flashcard' },
    { key: '→', desc: 'Next flashcard' },
    { key: '↑ / ↓', desc: 'Flip flashcard' },
    { key: 'S', desc: 'Star / Unstar current card for targeted study' },
    { key: '1, 2, 3, 4', desc: 'Select option in Learn mode' },
    { key: 'Enter', desc: 'Submit answer in Write mode' },
    { key: 'Esc', desc: 'Close dialogs or exit fullscreen' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-scale-in">
      <div className="bg-white dark:bg-[#121626] rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs"
            >
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {sc.desc}
              </span>
              <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono font-bold text-slate-800 dark:text-slate-100 shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
