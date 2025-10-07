import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import WeekDayCard from './WeekDayCard';

const CalendarWeekView = ({ tasks, selectedDate, setSelectedDate, navigation }) => {
  // Helper function to get first day of week (Sunday)
  const getFirstDayOfWeek = (date) => {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  // Get all 7 days of the week
  const getWeekDays = (selectedDate) => {
    const firstDay = getFirstDayOfWeek(selectedDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDay);
      day.setDate(firstDay.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Get tasks for a specific date
  const getTasksForDate = (date, allTasks) => {
    const scheduledTasks = allTasks.scheduled.filter(task =>
      isSameDay(task.date, date)
    );
    const completeTodayTasks = allTasks.anytime.filter(task =>
      isSameDay(task.date, date) && task.dueBy
    );
    const dueTodayTasks = allTasks.dueToday?.filter(task =>
      isSameDay(task.date, date)
    ) || [];

    return {
      scheduled: scheduledTasks,
      completeToday: [...completeTodayTasks, ...dueTodayTasks],
      all: [...scheduledTasks, ...completeTodayTasks, ...dueTodayTasks]
    };
  };

  // Handle day card press
  const handleDayPress = (date) => {
    setSelectedDate(date);
    navigation.navigate('Day');
  };

  const weekDays = getWeekDays(selectedDate);
  const today = new Date();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {weekDays.map((day, index) => {
        const dayTasks = getTasksForDate(day, tasks);
        const taskCount = dayTasks.all.length;
        const scheduledCount = dayTasks.scheduled.length;
        const completeTodayCount = dayTasks.completeToday.length;
        const completedCount = dayTasks.all.filter(t => t.completed).length;
        const isToday = isSameDay(day, today);

        return (
          <WeekDayCard
            key={index}
            date={day}
            isToday={isToday}
            taskCount={taskCount}
            scheduledCount={scheduledCount}
            completeTodayCount={completeTodayCount}
            completedCount={completedCount}
            onPress={() => handleDayPress(day)}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
});

export default CalendarWeekView;
