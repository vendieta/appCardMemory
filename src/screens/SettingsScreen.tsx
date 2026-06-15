import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useAppTheme } from '../utils/theme';
import { importSubjectJSON, ImportType } from '../utils/importExport';
import { exportSubjectJSON } from '../utils/importExport';
import { getSubjects, Subject } from '../db/subjects';
import { getSectionsBySubject } from '../db/sections';

interface Section {
  id: number;
  name: string;
  subject_id: number;
}

export default function SettingsScreen() {
  const theme = useAppTheme();
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [selectSubjectModalVisible, setSelectSubjectModalVisible] = useState(false);
  const [selectSectionModalVisible, setSelectSectionModalVisible] = useState(false);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [importType, setImportType] = useState<ImportType>('full');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  const handleImportClick = () => {
    setImportModalVisible(true);
  };

  const handleImportTypeSelect = async (type: ImportType) => {
    setImportType(type);
    
    if (type === 'full') {
      setImportModalVisible(false);
      await importSubjectJSON('full');
    } else if (type === 'section') {
      const subs = getSubjects();
      if (subs.length === 0) {
        Alert.alert('Error', 'No subjects available. Create one first.');
        return;
      }
      setSubjects(subs);
      setImportModalVisible(false);
      setSelectSubjectModalVisible(true);
    } else if (type === 'cards') {
      const subs = getSubjects();
      if (subs.length === 0) {
        Alert.alert('Error', 'No subjects available. Create one first.');
        return;
      }
      setSubjects(subs);
      setImportModalVisible(false);
      setSelectSubjectModalVisible(true);
    }
  };

  const handleSubjectSelect = (subjectId: number) => {
    if (importType === 'section') {
      setSelectedSubjectId(subjectId);
      setSelectSubjectModalVisible(false);
      importSubjectJSON('section', subjectId);
    } else if (importType === 'cards') {
      const sectionList = getSectionsBySubject(subjectId);
      setSections(sectionList);
      setSelectSubjectModalVisible(false);
      setSelectSectionModalVisible(true);
    }
  };

  const handleSectionSelect = (sectionId: number) => {
    setSelectedSectionId(sectionId);
    setSelectSectionModalVisible(false);
    importSubjectJSON('cards', undefined, sectionId);
  };

  const handleExportClick = () => {
    const subs = getSubjects();
    if (subs.length === 0) {
      Alert.alert('Exportar', 'No hay materias para exportar.');
      return;
    }
    setSubjects(subs);
    setExportModalVisible(true);
  };

  const handleExportSubject = async (subjectId: number) => {
    setExportModalVisible(false);
    await exportSubjectJSON(subjectId);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Configuración</Text>

      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DATOS Y RESPALDO</Text>
        
        <TouchableOpacity style={styles.row} onPress={handleImportClick}>
          <Text style={[styles.rowText, { color: theme.text }]}>📥 Importar desde JSON</Text>
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <TouchableOpacity style={styles.row} onPress={handleExportClick}>
          <Text style={[styles.rowText, { color: theme.text }]}>📤 Exportar materia a JSON</Text>
        </TouchableOpacity>
      </View>

      {/* Import Type Modal */}
      <Modal visible={importModalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>¿Qué deseas importar?</Text>
            
            <TouchableOpacity 
              style={[styles.optionBtn, { backgroundColor: theme.border }]}
              onPress={() => handleImportTypeSelect('full')}
            >
              <Text style={[styles.optionBtnText, { color: theme.text }]}>📚 Materia completa</Text>
              <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>Importar una materia con todas sus secciones</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionBtn, { backgroundColor: theme.border }]}
              onPress={() => handleImportTypeSelect('section')}
            >
              <Text style={[styles.optionBtnText, { color: theme.text }]}>📋 Una sección</Text>
              <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>Importar a una materia existente</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionBtn, { backgroundColor: theme.border }]}
              onPress={() => handleImportTypeSelect('cards')}
            >
              <Text style={[styles.optionBtnText, { color: theme.text }]}>📝 Solo palabras</Text>
              <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>Importar tarjetas a una sección</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.cancelBtn, { backgroundColor: theme.border }]} 
              onPress={() => setImportModalVisible(false)}
            >
              <Text style={[styles.btnText, { color: theme.text }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Select Subject Modal for Section/Cards Import */}
      <Modal visible={selectSubjectModalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {importType === 'section' ? 'Selecciona materia destino' : 'Selecciona materia'}
            </Text>
            
            <ScrollView style={styles.subjectList}>
              {subjects.map(sub => (
                <TouchableOpacity 
                  key={sub.id} 
                  style={[styles.subjectItem, { borderBottomColor: theme.border }]}
                  onPress={() => handleSubjectSelect(sub.id)}
                >
                  <View style={[styles.colorDot, { backgroundColor: sub.color }]} />
                  <Text style={[styles.subjectName, { color: theme.text }]}>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.cancelBtn, { backgroundColor: theme.border }]} 
              onPress={() => setSelectSubjectModalVisible(false)}
            >
              <Text style={[styles.btnText, { color: theme.text }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Select Section Modal for Cards Import */}
      <Modal visible={selectSectionModalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Selecciona sección destino</Text>
            
            <ScrollView style={styles.subjectList}>
              {sections.map(sec => (
                <TouchableOpacity 
                  key={sec.id} 
                  style={[styles.subjectItem, { borderBottomColor: theme.border }]}
                  onPress={() => handleSectionSelect(sec.id)}
                >
                  <Text style={[styles.subjectName, { color: theme.text }]}>{sec.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.cancelBtn, { backgroundColor: theme.border }]} 
              onPress={() => setSelectSectionModalVisible(false)}
            >
              <Text style={[styles.btnText, { color: theme.text }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal visible={exportModalVisible} transparent animationType="slide">
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
              onPress={() => setExportModalVisible(false)}
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
  btnText: { fontWeight: 'bold' },
  optionBtn: { 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  optionBtnText: { 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 4
  },
  optionDescription: { 
    fontSize: 13, 
    marginTop: 4 
  }
});
