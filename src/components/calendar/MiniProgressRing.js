import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../styles/colors';
import { useFonts, Lexend_300Light, Lexend_600SemiBold } from '@expo-google-fonts/lexend';

const MiniProgressRing = ({
  completed = 0,
  total = 0,
  scheduledCompleted = 0,
  completeTodayCompleted = 0,
}) => {
  let [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const radius = 22;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;

  // Handle empty state
  if (total === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.ringContainer}>
          <Svg width={60} height={60}>
            {/* Background ring */}
            <Circle
              cx="30"
              cy="30"
              r={radius}
              fill="none"
              stroke={colors.borderLight}
              strokeWidth={strokeWidth}
            />
          </Svg>
          <View style={styles.centerText}>
            <Text style={styles.emptyText}>-</Text>
          </View>
        </View>
      </View>
    );
  }

  // Calculate percentages
  const totalCompletedTasks = scheduledCompleted + completeTodayCompleted;
  const totalPercentage = totalCompletedTasks / total;
  const completeTodayPercentage = completeTodayCompleted / total;

  // Calculate stroke offsets
  const totalOffset = circumference - (totalPercentage * circumference);
  const completeTodayOffset = circumference - (completeTodayPercentage * circumference);

  return (
    <View style={styles.container}>
      <View style={styles.ringContainer}>
        <Svg width={60} height={60}>
          {/* Background ring */}
          <Circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={colors.borderLight}
            strokeWidth={strokeWidth}
          />

          {/* Total progress ring (scheduled color) - bottom layer */}
          <Circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={colors.scheduledTaskCalendar}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={totalOffset}
            transform={`rotate(-90 30 30)`}
          />

          {/* Complete Today ring - top layer */}
          <Circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={colors.completeTodayTaskCalendar}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={completeTodayOffset}
            transform={`rotate(-90 30 30)`}
          />
        </Svg>

        <View style={styles.centerText}>
          <Text style={styles.completedNumber}>{completed}</Text>
          <Text style={styles.totalNumber}>/{total}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    position: 'absolute',
  },
  completedNumber: {
    fontSize: 16,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
  },
  totalNumber: {
    fontSize: 11,
    fontFamily: 'Lexend_300Light',
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Lexend_300Light',
    color: colors.textMuted,
  },
});

export default MiniProgressRing;
