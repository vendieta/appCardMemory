import { db } from './database';

export interface Section {
  id: number;
  subject_id: number;
  name: string;
  created_at: string;
}

export function getSectionsBySubject(subjectId: number): Section[] {
  return db.getAllSync<Section>('SELECT * FROM sections WHERE subject_id = ? ORDER BY created_at ASC', [subjectId]);
}

export function getSectionById(id: number): Section | null {
  return db.getFirstSync<Section>('SELECT * FROM sections WHERE id = ?', [id]);
}

export function addSection(subjectId: number, name: string): number {
  const result = db.runSync('INSERT INTO sections (subject_id, name) VALUES (?, ?)', [subjectId, name]);
  return result.lastInsertRowId;
}

export function deleteSection(id: number): void {
  db.runSync('DELETE FROM sections WHERE id = ?', [id]);
}

export function getSectionCardsDueToday(sectionId: number): number {
  const result = db.getFirstSync<{ count: number }>(`
    SELECT COUNT(*) as count 
    FROM cards c
    JOIN card_progress cp ON cp.card_id = c.id
    WHERE c.section_id = ? AND cp.next_review <= date('now')
  `, [sectionId]);
  return result?.count || 0;
}

export function getTotalCardsBySection(sectionId: number): number {
  const result = db.getFirstSync<{ count: number }>(`
    SELECT COUNT(*) as count FROM cards WHERE section_id = ?
  `, [sectionId]);
  return result?.count || 0;
}

export function getSectionStats(sectionId: number): { total: number; mastered: number; progress: number } {
  const result = db.getFirstSync<{ total: number; mastered: number; progress: number }>(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN cp.box >= 4 THEN 1 ELSE 0 END) as mastered,
      SUM(CASE WHEN cp.box > 1 AND cp.box < 4 THEN 1 ELSE 0 END) as progress
    FROM cards c
    LEFT JOIN card_progress cp ON c.id = cp.card_id
    WHERE c.section_id = ?
  `, [sectionId]);
  return result || { total: 0, mastered: 0, progress: 0 };
}
