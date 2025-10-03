import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../styles/colors';

const TimelineTaskCard = ({ task, onTaskPress }) => {
  if (!task) return null;

  const isCompleted = task.status === 'completed';
  const isMissed = task.status === 'missed';
  const isNext = task.status === 'next';
  const isMessage = task.status === 'message' || task.status === 'next-message';
  const isNextMessage = task.status === 'next-message';

  // Shared values for animations
  const strikethroughProgress = useSharedValue(isCompleted ? 1 : 0);

  // Watch for status changes and update animation (skip for messages)
  useEffect(() => {
    if (!isMessage) {
      strikethroughProgress.value = withTiming(isCompleted ? 1 : 0, { duration: 300 });
    }
  }, [isCompleted, isMessage]);

  // Animated style for strikethrough effect
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    textDecorationLine: strikethroughProgress.value > 0 ? 'line-through' : 'none',
    opacity: interpolate(
      strikethroughProgress.value,
      [0, 1],
      [1, 0.7],
      Extrapolate.CLAMP
    ),
  }));

  const projectAnimatedStyle = useAnimatedStyle(() => ({
    textDecorationLine: strikethroughProgress.value > 0 ? 'line-through' : 'none',
    opacity: interpolate(
      strikethroughProgress.value,
      [0, 1],
      [1, 0.7],
      Extrapolate.CLAMP
    ),
  }));

  const handlePress = () => {
    if (isMissed || isMessage) return; // Messages not clickable

    if (!isCompleted) {
      // When completing: Delay handler call until after animation completes
      setTimeout(() => {
        onTaskPress(task);
      }, 300); // Match animation duration
    } else {
      // When uncompleting: Call immediately (no scroll happens)
      onTaskPress(task);
    }
  };

  let cardStyle = [styles.taskCard];
  if (isNext || isNextMessage) {
    cardStyle.push(styles.taskCardNext);
  } else if (isCompleted || isMissed) {
    cardStyle.push(styles.taskCardMuted);
  }

  if (isMessage) {
    cardStyle.push(styles.taskCardMessage);
  }

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={handlePress}
      disabled={isMissed || isMessage}
    >
      {isNext && <Text style={styles.upNextLabel}>UP NEXT</Text>}

      {isMessage ? (
        <Text style={styles.messageText}>{task.title}</Text>
      ) : (
        <>
          <Animated.Text style={[
            styles.taskTitle,
            titleAnimatedStyle,
            isMissed && styles.taskTitleMuted
          ]}>
            {task.title}
          </Animated.Text>

          {task.project && (
            <Animated.Text style={[
              styles.taskProject,
              projectAnimatedStyle,
              isMissed && styles.taskProjectMuted
            ]}>
              {task.project}
            </Animated.Text>
          )}

          {isMissed && <Text style={styles.missedLabel}>MISSED</Text>}
          {isCompleted && <Text style={styles.completedLabel}>COMPLETED</Text>}

          {!isMissed && (
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox,
                isCompleted && styles.checkboxCompleted
              ]}>
                {isCompleted && (
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
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const TimelineEmpty = () => {
  return (
    <View style={styles.container}>
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>You Have No Scheduled Tasks</Text>
      </View>
    </View>
  );
};

const TimelineTaskSlot = ({ slot, HOUR_HEIGHT, CENTER_OFFSET, CONTAINER_HEIGHT, scrollY, handleTaskPress }) => {
  const slotStyle = useAnimatedStyle(() => {
    const slotPosition = slot.index * HOUR_HEIGHT;
    const translateY = CENTER_OFFSET - scrollY.value + slotPosition;
    const distanceFromCenter = Math.abs(CENTER_OFFSET - translateY);

    const ratio = Math.min(distanceFromCenter / (CONTAINER_HEIGHT / 2), 1);
    const scale = interpolate(
      ratio,
      [0, 1],
      [1, 0.8],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      ratio,
      [0, 1],
      [1, 0.3],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.taskSlot, slotStyle]}>
      <Text style={styles.timeText}>{slot.displayTime}</Text>
      <View style={styles.midColumn}>
        <View style={styles.taskContainer}>
          <View style={styles.taskCardWrapper}>
            <TimelineTaskCard task={slot.task} onTaskPress={handleTaskPress} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const TimelineContent = ({ tasks = [], onTaskToggle }) => {
  const HOUR_HEIGHT = 120;
  const CONTAINER_HEIGHT = 120;
  const CENTER_OFFSET = -5; // Position focus in center of card

  // Dot/connector geometry (gutter lives INSIDE task area)
  const DOT_SIZE = 16;
  const DOT_BORDER = 4; // matches styles.timelineDot borderWidth
  const DOT_TOTAL = DOT_SIZE; // visual height (border included in background ring)
  const GUTTER_LEFT = 12;      // inset from task area's left edge
  const GUTTER_WIDTH = DOT_SIZE;
  const CONNECTOR_MIN_DOTS = 3;
  const CONNECTOR_DOT_SPACING = 15; // px between tiny connector dots

  const scrollY = useSharedValue(0);
  const [visibleTasks, setVisibleTasks] = useState([]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  };

  const [currentTime] = useState(8.5); // Simulating 8:30 AM

  // Create array of task positions for snapping (index-based)
  const taskPositions = useMemo(() => {
    return tasks.map((_, index) => index * HOUR_HEIGHT);
  }, [tasks]);

  // Create shared value for task positions to use in worklets
  const taskPositionsShared = useSharedValue(taskPositions);

  // Update shared value when task positions change
  useEffect(() => {
    taskPositionsShared.value = taskPositions;
  }, [taskPositions]);

  // Calculate task range for rendering messages
  const taskRange = useMemo(() => {
    if (tasks.length === 0) return { earliest: null, latest: null };
    const taskHours = tasks.map(t => t.time).sort((a, b) => a - b);
    return {
      earliest: taskHours[0],
      latest: taskHours[taskHours.length - 1]
    };
  }, [tasks]);

  const initializePosition = () => {
    const upNextTask = tasks.find(t => t.status === 'next' || t.status === 'next-message');
    if (upNextTask) {
      // Find the index of the "Up Next" task
      const taskIndex = tasks.findIndex(t => t.id === upNextTask.id);
      // Animate to the task's index position
      scrollY.value = withSpring(taskIndex * HOUR_HEIGHT, {
        damping: 25,
        stiffness: 120,
        mass: 1,
      });
    } else {
      // If no "Up Next" task, find the first upcoming task
      const upcomingTask = tasks.find(t => t.status === 'upcoming');
      if (upcomingTask) {
        const taskIndex = tasks.findIndex(t => t.id === upcomingTask.id);
        scrollY.value = withSpring(taskIndex * HOUR_HEIGHT, {
          damping: 25,
          stiffness: 120,
          mass: 1,
        });
      } else if (tasks.length > 0) {
        // Fallback to first task
        scrollY.value = withSpring(0, {
          damping: 25,
          stiffness: 120,
          mass: 1,
        });
      }
    }
  };

  useEffect(() => {
    initializePosition();
  }, [tasks]);

  const convertDecimalTimeToString = (decimalTime) => {
    // decimalTime is like 14.75 for 2:45 PM
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);
    const ampm = hours < 12 ? 'AM' : 'PM';
    const displayHour = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHour}:${displayMinutes} ${ampm}`;
  };

  const generateTaskSlots = () => {
    // Sort tasks by time and create one slot per task
    const sortedTasks = [...tasks].sort((a, b) => a.time - b.time);
    return sortedTasks.map((task, index) => ({
      index,  // Position in list (0, 1, 2, ...)
      time: task.time,  // Actual time for display
      displayTime: convertDecimalTimeToString(task.time),
      task: task,
    }));
  };

  const taskSlots = useMemo(() => generateTaskSlots(), [tasks]);

  const scrollVelocity = useSharedValue(0);
  const lastScrollY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      // Store the starting position when gesture begins
      lastScrollY.value = scrollY.value;
      scrollVelocity.value = 0;
    })
    .onChange((event) => {
      const scrollMultiplier = 0.5; // Dampen scroll speed for more control
      const newScrollY = scrollY.value - event.changeY * scrollMultiplier;
      const maxScroll = Math.max(0, (tasks.length - 1) * HOUR_HEIGHT);
      scrollY.value = Math.max(0, Math.min(newScrollY, maxScroll));

      // Track velocity (positive = scrolling down, negative = scrolling up)
      scrollVelocity.value = scrollY.value - lastScrollY.value;
      lastScrollY.value = scrollY.value;
    })
    .onEnd(() => {
      'worklet';
      const currentPosition = scrollY.value;
      const positions = taskPositionsShared.value;
      const velocity = scrollVelocity.value;

      let targetPosition;

      if (positions.length === 0) {
        // Fallback to hour snapping if no tasks
        targetPosition = Math.round(currentPosition / HOUR_HEIGHT) * HOUR_HEIGHT;
      } else {
        const VELOCITY_THRESHOLD = 1; // Minimum velocity to trigger directional snap

        if (Math.abs(velocity) < VELOCITY_THRESHOLD) {
          // Minimal movement: snap to nearest task
          targetPosition = positions[0];
          let minDistance = Math.abs(currentPosition - targetPosition);

          for (let i = 0; i < positions.length; i++) {
            const distance = Math.abs(currentPosition - positions[i]);
            if (distance < minDistance) {
              minDistance = distance;
              targetPosition = positions[i];
            }
          }
        } else if (velocity > 0) {
          // Scrolling down (increasing scrollY): find next task below
          targetPosition = positions[positions.length - 1]; // Default to last task
          for (let i = 0; i < positions.length; i++) {
            if (positions[i] > currentPosition) {
              targetPosition = positions[i];
              break;
            }
          }
        } else {
          // Scrolling up (decreasing scrollY): find next task above
          targetPosition = positions[0]; // Default to first task
          for (let i = positions.length - 1; i >= 0; i--) {
            if (positions[i] < currentPosition) {
              targetPosition = positions[i];
              break;
            }
          }
        }
      }

      scrollY.value = withSpring(targetPosition, {
        damping: 35,
        stiffness: 180,
        mass: 1,
      });
    });

  const timelineStyle = useAnimatedStyle(() => {
    const translateY = CENTER_OFFSET - scrollY.value;
    return {
      transform: [{ translateY }],
    };
  });

  const nowIndicatorStyle = useAnimatedStyle(() => {
    const nowPosition = currentTime * HOUR_HEIGHT;
    const translateY = CENTER_OFFSET - scrollY.value + nowPosition;
    return {
      transform: [{ translateY }],
      opacity: translateY > 0 && translateY < CONTAINER_HEIGHT ? 1 : 0,
    };
  });

  const handleTaskPress = (task) => {
    if (task && !task.id) return; // No ID means not a real task
    if (task.status === 'missed') return;

    if (task.id && onTaskToggle) {
      onTaskToggle(task.id);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.timeline, timelineStyle]}>
            {taskSlots.map((slot) => (
              <TimelineTaskSlot
                key={slot.task.id}
                slot={slot}
                HOUR_HEIGHT={HOUR_HEIGHT}
                CENTER_OFFSET={CENTER_OFFSET}
                CONTAINER_HEIGHT={CONTAINER_HEIGHT}
                scrollY={scrollY}
                handleTaskPress={handleTaskPress}
              />
            ))}
          </Animated.View>
        </GestureDetector>

        <Animated.View style={[styles.nowIndicator, nowIndicatorStyle]}>
          <View style={styles.nowDot} />
          <View style={styles.nowLine} />
          <Text style={styles.nowText}>Now</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const Timeline = ({ tasks = [], onTaskToggle, isEmpty = false }) => {
  if (isEmpty) {
    return <TimelineEmpty />;
  }
  return <TimelineContent tasks={tasks} onTaskToggle={onTaskToggle} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timelineContainer: {
    height: 120,
    position: 'relative',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
  },
  timeline: {
    position: 'relative',
    zIndex: 2,
  },
  hourSlot: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 4,
  },
  taskSlot: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 4,
  },
  timeText: {
    width: 68,
    fontSize: 12,
    fontFamily: 'Lexend_300Light',
    color: colors.textLight,
    textAlign: 'right',
    paddingTop: 2,
  },
  midColumn: {
    flex: 1,
    position: 'relative',
    marginLeft: 16,
  },
  // Give task cards room so the gutter overlays over their left edge nicely
  taskContainer: {
    paddingLeft: 0, // No left padding needed - dots are centered over tasks
    zIndex: 10, // Render above dots - high value to ensure it's always on top
    elevation: 10, // Android z-index support
  },
  taskCardWrapper: {
    // keep your existing card styles on the card itself; this wrapper only maintains spacing
  },
  taskCard: {
    backgroundColor: 'white',
    padding: 12,
    paddingRight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    zIndex: 1, // Ensure proper layering within taskContainer
  },
  taskCardNext: {
    borderWidth: 2,
    borderColor: colors.textPrimary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  taskCardMuted: {
    opacity: 0.7,
    borderColor: colors.borderLight,
  },
  upNextLabel: {
    fontSize: 10,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: 'Lexend_300Light',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  taskTitleMuted: {
    textDecorationLine: 'line-through',
  },
  taskProject: {
    fontSize: 12,
    fontFamily: 'Lexend_300Light',
    color: colors.textSecondary,
  },
  taskProjectMuted: {
    textDecorationLine: 'line-through',
  },
  missedLabel: {
    fontSize: 12,
    fontFamily: 'Lexend_600SemiBold',
    color: '#ef4444',
    marginTop: 4,
  },
  completedLabel: {
    fontSize: 12,
    fontFamily: 'Lexend_600SemiBold',
    color: colors.textPrimary,
    marginTop: 4,
  },
  taskCardMessage: {
    backgroundColor: colors.backgroundLight,
    borderStyle: 'dashed',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Lexend_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  nowIndicator: {
    position: 'absolute',
    left: 48,
    right: 0,
    height: 1,
    backgroundColor: '#ef4444',
    zIndex: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nowDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginLeft: -6,
    marginRight: 8,
  },
  nowLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ef4444',
  },
  nowText: {
    position: 'absolute',
    left: -48,
    width: 48,
    fontSize: 12,
    fontFamily: 'Lexend_600SemiBold',
    color: '#ef4444',
    textAlign: 'right',
  },
  noTasksWrap: {
    paddingVertical: 12,
  },
  noTasksMessage: {
    fontSize: 14,
    fontFamily: 'Lexend_300Light',
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: 0,
  },
  emptyStateContainer: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Lexend_300Light',
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default Timeline;
