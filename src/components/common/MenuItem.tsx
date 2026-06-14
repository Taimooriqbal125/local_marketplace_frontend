import React from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItemProps {
  icon?: IoniconName | React.ReactNode;
  iconSize?: number;
  iconColor?: string;
  iconBackgroundColor?: string;
  title: string;
  titleStyle?: StyleProp<TextStyle>;
  description?: string;
  descriptionStyle?: StyleProp<TextStyle>;
  rightElement?: React.ReactNode;
  rightIcon?: IoniconName;
  rightIconColor?: string;
  rightIconSize?: number;
  onPress?: () => void;
  disabled?: boolean;
  showDivider?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
  showrighttext?: boolean;
  rightText?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  iconSize = 24,
  iconColor = colors.light.success,
  iconBackgroundColor,
  title,
  titleStyle,
  description,
  descriptionStyle,
  rightElement,
  rightIcon,
  rightIconColor = colors.light.mutedText,
  rightIconSize = 20,
  onPress,
  disabled = false,
  showDivider = false,
  containerStyle,
  testID,
  showrighttext = false,
  rightText,
}) => {
  const renderRightElement = (): React.ReactNode => {
    if (rightElement) return rightElement;

    if (rightIcon) {
      return <Ionicons name={rightIcon} size={rightIconSize} color={rightIconColor} />;
    }

    return <Ionicons name="chevron-forward" size={rightIconSize} color={rightIconColor} />;
  };

  const renderIcon = (): React.ReactNode => {
    if (!icon) return null;

    const iconComponent =
      typeof icon === 'string' ? (
        <Ionicons name={icon as IoniconName} size={iconSize} color={iconColor} />
      ) : (
        icon
      );

    if (iconBackgroundColor) {
      return (
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
          {iconComponent}
        </View>
      );
    }

    return iconComponent;
  };

  return (
    <>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.container,
          containerStyle,
          disabled && styles.disabled,
          Platform.OS === 'ios' && pressed && !disabled && { opacity: 0.7 },
          Platform.OS === 'android' && pressed && !disabled && styles.pressed,
        ]}
        testID={testID}
        android_ripple={{ color: colors.light.border }}
      >
        {renderIcon()}

        <View style={styles.content}>
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>

          {description && (
            <Text style={[styles.description, descriptionStyle]} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>

        {showrighttext ? (
          <Text style={styles.rightText}>{rightText}</Text>
        ) : (
          <View style={styles.rightElement}>{renderRightElement()}</View>
        )}
      </Pressable>

      {showDivider && <View style={styles.divider} />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 10,
    marginVertical: 6,
    backgroundColor: colors.light.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  disabled: {
    opacity: 0.5,
  },
  rightText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.light.text,
    position: 'absolute',
    top: 0,
    right: 5,
    padding: 10,
    borderRadius: 8,
    opacity: 0.5,
  },
  pressed: {
    backgroundColor: colors.light.altBackground,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
  },
  description: {
    fontSize: 14,
    color: colors.light.subText,
    marginTop: 2,
  },
  rightElement: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.altBorder,
    marginLeft: 80,
  },
});

export default MenuItem;
