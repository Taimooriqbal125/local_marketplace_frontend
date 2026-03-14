import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const HomeHeader = ({
  title = 'Market',
  logoIcon = 'bolt',
  logoBackgroundColor = '#10B981',
  notificationCount = 0,
  onNotificationPress,
  onProfilePress,
  onSearch,
  profileImage,
  profileInitials = 'U',
  containerStyle,
  titleStyle,
  logoStyle,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchToggle = () => {
    if (isSearching) {
      setIsSearching(false);
      setSearchQuery('');
      if (onSearch) onSearch('');
    } else {
      setIsSearching(true);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (onSearch) onSearch(text);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {isSearching ? (
        <View style={styles.activeSearchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <Pressable style={styles.cancelSearchButton} onPress={handleSearchToggle}>
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
              <Ionicons name={logoIcon} size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, titleStyle]} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {/* Right Side - Notification Bell and Profile */}
          <View style={styles.rightContainer}>
            <Pressable
              style={styles.iconButton}
              onPress={handleSearchToggle}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={24} color="#1F2937" />
            </Pressable>

            {/* Notification Bell */}
            <Pressable
              style={styles.iconButton}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <View style={styles.bellContainer}>
                <Ionicons name="notifications" size={24} color="#1F2937" />
                {notificationCount > 0 && (
                  <View style={styles.notificationDot}>
                    {notificationCount > 9 ? (
                      <Text style={styles.notificationCountText}>9+</Text>
                    ) : (
                      <Text style={styles.notificationCountText}>{notificationCount}</Text>
                    )}
                  </View>
                )}
              </View>
            </Pressable>

            {/* Profile Avatar */}
            <Pressable
              style={styles.profileButton}
              onPress={onProfilePress}
              activeOpacity={0.7}
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
    color: '#111827',
    letterSpacing: -0.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  bellContainer: {
    position: 'relative',
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  profileButton: {
    marginLeft: 8,
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
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
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
    backgroundColor: '#F3F4F6',
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
    color: '#111827',
  },
  cancelSearchButton: {
    marginLeft: 12,
    paddingVertical: 8,
  },
  cancelSearchText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '500',
  },
});

export default HomeHeader;
