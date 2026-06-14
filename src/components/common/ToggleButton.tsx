import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';

type ToggleTab = 'left' | 'right';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ToggleButtonProps {
  leftText?: string;
  rightText?: string;
  leftIcon?: IoniconName;
  rightIcon?: IoniconName;

  onToggle?: (tab: ToggleTab) => void;

  initialState?: ToggleTab;

  activeColor?: string;
  inactiveColor?: string;
  textColor?: string;
  inactiveTextColor?: string;
  borderRadius?: number;
  height?: number;

  leftScreen?: React.ReactNode;
  rightScreen?: React.ReactNode;

  containerStyle?: StyleProp<ViewStyle>;
  toggleStyle?: StyleProp<ViewStyle>;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  leftText = 'Buying',
  rightText = 'Selling',
  leftIcon,
  rightIcon,
  onToggle,
  initialState = 'left',
  activeColor = colors.light.primary,
  inactiveColor = colors.light.border,
  textColor = '#FFFFFF',
  inactiveTextColor = colors.light.text,
  borderRadius = 25,
  height = 50,
  leftScreen,
  rightScreen,
  containerStyle,
  toggleStyle,
}) => {
  const [activeTab, setActiveTab] = useState<ToggleTab>(initialState);

  const handleToggle = (tab: ToggleTab) => {
    setActiveTab(tab);
    onToggle?.(tab);
  };

  const renderScreen = (): React.ReactNode => {
    if (activeTab === 'left' && leftScreen) {
      return leftScreen;
    }

    if (activeTab === 'right' && rightScreen) {
      return rightScreen;
    }

    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.toggleContainer,
          { backgroundColor: inactiveColor, borderRadius, height },
          toggleStyle,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'left' && {
              backgroundColor: activeColor,
              borderRadius: borderRadius - 2,
            },
          ]}
          onPress={() => handleToggle('left')}
          activeOpacity={0.7}
        >
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={18}
              color={activeTab === 'left' ? textColor : inactiveTextColor}
              style={styles.icon}
            />
          )}

          <Text
            style={[
              styles.toggleText,
              activeTab === 'left'
                ? { color: textColor, fontWeight: '600' }
                : { color: inactiveTextColor, fontWeight: '400' },
            ]}
          >
            {leftText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'right' && {
              backgroundColor: activeColor,
              borderRadius: borderRadius - 2,
            },
          ]}
          onPress={() => handleToggle('right')}
          activeOpacity={0.7}
        >
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={18}
              color={activeTab === 'right' ? textColor : inactiveTextColor}
              style={styles.icon}
            />
          )}

          <Text
            style={[
              styles.toggleText,
              activeTab === 'right'
                ? { color: textColor, fontWeight: '600' }
                : { color: inactiveTextColor, fontWeight: '400' },
            ]}
          >
            {rightText}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.screenContainer}>{renderScreen()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  icon: {
    marginRight: 6,
  },
  toggleText: {
    fontSize: 16,
    textAlign: 'center',
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default ToggleButton;
