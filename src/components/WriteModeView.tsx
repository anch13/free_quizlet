import React, { useState, useEffect, useRef } from 'react';
import { StudySet, Card, StudyMode } from '../types';
import { 
  ArrowLeft, 
  PenTool, 
  Check, 
  X, 
  Volume2, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/sound';
import { speakText } from '../utils/speech';

interface WriteModeViewProps {
  set: StudySet;
  onBack: () => void;
  onChangeMode: (mode: StudyMode) => void;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const WriteModeView: React.FC<WriteModeViewProps> = ({
  set,
  onBack,
  onChangeMode,
}) => {
  const [cards] = useState<Card[]>(() => [...set.cards].sort(() => Math.random() - 0.5).slice(0, Math.min(25, set.cards.length)));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [correctStreak, setCorrectStreak] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [history, setHistory] = useState<{ card: Card; userAnswer: string; isCorrect: boolean }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (!isSubmitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isSubmitted]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim() || isSubmitted) return;

    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(currentCard.term);

    const matches = normalizedUser === normalizedCorrect;
    setIsCorrect(matches);
    setIsSubmitted(true);

    if (matches) {
      soundManager.playCorrect();
      setCorrectStreak(prev => prev + 1);
    } else {
      soundManager.playIncorrect();
      setCorrectStreak(0);
    }

    setHistory(prev => [...prev, { card: currentCard, userAnswer, isCorrect: matches }]);
  };

  const handleOverrideCorrect = () => {
    soundManager.playCorrect();
    setIsCorrect(true);
    setCorrectStreak(prev => prev + 1);
    setHistory(prev => {
      const copy = [...prev];
      copy[copy.length - 1].isCorrect = true;
      return copy;
    });
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setIsSubmitted(false);
      setIsCorrect(false);
    } else {
      setIsFinished(true);
      soundManager.playVictory();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer('');
    setIsSubmitted(false);
    setIsCorrect(false);
    setCorrectStreak(0);
    setIsFinished(false);
    setHistory([]);
  };

  if (isFinished) {
    const totalCorrect = history.filter(h => h.isCorrect).length;
    const scorePercent = Math.round((totalCorrect / cards.length) * 100);

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-white dark:bg-[#121626] rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <PenTool className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Write Practice Complete!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            You scored {totalCorrect} out of {cards.length} ({scorePercent}%)
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
            >
              Practice Again
            </button>
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Write Mode
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type the matching term • {currentIndex + 1} of {cards.length}
            </p>
          </div>
        </div>

        {correctStreak > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 font-bold text-xs">
            <span>🔥 {correctStreak} streak</span>
          </div>
        )}
      </div>

      {/* Definition Prompt Box */}
      <div className="bg-white dark:bg-[#121626] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md mb-6">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          DEFINITION
        </div>
        <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
          {currentCard.definition}
        </div>
      </div>

      {/* Answer Input or Feedback Box */}
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              TYPE THE MATCHING TERM:
            </label>
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter your answer..."
              className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#141828] border-2 border-slate-200 dark:border-slate-800 focus:border-blue-500 text-slate-900 dark:text-white text-base font-semibold shadow-sm focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setUserAnswer("Don't know");
                handleSubmit();
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Don't know? Give up
            </button>

            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-sm shadow-md transition-all"
            >
              Answer
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 animate-scale-in">
          {/* Result Banner */}
          <div className={`p-6 rounded-3xl border-2 ${
            isCorrect 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-base">
                {isCorrect ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span>Exact match! Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-rose-600" />
                    <span>Study this one!</span>
                  </>
                )}
              </div>

              <button
                onClick={() => speakText(currentCard.term, set.termLang)}
                className="p-1.5 rounded-lg bg-white/60 dark:bg-black/20 hover:bg-white text-slate-700 dark:text-slate-200 transition-colors"
                title="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                  Your Answer:
                </div>
                <div className={`font-semibold ${!isCorrect ? 'line-through' : ''}`}>
                  {userAnswer || '(blank)'}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                  Correct Answer:
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {currentCard.term}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            {!isCorrect ? (
              <button
                onClick={handleOverrideCorrect}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Override: I was right!
              </button>
            ) : <div />}

            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
