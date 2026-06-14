import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@theme/index';

interface PaginationProps {
  totalSteps: number;
  currentStep: number;
  containerStyle?: StyleProp<ViewStyle>;
}

const Pagination: React.FC<PaginationProps> = ({ totalSteps, currentStep, containerStyle }) => {
  return (
    <View style={[styles.pagination, containerStyle]}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentStep && styles.activeDot,
            index < currentStep && styles.completedDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.border,
  },
  activeDot: {
    backgroundColor: colors.light.success,
    width: 24,
    borderRadius: 4,
  },
  completedDot: {
    backgroundColor: colors.light.success,
  },
});

export default Pagination;
