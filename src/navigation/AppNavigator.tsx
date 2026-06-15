import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import SubjectScreen from '../screens/SubjectScreen';
import SectionScreen from '../screens/SectionScreen';
import StudyScreen from '../screens/StudyScreen';

export type RootStackParamList = {
  Tabs: undefined;
  Subject: { subjectId: number };
  Section: { sectionId: number };
  Study: { subjectId?: number; sectionId?: number };
};

export type TabParamList = {
  Home: undefined;
  Stats: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Materias' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Estadísticas' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Subject" component={SubjectScreen} options={{ title: 'Materia' }} />
      <Stack.Screen name="Section" component={SectionScreen} options={{ title: 'Sección' }} />
      <Stack.Screen name="Study" component={StudyScreen} options={{ title: 'Estudiar' }} />
    </Stack.Navigator>
  );
}
