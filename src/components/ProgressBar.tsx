import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../utils/theme';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: string;
}

export default function ProgressBar({ current, total, label, color }: ProgressBarProps) {
  const theme = useAppTheme();
  const barColor = color || theme.primary;
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>}
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
