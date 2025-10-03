import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';
import { colors } from '../../styles/colors';

const DottedBackground = () => (
  <Svg
    style={StyleSheet.absoluteFillObject}
    width="100%"
    height="100%"
  >
    <Defs>
      <Pattern
        id="dots"
        patternUnits="userSpaceOnUse"
        width="12"
        height="12"
      >
        <Circle
          cx="6"
          cy="6"
          r="0.8"
          fill={colors.divider}
        />
      </Pattern>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#dots)" />
  </Svg>
);

export default DottedBackground;