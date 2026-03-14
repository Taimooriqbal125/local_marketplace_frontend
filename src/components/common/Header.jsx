import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';

const Header = ({
  title = 'My Listings',
  showBackButton = true,
  onBackPress,
  rightIcon = 'add',
  onRightIconPress,
  rightIconSize = 20,
  rightIconColor = '#007AFF',
  containerStyle,
  titleStyle,
  isRightIconVisible = false,
  showBottomBorder = false,
}) => {
  return (
    <View style={[styles.container, showBottomBorder && styles.containerBorder, containerStyle]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Left Side - Back Button */}
      <View style={styles.leftContainer}>
        {showBackButton && (
          <Pressable
            onPress={onBackPress}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </Pressable>
        )}
      </View>

      {/* Center - Title */}
      <View style={styles.centerContainer}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right Side - Icon (Always render container for balance) */}
      <View style={styles.rightContainer}>
        {isRightIconVisible && (
          <View style={styles.iconButtonContainer}>
            <Pressable
              onPress={onRightIconPress}
              style={styles.iconButton}
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 4 : 50,
    paddingBottom: 2,
    backgroundColor: '#FFFFFF',
  },
  containerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconButtonContainer: {
    width: 35,
    height: 35,
    borderRadius: 80,
    backgroundColor: '#08460c3a',
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
    color: '#1a1a1a',
    textAlign: 'center',
  },
  iconButton: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
