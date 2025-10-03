import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../styles/colors';

const TaskCard = ({
  id,
  progress,
  category,
  title,
  percentage,
  completed = false,
  time = null,
  showTimeInCorner = false,
  onComplete,
  onUncomplete,
  originalProgress,
  onPress
}) => {
  const progressAnimation = useSharedValue(progress);
  const checkboxAnimation = useSharedValue(completed ? 1 : 0);
  const fadeAnimation = useSharedValue(0);
  const strikethroughAnimation = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    progressAnimation.value = progress;
    checkboxAnimation.value = completed ? 1 : 0;
    strikethroughAnimation.value = completed ? 1 : 0;
  }, [progress, completed]);

  useEffect(() => {
    // Fade in animation when component mounts or id changes (new task appears)
    fadeAnimation.value = withTiming(1, { duration: 500 });
  }, [id]);

  const handleCheckboxPress = () => {
    if (completed && onUncomplete) {
      // Uncomplete animation sequence
      checkboxAnimation.value = withTiming(0, { duration: 200 });

      progressAnimation.value = withTiming(originalProgress || progress, { duration: 400 });

      strikethroughAnimation.value = withDelay(200, withTiming(0, { duration: 300 }));

      fadeAnimation.value = withDelay(600, withTiming(0, { duration: 400 }, () => {
        runOnJS(onUncomplete)(id);
      }));
    } else if (!completed && onComplete) {
      // Complete animation sequence
      checkboxAnimation.value = withTiming(1, { duration: 200 });

      progressAnimation.value = withTiming(100, { duration: 400 });

      strikethroughAnimation.value = withDelay(200, withTiming(1, { duration: 300 }));

      fadeAnimation.value = withDelay(600, withTiming(0, { duration: 400 }, () => {
        runOnJS(onComplete)(id);
      }));
    }
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value}%`,
  }));

  const checkboxStyle = useAnimatedStyle(() => ({
    backgroundColor: checkboxAnimation.value > 0.5 ? colors.checkboxCompleted : colors.white,
    borderColor: checkboxAnimation.value > 0.5 ? colors.checkboxCompleted : colors.checkboxBorder,
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: checkboxAnimation.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: fadeAnimation.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    textDecorationLine: strikethroughAnimation.value > 0.5 ? 'line-through' : 'none',
    color: strikethroughAnimation.value > 0.5 ? colors.textLight : colors.textSecondary,
  }));

  const categoryStyle = useAnimatedStyle(() => ({
    color: strikethroughAnimation.value > 0.5 ? colors.textLight : colors.textMuted,
  }));

  const percentageStyle = useAnimatedStyle(() => ({
    color: strikethroughAnimation.value > 0.5 ? colors.textLight : colors.textSecondary,
  }));

  return (
    <Animated.View style={[styles.taskCard, completed && styles.completedTask, cardStyle]}>
      {!completed && progress > 0 && <Animated.View style={[styles.liquidFill, progressStyle]} />}

      {/* Card content - touchable for navigation */}
      <TouchableOpacity
        style={styles.taskContent}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        <View style={styles.checkboxPlaceholder} />
        <View style={styles.taskDetails}>
          <Animated.Text style={[styles.taskCategory, categoryStyle]}>{category}</Animated.Text>
          <Animated.Text style={[styles.taskTitle, titleStyle]}>{title}</Animated.Text>
        </View>
        {!completed && progress > 0 && (
          <Animated.Text style={[styles.taskPercentage, percentageStyle]}>
            {Math.round(progressAnimation.value || progress)}%
          </Animated.Text>
        )}
      </TouchableOpacity>

      {/* Checkbox - separate touch area with higher z-index */}
      <TouchableOpacity
        onPress={handleCheckboxPress}
        style={styles.checkboxContainer}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.checkboxInner, checkboxStyle]}>
          <Animated.View style={checkmarkStyle}>
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 13l4 4L19 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  liquidFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.liquidFill,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  checkboxPlaceholder: {
    width: 24,
    height: 24,
  },
  checkboxContainer: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.checkboxBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCheckbox: {
    borderColor: colors.checkboxCompleted,
    backgroundColor: colors.checkboxCompleted,
  },
  taskDetails: {
    flex: 1,
  },
  taskCategory: {
    fontSize: 12,
    fontFamily: 'Lexend_300Light',
    color: colors.textMuted,
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: 'Lexend_300Light',
    color: colors.textSecondary,
  },
  taskPercentage: {
    fontSize: 14,
    fontFamily: 'Lexend_300Light',
    color: colors.textSecondary,
  },
  completedTask: {
    opacity: 0.7,
  },
});

export default TaskCard;