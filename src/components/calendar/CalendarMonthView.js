import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFonts, Lexend_300Light, Lexend_400Regular, Lexend_600SemiBold } from '@expo-google-fonts/lexend';
import MiniProgressRing from './MiniProgressRing';
import { colors } from '../../styles/colors';

const CalendarMonthView = ({ tasks, selectedDate, setSelectedDate, navigation }) => {
  let [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Helper function to check if two dates are the same day
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
    };
  };

  // Get all days to display in the calendar grid
  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Days in current month only (no padding from prev/next months)
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push(new Date(year, month, i));
    }

    return currentMonthDays;
  };

  // Handle day press
  const handleDayPress = (date) => {
    setSelectedDate(date);
    navigation.navigate('Day');
  };

  const calendarDays = getCalendarDays(selectedDate);
  const today = new Date();
  const currentMonth = selectedDate.getMonth();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((date, index) => {
          const dayTasks = getTasksForDate(date, tasks);
          const scheduledTasks = dayTasks.scheduled;
          const completeTodayTasks = dayTasks.completeToday;

          const scheduledCount = scheduledTasks.length;
          const completeTodayCount = completeTodayTasks.length;
          const totalCount = scheduledCount + completeTodayCount;

          // Calculate completed counts
          const scheduledCompleted = scheduledTasks.filter(t => t.completed).length;
          const completeTodayCompleted = completeTodayTasks.filter(t => t.completed).length;
          const totalCompleted = scheduledCompleted + completeTodayCompleted;

          const isToday = isSameDay(date, today);
          const isCurrentMonth = date.getMonth() === currentMonth;
          const monthNumber = date.getMonth() + 1; // +1 because getMonth() returns 0-11
          const dayNumber = date.getDate();
          const dateDisplay = `${monthNumber}/${dayNumber}`;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCard,
                isToday && styles.todayCard,
              ]}
              onPress={() => handleDayPress(date)}
              activeOpacity={0.7}
            >
              {/* Day number - top right */}
              <Text style={[
                styles.dayNumber,
                !isCurrentMonth && styles.otherMonthDay,
                isToday && styles.todayDayNumber,
              ]}>
                {dateDisplay}
              </Text>

              {/* Content container - centered */}
              <View style={styles.cardContent}>
                {/* Mini Progress Ring */}
                <MiniProgressRing
                  completed={totalCompleted}
                  total={totalCount}
                  scheduledCompleted={scheduledCompleted}
                  completeTodayCompleted={completeTodayCompleted}
                />

                {/* Stats row - below ring */}
                <View style={[styles.statsRow, totalCount === 0 && styles.statsRowHidden]}>
                  {/* Scheduled count */}
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: colors.scheduledTaskCalendar }]} />
                    <Text style={styles.statText}>{scheduledCount}</Text>
                  </View>

                  {/* Complete Today count */}
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: colors.completeTodayTaskCalendar }]} />
                    <Text style={styles.statText}>{completeTodayCount}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 32,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayCard: {
    width: '23.5%', // 4 columns: ~25% minus gap spacing
    height: 130,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCard: {
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  dayNumber: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 18,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
    zIndex: 10,
  },
  todayDayNumber: {
    color: colors.textPrimary,
  },
  otherMonthDay: {
    color: colors.textLight,
  },
  cardContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -20 }],
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  statsRowHidden: {
    opacity: 0,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Lexend_400Regular',
    color: colors.textMuted,
  },
});

export default CalendarMonthView;
