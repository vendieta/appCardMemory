import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SubjectCardProps {
  name: string;
  color: string;
  dueCards: number;
  onPress: () => void;
}

export default function SubjectCard({ name, color, dueCards, onPress }: SubjectCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: color, borderLeftWidth: 6 }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{name}</Text>
        {dueCards > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{dueCards} para hoy</Text>
          </View>
        ) : (
          <Text style={styles.doneText}>Al día 🎉</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
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
    color: '#1F2937',
  },
  badge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 12,
  },
  doneText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
