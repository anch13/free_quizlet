import React, { useState } from 'react';
import { 
  StudySet, 
  StudyMode, 
  TestSettings, 
  TestQuestion 
} from '../types';
import { 
  ArrowLeft, 
  ClipboardCheck, 
  Check, 
  X, 
  RotateCcw, 
  Sliders, 
  Trophy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateTestQuestions } from '../utils/testGenerator';
import { soundManager } from '../utils/sound';

interface TestModeViewProps {
  set: StudySet;
  onBack: () => void;
  onChangeMode: (mode: StudyMode) => void;
}

export const TestModeView: React.FC<TestModeViewProps> = ({
  set,
  onBack,
  onChangeMode,
}) => {
  // Test Settings State
  const [isConfiguring, setIsConfiguring] = useState<boolean>(true);
  const [settings, setSettings] = useState<TestSettings>({
    questionCount: Math.min(20, set.cards.length),
    questionTypes: {
      multipleChoice: true,
      written: true,
      trueFalse: true,
      matching: set.cards.length >= 4,
    },
    answerWith: 'definition',
  });

  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, Record<string, string>>>({}); // qId -> { cardId: targetCardId }

  const handleStartTest = () => {
    const generated = generateTestQuestions(set, settings);
    setQuestions(generated);
    setUserAnswers({});
    setMatchingAnswers({});
    setIsSubmitted(false);
    setIsConfiguring(false);
    soundManager.playFlip();
  };

  const handleSelectMC = (questionId: string, option: string) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSelectTF = (questionId: string, choice: 'True' | 'False') => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: choice }));
  };

  const handleWrittenChange = (questionId: string, val: string) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: val }));
  };

  const handleMatchingSelect = (questionId: string, termId: string, selectedDefCardId: string) => {
    if (isSubmitted) return;
    setMatchingAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [termId]: selectedDefCardId,
      }
    }));
  };

  // Grade test
  const handleGradeTest = () => {
    setIsSubmitted(true);

    // Calculate score
    let correctCount = 0;
    let totalScoreable = 0;

    questions.forEach(q => {
      if (q.type === 'matching' && q.matchingPairs) {
        const userMatches = matchingAnswers[q.id] || {};
        q.matchingPairs.forEach(pair => {
          totalScoreable += 1;
          if (userMatches[pair.id] === pair.id) {
            correctCount += 1;
          }
        });
      } else {
        totalScoreable += 1;
        const ans = (userAnswers[q.id] || '').trim().toLowerCase();
        const correct = q.correctAnswer.trim().toLowerCase();
        if (ans === correct) {
          correctCount += 1;
        }
      }
    });

    const percent = totalScoreable > 0 ? (correctCount / totalScoreable) * 100 : 0;

    if (percent >= 75) {
      soundManager.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      soundManager.playCorrect();
    }
  };

  // Compute final score
  let totalScoreable = 0;
  let correctCount = 0;

  if (isSubmitted) {
    questions.forEach(q => {
      if (q.type === 'matching' && q.matchingPairs) {
        const userMatches = matchingAnswers[q.id] || {};
        q.matchingPairs.forEach(pair => {
          totalScoreable += 1;
          if (userMatches[pair.id] === pair.id) {
            correctCount += 1;
          }
        });
      } else {
        totalScoreable += 1;
        const ans = (userAnswers[q.id] || '').trim().toLowerCase();
        const correct = q.correctAnswer.trim().toLowerCase();
        if (ans === correct) {
          correctCount += 1;
        }
      }
    });
  }

  const scorePercent = totalScoreable > 0 ? Math.round((correctCount / totalScoreable) * 100) : 0;

  if (isConfiguring) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white dark:bg-[#121626] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Test Setup: {set.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize your practice test settings
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Question count */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Number of Questions
                </label>
                <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                  {settings.questionCount} / {set.cards.length}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={set.cards.length}
                value={settings.questionCount}
                onChange={(e) => setSettings({ ...settings, questionCount: Number(e.target.value) })}
                className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Question Types */}
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                Question Types
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.questionTypes.multipleChoice}
                    onChange={(e) => setSettings({
                      ...settings,
                      questionTypes: { ...settings.questionTypes, multipleChoice: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Multiple Choice</span>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.questionTypes.written}
                    onChange={(e) => setSettings({
                      ...settings,
                      questionTypes: { ...settings.questionTypes, written: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Written</span>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.questionTypes.trueFalse}
                    onChange={(e) => setSettings({
                      ...settings,
                      questionTypes: { ...settings.questionTypes, trueFalse: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">True / False</span>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={set.cards.length < 4}
                    checked={settings.questionTypes.matching}
                    onChange={(e) => setSettings({
                      ...settings,
                      questionTypes: { ...settings.questionTypes, matching: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-40"
                  />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Matching {set.cards.length < 4 && '(min 4 cards)'}
                  </span>
                </label>
              </div>
            </div>

            {/* Answer With */}
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                Answer With
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="answerWith"
                    value="definition"
                    checked={settings.answerWith === 'definition'}
                    onChange={() => setSettings({ ...settings, answerWith: 'definition' })}
                    className="text-blue-600"
                  />
                  Definitions
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="answerWith"
                    value="term"
                    checked={settings.answerWith === 'term'}
                    onChange={() => setSettings({ ...settings, answerWith: 'term' })}
                    className="text-blue-600"
                  />
                  Terms
                </label>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-500/25 transition-all mt-4"
            >
              Start Practice Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Written, Multiple Choice, True/False, Matching Sections
  const matchingQuestions = questions.filter(q => q.type === 'matching');
  const writtenQuestions = questions.filter(q => q.type === 'written');
  const mcQuestions = questions.filter(q => q.type === 'multiple_choice');
  const tfQuestions = questions.filter(q => q.type === 'true_false');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConfiguring(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Practice Test: {set.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {questions.length} question blocks
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsConfiguring(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5" />
          Settings
        </button>
      </div>

      {/* Test Score Header Banner (if submitted) */}
      {isSubmitted && (
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-scale-in">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-3xl">
              {scorePercent}%
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Test Complete
              </div>
              <div className="text-2xl font-extrabold">
                {scorePercent >= 90 ? 'Outstanding! Grade: A+' : scorePercent >= 75 ? 'Great job! Passed.' : 'Keep practicing!'}
              </div>
              <div className="text-xs text-blue-100 mt-1">
                {correctCount} correct out of {totalScoreable} scoreable questions
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              handleStartTest();
            }}
            className="px-5 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Take Another Test
          </button>
        </div>
      )}

      {/* SECTION: Written Questions */}
      {writtenQuestions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Written Questions ({writtenQuestions.length})
          </h2>

          <div className="space-y-4">
            {writtenQuestions.map((q, idx) => {
              const userAns = userAnswers[q.id] || '';
              const isMatch = isSubmitted && userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              return (
                <div
                  key={q.id}
                  className={`bg-white dark:bg-[#121626] rounded-2xl p-5 border-2 transition-all ${
                    isSubmitted 
                      ? isMatch 
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20' 
                        : 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                    <span>QUESTION {idx + 1}</span>
                    {isSubmitted && (
                      <span className={isMatch ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                        {isMatch ? '✓ Correct' : '✕ Incorrect'}
                      </span>
                    )}
                  </div>

                  <div className="text-base font-bold text-slate-900 dark:text-white mb-3">
                    {q.prompt}
                  </div>

                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={userAns}
                    onChange={(e) => handleWrittenChange(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />

                  {isSubmitted && !isMatch && (
                    <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                      Correct answer: <span className="font-extrabold text-slate-900 dark:text-white">{q.correctAnswer}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: Matching Block */}
      {matchingQuestions.length > 0 && matchingQuestions.map(mq => {
        const pairs = mq.matchingPairs || [];
        const currentMatches = matchingAnswers[mq.id] || {};
        const shuffledDefs = [...pairs].sort(() => Math.random() - 0.5);

        return (
          <div key={mq.id} className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Matching Questions ({pairs.length} pairs)
            </h2>

            <div className="bg-white dark:bg-[#121626] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
              {pairs.map((pair, pIdx) => {
                const selectedDefId = currentMatches[pair.id] || '';
                const isMatch = isSubmitted && selectedDefId === pair.id;

                return (
                  <div key={pair.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-sm font-bold text-slate-900 dark:text-white sm:w-1/2">
                      {pIdx + 1}. {pair.term}
                    </div>

                    <div className="sm:w-1/2">
                      <select
                        disabled={isSubmitted}
                        value={selectedDefId}
                        onChange={(e) => handleMatchingSelect(mq.id, pair.id, e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 border text-slate-800 dark:text-slate-100 focus:outline-none ${
                          isSubmitted
                            ? isMatch ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600'
                            : 'border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <option value="">Select matching definition...</option>
                        {pairs.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.definition}
                          </option>
                        ))}
                      </select>
                      {isSubmitted && !isMatch && (
                        <div className="text-[11px] text-rose-500 font-semibold mt-1">
                          Correct: {pair.definition}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* SECTION: Multiple Choice Questions */}
      {mcQuestions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Multiple Choice Questions ({mcQuestions.length})
          </h2>

          <div className="space-y-4">
            {mcQuestions.map((q, idx) => {
              const selectedOption = userAnswers[q.id];
              const isMatch = isSubmitted && selectedOption === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`bg-white dark:bg-[#121626] rounded-2xl p-5 border-2 transition-all ${
                    isSubmitted 
                      ? isMatch 
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20' 
                        : 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                    <span>QUESTION {idx + 1}</span>
                    {isSubmitted && (
                      <span className={isMatch ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                        {isMatch ? '✓ Correct' : '✕ Incorrect'}
                      </span>
                    )}
                  </div>

                  <div className="text-base font-bold text-slate-900 dark:text-white mb-3">
                    {q.prompt}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options?.map((opt, oIdx) => {
                      const isSelected = selectedOption === opt;
                      let btnCls = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';

                      if (isSelected) {
                        btnCls = 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 font-bold';
                      }

                      if (isSubmitted) {
                        if (opt === q.correctAnswer) {
                          btnCls = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold';
                        } else if (isSelected && !isMatch) {
                          btnCls = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300 font-bold';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isSubmitted}
                          onClick={() => handleSelectMC(q.id, opt)}
                          className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${btnCls}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: True / False Questions */}
      {tfQuestions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            True / False Questions ({tfQuestions.length})
          </h2>

          <div className="space-y-4">
            {tfQuestions.map((q, idx) => {
              const selectedChoice = userAnswers[q.id];
              const isMatch = isSubmitted && selectedChoice === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`bg-white dark:bg-[#121626] rounded-2xl p-5 border-2 transition-all ${
                    isSubmitted 
                      ? isMatch 
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20' 
                        : 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                    <span>QUESTION {idx + 1}</span>
                    {isSubmitted && (
                      <span className={isMatch ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                        {isMatch ? '✓ Correct' : '✕ Incorrect'}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Term: <span className="font-extrabold text-slate-900 dark:text-white">{q.prompt}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    Definition given: <span className="font-bold text-blue-600 dark:text-blue-400">{q.tfStatement?.displayAnswer}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      disabled={isSubmitted}
                      onClick={() => handleSelectTF(q.id, 'True')}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedChoice === 'True'
                          ? isSubmitted 
                            ? q.correctAnswer === 'True' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-rose-500 text-white border-rose-500'
                            : 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      True
                    </button>
                    <button
                      disabled={isSubmitted}
                      onClick={() => handleSelectTF(q.id, 'False')}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedChoice === 'False'
                          ? isSubmitted 
                            ? q.correctAnswer === 'False' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-rose-500 text-white border-rose-500'
                            : 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      False
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Test Button */}
      {!isSubmitted ? (
        <div className="text-center mt-8">
          <button
            onClick={handleGradeTest}
            className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-xl shadow-blue-500/30 transition-all active:scale-95"
          >
            Submit Test & View Score
          </button>
        </div>
      ) : (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              setIsSubmitted(false);
              handleStartTest();
            }}
            className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md"
          >
            Retake Test
          </button>
        </div>
      )}
    </div>
  );
};
