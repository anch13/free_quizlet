export interface Card {
  id: string;
  term: string;
  definition: string;
  starred?: boolean;
  familiarity?: 'new' | 'familiar' | 'mastered';
  correctCount?: number;
  incorrectCount?: number;
}

export interface StudySet {
  id: string;
  title: string;
  description: string;
  category: string;
  termLang: string; // e.g. 'en-US', 'es-ES'
  defLang: string;  // e.g. 'en-US', 'es-ES'
  cards: Card[];
  createdAt: number;
  updatedAt: number;
  highScores?: {
    matchBestTime?: number; // in seconds
  };
}

export type StudyMode = 'dashboard' | 'flashcards' | 'learn' | 'write' | 'test' | 'match' | 'edit';

export interface TestSettings {
  questionCount: number;
  questionTypes: {
    multipleChoice: boolean;
    written: boolean;
    trueFalse: boolean;
    matching: boolean;
  };
  answerWith: 'definition' | 'term';
}

export type TestQuestionType = 'multiple_choice' | 'written' | 'true_false' | 'matching';

export interface TestQuestion {
  id: string;
  type: TestQuestionType;
  card: Card;
  prompt: string;
  correctAnswer: string;
  options?: string[]; // for multiple choice
  tfStatement?: {
    isTrue: boolean;
    displayAnswer: string;
  }; // for true/false
  matchingPairs?: {
    id: string;
    term: string;
    definition: string;
  }[]; // for matching block
  userAnswer?: string;
  userMatchingAnswers?: Record<string, string>; // termId -> definitionId
  isCorrect?: boolean;
}

export interface StudyStats {
  totalSets: number;
  totalCards: number;
  masteredCards: number;
  studyStreakDays: number;
}
