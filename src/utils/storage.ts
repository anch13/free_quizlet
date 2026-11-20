import { StudySet } from '../types';
import { STARTER_SETS } from '../data/hskStarters';

export { STARTER_SETS };

const SETS_STORAGE_KEY = 'free_quizlet_study_sets_saymei_hsk_v1';
const OLD_STORAGE_KEY_HSK = 'free_quizlet_study_sets_hsk';
const OLD_STORAGE_KEY_LEGACY = 'free_quizlet_study_sets';
const STREAK_STORAGE_KEY = 'free_quizlet_streak';

export function loadStudySets(): StudySet[] {
  try {
    const raw = localStorage.getItem(SETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Check if user had an older version stored with custom user sets
    const checkOldKeys = [OLD_STORAGE_KEY_HSK, OLD_STORAGE_KEY_LEGACY];
    let userCustomSets: StudySet[] = [];

    for (const key of checkOldKeys) {
      const oldRaw = localStorage.getItem(key);
      if (oldRaw) {
        try {
          const oldParsed: StudySet[] = JSON.parse(oldRaw);
          // Preserve any custom sets the user created (id not starting with starter-)
          const custom = oldParsed.filter(s => !s.id.startsWith('starter-'));
          if (custom.length > 0) {
            userCustomSets = custom;
            break;
          }
        } catch {}
      }
    }

    const combined = [...STARTER_SETS, ...userCustomSets];
    saveStudySets(combined);
    return combined;
  } catch (err) {
    console.error('Failed to load study sets, restoring SayMei HSK starters', err);
    return STARTER_SETS;
  }
}

export function saveStudySets(sets: StudySet[]): void {
  try {
    localStorage.setItem(SETS_STORAGE_KEY, JSON.stringify(sets));
  } catch (err) {
    console.error('Failed to save study sets to localStorage', err);
  }
}

export function resetToStarterSets(): StudySet[] {
  saveStudySets(STARTER_SETS);
  return STARTER_SETS;
}

export function recordStudyActivity(): number {
  try {
    const today = new Date().toDateString();
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    let streak = 1;
    let lastDate = '';

    if (raw) {
      const data = JSON.parse(raw);
      streak = data.streak || 1;
      lastDate = data.lastDate || '';

      if (lastDate === today) {
        return streak;
      }

      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
    }

    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify({ streak, lastDate: today }));
    return streak;
  } catch {
    return 1;
  }
}

export function getStudyStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return 1;
    const data = JSON.parse(raw);
    return data.streak || 1;
  } catch {
    return 1;
  }
}
