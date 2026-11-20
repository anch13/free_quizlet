import React from 'react';
import { 
  BookOpen, 
  PlusCircle, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  FileDown, 
  Keyboard,
  RotateCcw
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNewSet: () => void;
  onGoHome: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenImportExport: () => void;
  onOpenShortcuts: () => void;
  onResetStarters: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onNewSet,
  onGoHome,
  searchQuery,
  onSearchChange,
  onOpenImportExport,
  onOpenShortcuts,
  onResetStarters,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(soundManager.isEnabled());

  const handleToggleSound = () => {
    const next = !soundEnabled;
    soundManager.setEnabled(next);
    setSoundEnabled(next);
    if (next) soundManager.playFlip();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0a092d]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div 
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Quizlet<span className="text-blue-600 dark:text-blue-400">Free</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-md border border-emerald-300 dark:border-emerald-700/50">
                100% Free
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Flashcards, Learn & Test without paywalls
            </span>
          </div>
        </div>

        {/* Global Search Input */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search your sets, terms, definitions..."
              className="w-full px-4 py-2 pl-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
            <svg 
              className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Create Set Button */}
          <button
            onClick={onNewSet}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-sm shadow-blue-600/30 transition-all"
            title="Create a new study set"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Create Set</span>
          </button>

          {/* Import / Export & Backup */}
          <button
            onClick={onOpenImportExport}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Import / Export Sets & Backup"
          >
            <FileDown className="w-5 h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-blue-500" /> : <VolumeX className="w-5 h-5 opacity-60" />}
          </button>

          {/* Keyboard Shortcuts */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-5 h-5" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>

          {/* Reset Starter Sets */}
          <button
            onClick={onResetStarters}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden lg:block"
            title="Restore Default Starter Sets"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
