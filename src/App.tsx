import React, { useState, useEffect } from 'react';
import { StudySet, Card, StudyMode } from './types';
import { 
  loadStudySets, 
  saveStudySets, 
  resetToStarterSets, 
  recordStudyActivity, 
  getStudyStreak 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { FlashcardsView } from './components/FlashcardsView';
import { LearnModeView } from './components/LearnModeView';
import { WriteModeView } from './components/WriteModeView';
import { TestModeView } from './components/TestModeView';
import { MatchModeView } from './components/MatchModeView';
import { SetEditor } from './components/SetEditor';
import { ImportExportModal } from './components/ImportExportModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fq_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Data state
  const [sets, setSets] = useState<StudySet[]>(() => loadStudySets());
  const [streak, setStreak] = useState<number>(() => getStudyStreak());

  // View state
  const [currentMode, setCurrentMode] = useState<StudyMode>('dashboard');
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<StudySet | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [stagedImportCards, setStagedImportCards] = useState<{ term: string; definition: string }[] | null>(null);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fq_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Record study streak on any study mode launch
  const triggerStudyActivity = () => {
    const updatedStreak = recordStudyActivity();
    setStreak(updatedStreak);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Select a set and enter study mode
  const handleSelectSet = (set: StudySet, mode: StudyMode) => {
    setActiveSetId(set.id);
    setCurrentMode(mode);
    triggerStudyActivity();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setCurrentMode('dashboard');
    setActiveSetId(null);
    setEditingSet(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNewSet = () => {
    setEditingSet(null);
    setCurrentMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSet = (set: StudySet) => {
    setEditingSet(set);
    setCurrentMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSet = (setId: string) => {
    const updated = sets.filter(s => s.id !== setId);
    setSets(updated);
    saveStudySets(updated);
    if (activeSetId === setId) {
      handleGoHome();
    }
  };

  const handleDuplicateSet = (setToDuplicate: StudySet) => {
    const duplicated: StudySet = {
      ...setToDuplicate,
      id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${setToDuplicate.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cards: setToDuplicate.cards.map(c => ({
        ...c,
        id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        familiarity: 'new',
      })),
    };
    const updated = [duplicated, ...sets];
    setSets(updated);
    saveStudySets(updated);
  };

  const handleSaveSet = (savedSet: StudySet) => {
    let updated: StudySet[];
    const exists = sets.some(s => s.id === savedSet.id);

    if (exists) {
      updated = sets.map(s => s.id === savedSet.id ? savedSet : s);
    } else {
      updated = [savedSet, ...sets];
    }

    setSets(updated);
    saveStudySets(updated);
    setActiveSetId(savedSet.id);
    setCurrentMode('flashcards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateCard = (updatedCard: Card) => {
    if (!activeSetId) return;
    const updated = sets.map(s => {
      if (s.id === activeSetId) {
        return {
          ...s,
          cards: s.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
        };
      }
      return s;
    });
    setSets(updated);
    saveStudySets(updated);
  };

  const handleUpdateSet = (updatedSet: StudySet) => {
    const updated = sets.map(s => s.id === updatedSet.id ? updatedSet : s);
    setSets(updated);
    saveStudySets(updated);
  };

  const handleSaveHighScore = (newBestTime: number) => {
    if (!activeSetId) return;
    const updated = sets.map(s => {
      if (s.id === activeSetId) {
        return {
          ...s,
          highScores: {
            ...(s.highScores || {}),
            matchBestTime: newBestTime,
          }
        };
      }
      return s;
    });
    setSets(updated);
    saveStudySets(updated);
  };

  const handleResetStarters = () => {
    if (confirm('Restore default HSK 1 through 5 Chinese vocabulary sets? Your current sets will be reset.')) {
      const restored = resetToStarterSets();
      setSets(restored);
      handleGoHome();
    }
  };

  const handleRestoreAllSets = (restored: StudySet[]) => {
    setSets(restored);
    saveStudySets(restored);
    setIsImportExportOpen(false);
    handleGoHome();
  };

  const activeSet = sets.find(s => s.id === activeSetId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a092d] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onNewSet={handleCreateNewSet}
        onGoHome={handleGoHome}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onResetStarters={handleResetStarters}
      />

      <main className="flex-1 pb-16">
        {currentMode === 'dashboard' && (
          <Dashboard
            sets={sets}
            searchQuery={searchQuery}
            studyStreak={streak}
            onSelectSet={handleSelectSet}
            onEditSet={handleEditSet}
            onDeleteSet={handleDeleteSet}
            onDuplicateSet={handleDuplicateSet}
            onNewSet={handleCreateNewSet}
            onExportSet={(set) => {
              setActiveSetId(set.id);
              setIsImportExportOpen(true);
            }}
          />
        )}

        {currentMode === 'flashcards' && activeSet && (
          <FlashcardsView
            set={activeSet}
            onBack={handleGoHome}
            onChangeMode={(mode) => {
              setCurrentMode(mode);
              triggerStudyActivity();
            }}
            onUpdateCard={handleUpdateCard}
          />
        )}

        {currentMode === 'learn' && activeSet && (
          <LearnModeView
            set={activeSet}
            onBack={handleGoHome}
            onChangeMode={(mode) => setCurrentMode(mode)}
            onUpdateSet={handleUpdateSet}
          />
        )}

        {currentMode === 'write' && activeSet && (
          <WriteModeView
            set={activeSet}
            onBack={handleGoHome}
            onChangeMode={(mode) => setCurrentMode(mode)}
          />
        )}

        {currentMode === 'test' && activeSet && (
          <TestModeView
            set={activeSet}
            onBack={handleGoHome}
            onChangeMode={(mode) => setCurrentMode(mode)}
          />
        )}

        {currentMode === 'match' && activeSet && (
          <MatchModeView
            set={activeSet}
            onBack={handleGoHome}
            onChangeMode={(mode) => setCurrentMode(mode)}
            onSaveHighScore={handleSaveHighScore}
          />
        )}

        {currentMode === 'edit' && (
          <SetEditor
            initialSet={editingSet}
            onSave={handleSaveSet}
            onCancel={handleGoHome}
            onOpenImport={() => setIsImportExportOpen(true)}
            importedCards={stagedImportCards}
            onClearImportedCards={() => setStagedImportCards(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-700 dark:text-slate-300">QuizletFree</span> • High performance, 100% free flashcard learning platform.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:underline text-slate-600 dark:text-slate-400"
            >
              Shortcuts
            </button>
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="hover:underline text-slate-600 dark:text-slate-400"
            >
              Backup / Restore
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        activeSet={activeSet}
        allSets={sets}
        onImportCardsToEditor={(cards) => {
          setStagedImportCards(cards);
          if (currentMode !== 'edit') {
            setCurrentMode('edit');
          }
        }}
        onRestoreAllSets={handleRestoreAllSets}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
