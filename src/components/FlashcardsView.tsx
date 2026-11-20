import React, { useState, useEffect, useCallback } from 'react';
import { 
  StudySet, 
  Card, 
  StudyMode 
} from '../types';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Star, 
  Shuffle, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  ArrowLeftRight, 
  BrainCircuit, 
  PenTool, 
  ClipboardCheck, 
  Gamepad2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { speakText } from '../utils/speech';

interface FlashcardsViewProps {
  set: StudySet;
  onBack: () => void;
  onChangeMode: (mode: StudyMode) => void;
  onUpdateCard: (updatedCard: Card) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  set,
  onBack,
  onChangeMode,
  onUpdateCard,
}) => {
  const [cards, setCards] = useState<Card[]>(set.cards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [showStarredOnly, setShowStarredOnly] = useState<boolean>(false);
  const [termFirst, setTermFirst] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [listSearch, setListSearch] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(60);

  // Sync cards when set updates
  useEffect(() => {
    let activeCards = [...set.cards];
    if (showStarredOnly) {
      activeCards = activeCards.filter(c => c.starred);
      if (activeCards.length === 0) {
        // Fallback if no starred
        setShowStarredOnly(false);
        activeCards = [...set.cards];
      }
    }
    if (isShuffled) {
      activeCards = [...activeCards].sort(() => Math.random() - 0.5);
    }
    setCards(activeCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [set, showStarredOnly, isShuffled]);

  const currentCard = cards[currentIndex] || set.cards[0];
  const starredCardsCount = set.cards.filter(c => c.starred).length;

  const handleFlip = useCallback(() => {
    soundManager.playFlip();
    setIsFlipped(prev => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleToggleStar = (cardToToggle: Card, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = { ...cardToToggle, starred: !cardToToggle.starred };
    onUpdateCard(updated);

    // update local state
    setCards(prev => prev.map(c => c.id === cardToToggle.id ? updated : c));
  };

  const handleSpeak = (text: string, lang: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    speakText(text, lang);
  };

  const handleShuffleToggle = () => {
    setIsShuffled(prev => !prev);
    soundManager.playFlip();
  };

  const handleSwapSides = () => {
    setTermFirst(prev => !prev);
    setIsFlipped(false);
    soundManager.playFlip();
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (currentCard) handleToggleStar(currentCard);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentCard]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  if (!currentCard) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">No cards in this set.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  const frontText = termFirst ? currentCard.term : currentCard.definition;
  const frontLabel = termFirst ? 'TERM' : 'DEFINITION';
  const frontLang = termFirst ? set.termLang : set.defLang;

  const backText = termFirst ? currentCard.definition : currentCard.term;
  const backLabel = termFirst ? 'DEFINITION' : 'TERM';
  const backLang = termFirst ? set.defLang : set.termLang;

  const progressPercent = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header & Study Modes Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {set.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Flashcards Mode • {cards.length} cards {showStarredOnly && '(Starred only)'}
            </p>
          </div>
        </div>

        {/* Study Mode Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl overflow-x-auto scrollbar-none border border-slate-200 dark:border-slate-700">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold text-xs shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => onChangeMode('learn')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs transition-colors"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Learn</span>
          </button>
          <button
            onClick={() => onChangeMode('write')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 font-bold text-xs transition-colors"
          >
            <PenTool className="w-4 h-4" />
            <span>Write</span>
          </button>
          <button
            onClick={() => onChangeMode('test')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Test</span>
          </button>
          <button
            onClick={() => onChangeMode('match')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-bold text-xs transition-colors"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Match</span>
          </button>
        </div>
      </div>

      {/* Options Bar above the Card */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 px-1">
        <div className="flex items-center gap-2">
          {/* Swap Term & Definition */}
          <button
            onClick={handleSwapSides}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Swap which side is shown first"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" />
            <span>{termFirst ? 'Term First' : 'Definition First'}</span>
          </button>

          {/* Starred filter button */}
          {starredCardsCount > 0 && (
            <button
              onClick={() => setShowStarredOnly(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                showStarredOnly 
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700' 
                  : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 border-transparent'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showStarredOnly ? 'fill-current text-amber-500' : ''}`} />
              <span>Study Starred ({starredCardsCount})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Shuffle Toggle */}
          <button
            onClick={handleShuffleToggle}
            className={`p-1.5 rounded-lg transition-colors ${
              isShuffled 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
            title="Shuffle cards"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3D Flashcard Container */}
      <div 
        className="w-full h-80 sm:h-96 perspective-1000 select-none cursor-pointer group"
        onClick={handleFlip}
      >
        <div 
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-white dark:bg-[#151928] border-2 border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 flex flex-col justify-between shadow-xl shadow-slate-200/40 dark:shadow-black/40 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors">
            {/* Front Header */}
            <div className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-400 uppercase">
              <span>{frontLabel}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleSpeak(frontText, frontLang, e)}
                  className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => handleToggleStar(currentCard, e)}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                  title="Star this card (S)"
                >
                  <Star className={`w-5 h-5 ${currentCard.starred ? 'fill-current text-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Front Content */}
            <div className="flex-1 flex items-center justify-center text-center px-4 overflow-y-auto">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
                {frontText}
              </span>
            </div>

            {/* Front Footer hint */}
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Click or Space to flip</span>
              <span className="flex items-center gap-1 text-blue-500 font-semibold">
                <RotateCw className="w-3 h-3" /> Turn over
              </span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-b from-blue-50/50 to-white dark:from-[#171c2e] dark:to-[#121626] border-2 border-blue-400/80 dark:border-blue-600/80 p-8 sm:p-10 flex flex-col justify-between shadow-xl shadow-blue-500/10">
            {/* Back Header */}
            <div className="flex items-center justify-between text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
              <span>{backLabel}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleSpeak(backText, backLang, e)}
                  className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => handleToggleStar(currentCard, e)}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                  title="Star this card (S)"
                >
                  <Star className={`w-5 h-5 ${currentCard.starred ? 'fill-current text-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Back Content */}
            <div className="flex-1 flex items-center justify-center text-center px-4 overflow-y-auto">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                {backText}
              </span>
            </div>

            {/* Back Footer hint */}
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Click or Space to flip</span>
              <span className="flex items-center gap-1 text-blue-500 font-semibold">
                <RotateCw className="w-3 h-3" /> Turn back
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar & Navigation Controls */}
      <div className="mt-6 flex flex-col gap-4">
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Card <span className="font-extrabold text-slate-800 dark:text-slate-200">{currentIndex + 1}</span> of {cards.length}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-2xl border flex items-center justify-center transition-all ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm active:scale-95'
              }`}
              title="Previous card (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className={`p-3 rounded-2xl border flex items-center justify-center transition-all ${
                currentIndex === cards.length - 1
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                  : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95'
              }`}
              title="Next card (Right Arrow)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            Use <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">←</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">→</kbd> to navigate
          </div>
        </div>
      </div>

      {/* Cards in this set List (Quizlet-style bottom view) */}
      <div className="mt-14 border-t border-slate-200 dark:border-slate-800 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Terms in this set ({set.cards.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click audio or star to study individual terms
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={listSearch}
              onChange={(e) => {
                setListSearch(e.target.value);
                setVisibleCount(60);
              }}
              placeholder="Search terms or definitions..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {(() => {
          const q = listSearch.trim().toLowerCase();
          const filteredList = q
            ? set.cards.filter(c => c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q))
            : set.cards;
          const displayed = filteredList.slice(0, visibleCount);

          return (
            <>
              <div className="flex flex-col gap-3">
                {displayed.map((c, i) => (
                  <div
                    key={c.id}
                    className="bg-white dark:bg-[#121626] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1">
                      <span className="text-xs font-bold text-slate-400 shrink-0 w-8">
                        {i + 1}
                      </span>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                        <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                          {c.term}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {c.definition}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => speakText(c.term, set.termLang)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                        title="Pronounce term"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStar(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                        title="Star card"
                      >
                        <Star className={`w-4 h-4 ${c.starred ? 'fill-current text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredList.length > visibleCount && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 60)}
                    className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
                  >
                    Load more (+60)
                  </button>
                  <button
                    onClick={() => setVisibleCount(filteredList.length)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Show all ({filteredList.length} cards)
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};
