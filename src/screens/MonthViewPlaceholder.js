import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts, Lexend_300Light, Lexend_600SemiBold } from '@expo-google-fonts/lexend';
import { colors } from '../styles/colors';

const MonthViewPlaceholder = () => {
  let [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Month View</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Lexend_300Light',
    color: colors.textLight,
  },
});

export default MonthViewPlaceholder;
