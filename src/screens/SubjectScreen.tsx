import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getSubjectById, Subject, deleteSubject } from '../db/subjects';
import { getSectionsBySubject, Section, addSection, getSectionCardsDueToday } from '../db/sections';
import { addCard } from '../db/cards';
import { useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Subject'>;

export default function SubjectScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const { subjectId } = route.params;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [sections, setSections] = useState<(Section & { dueCards: number })[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  
  const [addCardModalVisible, setAddCardModalVisible] = useState(false);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');

  const loadData = () => {
    const sub = getSubjectById(subjectId);
    if (sub) {
      setSubject(sub);
      navigation.setOptions({ 
        title: sub.name, 
        headerStyle: { backgroundColor: sub.color },
        headerTintColor: '#fff'
      });
      const secs = getSectionsBySubject(subjectId).map(s => ({
        ...s,
        dueCards: getSectionCardsDueToday(s.id)
      }));
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

  const handleAddCard = () => {
    if (!frontText.trim() || !backText.trim()) return;
    
    let targetSectionId;
    if (sections.length === 0) {
      targetSectionId = addSection(subjectId, 'General');
    } else {
      targetSectionId = sections[0].id; // Simple default to first section
    }
    
    addCard(targetSectionId, frontText.trim(), backText.trim());
    setFrontText('');
    setBackText('');
    setAddCardModalVisible(false);
    loadData();
    Alert.alert('Éxito', 'Carta agregada correctamente');
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
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface }]} onPress={() => navigation.navigate('Study', { subjectId })}>
          <Text style={[styles.actionText, { color: theme.text }]}>▶️ Estudiar todo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface }]} onPress={() => setAddCardModalVisible(true)}>
          <Text style={[styles.actionText, { color: theme.text }]}>➕ Agregar Carta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.dangerBackground }]} onPress={handleDelete}>
          <Text style={[styles.actionText, { color: theme.danger }]}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.sectionCard, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate('Section', { sectionId: item.id })}
          >
            <Text style={[styles.sectionName, { color: theme.text }]}>{item.name}</Text>
            {item.dueCards > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.dangerBackground }]}>
                <Text style={[styles.badgeText, { color: theme.danger }]}>{item.dueCards}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
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

      <Modal visible={addCardModalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Nueva Carta</Text>
            <Text style={{color: theme.textSecondary, marginBottom: 8, fontSize: 12}}>
              {sections.length === 0 ? "Se creará una sección 'General' automáticamente." : `Se guardará en la sección: ${sections[0].name}`}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Frente (Ej. Apple)"
              placeholderTextColor={theme.textSecondary}
              value={frontText}
              onChangeText={setFrontText}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Reverso (Ej. Manzana)"
              placeholderTextColor={theme.textSecondary}
              value={backText}
              onChangeText={setBackText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddCardModalVisible(false)}>
                <Text style={[styles.btnText, { color: theme.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: subject.color }]} onPress={handleAddCard}>
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
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, elevation: 1 },
  actionText: { fontSize: 14, fontWeight: '600' },
  sectionCard: {
    padding: 16, borderRadius: 12, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 1
  },
  sectionName: { fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontWeight: 'bold', fontSize: 12 },
  fab: {
    position: 'absolute', right: 20, bottom: 20, width: 60, height: 60,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3
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
