import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../../styles/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({
  completed = 2,
  total = 7,
  scheduledCompleted = 1,
  anytimeCompleted = 1,
  dueTodayCompleted = 0
}) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const scheduledProgress = useSharedValue(circumference);
  const anytimeProgress = useSharedValue(circumference);

  useEffect(() => {
    // Handle empty state (no tasks) - prevent division by zero
    if (total === 0) {
      scheduledProgress.value = circumference; // Full circle (no progress)
      anytimeProgress.value = circumference;
      return;
    }

    // Calculate total completed and individual percentages
    const totalCompletedTasks = anytimeCompleted + dueTodayCompleted + scheduledCompleted;
    const anytimePercentage = anytimeCompleted / total;
    const totalPercentage = totalCompletedTasks / total;

    // Anytime ring shows only anytime tasks
    const anytimeOffset = circumference - (anytimePercentage * circumference);

    // Scheduled ring shows total completed (anytime + dueToday + scheduled)
    const scheduledOffset = circumference - (totalPercentage * circumference);

    scheduledProgress.value = withTiming(scheduledOffset, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });

    anytimeProgress.value = withTiming(anytimeOffset, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [scheduledCompleted, anytimeCompleted, dueTodayCompleted, total]);

  const scheduledAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: scheduledProgress.value,
  }));

  const anytimeAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: anytimeProgress.value,
  }));

  const totalCompletedTasks = anytimeCompleted + scheduledCompleted;

  return (
    <View style={styles.container}>
      <View style={styles.ringContainer}>
        <Svg width={160} height={160} style={styles.svg}>
          <Defs>
            <LinearGradient id="scheduledGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.scheduledColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.scheduledColor} stopOpacity="0.7" />
            </LinearGradient>
            <LinearGradient id="anytimeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.anytimeColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.anytimeColor} stopOpacity="0.7" />
            </LinearGradient>
          </Defs>

          {/* Background ring */}
          <Circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={colors.borderLight}
            strokeWidth="12"
          />

          {/* Inner glow/shadow for depth */}
          <Circle
            cx="80"
            cy="80"
            r={radius - 1}
            fill="none"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="2"
          />

          {/* Scheduled tasks ring (shows total completed) - bottom layer */}
          <AnimatedCircle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#scheduledGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={scheduledAnimatedProps}
            transform={`rotate(-90 80 80)`}
          />

          {/* Anytime tasks ring (shows anytime only) - top layer */}
          <AnimatedCircle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#anytimeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={anytimeAnimatedProps}
            transform={`rotate(-90 80 80)`}
          />

          {/* Shine highlight on the visible top ring */}
          <Circle
            cx="80"
            cy="38"
            r="3"
            fill="white"
            opacity="0.6"
            transform={`rotate(${total > 0 ? ((totalCompletedTasks / total) * 360 - 90) : -90} 80 80)`}
          />
        </Svg>

        <View style={styles.centerText}>
          <Text style={styles.completedNumber}>{completed}</Text>
          <Text style={styles.totalNumber}>/{total}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.scheduledColor }]} />
          <Text style={styles.legendText}>Scheduled</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.anytimeColor }]} />
          <Text style={styles.legendText}>Complete Today</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  ringContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    transform: [{ rotate: '0deg' }],
  },
  centerText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    position: 'absolute',
  },
  completedNumber: {
    fontSize: 36,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
  },
  totalNumber: {
    fontSize: 20,
    fontFamily: 'Lexend_300Light',
    color: colors.textSecondary,
  },
  legend: {
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

export default ProgressRing;