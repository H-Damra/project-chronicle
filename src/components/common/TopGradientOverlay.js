import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../styles/colors';

const TopGradientOverlay = () => (
  <LinearGradient
    colors={[colors.background, 'rgba(248, 250, 252, 0)']}
    locations={[0.6, 1]}
    style={styles.topGradient}
  />
);

const styles = StyleSheet.create({
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    zIndex: 1,
  },
});

export default TopGradientOverlay;