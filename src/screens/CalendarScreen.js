import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFonts, Lexend_600SemiBold } from '@expo-google-fonts/lexend';

import DottedBackground from '../components/common/DottedBackground';
import CalendarLegend from '../components/calendar/CalendarLegend';
import ViewSwitcher from '../components/calendar/ViewSwitcher';
import CalendarDayView from '../components/calendar/CalendarDayView';
import WeekViewPlaceholder from './WeekViewPlaceholder';
import MonthViewPlaceholder from './MonthViewPlaceholder';
import { useTasks } from '../contexts/TaskContext';
import { colors } from '../styles/colors';

const CalendarTab = createMaterialTopTabNavigator();

// Custom header component with legend and view switcher
const CalendarHeader = ({ state, navigation }) => {
  let [fontsLoaded] = useFonts({
    Lexend_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const routeNames = ['day', 'week', 'month'];
  const activeView = routeNames[state.index];

  const handleViewChange = (view) => {
    const index = routeNames.indexOf(view);
    if (index !== -1) {
      navigation.navigate(state.routes[index].name);
    }
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Calendar</Text>
      <View style={styles.controls}>
        <CalendarLegend />
        <ViewSwitcher
          activeView={activeView}
          onViewChange={handleViewChange}
        />
      </View>
    </View>
  );
};

// Separate Day view component
const DayViewScreen = () => {
  const { tasks } = useTasks();

  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const today = new Date();
  const todayScheduledTasks = tasks.scheduled.filter(task =>
    isSameDay(task.date, today)
  );
  const todayAnytimeTasks = tasks.anytime.filter(task =>
    isSameDay(task.date, today) && task.dueBy
  );
  const calendarTasks = [...todayScheduledTasks, ...todayAnytimeTasks];

  return (
    <View style={styles.calendarContainer}>
      <CalendarDayView tasks={calendarTasks} />
    </View>
  );
};

const CalendarScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <DottedBackground />

      <CalendarTab.Navigator
        tabBar={(props) => <CalendarHeader {...props} />}
        tabBarPosition="top"
        initialRouteName="Day"
        screenOptions={{
          headerShown: false,
          swipeEnabled: true,
          animationEnabled: true,
        }}
      >
        <CalendarTab.Screen name="Day" component={DayViewScreen} />
        <CalendarTab.Screen name="Week" component={WeekViewPlaceholder} />
        <CalendarTab.Screen name="Month" component={MonthViewPlaceholder} />
      </CalendarTab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});

export default CalendarScreen;
