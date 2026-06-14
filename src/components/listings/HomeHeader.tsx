import React, { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '@theme/index';

interface HomeHeaderProps {
  title?: string;
  logoIcon?: any; // Ionicons glyph name
  logoBackgroundColor?: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onSearch?: (query: string) => void;
  profileImage?: string | null;
  profileInitials?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  logoStyle?: ViewStyle;
}

const HomeHeader = ({
  title = 'Market',
  logoIcon = 'storefront-outline',
  logoBackgroundColor = colors.light.success,
  notificationCount = 0,
  onNotificationPress,
  onProfilePress,
  onSearch,
  profileImage,
  profileInitials = 'U',
  containerStyle,
  titleStyle,
  logoStyle,
  onActionsLayout,
}: HomeHeaderProps & {
  onActionsLayout?: (rect: { x: number; y: number; width: number; height: number }) => void;
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const actionsRef = React.useRef<View>(null);

  const handleSearchToggle = useCallback(() => {
    if (isSearching) {
      setIsSearching(false);
      setSearchQuery('');
      if (onSearch) onSearch('');
    } else {
      setIsSearching(true);
    }
  }, [isSearching, onSearch]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (onSearch) onSearch(text);
    },
    [onSearch],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {isSearching ? (
        <View style={styles.activeSearchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search"
              size={20}
              color={colors.light.mutedText}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus
              placeholderTextColor={colors.light.mutedText}
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.cancelSearchButton,
              Platform.OS === 'ios' && pressed && { opacity: 0.7 },
            ]}
            onPress={handleSearchToggle}
            android_ripple={{ color: colors.light.border, borderless: true }}
          >
            <Text style={styles.cancelSearchText}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Left Side - Logo and Title */}
          <View style={styles.leftContainer}>
            <View
              style={[styles.logoContainer, { backgroundColor: logoBackgroundColor }, logoStyle]}
            >
              <Ionicons name={logoIcon} size={24} color={colors.light.surface} />
            </View>
            <Text style={[styles.title, titleStyle]} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {/* Right Side - Notification Bell and Profile */}
          <View style={styles.rightContainer}>
            <View
              ref={actionsRef}
              onLayout={() => {
                actionsRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  onActionsLayout?.({ x: pageX, y: pageY, width, height });
                });
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                ]}
                onPress={handleSearchToggle}
                android_ripple={{ color: colors.light.border, borderless: true, radius: 20 }}
              >
                <Ionicons name="search" size={24} color={colors.light.text} />
              </Pressable>

              {/* Notification Bell */}
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                ]}
                onPress={onNotificationPress}
                android_ripple={{ color: colors.light.border, borderless: true, radius: 20 }}
              >
                <View style={styles.bellContainer}>
                  <Ionicons name="notifications" size={24} color={colors.light.text} />
                  {notificationCount > 0 && (
                    <View style={styles.notificationDot}>
                      <Text style={styles.notificationCountText}>
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>

            {/* Profile Avatar */}
            <Pressable
              style={({ pressed }) => [
                styles.profileButton,
                Platform.OS === 'ios' && pressed && { opacity: 0.8 },
              ]}
              onPress={onProfilePress}
              android_ripple={{ color: colors.light.border, borderless: true, radius: 24 }}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileInitials}>{profileInitials}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 10 : 16,
    backgroundColor: colors.light.background,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.light.text,
    letterSpacing: -0.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
    borderRadius: 20,
  },
  bellContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.light.danger,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.light.surface,
  },
  notificationCountText: {
    color: colors.light.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  profileButton: {
    marginLeft: 8,
    borderRadius: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  activeSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.altBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.light.text,
  },
  cancelSearchButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelSearchText: {
    fontSize: 16,
    color: colors.light.success,
    fontWeight: '500',
  },
});

export default React.memo(HomeHeader);
