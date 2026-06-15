import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getDueCardsBySubject, getDueCardsBySection } from '../db/progress';
import { CardWithProgress } from '../db/cards';
import { handleCorrectAnswer, handleIncorrectAnswer } from '../utils/leitner';
import { incrementCardsCorrectToday } from '../utils/streak';
import FlipCard from '../components/FlipCard';
import ProgressBar from '../components/ProgressBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Study'>;

export default function StudyScreen({ route, navigation }: Props) {
  const { subjectId, sectionId } = route.params;
  const [cards, setCards] = useState<CardWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let dueCards: CardWithProgress[] = [];
    if (sectionId) {
      dueCards = getDueCardsBySection(sectionId);
    } else if (subjectId) {
      dueCards = getDueCardsBySubject(subjectId);
    }
    setCards(dueCards);
  }, [subjectId, sectionId]);

  const handleAnswer = (isCorrect: boolean) => {
    const currentCard = cards[currentIndex];
    if (isCorrect) {
      handleCorrectAnswer(currentCard.id, currentCard.box);
      incrementCardsCorrectToday();
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      handleIncorrectAnswer(currentCard.id);
      setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (cards.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.messageTitle}>¡Todo al día!</Text>
        <Text style={styles.messageSub}>No hay cartas para revisar hoy.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emoji}>🏆</Text>
        <Text style={styles.messageTitle}>¡Sesión terminada!</Text>
        <View style={styles.statsBox}>
          <Text style={styles.statText}>✅ Correctas: {sessionStats.correct}</Text>
          <Text style={styles.statText}>❌ Incorrectas: {sessionStats.incorrect}</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <ProgressBar 
          current={currentIndex + 1} 
          total={cards.length} 
          label={`Carta ${currentIndex + 1} de ${cards.length}`} 
        />
      </View>

      <View style={styles.cardContainer}>
        <FlipCard 
          key={currentCard.id}
          front={currentCard.front} 
          back={currentCard.back} 
          onAnswer={handleAnswer} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  progressContainer: { padding: 20 },
  cardContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F3F4F6' },
  emoji: { fontSize: 64, marginBottom: 16 },
  messageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  messageSub: { fontSize: 16, color: '#6B7280', marginBottom: 32, textAlign: 'center' },
  statsBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 32, width: '100%', elevation: 2 },
  statText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#374151' },
  backBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
