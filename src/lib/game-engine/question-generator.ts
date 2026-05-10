import { Question, GameConfig, GameType } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getWrongAnswers(correctAnswer: number, tableNumber: number, count: number): number[] {
  const wrongAnswers = new Set<number>();
  const maxAnswer = Math.max(tableNumber * 9, correctAnswer + 10);
  const minAnswer = Math.min(1, correctAnswer - 10);
  
  while (wrongAnswers.size < count) {
    let wrong: number;
    const strategy = Math.random();
    
    if (strategy < 0.4) {
      // Close to correct answer
      wrong = correctAnswer + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
    } else if (strategy < 0.7) {
      // Same table, different result
      const otherMultiplier = Math.floor(Math.random() * 9) + 1;
      wrong = tableNumber * otherMultiplier;
    } else {
      // Random in range
      wrong = Math.floor(Math.random() * (maxAnswer - minAnswer + 1)) + minAnswer;
    }
    
    if (wrong !== correctAnswer && wrong > 0) {
      wrongAnswers.add(wrong);
    }
  }
  
  return Array.from(wrongAnswers);
}

export function generateMultipleChoiceQuestion(
  tableNumber: number,
  multiplicand?: number,
  multiplier?: number
): Question {
  const a = multiplicand ?? tableNumber;
  const b = multiplier ?? (Math.floor(Math.random() * 9) + 1);
  const correctAnswer = a * b;
  const wrongAnswers = getWrongAnswers(correctAnswer, tableNumber, 3);
  const options = shuffleArray([correctAnswer, ...wrongAnswers]);

  return {
    id: generateId(),
    tableNumber,
    multiplicand: a,
    multiplier: b,
    correctAnswer,
    options,
    display: `${a} × ${b} = ?`,
  };
}

export function generateTrueFalseQuestion(
  tableNumber: number,
  multiplicand?: number,
  multiplier?: number
): Question {
  const a = multiplicand ?? tableNumber;
  const b = multiplier ?? (Math.floor(Math.random() * 9) + 1);
  const correctAnswer = a * b;
  const isCorrectStatement = Math.random() > 0.4;
  
  let displayedAnswer = correctAnswer;
  if (!isCorrectStatement) {
    const offset = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
    displayedAnswer = correctAnswer + offset;
    if (displayedAnswer === correctAnswer) displayedAnswer = correctAnswer + 1;
  }

  return {
    id: generateId(),
    tableNumber,
    multiplicand: a,
    multiplier: b,
    correctAnswer,
    isTrue: isCorrectStatement,
    display: `${a} × ${b} = ${displayedAnswer}`,
  };
}

export function generateFillBlankQuestion(
  tableNumber: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Question {
  const a = tableNumber;
  const b = Math.floor(Math.random() * 9) + 1;
  const correctAnswer = a * b;
  
  let blankPosition: 'result' | 'multiplicand' | 'multiplier';
  if (difficulty === 'easy') {
    blankPosition = 'result';
  } else if (difficulty === 'medium') {
    blankPosition = Math.random() < 0.6 ? 'result' : (Math.random() < 0.5 ? 'multiplicand' : 'multiplier');
  } else {
    blankPosition = ['result', 'multiplicand', 'multiplier'][Math.floor(Math.random() * 3)] as any;
  }

  let display: string;
  switch (blankPosition) {
    case 'result':
      display = `${a} × ${b} = ___`;
      break;
    case 'multiplicand':
      display = `___ × ${b} = ${correctAnswer}`;
      break;
    case 'multiplier':
      display = `${a} × ___ = ${correctAnswer}`;
      break;
  }

  return {
    id: generateId(),
    tableNumber,
    multiplicand: a,
    multiplier: b,
    correctAnswer: blankPosition === 'result' ? correctAnswer : (blankPosition === 'multiplicand' ? a : b),
    blankPosition,
    display,
  };
}

export function generateMatchingQuestions(
  tableNumber: number,
  count: number = 5
): Question[] {
  const questions: Question[] = [];
  const usedMultipliers = new Set<number>();

  for (let i = 0; i < count; i++) {
    let b: number;
    do {
      b = Math.floor(Math.random() * 9) + 1;
    } while (usedMultipliers.has(b));
    usedMultipliers.add(b);

    const a = tableNumber;
    const correctAnswer = a * b;

    questions.push({
      id: generateId(),
      tableNumber,
      multiplicand: a,
      multiplier: b,
      correctAnswer,
      display: `${a} × ${b}`,
    });
  }

  return questions;
}

export function generateQuestions(config: GameConfig): Question[] {
  const { gameType, tableNumber, questionCount, difficulty } = config;
  const questions: Question[] = [];
  const tables = tableNumber === 'mixed' 
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9] 
    : [tableNumber];

  switch (gameType) {
    case 'multiple-choice':
      for (let i = 0; i < questionCount; i++) {
        const t = tables[Math.floor(Math.random() * tables.length)];
        questions.push(generateMultipleChoiceQuestion(t));
      }
      break;

    case 'true-false':
      for (let i = 0; i < questionCount; i++) {
        const t = tables[Math.floor(Math.random() * tables.length)];
        questions.push(generateTrueFalseQuestion(t));
      }
      break;

    case 'fill-blank':
      for (let i = 0; i < questionCount; i++) {
        const t = tables[Math.floor(Math.random() * tables.length)];
        questions.push(generateFillBlankQuestion(t, difficulty));
      }
      break;

    case 'matching':
      for (const t of tables) {
        questions.push(...generateMatchingQuestions(t, Math.ceil(questionCount / tables.length)));
      }
      break;
  }

  return shuffleArray(questions).slice(0, questionCount);
}

export function getTableQuestions(tableNumber: number, count: number = 10): Question[] {
  const questions: Question[] = [];
  for (let i = 1; i <= 9; i++) {
    questions.push(generateMultipleChoiceQuestion(tableNumber, tableNumber, i));
  }
  return shuffleArray(questions).slice(0, count);
}
