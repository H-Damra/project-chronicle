import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, Lexend_400Regular, Lexend_500Medium } from '@expo-google-fonts/lexend';
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
    Lexend_400Regular,
    Lexend_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  const backgroundColor = task.type === 'scheduled'
    ? colors.scheduledTaskCalendar
    : colors.completeTodayTaskCalendar;

  return (
    <View style={[styles.wrapper, { top: top, left: left - 30 }]}>
      {/* Checkbox overlay */}
      <TouchableOpacity
        style={styles.checkboxArea}
        onPress={(e) => onToggleComplete && onToggleComplete(task.id, e)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          task.completed && styles.checkboxCompleted
        ]}>
          {task.completed && (
            <Svg width="12" height="12" viewBox="0 0 12 12">
              <Path
                d="M2 6L5 9L10 3"
                stroke="#FFFFFF"
                strokeWidth="2"
                fill="none"
              />
            </Svg>
          )}
        </View>
      </TouchableOpacity>

      {/* Task content */}
      <TouchableOpacity
        style={[
          styles.container,
          {
            height: height,
            width: width,
            backgroundColor: backgroundColor,
            opacity: task.completed ? 0.6 : 1,
          }
        ]}
        onPress={() => onPress && onPress(task)}
        activeOpacity={0.7}
      >
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
        {task.time && (
          <Text style={styles.time}>{task.time}</Text>
        )}
        {task.category && height > 40 && (
          <Text
            style={styles.category}
            numberOfLines={1}
          >
            {task.category}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
  checkboxArea: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 24,
    height: 24,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
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
  container: {
    marginLeft: 30,
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Lexend_500Medium',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  time: {
    fontSize: 11,
    fontFamily: 'Lexend_400Regular',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  category: {
    fontSize: 10,
    fontFamily: 'Lexend_400Regular',
    color: colors.textMuted,
  },
});

export default CalendarTaskBlock;
