import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, Lexend_300Light, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold } from '@expo-google-fonts/lexend';
import { colors } from '../../styles/colors';

const WeekDayCard = ({
  date,
  isToday,
  taskCount,
  scheduledCount,
  completeTodayCount,
  completedCount,
  onPress
}) => {
  let [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateShort = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isToday && styles.todayCard
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with pill */}
      <View style={styles.header}>
        <Text style={styles.dayName}>{dayName}</Text>
        <Text style={styles.dateText}>{dateShort}</Text>

        {/* Absolutely centered pill overlay */}
        <View style={styles.headerContent}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {taskCount > 0 ? `${completedCount}/${taskCount} complete` : 'No tasks'}
            </Text>
          </View>
        </View>
      </View>

      {/* Horizontal metrics row */}
      <View style={styles.metricsRow}>
        {/* Scheduled */}
        <View style={styles.metric}>
          <Text style={[styles.metricNumber, styles.scheduledColor]}>
            {scheduledCount}
          </Text>
          <Text style={styles.metricLabel}>Scheduled</Text>
        </View>

        {/* Bullet separator */}
        <Text style={styles.separator}>•</Text>

        {/* Complete Today */}
        <View style={styles.metric}>
          <Text style={[styles.metricNumber, styles.completeTodayColor]}>
            {completeTodayCount}
          </Text>
          <Text style={styles.metricLabel}>Today</Text>
        </View>

        {/* Bullet separator */}
        <Text style={styles.separator}>•</Text>

        {/* Total */}
        <View style={styles.metric}>
          <Text style={[styles.metricNumber, styles.totalColor]}>
            {taskCount}
          </Text>
          <Text style={styles.metricLabel}>Total</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 100,
  },
  todayCard: {
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontFamily: 'Lexend_500Medium',
    color: colors.textPrimary,
    zIndex: 1,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Lexend_400Regular',
    color: colors.textMuted,
    zIndex: 1,
    width: 60,
    textAlign: 'right',
  },
  headerContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  pill: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    pointerEvents: 'auto',
  },
  pillText: {
    fontSize: 10,
    fontFamily: 'Lexend_400Regular',
    color: colors.textPrimary,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricNumber: {
    fontSize: 36,
    fontFamily: 'Lexend_600SemiBold',
    lineHeight: 36,
  },
  scheduledColor: {
    color: colors.scheduledTaskCalendar,
  },
  completeTodayColor: {
    color: colors.completeTodayTaskCalendar,
  },
  totalColor: {
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: 'Lexend_300Light',
    color: colors.textMuted,
    marginTop: 4,
  },
  separator: {
    fontSize: 24,
    color: colors.textMuted,
    marginHorizontal: 8,
  },
});

export default WeekDayCard;
