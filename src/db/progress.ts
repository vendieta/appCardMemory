import { db } from './database';
import { CardWithProgress } from './cards';

export function getDueCardsBySubject(subjectId: number): CardWithProgress[] {
  return db.getAllSync<CardWithProgress>(`
    SELECT c.*, cp.box, cp.next_review, cp.last_reviewed, cp.total_correct, cp.total_incorrect
    FROM cards c
    JOIN sections s ON c.section_id = s.id
    JOIN card_progress cp ON cp.card_id = c.id
    WHERE s.subject_id = ? AND cp.next_review <= date('now')
  `, [subjectId]);
}

export function getDueCardsBySection(sectionId: number): CardWithProgress[] {
  return db.getAllSync<CardWithProgress>(`
    SELECT c.*, cp.box, cp.next_review, cp.last_reviewed, cp.total_correct, cp.total_incorrect
    FROM cards c
    JOIN card_progress cp ON cp.card_id = c.id
    WHERE c.section_id = ? AND cp.next_review <= date('now')
  `, [sectionId]);
}

export function getAllCardsForStudyBySubject(subjectId: number): CardWithProgress[] {
  return db.getAllSync<CardWithProgress>(`
    SELECT c.*, cp.box, cp.next_review, cp.last_reviewed, cp.total_correct, cp.total_incorrect
    FROM cards c
    JOIN sections s ON c.section_id = s.id
    JOIN card_progress cp ON cp.card_id = c.id
    WHERE s.subject_id = ?
    ORDER BY cp.total_incorrect DESC, cp.total_correct ASC, RANDOM()
  `, [subjectId]);
}

export function getAllCardsForStudyBySection(sectionId: number): CardWithProgress[] {
  return db.getAllSync<CardWithProgress>(`
    SELECT c.*, cp.box, cp.next_review, cp.last_reviewed, cp.total_correct, cp.total_incorrect
    FROM cards c
    JOIN card_progress cp ON cp.card_id = c.id
    WHERE c.section_id = ?
    ORDER BY cp.total_incorrect DESC, cp.total_correct ASC, RANDOM()
  `, [sectionId]);
}

export function updateCardProgress(cardId: number, box: number, nextReviewDate: string, isCorrect: boolean) {
  const correctIncrement = isCorrect ? 1 : 0;
  const incorrectIncrement = isCorrect ? 0 : 1;
  
  db.runSync(`
    UPDATE card_progress
    SET box = ?, 
        next_review = ?, 
        last_reviewed = date('now'),
        total_correct = total_correct + ?,
        total_incorrect = total_incorrect + ?
    WHERE card_id = ?
  `, [box, nextReviewDate, correctIncrement, incorrectIncrement, cardId]);
}

export function getMostMasteredCards(limit = 5): CardWithProgress[] {
  return db.getAllSync<CardWithProgress>(`
    SELECT c.*, cp.box, cp.next_review, cp.last_reviewed, cp.total_correct, cp.total_incorrect
    FROM cards c
    JOIN card_progress cp ON cp.card_id = c.id
    WHERE cp.total_correct > 0
    ORDER BY cp.total_correct DESC
    LIMIT ?
  `, [limit]);
}

export function getMostFailedCards(limit = 5): CardWithProgress[] {
  return db.getAllSync<CardWithProgress>(`
    SELECT c.*, cp.box, cp.next_review, cp.last_reviewed, cp.total_correct, cp.total_incorrect
    FROM cards c
    JOIN card_progress cp ON cp.card_id = c.id
    WHERE cp.total_incorrect > 0
    ORDER BY cp.total_incorrect DESC
    LIMIT ?
  `, [limit]);
}
