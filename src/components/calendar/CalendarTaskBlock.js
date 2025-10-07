import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, Lexend_300Light, Lexend_400Regular, Lexend_500Medium } from '@expo-google-fonts/lexend';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../styles/colors';

const CalendarTaskBlock = ({
  task,
  top,
  height,
  width,
  left,
  onPress,
  onToggleComplete
}) => {
  let [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  const backgroundColor = task.type === 'scheduled'
    ? colors.scheduledTaskCalendar
    : colors.completeTodayTaskCalendar;

  const darkerColor = task.type === 'scheduled'
    ? '#B0A8C4' // Darker purple-grey
    : '#A3B5C4'; // Darker blue-grey

  return (
    <View style={[styles.wrapper, { top: top, left: left - 30 }]}>
      {/* Task content */}
      <TouchableOpacity
        style={[
          styles.container,
          {
            height: height,
            width: width,
            backgroundColor: backgroundColor,
            opacity: task.completed ? 0.7 : 1,
          }
        ]}
        onPress={() => onPress && onPress(task)}
        activeOpacity={0.7}
      >
        {/* Inset border */}
        <View style={[styles.insetBorder, { borderColor: darkerColor }]} pointerEvents="none" />

        {/* Checkbox - inline element */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={(e) => {
            e.stopPropagation();
            onToggleComplete && onToggleComplete(task.id, e);
          }}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            task.completed && styles.checkboxCompleted
          ]}>
            {task.completed && (
              <Svg width="16" height="16" viewBox="0 0 24 24">
                <Path
                  d="M5 13l4 4L19 7"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </View>
        </TouchableOpacity>

        {/* Task details */}
        <View style={styles.taskDetails}>
          {task.category && (
            <Text style={styles.category} numberOfLines={1}>
              {task.category}
            </Text>
          )}
          <Text
            style={[
              styles.title,
              task.completed && styles.titleCompleted
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {task.title}
          </Text>
          {(task.time || task.dueBy) && (
            <Text style={styles.time}>
              {task.time || task.dueBy}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
  container: {
    marginLeft: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  insetBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 11,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.checkboxBorder,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.checkboxCompleted,
    borderColor: colors.checkboxCompleted,
  },
  taskDetails: {
    flex: 1,
  },
  category: {
    fontSize: 12,
    fontFamily: 'Lexend_300Light',
    color: colors.textMuted,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Lexend_300Light',
    color: colors.textSecondary,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  time: {
    fontSize: 11,
    fontFamily: 'Lexend_400Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default CalendarTaskBlock;
