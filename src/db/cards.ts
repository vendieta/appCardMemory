import { db } from './database';

export interface Card {
  id: number;
  section_id: number;
  front: string;
  back: string;
  created_at: string;
}

export interface CardWithProgress extends Card {
  box: number;
  next_review: string;
  last_reviewed: string | null;
  total_correct: number;
  total_incorrect: number;
}

export function getCardsBySection(sectionId: number): CardWithProgress[] {
  return db.getAllSync<CardWithProgress>(`
    SELECT c.*, cp.box, cp.next_review, cp.last_reviewed, cp.total_correct, cp.total_incorrect
    FROM cards c
    LEFT JOIN card_progress cp ON c.id = cp.card_id
    WHERE c.section_id = ?
    ORDER BY c.created_at ASC
  `, [sectionId]);
}

export function addCard(sectionId: number, front: string, back: string): number {
  const result = db.runSync('INSERT INTO cards (section_id, front, back) VALUES (?, ?, ?)', [sectionId, front, back]);
  const cardId = result.lastInsertRowId;
  // Automatically create progress for the new card
  db.runSync('INSERT INTO card_progress (card_id, box, next_review) VALUES (?, 1, date("now"))', [cardId]);
  return cardId;
}

export function deleteCard(id: number): void {
  db.runSync('DELETE FROM cards WHERE id = ?', [id]);
}
