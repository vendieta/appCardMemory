import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getStreak, StreakInfo } from '../db/streak';
import { getMostMasteredCards, getMostFailedCards } from '../db/progress';
import { CardWithProgress } from '../db/cards';
import ProgressBar from '../components/ProgressBar';

export default function StatsScreen() {
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
    <ScrollView style={styles.container}>
      {streak && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rachas</Text>
          <View style={styles.row}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Racha Actual</Text>
              <Text style={styles.statValue}>🔥 {streak.current_streak}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Mejor Racha</Text>
              <Text style={styles.statValue}>🏆 {streak.best_streak}</Text>
            </View>
          </View>
          <ProgressBar 
            current={streak.cards_correct_today} 
            total={10} 
            label={`Cartas hoy: ${streak.cards_correct_today}/10`} 
            color="#10B981"
          />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Más Dominadas (Top 5)</Text>
        {topMastered.length === 0 && <Text style={styles.emptyText}>No hay datos aún.</Text>}
        {topMastered.map(c => (
          <View key={c.id} style={styles.listItem}>
            <Text style={styles.listFront}>{c.front}</Text>
            <Text style={styles.listMastery}>{calculateMastery(c)}% ({c.total_correct}✅)</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Más Falladas (Top 5)</Text>
        {topFailed.length === 0 && <Text style={styles.emptyText}>No hay datos aún.</Text>}
        {topFailed.map(c => (
          <View key={c.id} style={styles.listItem}>
            <Text style={styles.listFront}>{c.front}</Text>
            <Text style={styles.listFailed}>{c.total_incorrect}❌</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  statLabel: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  emptyText: { color: '#9CA3AF', fontStyle: 'italic' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  listFront: { fontSize: 16, color: '#374151', flex: 1 },
  listMastery: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  listFailed: { fontSize: 16, fontWeight: 'bold', color: '#EF4444' }
});
