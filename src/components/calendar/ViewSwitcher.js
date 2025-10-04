import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, Lexend_500Medium } from '@expo-google-fonts/lexend';
import { colors } from '../../styles/colors';

const ViewSwitcher = ({ activeView = 'day', onViewChange }) => {
  let [fontsLoaded] = useFonts({
    Lexend_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  const views = ['Day', 'Week', 'Month'];

  return (
    <View style={styles.container}>
      {views.map((view) => {
        const viewKey = view.toLowerCase();
        const isActive = activeView === viewKey;

        return (
          <TouchableOpacity
            key={view}
            style={[
              styles.button,
              isActive && styles.activeButton
            ]}
            onPress={() => onViewChange(viewKey)}
          >
            <Text style={[
              styles.buttonText,
              isActive && styles.activeButtonText
            ]}>
              {view}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Lexend_500Medium',
    color: colors.textSecondary,
  },
  activeButtonText: {
    color: colors.white,
  },
});

export default ViewSwitcher;
