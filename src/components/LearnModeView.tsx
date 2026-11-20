import React, { useState, useEffect, useMemo } from 'react';
import { StudySet, Card, StudyMode } from '../types';
import { 
  ArrowLeft, 
  BrainCircuit, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Volume2, 
  ChevronRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/sound';
import { speakText } from '../utils/speech';

interface LearnModeViewProps {
  set: StudySet;
  onBack: () => void;
  onChangeMode: (mode: StudyMode) => void;
  onUpdateSet: (updatedSet: StudySet) => void;
}

interface CardProgress {
  card: Card;
  correctCount: number; // 0 = new/not studied, 1 = familiar, 2 = mastered
}

export const LearnModeView: React.FC<LearnModeViewProps> = ({
  set,
  onBack,
  onChangeMode,
  onUpdateSet,
}) => {
  // Initialize queue of cards with progress
  const [cardProgress, setCardProgress] = useState<CardProgress[]>(() => {
    return set.cards.map(c => ({
      card: c,
      correctCount: c.familiarity === 'mastered' ? 2 : c.familiarity === 'familiar' ? 1 : 0
    }));
  });

  // Active round queue (batches of 20 for efficient focused study)
  const [queue, setQueue] = useState<number[]>(() => {
    // Indices of cards that are not yet mastered
    const unmastered = set.cards
      .map((c, idx) => ({ c, idx }))
      .filter(x => x.c.familiarity !== 'mastered')
      .map(x => x.idx);
    const pool = unmastered.length > 0 ? unmastered : set.cards.map((_, i) => i);
    return pool.slice(0, 20);
  });

  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isRoundFinished, setIsRoundFinished] = useState<boolean>(false);

  const activeCardIndex = queue[queueIndex];
  const activeCard = set.cards[activeCardIndex];

  // Generate 4 multiple choice options for current card
  const options = useMemo(() => {
    if (!activeCard) return [];
    const correctAnswer = activeCard.definition;
    const others = set.cards.filter(c => c.id !== activeCard.id);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
    const distractors = shuffledOthers.slice(0, 3).map(c => c.definition);

    const allOptions = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
    return allOptions;
  }, [activeCard, set.cards]);

  // Compute counts
  const masteredCount = cardProgress.filter(cp => cp.correctCount >= 2).length;
  const familiarCount = cardProgress.filter(cp => cp.correctCount === 1).length;
  const remainingCount = cardProgress.filter(cp => cp.correctCount === 0).length;
  const totalCards = cardProgress.length;

  const handleSelectOption = (option: string) => {
    if (isAnswered || !activeCard) return;

    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === activeCard.definition;

    if (isCorrect) {
      soundManager.playCorrect();
      setCardProgress(prev => prev.map((cp, idx) => {
        if (idx === activeCardIndex) {
          const nextCount = Math.min(2, cp.correctCount + 1);
          return { ...cp, correctCount: nextCount };
        }
        return cp;
      }));
    } else {
      soundManager.playIncorrect();
      setCardProgress(prev => prev.map((cp, idx) => {
        if (idx === activeCardIndex) {
          return { ...cp, correctCount: 0 }; // reset to remaining
        }
        return cp;
      }));
    }
  };

  const handleContinue = () => {
    if (queueIndex < queue.length - 1) {
      setQueueIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Round completed!
      setIsRoundFinished(true);

      // Check if all cards mastered
      const allMastered = cardProgress.every(cp => cp.correctCount >= 2);
      if (allMastered) {
        soundManager.playVictory();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        soundManager.playMatch();
      }

      // Persist familiarity back into set
      const updatedCards = set.cards.map((c, i) => {
        const p = cardProgress[i];
        const familiarity = p.correctCount >= 2 ? 'mastered' : p.correctCount === 1 ? 'familiar' : 'new';
        return { ...c, familiarity: familiarity as 'new' | 'familiar' | 'mastered' };
      });
      onUpdateSet({ ...set, cards: updatedCards });
    }
  };

  const handleStartNextRound = () => {
    // Queue next batch of cards that are not yet mastered
    const nextQueue = cardProgress
      .map((cp, idx) => ({ cp, idx }))
      .filter(x => x.cp.correctCount < 2)
      .map(x => x.idx);

    if (nextQueue.length === 0) {
      // All mastered, restart full set in rounds of 20
      setCardProgress(set.cards.map(c => ({ card: c, correctCount: 0 })));
      setQueue(set.cards.map((_, i) => i).slice(0, 20));
    } else {
      setQueue(nextQueue.slice(0, 20));
    }

    setQueueIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsRoundFinished(false);
  };

  if (isRoundFinished) {
    const isFullMastery = cardProgress.every(cp => cp.correctCount >= 2);

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-white dark:bg-[#121626] rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
            {isFullMastery ? <Trophy className="w-10 h-10" /> : <BrainCircuit className="w-10 h-10" />}
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            {isFullMastery ? 'Mastery Achieved! 🎉' : 'Round Complete!'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            {isFullMastery 
              ? `You have mastered all ${totalCards} terms in this study set!` 
              : `Great progress! Keep going to lock these concepts into long-term memory.`}
          </p>

          {/* Progress summary stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{masteredCount}</div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Mastered</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{familiarCount}</div>
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">Familiar</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40">
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{remainingCount}</div>
              <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">Remaining</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleStartNextRound}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
            >
              {isFullMastery ? 'Study Again' : 'Continue Learning Remaining Cards'}
            </button>
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeCard) {
    return null;
  }

  const isCurrentCorrect = selectedAnswer === activeCard.definition;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              Learn: {set.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adaptive mastery mode • Question {queueIndex + 1} of {queue.length}
            </p>
          </div>
        </div>

        {/* Familiarity Bar / Counters */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40">
            {masteredCount} Mastered
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800/40">
            {familiarCount} Familiar
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {remainingCount} Left
          </span>
        </div>
      </div>

      {/* Question Card Prompt */}
      <div className="bg-white dark:bg-[#121626] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          <span>TERM</span>
          <button
            onClick={() => speakText(activeCard.term, set.termLang)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
            title="Pronounce term"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-relaxed">
          {activeCard.term}
        </div>
      </div>

      {/* Multiple Choice Options Grid */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {options.map((option, idx) => {
          let btnStyle = 'bg-white dark:bg-[#141828] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/60';

          if (isAnswered) {
            if (option === activeCard.definition) {
              btnStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
            } else if (option === selectedAnswer) {
              btnStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-200 font-bold';
            } else {
              btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-500';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(option)}
              disabled={isAnswered}
              className={`p-4 sm:p-5 rounded-2xl border-2 text-left font-medium text-sm sm:text-base transition-all flex items-start gap-4 ${btnStyle}`}
            >
              <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="flex-1 leading-relaxed">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback & Continue Drawer */}
      {isAnswered && (
        <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 animate-scale-in ${
          isCurrentCorrect 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
        }`}>
          <div className="flex items-center gap-3">
            {isCurrentCorrect ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm">
                {isCurrentCorrect ? 'Nicely done! Correct answer.' : 'Not quite. Here is the correct definition:'}
              </div>
              {!isCurrentCorrect && (
                <div className="text-xs text-rose-700 dark:text-rose-300 font-medium mt-0.5">
                  {activeCard.definition}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shrink-0 active:scale-95 transition-transform"
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
