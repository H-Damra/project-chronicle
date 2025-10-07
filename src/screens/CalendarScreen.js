import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useFonts, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold } from '@expo-google-fonts/lexend';
import Svg, { Path } from 'react-native-svg';

import DottedBackground from '../components/common/DottedBackground';
import TopGradientOverlay from '../components/common/TopGradientOverlay';
import CalendarLegend from '../components/calendar/CalendarLegend';
import ViewSwitcher from '../components/calendar/ViewSwitcher';
import CalendarDayView from '../components/calendar/CalendarDayView';
import CalendarWeekView from '../components/calendar/CalendarWeekView';
import CalendarMonthView from '../components/calendar/CalendarMonthView';
import DatePickerModal from '../components/calendar/DatePickerModal';
import { useTasks } from '../contexts/TaskContext';
import { colors } from '../styles/colors';

const CalendarTab = createMaterialTopTabNavigator();

// Helper functions for date formatting and navigation
const formatDayView = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatWeekView = (date) => {
  const firstDay = getFirstDayOfWeek(date);
  return `Week of ${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

const formatMonthView = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const getFirstDayOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  return result;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addWeeks = (date, weeks) => {
  return addDays(date, weeks * 7);
};

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Custom header component with legend and view switcher
const CalendarHeader = ({ state, navigation, selectedDate, setSelectedDate, showDatePicker, setShowDatePicker }) => {
  let [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
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

  const getDateText = () => {
    switch (activeView) {
      case 'week':
        return formatWeekView(selectedDate);
      case 'month':
        return formatMonthView(selectedDate);
      default: // day
        return formatDayView(selectedDate);
    }
  };

  const handlePreviousDate = () => {
    switch (activeView) {
      case 'week':
        setSelectedDate(addWeeks(selectedDate, -1));
        break;
      case 'month':
        setSelectedDate(addMonths(selectedDate, -1));
        break;
      default: // day
        setSelectedDate(addDays(selectedDate, -1));
        break;
    }
  };

  const handleNextDate = () => {
    switch (activeView) {
      case 'week':
        setSelectedDate(addWeeks(selectedDate, 1));
        break;
      case 'month':
        setSelectedDate(addMonths(selectedDate, 1));
        break;
      default: // day
        setSelectedDate(addDays(selectedDate, 1));
        break;
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const getPickerMode = () => {
    switch (activeView) {
      case 'week':
        return 'week';
      case 'month':
        return 'month';
      default:
        return 'day';
    }
  };

  return (
    <View style={styles.header}>
      {/* Title and Date Picker Row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Calendar</Text>
        <View style={styles.datePillButton}>
          <TouchableOpacity onPress={handlePreviousDate} style={styles.chevronButton}>
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18l-6-6 6-6"
                stroke={colors.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.datePillText}>{getDateText()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextDate} style={styles.chevronButton}>
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 18l6-6-6-6"
                stroke={colors.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legend and View Switcher */}
      <View style={styles.controls}>
        <CalendarLegend />
        <ViewSwitcher
          activeView={activeView}
          onViewChange={handleViewChange}
        />
      </View>

      {/* Custom Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onClose={() => setShowDatePicker(false)}
        mode={getPickerMode()}
      />
    </View>
  );
};

// Separate Day view component
const DayViewScreen = ({ selectedDate }) => {
  const { tasks } = useTasks();

  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const selectedScheduledTasks = tasks.scheduled.filter(task =>
    isSameDay(task.date, selectedDate)
  );
  const selectedAnytimeTasks = tasks.anytime.filter(task =>
    isSameDay(task.date, selectedDate) && task.dueBy
  );
  const calendarTasks = [...selectedScheduledTasks, ...selectedAnytimeTasks];

  return (
    <View style={styles.calendarContainer}>
      <CalendarDayView tasks={calendarTasks} selectedDate={selectedDate} />
    </View>
  );
};

// Separate Week view component
const WeekViewScreen = ({ selectedDate, setSelectedDate, navigation }) => {
  const { tasks } = useTasks();

  return (
    <View style={styles.calendarContainer}>
      <CalendarWeekView
        tasks={tasks}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        navigation={navigation}
      />
    </View>
  );
};

// Separate Month view component
const MonthViewScreen = ({ selectedDate, setSelectedDate, navigation }) => {
  const { tasks } = useTasks();

  return (
    <View style={styles.calendarContainer}>
      <CalendarMonthView
        tasks={tasks}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        navigation={navigation}
      />
    </View>
  );
};

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigationRef = useRef(null);

  // Reset to Day view and today's date when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset to today
      setSelectedDate(new Date());

      // Reset to Day tab
      if (navigationRef.current) {
        navigationRef.current.navigate('Day');
      }
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <DottedBackground />
      <TopGradientOverlay />

      <CalendarTab.Navigator
        ref={navigationRef}
        tabBar={(props) => (
          <CalendarHeader
            {...props}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
          />
        )}
        tabBarPosition="top"
        initialRouteName="Day"
        style={{ zIndex: 2 }}
        screenOptions={{
          headerShown: false,
          swipeEnabled: true,
          animationEnabled: true,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      >
        <CalendarTab.Screen name="Day">
          {() => <DayViewScreen selectedDate={selectedDate} />}
        </CalendarTab.Screen>
        <CalendarTab.Screen name="Week">
          {({ navigation }) => (
            <WeekViewScreen
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              navigation={navigation}
            />
          )}
        </CalendarTab.Screen>
        <CalendarTab.Screen name="Month">
          {({ navigation }) => (
            <MonthViewScreen
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              navigation={navigation}
            />
          )}
        </CalendarTab.Screen>
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
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
  },
  datePillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chevronButton: {
    padding: 2,
  },
  datePillText: {
    fontSize: 14,
    fontFamily: 'Lexend_500Medium',
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
});

export default CalendarScreen;
