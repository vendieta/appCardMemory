import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getSubjectById, Subject, deleteSubject } from '../db/subjects';
import { getSectionsBySubject, Section, addSection, getSectionCardsDueToday } from '../db/sections';
import { importSubjectJSON, exportSubjectJSON } from '../utils/importExport';

type Props = NativeStackScreenProps<RootStackParamList, 'Subject'>;

export default function SubjectScreen({ route, navigation }: Props) {
  const { subjectId } = route.params;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [sections, setSections] = useState<(Section & { dueCards: number })[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

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

  const handleImport = async () => {
    await importSubjectJSON();
    loadData();
  };

  const handleExport = async () => {
    await exportSubjectJSON(subjectId);
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

  if (!subject) return <View style={styles.container}><Text>Cargando...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Study', { subjectId })}>
          <Text style={styles.actionText}>▶️ Estudiar todo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleImport}>
          <Text style={styles.actionText}>📥 Importar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
          <Text style={styles.actionText}>📤 Exportar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#FEE2E2'}]} onPress={handleDelete}>
          <Text style={[styles.actionText, {color: '#DC2626'}]}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => navigation.navigate('Section', { sectionId: item.id })}
          >
            <Text style={styles.sectionName}>{item.name}</Text>
            {item.dueCards > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.dueCards}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={[styles.fab, {backgroundColor: subject.color}]} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Sección</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la sección"
              value={newSectionName}
              onChangeText={setNewSectionName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, {backgroundColor: subject.color}]} onPress={handleAddSection}>
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
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  actionBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, elevation: 1 },
  actionText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  sectionCard: {
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 1
  },
  sectionName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  badge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#DC2626', fontWeight: 'bold', fontSize: 12 },
  fab: {
    position: 'absolute', right: 20, bottom: 20, width: 60, height: 60,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3
  },
  fabText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '80%', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 12, marginRight: 8 },
  saveBtn: { padding: 12, borderRadius: 8 },
  btnText: { fontWeight: 'bold', color: '#374151' }
});
