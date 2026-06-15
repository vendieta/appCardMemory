import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../utils/theme';

interface SubjectCardProps {
  name: string;
  color: string;
  dueCards: number;
  onPress: () => void;
}

export default function SubjectCard({ name, color, dueCards, onPress }: SubjectCardProps) {
  const theme = useAppTheme();
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.surface, borderLeftColor: color, borderLeftWidth: 6 }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{name}</Text>
        {dueCards > 0 ? (
          <View style={[styles.badge, { backgroundColor: theme.dangerBackground }]}>
            <Text style={[styles.badgeText, { color: theme.danger }]}>{dueCards} para hoy</Text>
          </View>
        ) : (
          <Text style={[styles.doneText, { color: theme.success }]}>Al día 🎉</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  doneText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
