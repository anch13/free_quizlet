import { StudySet, Card, TestSettings, TestQuestion } from '../types';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateTestQuestions(set: StudySet, settings: TestSettings): TestQuestion[] {
  const cards = shuffleArray(set.cards);
  const totalWanted = Math.min(settings.questionCount, cards.length);
  const selectedCards = cards.slice(0, totalWanted);

  const activeTypes: ('multiple_choice' | 'written' | 'true_false' | 'matching')[] = [];
  if (settings.questionTypes.multipleChoice) activeTypes.push('multiple_choice');
  if (settings.questionTypes.written) activeTypes.push('written');
  if (settings.questionTypes.trueFalse) activeTypes.push('true_false');
  if (settings.questionTypes.matching && selectedCards.length >= 4) activeTypes.push('matching');

  // fallback if none selected
  if (activeTypes.length === 0) activeTypes.push('multiple_choice');

  const questions: TestQuestion[] = [];
  const answerWith = settings.answerWith;

  // If matching is selected, we reserve 4-5 cards for a matching block if possible
  let matchingCardsCount = 0;
  if (activeTypes.includes('matching') && selectedCards.length >= 4) {
    matchingCardsCount = Math.min(5, Math.floor(selectedCards.length / 2));
    const matchingBlock = selectedCards.slice(0, matchingCardsCount);
    
    questions.push({
      id: 'q-matching-block',
      type: 'matching',
      card: matchingBlock[0],
      prompt: 'Match each term with its corresponding definition:',
      correctAnswer: 'matched',
      matchingPairs: matchingBlock.map(c => ({
        id: c.id,
        term: c.term,
        definition: c.definition
      }))
    });
  }

  const remainingCards = selectedCards.slice(matchingCardsCount);
  const nonMatchingTypes = activeTypes.filter(t => t !== 'matching');
  const typePool = nonMatchingTypes.length > 0 ? nonMatchingTypes : ['multiple_choice'];

  remainingCards.forEach((card, index) => {
    const qType = typePool[index % typePool.length];
    const prompt = answerWith === 'definition' ? card.term : card.definition;
    const correctAnswer = answerWith === 'definition' ? card.definition : card.term;

    if (qType === 'multiple_choice') {
      // Pick 3 distractors from all other cards in set
      const otherCards = set.cards.filter(c => c.id !== card.id);
      const shuffledOthers = shuffleArray(otherCards);
      const distractors = shuffledOthers.slice(0, 3).map(c => 
        answerWith === 'definition' ? c.definition : c.term
      );

      const options = shuffleArray([correctAnswer, ...distractors]);

      questions.push({
        id: `q-${card.id}-${index}`,
        type: 'multiple_choice',
        card,
        prompt,
        correctAnswer,
        options,
      });
    } else if (qType === 'true_false') {
      const isTrue = Math.random() > 0.4;
      let displayAnswer = correctAnswer;
      if (!isTrue) {
        const otherCards = set.cards.filter(c => c.id !== card.id);
        if (otherCards.length > 0) {
          const fake = otherCards[Math.floor(Math.random() * otherCards.length)];
          displayAnswer = answerWith === 'definition' ? fake.definition : fake.term;
        } else {
          displayAnswer = 'N/A';
        }
      }

      questions.push({
        id: `q-${card.id}-${index}`,
        type: 'true_false',
        card,
        prompt,
        correctAnswer: isTrue ? 'True' : 'False',
        tfStatement: {
          isTrue,
          displayAnswer
        }
      });
    } else {
      // Written question
      questions.push({
        id: `q-${card.id}-${index}`,
        type: 'written',
        card,
        prompt,
        correctAnswer,
      });
    }
  });

  return questions;
}
