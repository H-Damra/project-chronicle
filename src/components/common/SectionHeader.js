import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { colors } from '../../styles/colors';

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Svg style={styles.headerDivider} width="100%" height="1" viewBox="0 0 100 1" preserveAspectRatio="none">
      <Rect x="0" y="0" width="33.33" height="1" fill={colors.border} />
      <Line x1="33.33" y1="0.5" x2="66.66" y2="0.5" stroke={colors.border} strokeWidth="1" strokeDasharray="6,1" />
      <Line x1="66.66" y1="0.5" x2="100" y2="0.5" stroke={colors.border} strokeWidth="1" strokeDasharray="1,0.5" />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: 16,
    position: 'relative',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Lexend_300Light',
    color: colors.textTertiary,
  },
  headerDivider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});

export default SectionHeader;