import React, { useState, useEffect, useRef } from 'react';
import { StudySet, StudyMode } from '../types';
import { 
  ArrowLeft, 
  Gamepad2, 
  Timer, 
  Trophy, 
  RotateCcw, 
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/sound';

interface MatchModeViewProps {
  set: StudySet;
  onBack: () => void;
  onChangeMode: (mode: StudyMode) => void;
  onSaveHighScore: (newBestTime: number) => void;
}

interface MatchTile {
  id: string; // unique tile id
  cardId: string;
  type: 'term' | 'definition';
  text: string;
  isMatched: boolean;
}

export const MatchModeView: React.FC<MatchModeViewProps> = ({
  set,
  onBack,
  onChangeMode,
  onSaveHighScore,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tiles, setTiles] = useState<MatchTile[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [wrongTileIds, setWrongTileIds] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [penaltyMessage, setPenaltyMessage] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  // Setup game
  const initGame = () => {
    // Select 6 random cards (or all if fewer)
    const shuffledCards = [...set.cards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffledCards.slice(0, 6);

    const generatedTiles: MatchTile[] = [];
    selectedCards.forEach(card => {
      generatedTiles.push({
        id: `term-${card.id}`,
        cardId: card.id,
        type: 'term',
        text: card.term,
        isMatched: false,
      });
      generatedTiles.push({
        id: `def-${card.id}`,
        cardId: card.id,
        type: 'definition',
        text: card.definition,
        isMatched: false,
      });
    });

    // Shuffle tiles randomly
    setTiles(generatedTiles.sort(() => Math.random() - 0.5));
    setSelectedTileId(null);
    setWrongTileIds([]);
    setElapsedTime(0);
    setIsCompleted(false);
    setIsPlaying(true);
    setPenaltyMessage(null);
  };

  // Stopwatch timer
  useEffect(() => {
    if (isPlaying && !isCompleted) {
      const startTime = Date.now() - elapsedTime * 1000;
      timerRef.current = window.setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isCompleted]);

  const handleTileClick = (tile: MatchTile) => {
    if (!isPlaying || isCompleted || tile.isMatched || wrongTileIds.length > 0) return;

    // If no tile selected, select this one
    if (!selectedTileId) {
      setSelectedTileId(tile.id);
      soundManager.playFlip();
      return;
    }

    // If clicking the same tile, deselect
    if (selectedTileId === tile.id) {
      setSelectedTileId(null);
      return;
    }

    // Two tiles selected: check if they match
    const firstTile = tiles.find(t => t.id === selectedTileId);
    if (!firstTile) return;

    if (firstTile.cardId === tile.cardId && firstTile.type !== tile.type) {
      // MATCH!
      soundManager.playMatch();
      const updatedTiles = tiles.map(t => {
        if (t.id === firstTile.id || t.id === tile.id) {
          return { ...t, isMatched: true };
        }
        return t;
      });

      setTiles(updatedTiles);
      setSelectedTileId(null);

      // Check if all tiles matched
      const allDone = updatedTiles.every(t => t.isMatched);
      if (allDone) {
        setIsCompleted(true);
        soundManager.playVictory();
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });

        // Save high score if better
        const finalTime = Number(elapsedTime.toFixed(1));
        if (!set.highScores?.matchBestTime || finalTime < set.highScores.matchBestTime) {
          onSaveHighScore(finalTime);
        }
      }
    } else {
      // WRONG MATCH
      soundManager.playIncorrect();
      setWrongTileIds([firstTile.id, tile.id]);
      setPenaltyMessage('+1.0s penalty!');
      // Apply 1s penalty to timer
      setElapsedTime(prev => prev + 1.0);

      setTimeout(() => {
        setWrongTileIds([]);
        setSelectedTileId(null);
        setPenaltyMessage(null);
      }, 600);
    }
  };

  const bestTime = set.highScores?.matchBestTime;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              Match Game: {set.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear all tiles as fast as possible by pairing terms and definitions
            </p>
          </div>
        </div>

        {/* Stopwatch & Best Score */}
        <div className="flex items-center gap-3">
          {bestTime && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800/40 hidden sm:flex">
              <Trophy className="w-3.5 h-3.5 text-purple-500" />
              <span>Record: {bestTime.toFixed(1)}s</span>
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <Timer className="w-5 h-5 text-blue-500" />
            <span className="font-mono text-xl font-black text-slate-900 dark:text-white">
              {elapsedTime.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {penaltyMessage && (
        <div className="text-center font-bold text-xs text-rose-500 animate-pulse mb-2">
          {penaltyMessage}
        </div>
      )}

      {/* Game Area */}
      {!isPlaying ? (
        <div className="max-w-md mx-auto text-center py-16 bg-white dark:bg-[#121626] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
            <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            Ready to Play Match?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            Make everything disappear! Drag or click matching terms and definitions to eliminate them against the clock.
          </p>

          <button
            onClick={initGame}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-xl shadow-blue-500/30 transition-all active:scale-95"
          >
            Start Game
          </button>
        </div>
      ) : isCompleted ? (
        <div className="max-w-md mx-auto text-center py-14 bg-white dark:bg-[#121626] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl animate-scale-in">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            Victory!
          </h2>
          <div className="font-mono text-4xl font-black text-blue-600 dark:text-blue-400 my-4">
            {elapsedTime.toFixed(1)}s
          </div>

          {bestTime && elapsedTime <= bestTime ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 font-bold text-xs mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              New Personal Best Record!
            </div>
          ) : (
            <div className="text-xs text-slate-400 mb-6 font-semibold">
              Personal Best: {bestTime ? `${bestTime.toFixed(1)}s` : `${elapsedTime.toFixed(1)}s`}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={initGame}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="w-full py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map((tile) => {
            const isSelected = selectedTileId === tile.id;
            const isWrong = wrongTileIds.includes(tile.id);

            if (tile.isMatched) {
              return (
                <div 
                  key={tile.id} 
                  className="h-28 sm:h-32 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/40 opacity-0 transition-opacity duration-300 pointer-events-none"
                />
              );
            }

            let styleCls = 'bg-white dark:bg-[#141828] border-2 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm';

            if (isSelected) {
              styleCls = 'bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-500 text-blue-700 dark:text-blue-300 shadow-md scale-95';
            } else if (isWrong) {
              styleCls = 'bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-700 dark:text-rose-300 animate-shake';
            }

            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`h-28 sm:h-32 p-4 rounded-2xl flex items-center justify-center text-center font-bold text-xs sm:text-sm select-none transition-all active:scale-95 overflow-hidden ${styleCls}`}
              >
                <span className="line-clamp-4 leading-snug">
                  {tile.text}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
