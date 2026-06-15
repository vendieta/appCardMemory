import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getSectionById, Section } from '../db/sections';
import { getCardsBySection, addCard, deleteCard, CardWithProgress } from '../db/cards';

type Props = NativeStackScreenProps<RootStackParamList, 'Section'>;

export default function SectionScreen({ route, navigation }: Props) {
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

  if (!section) return <View style={styles.container}><Text>Cargando...</Text></View>;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.studyBtn} 
        onPress={() => navigation.navigate('Study', { sectionId })}
      >
        <Text style={styles.studyBtnText}>▶️ Estudiar sección</Text>
      </TouchableOpacity>

      <FlatList
        data={cards}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardItem}>
            <View style={styles.cardContent}>
              <Text style={styles.cardFront}>{item.front}</Text>
              <View style={styles.badgeBox}>
                <Text style={styles.badgeText}>Box {item.box}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDeleteCard(item.id)}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Carta</Text>
            <TextInput
              style={styles.input}
              placeholder="Frente (Ej. Apple)"
              value={frontText}
              onChangeText={setFrontText}
            />
            <TextInput
              style={styles.input}
              placeholder="Reverso (Ej. Manzana)"
              value={backText}
              onChangeText={setBackText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddCard}>
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
  studyBtn: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  studyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cardItem: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  cardContent: { flex: 1 },
  cardFront: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  badgeBox: { backgroundColor: '#E0E7FF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { color: '#4F46E5', fontSize: 12, fontWeight: 'bold' },
  deleteIcon: { fontSize: 20, color: '#DC2626', marginLeft: 16 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#4F46E5', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '80%', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 12, marginRight: 8 },
  saveBtn: { padding: 12, backgroundColor: '#4F46E5', borderRadius: 8 },
  btnText: { fontWeight: 'bold', color: '#374151' }
});
