import { getStreak, updateStreak } from '../db/streak';

export function initializeStreakOnStartup() {
  const streak = getStreak();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let needsUpdate = false;
  let newCurrentStreak = streak.current_streak;
  let newCardsCorrect = streak.cards_correct_today;

  if (streak.last_study_date && streak.last_study_date < yesterdayStr) {
    // Missed a day or more, reset current streak and daily progress
    newCurrentStreak = 0;
    newCardsCorrect = 0;
    needsUpdate = true;
  } else if (streak.last_study_date && streak.last_study_date !== today) {
    // New day, reset daily progress but keep streak intact for now (until they reach 10 today)
    newCardsCorrect = 0;
    needsUpdate = true;
  }

  if (needsUpdate) {
    updateStreak(newCurrentStreak, streak.best_streak, newCardsCorrect, streak.last_study_date || today);
  }
}

export function incrementCardsCorrectToday() {
  const streak = getStreak();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  let newCardsCorrect = streak.cards_correct_today + 1;
  let newStreak = streak.current_streak;
  let newBestStreak = streak.best_streak;
  let newLastStudyDate = streak.last_study_date;

  // We hit the goal for today!
  if (newCardsCorrect === 10) {
    if (streak.last_study_date === yesterdayStr) {
      // Kept the streak from yesterday
      newStreak++;
    } else if (!streak.last_study_date || streak.last_study_date < yesterdayStr) {
      // Starting a new streak
      newStreak = 1;
    } else if (streak.last_study_date === today && streak.cards_correct_today < 10) {
      // E.g. they studied yesterday, but last_study_date was somehow today?
      // Wait, if last_study_date is updated ONLY when hitting 10:
      // If we are hitting 10 today for the first time
      newStreak++; // Assuming they are continuing
    }
    
    newLastStudyDate = today;
    newBestStreak = Math.max(newStreak, newBestStreak);
  }

  // If we already hit 10 today, newCardsCorrect will be > 10, no further streak increments
  
  updateStreak(newStreak, newBestStreak, newCardsCorrect, newLastStudyDate || today);
}
