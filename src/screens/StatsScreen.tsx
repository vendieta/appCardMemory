import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getStreak, StreakInfo } from '../db/streak';
import { getMostMasteredCards, getMostFailedCards } from '../db/progress';
import { CardWithProgress } from '../db/cards';
import ProgressBar from '../components/ProgressBar';
import { useAppTheme } from '../utils/theme';

export default function StatsScreen() {
  const theme = useAppTheme();
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [topMastered, setTopMastered] = useState<CardWithProgress[]>([]);
  const [topFailed, setTopFailed] = useState<CardWithProgress[]>([]);

  const loadData = () => {
    setStreak(getStreak());
    setTopMastered(getMostMasteredCards(5));
    setTopFailed(getMostFailedCards(5));
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateMastery = (c: CardWithProgress) => {
    const total = c.total_correct + c.total_incorrect;
    if (total === 0) return 0;
    return Math.round((c.total_correct / total) * 100);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {streak && (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Rachas</Text>
          <View style={styles.row}>
            <View style={[styles.statBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Racha Actual</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>🔥 {streak.current_streak}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Mejor Racha</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>🏆 {streak.best_streak}</Text>
            </View>
          </View>
          <ProgressBar 
            current={streak.cards_correct_today} 
            total={10} 
            label={`Cartas hoy: ${streak.cards_correct_today}/10`} 
            color={theme.success}
          />
        </View>
      )}

      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Más Dominadas (Top 5)</Text>
        {topMastered.length === 0 && <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No hay datos aún.</Text>}
        {topMastered.map(c => (
          <View key={c.id} style={[styles.listItem, { borderBottomColor: theme.border }]}>
            <Text style={[styles.listFront, { color: theme.text }]}>{c.front}</Text>
            <Text style={[styles.listMastery, { color: theme.success }]}>{calculateMastery(c)}% ({c.total_correct}✅)</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Más Falladas (Top 5)</Text>
        {topFailed.length === 0 && <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No hay datos aún.</Text>}
        {topFailed.map(c => (
          <View key={c.id} style={[styles.listItem, { borderBottomColor: theme.border }]}>
            <Text style={[styles.listFront, { color: theme.text }]}>{c.front}</Text>
            <Text style={[styles.listFailed, { color: theme.danger }]}>{c.total_incorrect}❌</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statBox: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  statLabel: { fontSize: 14, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  emptyText: { fontStyle: 'italic' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  listFront: { fontSize: 16, flex: 1 },
  listMastery: { fontSize: 16, fontWeight: 'bold' },
  listFailed: { fontSize: 16, fontWeight: 'bold' }
});
