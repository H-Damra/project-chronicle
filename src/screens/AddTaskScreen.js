import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFonts, Lexend_300Light, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold } from '@expo-google-fonts/lexend';
import Svg, { Path } from 'react-native-svg';

import { useTasks } from '../contexts/TaskContext';
import { colors } from '../styles/colors';

const AddTaskScreen = ({ navigation }) => {
  const { addTask } = useTasks();
  let [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
  });

  // Form state
  const [taskType, setTaskType] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [length, setLength] = useState(30);
  const [dueBy, setDueBy] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDueByPicker, setShowDueByPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showLengthPicker, setShowLengthPicker] = useState(false);

  const handleAddSubtask = () => {
    setSubTasks([
      ...subTasks,
      {
        id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: '',
        description: '',
        completed: false,
      },
    ]);
  };

  const handleRemoveSubtask = (index) => {
    setSubTasks(subTasks.filter((_, i) => i !== index));
  };

  const handleSubtaskChange = (index, field, value) => {
    const updated = [...subTasks];
    updated[index][field] = value;
    setSubTasks(updated);
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const getTaskTypeLabel = () => {
    if (!taskType) return 'Select Task Type';
    return taskType === 'scheduled' ? 'Scheduled Task' : 'Complete By Task';
  };

  const validate = () => {
    if (!taskType) {
      Alert.alert('Validation Error', 'Please select a task type');
      return false;
    }

    if (!taskName.trim()) {
      Alert.alert('Validation Error', 'Task name is required');
      return false;
    }

    if (taskType === 'scheduled' && !time) {
      Alert.alert('Validation Error', 'Time is required for scheduled tasks');
      return false;
    }

    if (taskType === 'scheduled' && !length) {
      Alert.alert('Validation Error', 'Length is required for scheduled tasks');
      return false;
    }

    // Validate subtasks
    for (let i = 0; i < subTasks.length; i++) {
      if (!subTasks[i].name.trim()) {
        Alert.alert('Validation Error', `Subtask ${i + 1} name is required`);
        return false;
      }
    }

    return true;
  };

  const handleAdd = () => {
    if (!validate()) return;

    const taskData = {
      type: taskType,
      title: taskName,
      description: description,
      category: taskType === 'scheduled' ? 'Scheduled' : 'Complete Today',
      date: date,
      subTasks: subTasks.filter(st => st.name.trim()),
    };

    if (taskType === 'scheduled') {
      taskData.time = formatTime(time);
      taskData.length = length;
    } else if (taskType === 'completeBy') {
      if (dueBy) {
        taskData.dueBy = formatTime(dueBy);
      }
    }

    addTask(taskData);
    navigation.goBack();
  };

  const handleCancel = () => {
    if (taskName || description || subTasks.length > 0) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Task</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.headerButton}>
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Type Picker */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Task Type</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTypePicker(true)}
          >
            <Text style={[styles.inputText, !taskType && styles.placeholderText]}>
              {getTaskTypeLabel()}
            </Text>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.dropdownIcon}>
              <Path
                d="M6 9l6 6 6-6"
                stroke={colors.textMuted}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Only show form fields after task type is selected */}
        {taskType && (
          <>
            {/* Task Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Task Name *</Text>
              <TextInput
                style={styles.input}
                value={taskName}
                onChangeText={setTaskName}
                placeholder="Enter task name"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description (optional)"
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.inputText}>
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Time (Scheduled only) */}
        {taskType === 'scheduled' && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Time *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.inputText}>{formatTime(time)}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(Platform.OS === 'ios');
                    if (selectedTime) {
                      setTime(selectedTime);
                    }
                  }}
                />
              )}
            </View>

            {/* Length */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Length *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowLengthPicker(true)}
              >
                <Text style={styles.inputText}>
                  {length >= 60
                    ? `${length / 60} hour${length / 60 > 1 ? 's' : ''}`
                    : `${length} minutes`
                  }
                </Text>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.dropdownIcon}>
                  <Path
                    d="M6 9l6 6 6-6"
                    stroke={colors.textMuted}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Due By (Complete By only) */}
        {taskType === 'completeBy' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Due By (Optional)</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDueByPicker(true)}
            >
              <Text style={styles.inputText}>
                {dueBy ? formatTime(dueBy) : 'No specific time'}
              </Text>
            </TouchableOpacity>
            {showDueByPicker && (
              <DateTimePicker
                value={dueBy || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowDueByPicker(Platform.OS === 'ios');
                  if (selectedTime) {
                    setDueBy(selectedTime);
                  }
                }}
              />
            )}
          </View>
        )}

        {/* Subtasks */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Subtasks</Text>
          {subTasks.map((subtask, index) => (
            <View key={subtask.id} style={styles.subtaskContainer}>
              <View style={styles.subtaskHeader}>
                <Text style={styles.subtaskNumber}>Subtask {index + 1}</Text>
                <TouchableOpacity onPress={() => handleRemoveSubtask(index)}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M18 6L6 18M6 6l12 12"
                      stroke={colors.textMuted}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={subtask.name}
                onChangeText={(value) => handleSubtaskChange(index, 'name', value)}
                placeholder="Subtask name *"
                placeholderTextColor={colors.textLight}
              />
              <TextInput
                style={[styles.input, styles.textArea, { marginTop: 8 }]}
                value={subtask.description}
                onChangeText={(value) => handleSubtaskChange(index, 'description', value)}
                placeholder="Subtask description (optional)"
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={2}
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addSubtaskButton} onPress={handleAddSubtask}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 4v16m8-8H4"
                stroke={colors.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.addSubtaskText}>Add Subtask</Text>
          </TouchableOpacity>
        </View>
          </>
        )}
      </ScrollView>

      {/* Modal for task type selection */}
      <Modal
        visible={showTypePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypePicker(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Select Task Type</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setTaskType('scheduled');
                setShowTypePicker(false);
              }}
            >
              <Text style={styles.modalOptionText}>Scheduled Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setTaskType('completeBy');
                setShowTypePicker(false);
              }}
            >
              <Text style={styles.modalOptionText}>Complete By Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancelOption]}
              onPress={() => setShowTypePicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal for length selection */}
      <Modal
        visible={showLengthPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLengthPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLengthPicker(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Select Length</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setLength(15);
                setShowLengthPicker(false);
              }}
            >
              <Text style={styles.modalOptionText}>15 minutes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setLength(30);
                setShowLengthPicker(false);
              }}
            >
              <Text style={styles.modalOptionText}>30 minutes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setLength(45);
                setShowLengthPicker(false);
              }}
            >
              <Text style={styles.modalOptionText}>45 minutes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setLength(60);
                setShowLengthPicker(false);
              }}
            >
              <Text style={styles.modalOptionText}>1 hour</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setLength(90);
                setShowLengthPicker(false);
              }}
            >
              <Text style={styles.modalOptionText}>1.5 hours</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setLength(120);
                setShowLengthPicker(false);
              }}
            >
              <Text style={styles.modalOptionText}>2 hours</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancelOption]}
              onPress={() => setShowLengthPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Lexend_500Medium',
    color: colors.textPrimary,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
    color: colors.textMuted,
  },
  addText: {
    fontSize: 16,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Lexend_500Medium',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
    color: colors.textPrimary,
  },
  inputText: {
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  placeholderText: {
    color: colors.textLight,
  },
  dropdownIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalCancelOption: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Lexend_500Medium',
    color: colors.textMuted,
    textAlign: 'center',
  },
  subtaskContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  subtaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtaskNumber: {
    fontSize: 14,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textMuted,
  },
  addSubtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  addSubtaskText: {
    fontSize: 14,
    fontFamily: 'Lexend_500Medium',
    color: colors.textSecondary,
  },
});

export default AddTaskScreen;
