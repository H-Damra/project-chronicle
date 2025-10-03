import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Lexend_300Light, Lexend_600SemiBold } from '@expo-google-fonts/lexend';

import DottedBackground from '../components/common/DottedBackground';
import TopGradientOverlay from '../components/common/TopGradientOverlay';
import { colors } from '../styles/colors';

const MarketplaceScreen = () => {
  let [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <DottedBackground />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TopGradientOverlay />
        <View style={styles.content}>
          <Text style={styles.title}>Marketplace</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140,
  },
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

export default MarketplaceScreen;