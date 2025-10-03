import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../styles/colors';
import { useScroll } from '../../contexts/ScrollContext';

const BottomNavigation = ({ state, descriptors, navigation }) => {
  const { scrollY } = useScroll();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY,
      [0, 50],
      [1, 0.95],
      'clamp'
    ),
  }));
  const icons = {
    Home: (focused) => (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={focused ? "white" : colors.textLight} strokeWidth="2">
        <Path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </Svg>
    ),
    Projects: (focused) => (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={focused ? "white" : colors.textLight} strokeWidth="2">
        <Path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </Svg>
    ),
    Stats: (focused) => (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={focused ? "white" : colors.textLight} strokeWidth="2">
        <Path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </Svg>
    ),
    Profile: (focused) => (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={focused ? "white" : colors.textLight} strokeWidth="2">
        <Path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </Svg>
    ),
  };

  return (
    <Animated.View style={[styles.bottomNav, animatedStyle]}>
      <View style={styles.navContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={[styles.navButton, isFocused && styles.navButtonActive]}
            >
              {icons[route.name] && icons[route.name](isFocused)}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  navButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  navButtonActive: {
    backgroundColor: colors.textPrimary,
  },
});

export default BottomNavigation;