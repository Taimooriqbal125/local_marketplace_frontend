import { Text, StyleSheet, View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MenuItem = ({
  icon,
  iconSize = 24,
  iconColor = '#10B981',
  iconBackgroundColor,
  title,
  titleStyle,
  description,
  descriptionStyle,
  rightElement,
  rightIcon,
  rightIconColor = '#9CA3AF',
  rightIconSize = 20,
  onPress,
  disabled = false,
  showDivider = false,
  containerStyle,
  activeOpacity = 0.7,
  testID,
  showrighttext = false,
  rightText,
}) => {
  const renderRightElement = () => {
    if (rightElement) return rightElement;

    if (rightIcon) {
      return <Ionicons name={rightIcon} size={rightIconSize} color={rightIconColor} />;
    }

    return <Ionicons name="chevron-forward" size={rightIconSize} color={rightIconColor} />;
  };

  const renderIcon = () => {
    if (!icon) return null;

    const iconComponent =
      typeof icon === 'string' ? <Ionicons name={icon} size={iconSize} color={iconColor} /> : icon;

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
        activeOpacity={activeOpacity}
        style={({ pressed }) => [
          styles.container,
          containerStyle,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
        testID={testID}
        android_ripple={{ color: 'rgba(16, 185, 129, 0.1)' }}
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
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: 'red',
    color: 'black',
  },
  rightText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#111827',
    position: 'absolute',
    top: 0,
    right: 5,
    padding: 10,
    borderRadius: 8,
    opacity: 0.5,
  },
  pressed: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
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
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  rightElement: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 80,
  },
});

export default MenuItem;
