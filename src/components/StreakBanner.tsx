import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../utils/theme';

interface StreakBannerProps {
  currentStreak: number;
  bestStreak: number;
}

export default function StreakBanner({ currentStreak, bestStreak }: StreakBannerProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.streakBox}>
        <Text style={styles.emoji}>{currentStreak > 0 ? '🔥' : '🧊'}</Text>
        <Text style={[styles.streakText, { color: theme.text }]}>
          {currentStreak} {currentStreak === 1 ? 'día' : 'días'}
        </Text>
      </View>
      <View style={[styles.bestBox, { backgroundColor: theme.background }]}>
        <Text style={[styles.bestText, { color: theme.textSecondary }]}>Mejor racha: {bestStreak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bestBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bestText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
