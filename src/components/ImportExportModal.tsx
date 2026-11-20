import React, { useState, useMemo } from 'react';
import { StudySet } from '../types';
import { 
  X, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Database,
  Sparkles
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSet?: StudySet | null;
  allSets: StudySet[];
  onImportCardsToEditor?: (cards: { term: string; definition: string }[]) => void;
  onRestoreAllSets: (sets: StudySet[]) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  activeSet,
  allSets,
  onImportCardsToEditor,
  onRestoreAllSets,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'backup'>('import');

  // Import state
  const [inputText, setInputText] = useState<string>('');
  const [termSeparator, setTermSeparator] = useState<string>('tab'); // 'tab', 'comma', 'dash', 'semicolon'
  const [cardSeparator, setCardSeparator] = useState<string>('newline'); // 'newline', 'semicolon'
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Backup restore file state
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);

  // Parse imported text live
  const parsedCards = useMemo(() => {
    if (!inputText.trim()) return [];

    const cardSplitChar = cardSeparator === 'newline' ? '\n' : ';';
    const lines = inputText.split(cardSplitChar);

    const results: { term: string; definition: string }[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let parts: string[] = [];

      if (termSeparator === 'tab') {
        parts = trimmed.split('\t');
      } else if (termSeparator === 'comma') {
        // Simple comma split
        parts = trimmed.split(',');
      } else if (termSeparator === 'dash') {
        parts = trimmed.split(' - ');
      } else if (termSeparator === 'semicolon') {
        parts = trimmed.split(';');
      }

      if (parts.length >= 2) {
        const term = parts[0].trim();
        const definition = parts.slice(1).join(' ').trim();
        if (term || definition) {
          results.push({ term, definition });
        }
      } else if (parts.length === 1 && parts[0].trim()) {
        results.push({ term: parts[0].trim(), definition: '' });
      }
    });

    return results;
  }, [inputText, termSeparator, cardSeparator]);

  if (!isOpen) return null;

  const handleApplyImport = () => {
    if (parsedCards.length === 0) return;
    if (onImportCardsToEditor) {
      onImportCardsToEditor(parsedCards);
      soundManager.playCorrect();
      onClose();
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStatus(label);
      soundManager.playMatch();
      setTimeout(() => setCopiedStatus(null), 2000);
    });
  };

  // Export content generation for activeSet
  const targetSet = activeSet || allSets[0];
  const tsvExport = targetSet 
    ? targetSet.cards.map(c => `${c.term}\t${c.definition}`).join('\n') 
    : '';
  const csvExport = targetSet 
    ? targetSet.cards.map(c => `"${c.term.replace(/"/g, '""')}","${c.definition.replace(/"/g, '""')}"`).join('\n') 
    : '';

  // Download full JSON backup
  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allSets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `quizlet_free_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    soundManager.playMatch();
  };

  // Restore from JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError(null);
    setRestoreSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].cards) {
          onRestoreAllSets(parsed);
          setRestoreSuccess(`Successfully restored ${parsed.length} study sets!`);
          soundManager.playVictory();
        } else {
          setRestoreError('Invalid backup file format.');
        }
      } catch (err) {
        setRestoreError('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-scale-in">
      <div className="bg-white dark:bg-[#121626] rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Import & Export Data
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Copy-paste cards or backup your entire library
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2">
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Import Text (Quizlet/CSV)
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Export Cards
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'backup'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Backup & Restore
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Copy and paste your data here from Quizlet, Google Sheets, Excel, or Word:
              </p>

              <textarea
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Term 1	Definition 1&#10;Term 2	Definition 2&#10;Term 3	Definition 3"
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Delimiter Options */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">
                    Between term and definition:
                  </label>
                  <select
                    value={termSeparator}
                    onChange={(e) => setTermSeparator(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="tab">Tab (Quizlet default)</option>
                    <option value="comma">Comma (,)</option>
                    <option value="dash">Dash ( - )</option>
                    <option value="semicolon">Semicolon (;)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">
                    Between cards:
                  </label>
                  <select
                    value={cardSeparator}
                    onChange={(e) => setCardSeparator(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="newline">New Line</option>
                    <option value="semicolon">Semicolon (;)</option>
                  </select>
                </div>
              </div>

              {/* Live Preview */}
              {parsedCards.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Preview: {parsedCards.length} cards detected
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800 text-xs">
                    {parsedCards.slice(0, 5).map((c, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0 w-28 truncate">{c.term}</span>
                        <span className="text-slate-500 dark:text-slate-400 truncate">{c.definition}</span>
                      </div>
                    ))}
                    {parsedCards.length > 5 && (
                      <div className="text-[11px] text-slate-400 italic">
                        + {parsedCards.length - 5} more cards...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Export cards from <span className="font-bold">{targetSet?.title || 'Selected set'}</span> for Quizlet, Anki, or spreadsheets:
              </p>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tab-Separated (Quizlet / Anki Format)
                  </span>
                  <button
                    onClick={() => copyToClipboard(tsvExport, 'tsv')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    {copiedStatus === 'tsv' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedStatus === 'tsv' ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={4}
                  value={tsvExport}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    CSV Format
                  </span>
                  <button
                    onClick={() => copyToClipboard(csvExport, 'csv')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    {copiedStatus === 'csv' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedStatus === 'csv' ? 'Copied!' : 'Copy CSV'}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={4}
                  value={csvExport}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">
                  Full Library Backup
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                  Export all your study sets, cards, progress, and high scores into a single portable JSON file.
                </p>
                <button
                  onClick={handleDownloadBackup}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Backup (.json)
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Restore from Backup
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Upload a previously exported backup file to restore your sets.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />

                {restoreSuccess && (
                  <div className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {restoreSuccess}
                  </div>
                )}
                {restoreError && (
                  <div className="mt-3 text-xs font-bold text-rose-600 dark:text-rose-400">
                    {restoreError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>

          {activeTab === 'import' && (
            <button
              onClick={handleApplyImport}
              disabled={parsedCards.length === 0}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-blue-500/20"
            >
              Add {parsedCards.length} Cards to Set
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
