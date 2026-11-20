import React, { useState } from 'react';
import { StudySet, Card } from '../types';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ArrowLeftRight, 
  Copy, 
  FileText, 
  Save, 
  Sparkles,
  Languages
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/speech';
import { soundManager } from '../utils/sound';

interface SetEditorProps {
  initialSet?: StudySet | null;
  onSave: (set: StudySet) => void;
  onCancel: () => void;
  onOpenImport: () => void;
  importedCards?: { term: string; definition: string }[] | null;
  onClearImportedCards?: () => void;
}

export const SetEditor: React.FC<SetEditorProps> = ({
  initialSet,
  onSave,
  onCancel,
  onOpenImport,
  importedCards,
  onClearImportedCards,
}) => {
  const [title, setTitle] = useState(initialSet?.title || '');
  const [description, setDescription] = useState(initialSet?.description || '');
  const [category, setCategory] = useState(initialSet?.category || 'General');
  const [termLang, setTermLang] = useState(initialSet?.termLang || 'en-US');
  const [defLang, setDefLang] = useState(initialSet?.defLang || 'en-US');

  const [cards, setCards] = useState<Card[]>(() => {
    if (initialSet && initialSet.cards.length > 0) {
      return [...initialSet.cards];
    }
    // Default 4 empty rows
    return [
      { id: 'c-1', term: '', definition: '', familiarity: 'new' },
      { id: 'c-2', term: '', definition: '', familiarity: 'new' },
      { id: 'c-3', term: '', definition: '', familiarity: 'new' },
      { id: 'c-4', term: '', definition: '', familiarity: 'new' },
    ];
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If cards are imported from modal, append or replace
  React.useEffect(() => {
    if (importedCards && importedCards.length > 0) {
      const newItems: Card[] = importedCards.map((c, i) => ({
        id: `imported-${Date.now()}-${i}`,
        term: c.term,
        definition: c.definition,
        familiarity: 'new'
      }));

      // If user had purely empty cards, replace them; otherwise append
      const onlyEmpty = cards.every(c => !c.term.trim() && !c.definition.trim());
      if (onlyEmpty) {
        setCards(newItems);
      } else {
        setCards(prev => [...prev, ...newItems]);
      }

      if (onClearImportedCards) {
        onClearImportedCards();
      }
    }
  }, [importedCards, cards, onClearImportedCards]);

  const handleAddCard = () => {
    setCards(prev => [
      ...prev,
      {
        id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        term: '',
        definition: '',
        familiarity: 'new',
      }
    ]);
  };

  const handleUpdateCard = (id: string, field: 'term' | 'definition', value: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDeleteCard = (id: string) => {
    if (cards.length <= 1) {
      setErrorMsg('A study set must have at least one card.');
      return;
    }
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const handleDuplicateCard = (index: number) => {
    const target = cards[index];
    const newCard: Card = {
      ...target,
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    const next = [...cards];
    next.splice(index + 1, 0, newCard);
    setCards(next);
  };

  const handleSwapCard = (id: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, term: c.definition, definition: c.term };
      }
      return c;
    }));
  };

  const handleSwapAll = () => {
    soundManager.playFlip();
    setCards(prev => prev.map(c => ({
      ...c,
      term: c.definition,
      definition: c.term,
    })));
    // Also swap default languages
    const oldTermLang = termLang;
    setTermLang(defLang);
    setDefLang(oldTermLang);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a title for your study set.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Filter out completely blank cards
    const validCards = cards.filter(c => c.term.trim() || c.definition.trim());

    if (validCards.length < 1) {
      setErrorMsg('Please add at least one card with a term and definition.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const newSet: StudySet = {
      id: initialSet?.id || `set-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      termLang,
      defLang,
      cards: validCards,
      createdAt: initialSet?.createdAt || Date.now(),
      updatedAt: Date.now(),
      highScores: initialSet?.highScores || {},
    };

    soundManager.playCorrect();
    onSave(newSet);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top action header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {initialSet ? 'Edit Study Set' : 'Create a New Study Set'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {cards.length} cards total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Import Text</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Set</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Set Metadata Details */}
      <div className="bg-white dark:bg-[#121626] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 mb-8">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            TITLE <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="Enter a title, like 'Biology 101: Cells' or 'Spanish Verbs'"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              DESCRIPTION
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              CATEGORY / TAG
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Languages, Science, History, Tech"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Audio Language Pronunciation Pickers */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-blue-500" />
              TERM AUDIO LANGUAGE
            </label>
            <select
              value={termLang}
              onChange={(e) => setTermLang(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              DEFINITION AUDIO LANGUAGE
            </label>
            <select
              value={defLang}
              onChange={(e) => setDefLang(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Global Card Action Bar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
          Cards ({cards.length})
        </h2>

        <button
          onClick={handleSwapAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Swap all terms and definitions"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" />
          <span>Swap All Terms & Definitions</span>
        </button>
      </div>

      {/* Dynamic Cards List */}
      <div className="space-y-4 mb-8">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="bg-white dark:bg-[#121626] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative group"
          >
            {/* Card row header */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold">
                {index + 1}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSwapCard(card.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Swap term and definition for this card"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDuplicateCard(index)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Duplicate card"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={card.term}
                  onChange={(e) => handleUpdateCard(card.id, 'term', e.target.value)}
                  placeholder="Enter term..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 px-1">
                  TERM
                </span>
              </div>

              <div>
                <input
                  type="text"
                  value={card.definition}
                  onChange={(e) => handleUpdateCard(card.id, 'definition', e.target.value)}
                  placeholder="Enter definition..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 px-1">
                  DEFINITION
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Card Button */}
      <button
        onClick={handleAddCard}
        className="w-full py-4 rounded-2xl bg-white dark:bg-[#121626] border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm mb-10"
      >
        <Plus className="w-5 h-5" />
        <span>+ Add Card</span>
      </button>

      {/* Bottom Save bar */}
      <div className="sticky bottom-6 z-20 bg-white/90 dark:bg-[#0a092d]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save and Finish</span>
        </button>
      </div>
    </div>
  );
};
