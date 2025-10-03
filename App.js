import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { TaskProvider } from './src/contexts/TaskContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TaskProvider>
        <AppNavigator />
      </TaskProvider>
    </GestureHandlerRootView>
  );
}