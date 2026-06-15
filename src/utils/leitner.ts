import { updateCardProgress } from '../db/progress';

// Intervals for Box 1 to 5 (index 1 to 5)
const INTERVALS = [0, 1, 2, 4, 8, 16];

export function getNextReviewDate(box: number): string {
  const date = new Date();
  date.setDate(date.getDate() + INTERVALS[box]);
  return date.toISOString().split('T')[0];
}

export function handleCorrectAnswer(cardId: number, currentBox: number) {
  const newBox = Math.min(currentBox + 1, 5);
  const nextReview = getNextReviewDate(newBox);
  updateCardProgress(cardId, newBox, nextReview, true);
}

export function handleIncorrectAnswer(cardId: number) {
  const newBox = 1;
  const nextReview = getNextReviewDate(newBox); // Review tomorrow
  updateCardProgress(cardId, newBox, nextReview, false);
}
