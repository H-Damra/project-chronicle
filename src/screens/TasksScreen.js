import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
  Layout
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Lexend_300Light, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

import DottedBackground from '../components/common/DottedBackground';
import TopGradientOverlay from '../components/common/TopGradientOverlay';
import SectionHeader from '../components/common/SectionHeader';
import TaskCard from '../components/tasks/TaskCard';
import ProgressRing from '../components/common/ProgressRing';
import Timeline from '../components/common/Timeline';
import { colors } from '../styles/colors';
import { useScroll } from '../contexts/ScrollContext';
import { useTasks } from '../contexts/TaskContext';

const TasksScreen = () => {
  const { setScrollY } = useScroll();
  const navigation = useNavigation();
  const { tasks, toggleTaskComplete } = useTasks();

  // Utility functions for date filtering
  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const filterTasksForToday = (taskArray) => {
    const today = new Date();
    return taskArray.filter(task => isSameDay(task.date, today));
  };

  let [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

  const getTimelineTasks = () => {
    const currentHour = new Date().getHours();
    const currentMinutes = new Date().getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinutes;

    const timelineTasks = filterTasksForToday(tasks.scheduled).map(task => {
      const taskMinutes = parseTime(task.time);
      let status = 'upcoming';

      if (task.completed) {
        status = 'completed';
      } else if (taskMinutes < currentTotalMinutes - 60) {
        status = 'missed';
      } else if (taskMinutes <= currentTotalMinutes + 30) {
        status = 'next';
      }

      return {
        time: taskMinutes / 60,
        title: task.title,
        project: task.category,
        status,
        id: task.id,
        taskMinutes, // Keep for finding closest task
      };
    });

    // Check if ALL scheduled tasks for today are completed
    const todayScheduled = filterTasksForToday(tasks.scheduled);
    const allCompleted = todayScheduled.length > 0 &&
                         todayScheduled.every(t => t.completed);

    if (allCompleted) {
      // Find the last completed task time
      const lastTaskMinutes = Math.max(...tasks.scheduled.map(t => parseTime(t.time)));

      // Add "nothing else" message as a pseudo-task after the last task
      timelineTasks.push({
        time: (lastTaskMinutes / 60) + 1, // 1 hour after last task
        title: "Nothing Else Scheduled for the Day",
        project: null,
        status: 'message',
        id: 'nothing-scheduled-message',
        taskMinutes: lastTaskMinutes + 60,
      });
    }

    // Ensure at least one non-completed task is marked as 'next'
    const hasNextTask = timelineTasks.some(t => t.status === 'next');
    if (!hasNextTask) {
      // Find closest task to current time (either upcoming or most recent)
      const nonCompletedTasks = timelineTasks.filter(t => t.status !== 'completed' && t.status !== 'message');

      if (nonCompletedTasks.length > 0) {
        // Find task with minimum time distance from now
        let closestTask = nonCompletedTasks[0];
        let minDistance = Math.abs(closestTask.taskMinutes - currentTotalMinutes);

        nonCompletedTasks.forEach(task => {
          const distance = Math.abs(task.taskMinutes - currentTotalMinutes);
          if (distance < minDistance) {
            minDistance = distance;
            closestTask = task;
          }
        });

        closestTask.status = 'next';
      } else if (timelineTasks.find(t => t.status === 'message')) {
        // If only message exists, mark it as 'next'
        const messageTask = timelineTasks.find(t => t.status === 'message');
        messageTask.status = 'next-message';
      }
    }

    return timelineTasks;
  };

  const handleTaskComplete = (taskId) => {
    toggleTaskComplete(taskId);
  };

  const parseTime = (timeString) => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;

    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }

    return hour24 * 60 + minutes; // Convert to minutes for easy comparison
  };

  const handleTaskUncomplete = (taskId) => {
    toggleTaskComplete(taskId);
  };

  const getTotalRemainingTasks = () => {
    return filterTasksForToday(tasks.anytime).length +
           filterTasksForToday(tasks.dueToday).length +
           filterTasksForToday(tasks.scheduled).length;
  };

  const getCompletedTasks = () => {
    return [
      ...filterTasksForToday(tasks.anytime).filter(t => t.completed),
      ...filterTasksForToday(tasks.dueToday).filter(t => t.completed),
      ...filterTasksForToday(tasks.scheduled).filter(t => t.completed),
    ];
  };

  const getTotalCompletedTasks = () => {
    return getCompletedTasks().length;
  };

  const getTotalTasks = () => {
    return filterTasksForToday(tasks.anytime).length +
           filterTasksForToday(tasks.dueToday).length +
           filterTasksForToday(tasks.scheduled).length;
  };

  const getSortedAnytimeTasks = () => {
    return filterTasksForToday(tasks.anytime)
      .filter(t => !t.completed)
      .sort((a, b) => {
        // Tasks with dueBy times come first
        if (a.dueBy && !b.dueBy) return -1;
        if (!a.dueBy && b.dueBy) return 1;

        // Both have dueBy - sort by time
        if (a.dueBy && b.dueBy) {
          return parseTime(a.dueBy) - parseTime(b.dueBy);
        }

        // Both are anytime - maintain order
        return 0;
      });
  };

  const getSortedScheduledTasks = () => {
    return filterTasksForToday(tasks.scheduled)
      .filter(t => !t.completed)
      .sort((a, b) => parseTime(a.time) - parseTime(b.time));
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollY(offsetY);
  };

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <DottedBackground />
      <TopGradientOverlay />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Motivational Quote (Change to randomize between 100 different quotes)*/}
        <View style={styles.quoteSection}>
          <Text style={styles.quoteText}>
            "Fall seven times, stand up eight.” — Japanese Proverb
          </Text>
        </View>

        {/* Divider Line */}
        <View style={styles.quoteDivider} />

        {/* Progress Ring Section */}
        <View style={styles.progressSection}>
          <ProgressRing
            completed={getTotalCompletedTasks()}
            total={getTotalTasks()}
            scheduledCompleted={filterTasksForToday(tasks.scheduled).filter(t => t.completed).length}
            anytimeCompleted={filterTasksForToday(tasks.anytime).filter(t => t.completed).length}
            dueTodayCompleted={filterTasksForToday(tasks.dueToday).filter(t => t.completed).length}
          />
        </View>

        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          {/* Add Task button */}
          <View style={styles.addTasksButtonContainer}>
            <TouchableOpacity
              style={styles.addTasksPillButton}
              onPress={() => navigation.navigate('AddTask')}
            >
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 4v16m8-8H4"
                  stroke={colors.textSecondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.addTasksPillText}>Add Task</Text>
            </TouchableOpacity>
          </View>

          {/* Your Schedule card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Schedule</Text>
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeText}>{currentDate} • {currentTime}</Text>
              </View>
            </View>
            {/* Keep the outer card for shadow; clip the scroll inside this inner container */}
            <View style={styles.sectionCardInner}>
              <Timeline
                tasks={getTimelineTasks()}
                isEmpty={tasks.scheduled.length === 0}
                onTaskToggle={(taskId) => {
                  const task = tasks.scheduled.find(t => t.id === taskId);
                  if (task?.completed) {
                    handleTaskUncomplete(taskId);
                  } else {
                    handleTaskComplete(taskId);
                  }
                }}
              />
            </View>
          </View>
        </View>

        {/* Today's Tasks Section */}
        <Animated.View
          style={styles.section}
          entering={FadeIn.duration(500)}
          layout={Layout.duration(400)}
        >
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
            </View>
            <View style={styles.taskList}>
              {/* Complete Today Subsection */}
              <Text style={styles.subsectionTitle}>COMPLETE TODAY</Text>
              {(filterTasksForToday(tasks.anytime).filter(t => !t.completed).length > 0 || filterTasksForToday(tasks.dueToday).filter(t => !t.completed).length > 0) ? (
                <>
                  {getSortedAnytimeTasks().map((task) => (
                      <Animated.View
                        key={task.id}
                        style={styles.taskItem}
                        entering={FadeIn.duration(300)}
                        exiting={FadeOut.duration(300)}
                        layout={Layout.duration(300)}
                      >
                        <View style={styles.scheduledTaskContainer}>
                          <Text style={styles.scheduledTimeLabel}>
                            {task.dueBy ? `by ${task.dueBy}` : 'anytime'}
                          </Text>
                          <TaskCard
                            id={task.id}
                            progress={task.progress}
                            category={task.category}
                            title={task.title}
                            percentage={task.percentage}
                            completed={task.completed}
                            onComplete={handleTaskComplete}
                            onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                          />
                        </View>
                      </Animated.View>
                    ))}
                  {filterTasksForToday(tasks.dueToday).filter(t => !t.completed).map((task) => (
                    <Animated.View
                      key={task.id}
                      style={styles.taskItem}
                      entering={FadeIn.duration(300)}
                      exiting={FadeOut.duration(300)}
                      layout={Layout.duration(300)}
                    >
                      <View style={styles.scheduledTaskContainer}>
                        <Text style={styles.scheduledTimeLabel}>anytime</Text>
                        <TaskCard
                          id={task.id}
                          progress={task.progress}
                          category={task.category}
                          title={task.title}
                          percentage={task.percentage}
                          completed={task.completed}
                          onComplete={handleTaskComplete}
                          onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                        />
                      </View>
                    </Animated.View>
                  ))}
                </>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>You Have No Complete Today Tasks At The Moment</Text>
                </View>
              )}

              {/* Divider between subsections */}
              <View style={styles.sectionDivider} />

              {/* Scheduled Subsection */}
              <Text style={styles.subsectionTitle}>SCHEDULED</Text>
              {getSortedScheduledTasks().length > 0 ? (
                <>
                  {getSortedScheduledTasks().map((task) => (
                      <Animated.View
                        key={task.id}
                        style={styles.taskItem}
                        entering={FadeIn.duration(300)}
                        exiting={FadeOut.duration(300)}
                        layout={Layout.duration(300)}
                      >
                        <View style={styles.scheduledTaskContainer}>
                          <Text style={styles.scheduledTimeLabel}>{task.time}</Text>
                          <TaskCard
                            id={task.id}
                            progress={task.progress}
                            category={task.category}
                            title={task.title}
                            percentage={task.percentage}
                            completed={task.completed}
                            onComplete={handleTaskComplete}
                            onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                          />
                        </View>
                    </Animated.View>
                  ))}
                </>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>You Have No Scheduled Tasks At The Moment</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Completed Tasks Section */}
        {getCompletedTasks().length > 0 && (
          <Animated.View
            style={styles.section}
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(500)}
            layout={Layout.duration(400)}
          >
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Completed</Text>
              </View>
              <View style={styles.taskList}>
                {getCompletedTasks().map((task) => (
                  <Animated.View
                    key={task.id}
                    style={styles.taskItem}
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                    layout={Layout.duration(300)}
                  >
                    <TaskCard
                      id={task.id}
                      progress={task.progress}
                      category={task.category}
                      title={task.title}
                      percentage={task.percentage}
                      completed={task.completed}
                      time={task.time}
                      originalProgress={task.originalProgress}
                      onUncomplete={handleTaskUncomplete}
                      onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                    />
                  </Animated.View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
    position: 'relative',
    zIndex: 2,
  },
  quoteSection: {
    paddingHorizontal: 8,
    marginTop: 50,
    marginBottom: 16,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 13,
    fontFamily: 'Lexend_300Light',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 12,
    fontFamily: 'Lexend_500Medium',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  quoteDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 40,
    marginBottom: 16,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineSection: {
    marginBottom: 32,
  },
  addTasksButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  addTasksPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addTasksPillText: {
    fontSize: 14,
    fontFamily: 'Lexend_400Regular',
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  sectionCardInner: {
    borderRadius: 12,
    overflow: 'hidden', // confines the timeline / "scroll wheel" to the card
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 12,
    fontFamily: 'Lexend_300Light',
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Lexend_300Light',
    color: colors.textPrimary,
  },
  taskCount: {
    backgroundColor: colors.borderLight,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Lexend_600SemiBold',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  taskList: {
    padding: 24,
    paddingTop: 16,
    gap: 16,
  },
  taskItem: {
    // Individual task container
  },
  subsectionTitle: {
    fontSize: 11,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  scheduledTaskContainer: {
    position: 'relative',
  },
  scheduledTimeLabel: {
    fontSize: 11,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textMuted,
    textAlign: 'right',
    marginBottom: 4,
    paddingRight: 4,
  },
  emptyStateContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Lexend_300Light',
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TasksScreen;