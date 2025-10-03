import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import TasksScreen from '../screens/TasksScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import BottomNavigation from '../components/navigation/BottomNavigation';
import { ScrollProvider } from '../contexts/ScrollContext';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator Component
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavigation {...props} />}
      tabBarPosition="bottom"
      screenOptions={{
        headerShown: false,
        swipeEnabled: true,
        animationEnabled: true,
      }}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={TasksScreen}
        options={{
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarAccessibilityLabel: 'Projects tab',
        }}
      />
      <Tab.Screen
        name="Stats"
        component={CalendarScreen}
        options={{
          tabBarAccessibilityLabel: 'Stats tab',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={MarketplaceScreen}
        options={{
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const AppNavigator = () => {
  return (
    <ScrollProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="AddTask"
            component={AddTaskScreen}
            options={{
              presentation: 'modal',
              animationEnabled: true,
            }}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{
              presentation: 'card',
              animationEnabled: true,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ScrollProvider>
  );
};

export default AppNavigator;