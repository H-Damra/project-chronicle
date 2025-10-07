import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFonts, Lexend_300Light, Lexend_400Regular } from '@expo-google-fonts/lexend';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import CalendarTaskBlock from './CalendarTaskBlock';
import { useTasks } from '../../contexts/TaskContext';
import { colors } from '../../styles/colors';

const HOUR_HEIGHT = 120; // Height of each hour slot in pixels (120px = 60px per 30-min interval)

const CalendarDayView = ({ tasks, selectedDate }) => {
  const navigation = useNavigation();
  const { toggleTaskComplete } = useTasks();
  const scrollViewRef = useRef(null);

  let [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
  });

  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Check if selected date is today
  const isToday = isSameDay(selectedDate, new Date());

  // Helper functions for current time
  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours * HOUR_HEIGHT) + (minutes / 60 * HOUR_HEIGHT) + 8;
  };

  const getCurrentTimeLabel = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // State for real-time current time indicator
  const [currentTimePosition, setCurrentTimePosition] = useState(getCurrentTimePosition());
  const [currentTimeLabel, setCurrentTimeLabel] = useState(getCurrentTimeLabel());

  // Auto-scroll to current time when viewing today and screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current && isToday) {
        // Position current time in the middle of visible area
        const scrollPosition = getCurrentTimePosition() - 200;

        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, scrollPosition),
            animated: true,
          });
        }, 300);
      }
    }, [isToday])
  );

  // Update current time position and label every second (only if viewing today)
  useEffect(() => {
    if (!isToday) return;

    const interval = setInterval(() => {
      setCurrentTimePosition(getCurrentTimePosition());
      setCurrentTimeLabel(getCurrentTimeLabel());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isToday]);

  // Parse time string "3:30 PM" to minutes from midnight
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) {
      console.warn('parseTimeToMinutes: No time provided');
      return 0;
    }
    const parts = timeStr.split(' ');
    if (parts.length !== 2) {
      console.warn('parseTimeToMinutes: Invalid time format:', timeStr);
      return 0;
    }
    const [time, period] = parts;
    const timeParts = time.split(':');
    if (timeParts.length !== 2) {
      console.warn('parseTimeToMinutes: Invalid time structure:', timeStr);
      return 0;
    }
    const [hours, minutes] = timeParts.map(Number);
    let totalHours = hours;
    if (period === 'PM' && hours !== 12) totalHours += 12;
    if (period === 'AM' && hours === 12) totalHours = 0;
    const totalMinutes = totalHours * 60 + minutes;
    console.log(`parseTimeToMinutes: "${timeStr}" -> ${totalMinutes} minutes (${totalHours}h ${minutes}m)`);
    return totalMinutes;
  };

  // Detect overlapping tasks and calculate their layout
  const calculateTaskLayout = (tasks) => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const aStart = parseTimeToMinutes(a.time || a.dueBy);
      const bStart = parseTimeToMinutes(b.time || b.dueBy);
      return aStart - bStart;
    });

    const layoutTasks = sortedTasks.map((task) => {
      const startMinutes = parseTimeToMinutes(task.time || task.dueBy);
      const durationMinutes = task.length || 30;
      const endMinutes = startMinutes + durationMinutes;

      return {
        ...task,
        startMinutes,
        endMinutes,
        durationMinutes,
        column: 0,
        totalColumns: 1,
      };
    });

    // Detect overlaps and assign columns
    for (let i = 0; i < layoutTasks.length; i++) {
      const currentTask = layoutTasks[i];
      const overlappingTasks = [currentTask];

      // Find all tasks that overlap with current task
      for (let j = 0; j < layoutTasks.length; j++) {
        if (i === j) continue;
        const otherTask = layoutTasks[j];

        // Check if tasks overlap
        if (
          (otherTask.startMinutes < currentTask.endMinutes &&
            otherTask.endMinutes > currentTask.startMinutes)
        ) {
          if (!overlappingTasks.includes(otherTask)) {
            overlappingTasks.push(otherTask);
          }
        }
      }

      // Assign columns to overlapping tasks
      if (overlappingTasks.length > 1) {
        overlappingTasks.sort((a, b) => a.startMinutes - b.startMinutes);
        overlappingTasks.forEach((task, index) => {
          task.column = index;
          task.totalColumns = overlappingTasks.length;
        });
      }
    }

    return layoutTasks;
  };

  const layoutTasks = calculateTaskLayout(tasks);

  if (!fontsLoaded) {
    return null;
  }

  const hours = Array.from({ length: 25 }, (_, i) => i);

  const handleTaskPress = (task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleTaskToggle = (taskId, event) => {
    if (event) {
      event.stopPropagation();
    }
    toggleTaskComplete(taskId);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.container}>
        {/* Hour lines and labels */}
        {hours.map((hour) => {
          const displayHour = hour === 0 || hour === 24 ? 12 : hour > 12 ? hour - 12 : hour;
          const ampm = (hour < 12 || hour === 24) ? 'AM' : 'PM';

          return (
            <React.Fragment key={hour}>
              {/* Hour line */}
              <View style={styles.hourRow}>
                <View style={styles.timeLabel}>
                  <Text style={styles.timeLabelText}>
                    {displayHour} {ampm}
                  </Text>
                </View>
                <View style={styles.hourLine} />
              </View>

              {/* 30-minute line (no label) - don't show for hour 24 */}
              {hour < 24 && (
                <View style={styles.halfHourRow}>
                  <View style={styles.timeLabel} />
                  <View style={styles.halfHourLine} />
                </View>
              )}
            </React.Fragment>
          );
        })}

        {/* Vertical timeline axis */}
        <View style={styles.verticalAxis} />

        {/* Task blocks */}
        <View style={styles.tasksContainer}>
          {layoutTasks.map((task, index) => {
            const topPosition = (task.startMinutes / 60) * HOUR_HEIGHT + 8;
            const blockHeight = (task.durationMinutes / 60) * HOUR_HEIGHT;
            const containerWidth = 280; // Available width for tasks
            const blockWidth = containerWidth / task.totalColumns - 4;
            const leftPosition = 80 + (task.column * (containerWidth / task.totalColumns));

            // Debug logging for task positioning
            console.log(`Task "${task.title}": startMin=${task.startMinutes}, topPos=${topPosition}, height=${blockHeight}`);

            return (
              <CalendarTaskBlock
                key={task.id || index}
                task={task}
                top={topPosition}
                height={blockHeight}
                width={blockWidth}
                left={leftPosition}
                onPress={handleTaskPress}
                onToggleComplete={handleTaskToggle}
              />
            );
          })}
        </View>

        {/* Current time indicator (only show if viewing today) */}
        {isToday && (
          <View
            style={[
              styles.currentTimeLine,
              { top: currentTimePosition }
            ]}
          >
            <View style={styles.currentTimeDot} />
            <View style={styles.currentTimeLineBar} />
            <View style={styles.currentTimeLabel}>
              <Text style={styles.currentTimeLabelText}>
                {currentTimeLabel}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  container: {
    position: 'relative',
    height: HOUR_HEIGHT * 24 + (HOUR_HEIGHT / 2),
  },
  hourRow: {
    height: HOUR_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  halfHourRow: {
    height: HOUR_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeLabel: {
    width: 70,
    paddingRight: 8,
    paddingTop: 4,
  },
  timeLabelText: {
    fontSize: 12,
    fontFamily: 'Lexend_300Light',
    color: colors.textMuted,
    textAlign: 'right',
  },
  hourLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
    marginTop: 8,
  },
  halfHourLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
    marginTop: 8,
  },
  verticalAxis: {
    position: 'absolute',
    left: 70,
    top: 0,
    width: 1,
    height: HOUR_HEIGHT * 24 + (HOUR_HEIGHT / 2),
    backgroundColor: colors.divider,
    zIndex: 1,
  },
  tasksContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HOUR_HEIGHT * 24 + (HOUR_HEIGHT / 2),
  },
  currentTimeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  currentTimeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.currentTimeIndicator,
    marginLeft: 65,
    zIndex: 101,
    opacity: 0.5,
  },
  currentTimeLineBar: {
    flex: 1,
    height: 2,
    backgroundColor: colors.currentTimeIndicator,
    opacity: 0.5,
  },
  currentTimeLabel: {
    position: 'absolute',
    right: 16,
    backgroundColor: colors.currentTimeIndicator,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentTimeLabelText: {
    fontSize: 11,
    fontFamily: 'Lexend_400Regular',
    color: colors.white,
  },
});

export default CalendarDayView;
