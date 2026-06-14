import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  Pressable,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '@theme/index';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: IoniconName;
  onRightIconPress?: () => void;
  rightIconSize?: number;
  rightIconColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  isRightIconVisible?: boolean;
  showBottomBorder?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = 'My Listings',
  showBackButton = true,
  onBackPress,
  rightIcon = 'add',
  onRightIconPress,
  rightIconSize = 20,
  rightIconColor = colors.light.primary,
  containerStyle,
  titleStyle,
  isRightIconVisible = false,
  showBottomBorder = false,
}) => {
  return (
    <View style={[styles.container, showBottomBorder && styles.containerBorder, containerStyle]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light.surface} />

      <View style={styles.leftContainer}>
        {showBackButton && (
          <Pressable
            onPress={onBackPress}
            style={({ pressed }) => [
              styles.iconButton,
              Platform.OS === 'ios' && pressed && { opacity: 0.7 },
            ]}
            android_ripple={{ color: colors.light.altBorder, borderless: true, radius: 24 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.light.text} />
          </Pressable>
        )}
      </View>

      <View style={styles.centerContainer}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {isRightIconVisible && (
          <View style={styles.iconButtonContainer}>
            <Pressable
              onPress={onRightIconPress}
              style={({ pressed }) => [
                styles.iconButton,
                Platform.OS === 'ios' && pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: colors.light.border, borderless: true, radius: 24 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name={rightIcon} size={rightIconSize} color={rightIconColor} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 4 : 50,
    paddingBottom: 2,
    backgroundColor: colors.light.surface,
  },
  containerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  iconButtonContainer: {
    width: 35,
    height: 35,
    borderRadius: 18, // Circular
    backgroundColor: colors.light.successBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    textAlign: 'center',
  },
  iconButton: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(Header);
