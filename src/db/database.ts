import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('flashcards.db');

export function initDatabase() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#4F46E5',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS card_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL UNIQUE,
      box INTEGER NOT NULL DEFAULT 1,
      next_review TEXT DEFAULT (date('now')),
      last_reviewed TEXT,
      total_correct INTEGER DEFAULT 0,
      total_incorrect INTEGER DEFAULT 0,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS streak (
      id INTEGER PRIMARY KEY DEFAULT 1,
      current_streak INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      last_study_date TEXT,
      cards_correct_today INTEGER DEFAULT 0
    );
  `);

  // Ensure streak table has an initial row
  const hasStreak = db.getFirstSync<{ id: number }>('SELECT id FROM streak WHERE id = 1');
  if (!hasStreak) {
    db.runSync('INSERT INTO streak (id, current_streak, best_streak, cards_correct_today) VALUES (1, 0, 0, 0)');
  }
}
