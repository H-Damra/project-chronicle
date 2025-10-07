import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useFonts, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold } from '@expo-google-fonts/lexend';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../styles/colors';

const DatePickerModal = ({ visible, selectedDate, onDateSelect, onClose, mode = 'day' }) => {
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  let [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const today = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const getFirstDayOfWeek = (date) => {
    if (!date) return null;
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    return result;
  };

  const isSameWeek = (date1, date2) => {
    if (!date1 || !date2) return false;
    const week1Start = getFirstDayOfWeek(date1);
    const week2Start = getFirstDayOfWeek(date2);
    return isSameDay(week1Start, week2Start);
  };

  const getWeekRows = (days) => {
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handlePreviousYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  };

  const handleNextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  };

  const handleDateSelect = (date) => {
    if (date) {
      if (mode === 'week') {
        // For week mode, return the first day of the week
        const weekStart = getFirstDayOfWeek(date);
        onDateSelect(weekStart);
      } else {
        onDateSelect(date);
      }
      onClose();
    }
  };

  const handleMonthSelect = () => {
    // For month mode, return the first day of the current month
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    onDateSelect(firstDayOfMonth);
    onClose();
  };

  const days = getDaysInMonth(currentMonth);
  const weekRows = getWeekRows(days);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 18l-6-6 6-6"
                  stroke={colors.textSecondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.monthYear}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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

          {/* Month mode: Just show year navigation and select button */}
          {mode === 'month' && (
            <>
              <View style={styles.yearNavigation}>
                <TouchableOpacity onPress={handlePreviousYear} style={styles.yearNavButton}>
                  <Text style={styles.yearNavText}>← Previous Year</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNextYear} style={styles.yearNavButton}>
                  <Text style={styles.yearNavText}>Next Year →</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.selectButton} onPress={handleMonthSelect}>
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Day and Week modes: Show calendar grid */}
          {(mode === 'day' || mode === 'week') && (
            <>
              {/* Day names */}
              <View style={styles.dayNamesRow}>
                {dayNames.map((name, index) => (
                  <View key={index} style={styles.dayNameCell}>
                    <Text style={styles.dayNameText}>{name}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar grid */}
              {mode === 'day' && (
                <View style={styles.calendarGrid}>
                  {days.map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, today);

                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.dayCell}
                        onPress={() => handleDateSelect(date)}
                        disabled={!date}
                      >
                        {date && (
                          <View style={[
                            styles.dayButton,
                            isSelected && styles.selectedDay,
                            isToday && !isSelected && styles.todayDay,
                          ]}>
                            <Text style={[
                              styles.dayText,
                              isSelected && styles.selectedDayText,
                              isToday && !isSelected && styles.todayDayText,
                            ]}>
                              {date.getDate()}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Week mode grid */}
              {mode === 'week' && (
                <View style={styles.calendarGrid}>
                  {weekRows.map((week, weekIndex) => {
                    const firstDayOfWeek = week.find(day => day !== null);
                    const isSelectedWeek = firstDayOfWeek && isSameWeek(firstDayOfWeek, selectedDate);

                    return (
                      <View key={weekIndex} style={styles.weekRowContainer}>
                        <View style={[styles.weekRow, isSelectedWeek && styles.selectedWeekRow]}>
                          {week.map((date, dayIndex) => {
                            const isToday = isSameDay(date, today);

                            return (
                              <TouchableOpacity
                                key={dayIndex}
                                style={styles.dayCell}
                                onPress={() => handleDateSelect(date)}
                                disabled={!date}
                              >
                                {date && (
                                  <View style={[
                                    styles.dayButton,
                                    isToday && styles.todayDay,
                                  ]}>
                                    <Text style={[
                                      styles.dayText,
                                      isSelectedWeek && styles.selectedWeekText,
                                      isToday && !isSelectedWeek && styles.todayDayText,
                                    ]}>
                                      {date.getDate()}
                                    </Text>
                                  </View>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Done button */}
              <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontFamily: 'Lexend_500Medium',
    color: colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: colors.textPrimary,
  },
  todayDay: {
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Lexend_400Regular',
    color: colors.textSecondary,
  },
  selectedDayText: {
    color: colors.white,
    fontFamily: 'Lexend_500Medium',
  },
  todayDayText: {
    color: colors.textPrimary,
    fontFamily: 'Lexend_500Medium',
  },
  doneButton: {
    backgroundColor: colors.borderLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'Lexend_500Medium',
    color: colors.textSecondary,
  },
  yearNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: 12,
  },
  yearNavButton: {
    flex: 1,
    backgroundColor: colors.borderLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  yearNavText: {
    fontSize: 14,
    fontFamily: 'Lexend_500Medium',
    color: colors.textSecondary,
  },
  selectButton: {
    backgroundColor: colors.textPrimary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: 'Lexend_500Medium',
    color: colors.white,
  },
  weekRowContainer: {
    width: '100%',
    marginBottom: 4,
  },
  weekRow: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  selectedWeekRow: {
    backgroundColor: colors.borderLight,
  },
  selectedWeekText: {
    color: colors.textPrimary,
    fontFamily: 'Lexend_500Medium',
  },
});

export default DatePickerModal;
