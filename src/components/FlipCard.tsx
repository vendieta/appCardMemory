import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Speech from 'expo-speech';

interface FlipCardProps {
  front: string;
  back: string;
  language?: string;
  onAnswer?: (isCorrect: boolean) => void;
}

export default function FlipCard({ front, back, language = 'en-US', onAnswer }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    if (isFlipped) return; // Prevent flipping back immediately if needed
    setIsFlipped(true);
    Animated.timing(animatedValue, {
      toValue: 180,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }]
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }]
  };

  const speak = (text: string, lang: string) => {
    Speech.speak(text, { language: lang });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} onPress={flipCard} style={styles.cardContainer}>
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <Text style={styles.text}>{front}</Text>
          <TouchableOpacity style={styles.speaker} onPress={() => speak(front, language)}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Text style={styles.text}>{back}</Text>
          <TouchableOpacity style={styles.speaker} onPress={() => speak(back, language === 'en-US' ? 'es-ES' : language)}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      {isFlipped && onAnswer && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.button, styles.btnIncorrect]} onPress={() => onAnswer(false)}>
            <Text style={styles.btnText}>❌ No lo supe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.btnCorrect]} onPress={() => onAnswer(true)}>
            <Text style={styles.btnText}>✅ Lo supe</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cardContainer: {
    width: '100%',
    aspectRatio: 1,
    transform: [{ perspective: 1000 }],
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    padding: 20,
  },
  cardFront: {
    backgroundColor: '#F9FAFB',
  },
  cardBack: {
    backgroundColor: '#EEF2FF',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  speaker: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
  },
  speakerIcon: {
    fontSize: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  btnIncorrect: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  btnCorrect: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});
