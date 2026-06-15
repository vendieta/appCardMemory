import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useAppTheme } from '../utils/theme';
import { importSubjectJSON, exportSubjectJSON } from '../utils/importExport';
import { getSubjects, Subject } from '../db/subjects';

export default function SettingsScreen() {
  const theme = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const handleImport = async () => {
    await importSubjectJSON();
  };

  const handleExportClick = () => {
    const subs = getSubjects();
    if (subs.length === 0) {
      Alert.alert('Exportar', 'No hay materias para exportar.');
      return;
    }
    setSubjects(subs);
    setModalVisible(true);
  };

  const handleExportSubject = async (subjectId: number) => {
    setModalVisible(false);
    await exportSubjectJSON(subjectId);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Configuración</Text>

      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DATOS Y RESPALDO</Text>
        
        <TouchableOpacity style={styles.row} onPress={handleImport}>
          <Text style={[styles.rowText, { color: theme.text }]}>📥 Importar materia desde JSON</Text>
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <TouchableOpacity style={styles.row} onPress={handleExportClick}>
          <Text style={[styles.rowText, { color: theme.text }]}>📤 Exportar materia a JSON</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Selecciona una materia a exportar</Text>
            
            <ScrollView style={styles.subjectList}>
              {subjects.map(sub => (
                <TouchableOpacity 
                  key={sub.id} 
                  style={[styles.subjectItem, { borderBottomColor: theme.border }]}
                  onPress={() => handleExportSubject(sub.id)}
                >
                  <View style={[styles.colorDot, { backgroundColor: sub.color }]} />
                  <Text style={[styles.subjectName, { color: theme.text }]}>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.cancelBtn, { backgroundColor: theme.border }]} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.btnText, { color: theme.text }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 10 },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    padding: 16,
  },
  rowText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 20, borderRadius: 12, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  subjectList: { maxHeight: 300 },
  subjectItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  subjectName: { fontSize: 16 },
  cancelBtn: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  btnText: { fontWeight: 'bold' }
});
