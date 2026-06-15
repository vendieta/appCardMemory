import { useColorScheme } from 'react-native';

export const lightTheme = {
  background: '#F3F4F6',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#D1D5DB',
  primary: '#4F46E5',
  danger: '#DC2626',
  dangerBackground: '#FEE2E2',
  success: '#059669',
  cardShadow: '#000000',
  modalOverlay: 'rgba(0,0,0,0.5)',
  iconUnfocused: '#8E8E93',
};

export const darkTheme = {
  background: '#111827', // Very dark blue/gray
  surface: '#1F2937',    // Dark gray for cards
  text: '#F9FAFB',       // White-ish
  textSecondary: '#9CA3AF', // Light gray
  border: '#374151',
  primary: '#6366F1',    // Indigo slightly lighter
  danger: '#EF4444',
  dangerBackground: '#450a0a',
  success: '#10B981',
  cardShadow: '#000000',
  modalOverlay: 'rgba(0,0,0,0.7)',
  iconUnfocused: '#8E8E93',
};

export type Theme = typeof lightTheme;

export function useAppTheme() {
  // El usuario solicitó que la app esté en modo oscuro.
  // Ignoramos el scheme del sistema por ahora y forzamos darkTheme.
  return darkTheme;
}
