import React, { createContext, useContext, useState } from 'react';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState({
    anytime: [],
    dueToday: [],
    scheduled: []
  });

  // Calculate progress based on subtasks
  const calculateProgress = (task) => {
    if (!task.subTasks || task.subTasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    const completedSubtasks = task.subTasks.filter(st => st.completed).length;
    return Math.round((completedSubtasks / task.subTasks.length) * 100);
  };

  // Add new task
  const addTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      originalProgress: 0,
      progress: 0,
      percentage: 0,
    };

    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };

      // Determine which category to add to based on task type
      if (taskData.type === 'scheduled') {
        updatedTasks.scheduled = [...prevTasks.scheduled, newTask];
      } else if (taskData.type === 'completeBy') {
        if (taskData.dueBy) {
          // Has a due by time, goes to anytime
          updatedTasks.anytime = [...prevTasks.anytime, newTask];
        } else {
          // No due by time, goes to dueToday
          updatedTasks.dueToday = [...prevTasks.dueToday, newTask];
        }
      }

      return updatedTasks;
    });
  };

  // Update existing task
  const updateTask = (taskId, updates) => {
    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };

      ['anytime', 'dueToday', 'scheduled'].forEach(category => {
        const taskIndex = updatedTasks[category].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          const updatedTask = { ...updatedTasks[category][taskIndex], ...updates };
          updatedTask.progress = calculateProgress(updatedTask);
          updatedTask.percentage = updatedTask.progress;
          updatedTasks[category][taskIndex] = updatedTask;
        }
      });

      return updatedTasks;
    });
  };

  // Delete task
  const deleteTask = (taskId) => {
    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };

      ['anytime', 'dueToday', 'scheduled'].forEach(category => {
        updatedTasks[category] = updatedTasks[category].filter(t => t.id !== taskId);
      });

      return updatedTasks;
    });
  };

  // Toggle subtask completion and recalculate progress
  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };

      ['anytime', 'dueToday', 'scheduled'].forEach(category => {
        const taskIndex = updatedTasks[category].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          const task = { ...updatedTasks[category][taskIndex] };

          // Toggle the subtask
          const subtaskIndex = task.subTasks.findIndex(st => st.id === subtaskId);
          if (subtaskIndex !== -1) {
            task.subTasks = [...task.subTasks];
            task.subTasks[subtaskIndex] = {
              ...task.subTasks[subtaskIndex],
              completed: !task.subTasks[subtaskIndex].completed
            };

            // Recalculate progress
            task.progress = calculateProgress(task);
            task.percentage = task.progress;

            updatedTasks[category][taskIndex] = task;
          }
        }
      });

      return updatedTasks;
    });
  };

  // Mark task as complete/incomplete
  const toggleTaskComplete = (taskId) => {
    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };

      ['anytime', 'dueToday', 'scheduled'].forEach(category => {
        const taskIndex = updatedTasks[category].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          const task = { ...updatedTasks[category][taskIndex] };

          if (task.completed) {
            // Uncomplete
            task.completed = false;
            task.progress = task.originalProgress || 0;
            task.percentage = task.progress;
          } else {
            // Complete
            task.completed = true;
            task.originalProgress = task.progress;
            task.progress = 100;
            task.percentage = 100;
          }

          updatedTasks[category][taskIndex] = task;
        }
      });

      return updatedTasks;
    });
  };

  // Find task by ID across all categories
  const findTask = (taskId) => {
    for (const category of ['anytime', 'dueToday', 'scheduled']) {
      const task = tasks[category].find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleSubtask,
      toggleTaskComplete,
      findTask,
      calculateProgress
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
