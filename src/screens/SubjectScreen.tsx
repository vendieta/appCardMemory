import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getSubjectById, Subject, deleteSubject } from '../db/subjects';
import { getSectionsBySubject, Section, addSection, getSectionCardsDueToday, getSectionStats } from '../db/sections';
import { useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Subject'>;

interface SectionWithStats extends Section {
  dueCards: number;
  total: number;
  mastered: number;
  progress: number;
}

export default function SubjectScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const { subjectId } = route.params;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [sections, setSections] = useState<SectionWithStats[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const loadData = () => {
    const sub = getSubjectById(subjectId);
    if (sub) {
      setSubject(sub);
      navigation.setOptions({ 
        title: sub.name, 
        headerStyle: { backgroundColor: sub.color },
        headerTintColor: '#fff',
        headerRight: () => (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={{ fontSize: 20 }}>🗑️</Text>
          </TouchableOpacity>
        )
      });
      const secs = getSectionsBySubject(subjectId).map(s => {
        const stats = getSectionStats(s.id);
        return {
          ...s,
          dueCards: getSectionCardsDueToday(s.id),
          ...stats
        };
      });
      setSections(secs);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, subjectId]);

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    addSection(subjectId, newSectionName.trim());
    setNewSectionName('');
    setModalVisible(false);
    loadData();
  };

  const handleDelete = () => {
    Alert.alert('Eliminar', '¿Estás seguro de eliminar esta materia y todas sus cartas?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        deleteSubject(subjectId);
        navigation.goBack();
      }}
    ]);
  };

  if (!subject) return <View style={[styles.container, { backgroundColor: theme.background }]}><Text style={{color: theme.text}}>Cargando...</Text></View>;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Secciones</Text>

      <FlatList
        data={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const progressPercent = item.total > 0 ? Math.round((item.mastered / item.total) * 100) : 0;
          return (
            <TouchableOpacity 
              style={[styles.sectionCard, { backgroundColor: theme.surface }]}
              onPress={() => navigation.navigate('Section', { sectionId: item.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.sectionName, { color: theme.text }]}>{item.name}</Text>
                {item.dueCards > 0 && (
                  <View style={[styles.badge, { backgroundColor: theme.dangerBackground }]}>
                    <Text style={[styles.badgeText, { color: theme.danger }]}>📚 {item.dueCards}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.text }]}>{item.total}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Cartas</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#4CAF50' }]}>{item.mastered}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Dominadas</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#FF9800' }]}>{item.progress}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>En progreso</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progressPercent}%`,
                      backgroundColor: subject.color
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {progressPercent}% dominadas
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={[styles.fab, {backgroundColor: subject.color}]} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Nueva Sección</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Nombre de la sección"
              placeholderTextColor={theme.textSecondary}
              value={newSectionName}
              onChangeText={setNewSectionName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={[styles.btnText, { color: theme.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: subject.color }]} onPress={handleAddSection}>
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
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  sectionCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 12, marginRight: 8 },
  saveBtn: { padding: 12, borderRadius: 8 },
  btnText: { fontWeight: 'bold' }
});
