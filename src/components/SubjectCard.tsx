import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../utils/theme';

interface SubjectCardProps {
  name: string;
  color: string;
  dueCards: number;
  totalCards: number;
  sections: number;
  onPress: () => void;
}

export default function SubjectCard({ name, color, dueCards, totalCards, sections, onPress }: SubjectCardProps) {
  const theme = useAppTheme();
  const progress = totalCards > 0 ? Math.round((dueCards / totalCards) * 100) : 0;

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.surface, borderLeftColor: color, borderLeftWidth: 5 }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: dueCards > 0 ? theme.dangerBackground : theme.successBackground }]}>
          <Text style={[styles.statusText, { color: dueCards > 0 ? theme.danger : theme.success }]}>
            {dueCards > 0 ? '⚠️' : '✓'}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tarjetas</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{totalCards}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Secciones</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{sections}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Para hoy</Text>
          <Text style={[styles.statValue, { color: dueCards > 0 ? theme.danger : theme.success }]}>{dueCards}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${100 - progress}%`, backgroundColor: color }]} />
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>{progress}% pendiente</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 160,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});
