import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenWrapper from '@components/common/ScreenWrapper';
import Header from '@components/common/Header';
import MenuItem from '@components/common/MenuItem';
import ProfileViewCard from '@components/common/ProfileViewCard';

const Profile = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Navigate back to auth flow or handle logout
    router.replace('/(auth)/Login');
  };

  return (
    <ScreenWrapper withTopInset={false}>
      <Header
        title="Profile"
        showBackButton={true}
        onBackPress={() => router.back()}
        isRightIconVisible={true}
        rightIcon="settings-sharp"
        rightIconColor="#111827"
        onRightIconPress={() => console.log('Settings Pressed')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} // Provide a placeholder or actual image
              style={styles.avatar}
            />
          </View>

          <Text style={styles.name}>Johnathan Doe</Text>
          <Text style={styles.email}>john.doe@marketplace.com</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star, index) => (
                <Ionicons
                  key={index}
                  name={index === 4 ? 'star-half' : 'star'}
                  size={16}
                  color="#F59E0B"
                  style={styles.starIcon}
                />
              ))}
              <Text style={styles.ratingScore}>4.8</Text>
            </View>
            <Text style={styles.reviewCount}>(124 verified reviews)</Text>
          </View>

          {/* Edit Profile Button */}
          <Pressable style={styles.editButton} onPress={() => router.push('/(user)/ProfileForm')}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Stats Section using ProfileViewCard */}
        <View style={styles.statsContainer}>
          <ProfileViewCard
            title="15"
            toptitle="My Orders"
            istitle={true}
            containerStyle={styles.statCard}
            ratingStyle={styles.statValue}
          />
          <ProfileViewCard
            title="8"
            toptitle="Listings"
            istitle={true}
            containerStyle={styles.statCard}
            ratingStyle={styles.statValue}
          />
          <ProfileViewCard
            title="42"
            toptitle="My Reviews"
            istitle={true}
            containerStyle={styles.statCard}
            ratingStyle={styles.statValue}
          />
        </View>

        {/* Menu Items Section */}
        <View style={styles.menuContainer}>
          <MenuItem
            title="Messages"
            icon="chatbubble"
            iconColor="#3B82F6"
            showrighttext={true}
            rightText="10"
            iconBackgroundColor="#EFF6FF"
            onPress={() => router.push('/(user)/(tabs)/Message')}
          />
          <MenuItem
            title="My Reviews"
            icon="star"
            iconColor="#3B82F6"
            iconBackgroundColor="#EFF6FF"
            onPress={() => router.push('/(user)/MyReviews')}
          />
          <MenuItem
            title="Help & Support"
            icon="help-circle"
            iconColor="#3B82F6"
            iconBackgroundColor="#EFF6FF"
            onPress={() => router.push('/(user)/Help&Support')}
          />

          <MenuItem
            title="Logout"
            icon="log-out-outline"
            iconColor="#EF4444"
            iconBackgroundColor="transparent"
            titleStyle={styles.logoutTitle}
            containerStyle={styles.logoutContainer}
            rightIconColor="#EF4444"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#FFF',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  ratingScore: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  editButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    // Shadow for cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    color: '#3B82F6', // Blue color for numbers
    marginTop: 8,
  },
  menuContainer: {
    paddingHorizontal: 8,
    marginTop: 8,
  },
  logoutContainer: {
    backgroundColor: '#FEF2F2', // Light red background
    marginTop: 16,
  },
  logoutTitle: {
    color: '#EF4444', // Red title
  },
});

export default Profile;
