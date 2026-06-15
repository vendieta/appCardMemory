import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import * as Speech from 'expo-speech';
import { useAppTheme } from '../utils/theme';

interface FlipCardProps {
  front: string;
  back: string;
  language?: string;
  onAnswer?: (isCorrect: boolean) => void;
}

export default function FlipCard({ front, back, language = 'en-US', onAnswer }: FlipCardProps) {
  const theme = useAppTheme();
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (e, gestureState) => {
        // Only flip if it's a swipe up (dy is negative and magnitude > 30)
        if (gestureState.dy < -30 && Math.abs(gestureState.dx) < 50) {
          flipCard();
        }
      },
    })
  ).current;

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
      <View {...panResponder.panHandlers} style={styles.cardContainer}>
        <Animated.View style={[styles.card, { backgroundColor: theme.surface }, frontAnimatedStyle]}>
          <Text style={[styles.text, { color: theme.text }]}>{front}</Text>
          <TouchableOpacity style={[styles.speaker, { backgroundColor: theme.background }]} onPress={() => speak(front, language)}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.card, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.primary }, backAnimatedStyle]}>
          <Text style={[styles.text, { color: theme.text }]}>{back}</Text>
          <TouchableOpacity style={[styles.speaker, { backgroundColor: theme.background }]} onPress={() => speak(back, language === 'en-US' ? 'es-ES' : language)}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {isFlipped && onAnswer && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.dangerBackground, borderColor: theme.danger, borderWidth: 1 }]} onPress={() => onAnswer(false)}>
            <Text style={[styles.btnText, { color: theme.text }]}>❌ No lo supe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.success + '20', borderColor: theme.success, borderWidth: 1 }]} onPress={() => onAnswer(true)}>
            <Text style={[styles.btnText, { color: theme.text }]}>✅ Lo supe</Text>
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
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  speaker: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 10,
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
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
