import { db } from './database';

export interface StreakInfo {
  id: number;
  current_streak: number;
  best_streak: number;
  last_study_date: string | null;
  cards_correct_today: number;
}

export function getStreak(): StreakInfo {
  let streak = db.getFirstSync<StreakInfo>('SELECT * FROM streak WHERE id = 1');
  if (!streak) {
    db.runSync('INSERT INTO streak (id, current_streak, best_streak, cards_correct_today) VALUES (1, 0, 0, 0)');
    streak = db.getFirstSync<StreakInfo>('SELECT * FROM streak WHERE id = 1');
  }
  return streak!;
}

export function updateStreak(currentStreak: number, bestStreak: number, cardsCorrectToday: number, lastStudyDate: string) {
  db.runSync(`
    UPDATE streak
    SET current_streak = ?,
        best_streak = ?,
        cards_correct_today = ?,
        last_study_date = ?
    WHERE id = 1
  `, [currentStreak, bestStreak, cardsCorrectToday, lastStudyDate]);
}
