import { db } from './database';

export interface Subject {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export function getSubjects(): Subject[] {
  return db.getAllSync<Subject>('SELECT * FROM subjects ORDER BY created_at DESC');
}

export function getSubjectById(id: number): Subject | null {
  return db.getFirstSync<Subject>('SELECT * FROM subjects WHERE id = ?', [id]);
}

export function addSubject(name: string, color: string): number {
  const result = db.runSync('INSERT INTO subjects (name, color) VALUES (?, ?)', [name, color]);
  return result.lastInsertRowId;
}

export function deleteSubject(id: number): void {
  db.runSync('DELETE FROM subjects WHERE id = ?', [id]);
}

export function getSubjectCardsDueToday(subjectId: number): number {
  const result = db.getFirstSync<{ count: number }>(`
    SELECT COUNT(*) as count 
    FROM cards c
    JOIN sections s ON c.section_id = s.id
    JOIN card_progress cp ON cp.card_id = c.id
    WHERE s.subject_id = ? AND cp.next_review <= date('now')
  `, [subjectId]);
  return result?.count || 0;
}

export function getSubjectTotalCards(subjectId: number): number {
  const result = db.getFirstSync<{ count: number }>(`
    SELECT COUNT(*) as count 
    FROM cards c
    JOIN sections s ON c.section_id = s.id
    WHERE s.subject_id = ?
  `, [subjectId]);
  return result?.count || 0;
}

export function getSubjectSectionCount(subjectId: number): number {
  const result = db.getFirstSync<{ count: number }>(`
    SELECT COUNT(*) as count 
    FROM sections
    WHERE subject_id = ?
  `, [subjectId]);
  return result?.count || 0;
}
