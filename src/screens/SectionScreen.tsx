import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getSectionById, Section } from '../db/sections';
import { getCardsBySection, addCard, deleteCard, CardWithProgress } from '../db/cards';
import { useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Section'>;

export default function SectionScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const { sectionId } = route.params;
  const [section, setSection] = useState<Section | null>(null);
  const [cards, setCards] = useState<CardWithProgress[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');

  const loadData = () => {
    const sec = getSectionById(sectionId);
    if (sec) {
      setSection(sec);
      navigation.setOptions({ title: sec.name });
      setCards(getCardsBySection(sectionId));
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, sectionId]);

  const handleAddCard = () => {
    if (!frontText.trim() || !backText.trim()) return;
    addCard(sectionId, frontText.trim(), backText.trim());
    setFrontText('');
    setBackText('');
    setModalVisible(false);
    loadData();
  };

  const handleDeleteCard = (id: number) => {
    Alert.alert('Eliminar', '¿Eliminar carta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        deleteCard(id);
        loadData();
      }}
    ]);
  };

  if (!section) return <View style={[styles.container, { backgroundColor: theme.background }]}><Text style={{color: theme.text}}>Cargando...</Text></View>;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={cards}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.cardItem, { backgroundColor: theme.surface }]}>
            <View style={styles.cardContent}>
              <Text style={[styles.cardFront, { color: theme.text }]}>{item.front}</Text>
              <View style={[styles.badgeBox, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: theme.primary }]}>Box {item.box}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDeleteCard(item.id)}>
              <Text style={[styles.deleteIcon, { color: theme.danger }]}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.studyBtn, { backgroundColor: theme.primary }]} 
              onPress={() => navigation.navigate('Study', { sectionId })}
            >
              <Text style={styles.studyBtnText}>▶️ Estudiar sección</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Nueva Carta</Text>
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
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={[styles.btnText, { color: theme.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleAddCard}>
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
  headerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 10,
  },
  studyBtn: { 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  studyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { paddingTop: 12, paddingBottom: 24 },
  cardItem: { padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  cardContent: { flex: 1 },
  cardFront: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  badgeBox: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  deleteIcon: { fontSize: 20, marginLeft: 16 },
  fab: { position: 'absolute', right: 20, bottom: 100, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
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
