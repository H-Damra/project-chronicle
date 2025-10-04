import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts, Lexend_300Light } from '@expo-google-fonts/lexend';
import { colors } from '../../styles/colors';

const CalendarLegend = () => {
  let [fontsLoaded] = useFonts({
    Lexend_300Light,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.scheduledTaskCalendar }]} />
        <Text style={styles.legendText}>Scheduled</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.completeTodayTaskCalendar }]} />
        <Text style={styles.legendText}>Complete Today</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Lexend_300Light',
    color: colors.textSecondary,
  },
});

export default CalendarLegend;
