import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getAllCardsForStudyBySubject, getAllCardsForStudyBySection } from '../db/progress';
import { CardWithProgress } from '../db/cards';
import { handleCorrectAnswer, handleIncorrectAnswer } from '../utils/leitner';
import { incrementCardsCorrectToday } from '../utils/streak';
import FlipCard from '../components/FlipCard';
import ProgressBar from '../components/ProgressBar';
import { useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Study'>;

export default function StudyScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const { subjectId, sectionId } = route.params;
  const [cards, setCards] = useState<CardWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  /**
   * Weighted random deck builder.
   *
   * Weight formula per card:
   *   - base weight = total_incorrect * 3  (failed cards are heavily prioritised)
   *   - If the card has NEVER been reviewed  → weight = 2 (new card, medium priority)
   *   - If the card is mostly mastered       → weight = 1 (shows occasionally as reinforcement)
   *   - Minimum weight is always 1 so every card can appear.
   *
   * We then build a "weighted deck" by repeating each card proportional to its weight,
   * shuffle it, and remove duplicates — giving a random order biased toward hard cards.
   */
  const buildWeightedDeck = (allCards: CardWithProgress[]): CardWithProgress[] => {
    const weightedPool: CardWithProgress[] = [];

    for (const card of allCards) {
      const neverReviewed = card.last_reviewed === null;
      let weight: number;

      if (neverReviewed) {
        weight = 2; // New card — medium priority
      } else {
        const totalAnswers = card.total_correct + card.total_incorrect;
        const failRate = totalAnswers > 0 ? card.total_incorrect / totalAnswers : 0;

        if (failRate >= 0.5 || card.total_incorrect >= 2) {
          weight = 3 + card.total_incorrect; // Heavy priority for hard cards
        } else if (card.total_correct >= 3 && failRate < 0.2) {
          weight = 1; // Mostly mastered — appears occasionally
        } else {
          weight = 2; // Neutral — medium priority
        }
      }

      for (let i = 0; i < weight; i++) {
        weightedPool.push(card);
      }
    }

    // Fisher-Yates shuffle
    for (let i = weightedPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [weightedPool[i], weightedPool[j]] = [weightedPool[j], weightedPool[i]];
    }

    // Remove duplicates while preserving weighted-random order
    const seen = new Set<number>();
    const deck: CardWithProgress[] = [];
    for (const card of weightedPool) {
      if (!seen.has(card.id)) {
        seen.add(card.id);
        deck.push(card);
      }
    }

    return deck;
  };

  const loadCards = () => {
    let allCards: CardWithProgress[] = [];
    if (sectionId) {
      allCards = getAllCardsForStudyBySection(sectionId);
    } else if (subjectId) {
      allCards = getAllCardsForStudyBySubject(subjectId);
    }
    const deck = buildWeightedDeck(allCards);
    setCards(deck);
    setCurrentIndex(0);
  };

  useEffect(() => {
    loadCards();
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
      // End of round → re-build the deck with updated weights based on new mistakes
      loadCards();
    }
  };

  if (cards.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={[styles.messageTitle, { color: theme.text }]}>No hay cartas</Text>
        <Text style={[styles.messageSub, { color: theme.textSecondary }]}>Agrega algunas cartas para practicar.</Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.primary }]} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
  container: { flex: 1 },
  progressContainer: { padding: 20 },
  cardContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emoji: { fontSize: 64, marginBottom: 16 },
  messageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  messageSub: { fontSize: 16, marginBottom: 32, textAlign: 'center' },
  statsBox: { padding: 20, borderRadius: 12, marginBottom: 32, width: '100%', elevation: 2 },
  statText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  backBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
