import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import StreakBanner from '../components/StreakBanner';
import ProgressBar from '../components/ProgressBar';
import SubjectCard from '../components/SubjectCard';
import { getSubjects, addSubject, Subject, getSubjectCardsDueToday } from '../db/subjects';
import { getStreak, StreakInfo } from '../db/streak';
import { initializeStreakOnStartup } from '../utils/streak';
import { useAppTheme } from '../utils/theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const COLORS = ['#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2'];

export default function HomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const [subjects, setSubjects] = useState<(Subject & { dueCards: number })[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const loadData = () => {
    initializeStreakOnStartup();
    setStreakInfo(getStreak());
    const subs = getSubjects().map(s => ({
      ...s,
      dueCards: getSubjectCardsDueToday(s.id)
    }));
    setSubjects(subs);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      Alert.alert('Error', 'Ingrese un nombre');
      return;
    }
    addSubject(newSubjectName.trim(), selectedColor);
    setNewSubjectName('');
    setModalVisible(false);
    loadData();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {streakInfo && (
        <>
          <StreakBanner currentStreak={streakInfo.current_streak} bestStreak={streakInfo.best_streak} />
          {streakInfo.cards_correct_today < 10 && (
            <ProgressBar 
              current={streakInfo.cards_correct_today} 
              total={10} 
              label={`${streakInfo.cards_correct_today}/10 cartas para mantener racha`} 
            />
          )}
        </>
      )}

      <FlatList
        data={subjects}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <SubjectCard
            name={item.name}
            color={item.color}
            dueCards={item.dueCards}
            onPress={() => navigation.navigate('Subject', { subjectId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Nueva Materia</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Nombre de la materia"
              placeholderTextColor={theme.textSecondary}
              value={newSubjectName}
              onChangeText={setNewSubjectName}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorCircle, { backgroundColor: color, borderWidth: selectedColor === color ? 3 : 0, borderColor: theme.text }]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={[styles.btnText, { color: theme.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleAddSubject}>
                <Text style={[styles.btnText, { color: '#fff' }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  listContent: { paddingBottom: 80 },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    width: 60, height: 60,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3
  },
  fabText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  colorRow: { flexDirection: 'row', marginBottom: 20 },
  colorCircle: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 12, marginRight: 8 },
  saveBtn: { padding: 12, borderRadius: 8 },
  btnText: { fontWeight: 'bold' }
});
