import React from 'react';
import { View, StyleSheet } from 'react-native';

const BottomNavButton = ({ active = false, children }) => (
  <View style={[styles.navButton, active && styles.activeNavButton]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavButton: {
    // Active state handled by SVG fill color
  },
});

export default BottomNavButton;