import Header from '@/components/common/Header';
import MenuItem from '@/components/common/MenuItem';
import ProfileViewCard from '@/components/common/ProfileViewCard';
import ScreenWrapper from '@/components/common/ScreenWrapper';
import CustomAlert from '@/components/toast/CustomAlert';
import { baseApi } from '@/redux/api/baseApi';
import { logoutUser } from '@/redux/auth/authSlice';
import { useRevokeTokenMutation } from '@/redux/auth/refreshApi';
import { useGetMyProfileQuery } from '@/redux/profiles/profileApi';
import { RootState } from '@/redux/store';
import { secureStore, storage } from '@/storage';
import { CACHE_KEYS } from '@/storage/keys';
import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { deactivatePushNotification } from '@/services/notifications/notificationService';
import { colors } from '@theme/index';

const Profile = () => {
  const [revokeToken] = useRevokeTokenMutation();
  const { data: profile, isLoading, isError, refetch } = useGetMyProfileQuery();
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleResetGuide = () => {
    storage.remove(CACHE_KEYS.HAS_SEEN_HOME_GUIDE);
    storage.remove(CACHE_KEYS.HAS_SEEN_ORDER_GUIDE);
    storage.remove(CACHE_KEYS.HAS_SEEN_LISTING_GUIDE);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/Login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = async () => {
    setShowLogoutAlert(false);
    try {
      // 1. Get token before clearing storage
      const refreshToken = await secureStore.getRefreshToken();

      // 2. Call revoke endpoint if token exists
      if (refreshToken) {
        console.log('[Profile] Revoking token...');
        await revokeToken({ refresh_token: refreshToken }).unwrap();
      }

      // 3. Deactivate push notifications for this device
      console.log('[Profile] Deactivating push notifications...');
      await deactivatePushNotification(dispatch);

      // 4. Complete local logout
      await dispatch(logoutUser()).unwrap();
      dispatch(baseApi.util.resetApiState());
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: still logout locally even if revoke fails
      await dispatch(logoutUser()).unwrap();
      dispatch(baseApi.util.resetApiState());
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header title="Profile" showBackButton onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <AppLoadingAnimation visible={true} message="Loading profile..." />
        </View>
      </ScreenWrapper>
    );
  }

  if (isError || !profile) {
    return (
      <ScreenWrapper>
        <Header title="Profile" showBackButton onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.light.danger} />
          <Text style={styles.errorText}>Could not load profile</Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              Platform.OS === 'ios' && pressed && { opacity: 0.7 },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Tap to Retry</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper withTopInset={false}>
      <Header
        title="Profile"
        showBackButton={true}
        onBackPress={() => router.back()}
        isRightIconVisible={true}
        rightIcon="refresh-circle-outline"
        rightIconColor={colors.light.text}
        onRightIconPress={() => handleResetGuide()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'ios' ? 120 + insets.bottom : 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: profile?.photoUrl || 'https://randomuser.me/api/portraits/men/32.jpg',
              }}
              style={styles.avatar}
            />
            {profile?.sellerStatus === 'active' && (
              <View style={styles.sellerBadgeMini}>
                <Ionicons name="checkmark-circle" size={16} color={colors.light.success} />
              </View>
            )}
          </View>

          <View style={styles.nameContainer}>
            <Text style={styles.name}>{profile?.name}</Text>
          </View>

          <Text style={styles.email}>{profile?.email}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              Platform.OS === 'ios' && pressed && { opacity: 0.7 },
            ]}
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            onPress={() => router.push('/(user)/ProfileForm')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.statsContainer}>
          <ProfileViewCard
            title={(profile?.sellerCompletedOrdersCount ?? 0).toString()}
            toptitle="Completed"
            istitle={true}
            containerStyle={styles.statCard}
            ratingStyle={styles.statValue}
          />
          <ProfileViewCard
            title={(profile?.totalServices ?? 0).toString()}
            toptitle="Listings"
            istitle={true}
            containerStyle={styles.statCard}
            ratingStyle={styles.statValue}
          />
          <ProfileViewCard
            title={(profile?.sellerRatingCount ?? 0).toString()}
            toptitle="Reviews"
            istitle={true}
            containerStyle={styles.statCard}
            ratingStyle={styles.statValue}
          />
        </View>

        <View style={styles.menuContainer}>
          <MenuItem
            title="Messages"
            icon="chatbubble"
            iconColor={colors.light.success}
            iconBackgroundColor={colors.light.infoBackground}
            onPress={() => router.push('/(user)/(tabs)/Message')}
          />
          <MenuItem
            title="My Reviews"
            icon="star"
            iconColor={colors.light.warning}
            iconBackgroundColor={colors.light.warningBackground}
            onPress={() => router.push('/(user)/MyReviews')}
          />
          <MenuItem
            title="Help & Support"
            icon="help-circle"
            iconColor={colors.light.success}
            iconBackgroundColor={colors.light.successBackground}
            onPress={() => router.push('/(user)/Help&Support')}
          />

          <MenuItem
            title="Logout"
            icon="log-out-outline"
            iconColor={colors.light.danger}
            iconBackgroundColor={colors.light.dangerBackground}
            titleStyle={styles.logoutTitle}
            containerStyle={styles.logoutContainer}
            rightIconColor={colors.light.danger}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
      <CustomAlert
        visible={showLogoutAlert}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        type="warning"
        confirmText="Logout"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutAlert(false)}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: colors.light.surface,
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
    borderColor: colors.light.altBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: colors.light.surface,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.light.subText,
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
    color: colors.light.text,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.light.subText,
  },
  editButton: {
    backgroundColor: colors.light.altBorder,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
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
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.altBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    color: colors.light.success,
    marginTop: 8,
  },
  menuContainer: {
    paddingHorizontal: 8,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.light.subText,
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.light.success,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.light.surface,
    fontWeight: '600',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  sellerBadgeMini: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.light.surface,
    borderRadius: 10,
    padding: 2,
  },
  verifiedBadge: {
    backgroundColor: colors.light.successBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.success,
    letterSpacing: 0.5,
  },
  logoutContainer: {
    backgroundColor: colors.light.dangerBackground,
    marginTop: 20,
    borderRadius: 16,
  },
  logoutTitle: {
    color: colors.light.danger,
    fontWeight: '700',
  },
});

export default Profile;
