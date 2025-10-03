import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Lexend_300Light, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend';
import Svg, { Path } from 'react-native-svg';

import { useTasks } from '../contexts/TaskContext';
import { colors } from '../styles/colors';

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { findTask, toggleSubtask } = useTasks();
  const task = findTask(taskId);

  let [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  if (!fontsLoaded || !task) {
    return null;
  }

  const formatDate = (date) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const completedSubtasks = task.subTasks ? task.subTasks.filter(st => st.completed).length : 0;
  const totalSubtasks = task.subTasks ? task.subTasks.length : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M5 12l7 7M5 12l7-7"
              stroke={colors.textPrimary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Name */}
        <View style={styles.section}>
          <Text style={styles.taskName}>{task.title}</Text>
          {task.category && (
            <Text style={styles.category}>{task.category}</Text>
          )}
        </View>

        {/* Description */}
        {task.description && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        )}

        {/* Task Info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{formatDate(task.date)}</Text>
            </View>

            {task.time && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Time:</Text>
                <Text style={styles.infoValue}>{task.time}</Text>
              </View>
            )}

            {task.length && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Length:</Text>
                <Text style={styles.infoValue}>
                  {task.length >= 60
                    ? `${task.length / 60} hour${task.length / 60 > 1 ? 's' : ''}`
                    : `${task.length} minutes`
                  }
                </Text>
              </View>
            )}

            {task.dueBy && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Due By:</Text>
                <Text style={styles.infoValue}>{task.dueBy}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>
                {task.type === 'scheduled' ? 'Scheduled Task' : 'Complete By Task'}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${task.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{task.progress}% Complete</Text>
          </View>
        </View>

        {/* Subtasks */}
        {task.subTasks && task.subTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Subtasks ({completedSubtasks}/{totalSubtasks})
            </Text>
            {task.subTasks.map((subtask) => (
              <TouchableOpacity
                key={subtask.id}
                style={styles.subtaskCard}
                onPress={() => toggleSubtask(task.id, subtask.id)}
                activeOpacity={0.7}
              >
                <View style={styles.subtaskContent}>
                  {/* Checkbox */}
                  <View style={[
                    styles.checkbox,
                    subtask.completed && styles.checkboxCompleted
                  ]}>
                    {subtask.completed && (
                      <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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

                  {/* Subtask Details */}
                  <View style={styles.subtaskDetails}>
                    <Text style={[
                      styles.subtaskName,
                      subtask.completed && styles.subtaskNameCompleted
                    ]}>
                      {subtask.name}
                    </Text>
                    {subtask.description && (
                      <Text style={[
                        styles.subtaskDescription,
                        subtask.completed && styles.subtaskDescriptionCompleted
                      ]}>
                        {subtask.description}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State for No Subtasks */}
        {(!task.subTasks || task.subTasks.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No subtasks for this task</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Lexend_500Medium',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  taskName: {
    fontSize: 28,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    fontFamily: 'Lexend_400Regular',
    color: colors.textMuted,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Lexend_300Light',
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Lexend_500Medium',
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Lexend_400Regular',
    color: colors.textPrimary,
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: colors.borderLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.textPrimary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtaskCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  subtaskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.checkboxBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    borderColor: colors.checkboxCompleted,
    backgroundColor: colors.checkboxCompleted,
  },
  subtaskDetails: {
    flex: 1,
  },
  subtaskName: {
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtaskNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  subtaskDescription: {
    fontSize: 14,
    fontFamily: 'Lexend_300Light',
    color: colors.textMuted,
  },
  subtaskDescriptionCompleted: {
    color: colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Lexend_300Light',
    color: colors.textMuted,
  },
});

export default TaskDetailScreen;
