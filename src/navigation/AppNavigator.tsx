import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';

import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import SubjectScreen from '../screens/SubjectScreen';
import SectionScreen from '../screens/SectionScreen';
import StudyScreen from '../screens/StudyScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Tabs: undefined;
  Subject: { subjectId: number };
  Section: { sectionId: number };
  Study: { subjectId?: number; sectionId?: number };
};

export type TabParamList = {
  Home: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const theme = useAppTheme();
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({ 
        headerShown: true,
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.iconUnfocused,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Home') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Materias' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Estadísticas' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configuración' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const theme = useAppTheme();
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        contentStyle: { backgroundColor: theme.background }
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Subject" component={SubjectScreen} options={{ title: 'Materia' }} />
      <Stack.Screen name="Section" component={SectionScreen} options={{ title: 'Sección' }} />
      <Stack.Screen name="Study" component={StudyScreen} options={{ title: 'Estudiar' }} />
    </Stack.Navigator>
  );
}

