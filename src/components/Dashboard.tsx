import React, { useState } from 'react';
import { 
  StudySet, 
  StudyMode 
} from '../types';
import { 
  Flame, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  BrainCircuit, 
  PenTool, 
  ClipboardCheck, 
  Gamepad2, 
  MoreVertical, 
  Edit3, 
  Copy, 
  Trash2, 
  Plus, 
  Trophy,
  Share2
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface DashboardProps {
  sets: StudySet[];
  searchQuery: string;
  studyStreak: number;
  onSelectSet: (set: StudySet, mode: StudyMode) => void;
  onEditSet: (set: StudySet) => void;
  onDeleteSet: (setId: string) => void;
  onDuplicateSet: (set: StudySet) => void;
  onNewSet: () => void;
  onExportSet: (set: StudySet) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  sets,
  searchQuery,
  studyStreak,
  onSelectSet,
  onEditSet,
  onDeleteSet,
  onDuplicateSet,
  onNewSet,
  onExportSet,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Compute categories
  const categories = ['All', ...Array.from(new Set(sets.map(s => s.category || 'General')))];

  // Compute stats
  const totalCards = sets.reduce((acc, s) => acc + s.cards.length, 0);
  const masteredCards = sets.reduce(
    (acc, s) => acc + s.cards.filter(c => c.familiarity === 'mastered').length, 
    0
  );

  // Filter sets
  const filteredSets = sets.filter(s => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    if (!matchesCat) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(q);
    const descMatch = s.description.toLowerCase().includes(q);
    const cardsMatch = s.cards.some(c => 
      c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q)
    );
    return titleMatch || descMatch || cardsMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome / Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white p-6 sm:p-8 mb-8 shadow-xl shadow-blue-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Unlimited Free Study</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Master anything with flashcards.
            </h1>
            <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
              No paywalls, no limits. Flashcards, adaptive Learn mode, customizable Test exams, and speed Match games are 100% free forever.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                soundManager.playFlip();
                onNewSet();
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Create Study Set
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-48 h-48 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {studyStreak} {studyStreak === 1 ? 'day' : 'days'}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Study Streak</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{sets.length}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Study Sets</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalCards}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Flashcards</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{masteredCards}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Terms Mastered</div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Search Results header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {searchQuery && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Found <span className="font-bold text-slate-800 dark:text-slate-200">{filteredSets.length}</span> sets matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Study Sets Grid */}
      {filteredSets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-500 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No study sets found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
            {searchQuery 
              ? `No flashcards matched "${searchQuery}". Try a different keyword.` 
              : 'Create your first study set to start learning!'}
          </p>
          <button
            onClick={onNewSet}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create Study Set
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => {
            const starredCount = set.cards.filter(c => c.starred).length;
            const masteredCount = set.cards.filter(c => c.familiarity === 'mastered').length;

            return (
              <div
                key={set.id}
                className="group relative bg-white dark:bg-[#121626] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Category & Options */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                      {set.category || 'General'}
                    </span>

                    {/* Context menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === set.id ? null : set.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === set.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)} 
                          />
                          <div className="absolute right-0 top-7 z-20 w-44 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                onEditSet(set);
                              }}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-blue-500" />
                              Edit Set
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                onDuplicateSet(set);
                              }}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Copy className="w-4 h-4 text-indigo-500" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                onExportSet(set);
                              }}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Share2 className="w-4 h-4 text-emerald-500" />
                              Export Cards
                            </button>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                if (confirm(`Are you sure you want to delete "${set.title}"?`)) {
                                  onDeleteSet(set.id);
                                }
                              }}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Set
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 
                    onClick={() => onSelectSet(set, 'flashcards')}
                    className="font-bold text-lg text-slate-900 dark:text-white cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                  >
                    {set.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {set.description || 'No description provided.'}
                  </p>

                  {/* Badges / Metrics */}
                  <div className="mt-4 flex items-center gap-2 flex-wrap text-xs font-semibold">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {set.cards.length} {set.cards.length === 1 ? 'card' : 'cards'}
                    </span>

                    {starredCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                        ★ {starredCount} starred
                      </span>
                    )}

                    {masteredCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        ✓ {masteredCount} mastered
                      </span>
                    )}

                    {set.highScores?.matchBestTime && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        Best: {set.highScores.matchBestTime.toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Modes Launch Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {/* Flashcards */}
                    <button
                      onClick={() => {
                        soundManager.playFlip();
                        onSelectSet(set, 'flashcards');
                      }}
                      className="p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Study with 3D Flashcards"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Cards</span>
                    </button>

                    {/* Learn */}
                    <button
                      onClick={() => {
                        soundManager.playFlip();
                        onSelectSet(set, 'learn');
                      }}
                      className="p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Adaptive Learn Mode"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span>Learn</span>
                    </button>

                    {/* Write */}
                    <button
                      onClick={() => {
                        soundManager.playFlip();
                        onSelectSet(set, 'write');
                      }}
                      className="p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/60 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      title="Spelling & Active Recall"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>Write</span>
                    </button>

                    {/* Test */}
                    <button
                      onClick={() => {
                        soundManager.playFlip();
                        onSelectSet(set, 'test');
                      }}
                      className="p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      title="Customizable Practice Test"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Test</span>
                    </button>

                    {/* Match */}
                    <button
                      onClick={() => {
                        soundManager.playFlip();
                        onSelectSet(set, 'match');
                      }}
                      className="p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      title="Speed Matching Game"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span>Match</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
