import {
  useCreateMyProfileMutation,
  useGetMyProfileQuery,
  useUpdateProfileByUserIdMutation,
} from '@/redux/profiles/profileApi';
import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import Header from '@components/common/Header';
import ScreenWrapper from '@components/common/ScreenWrapper';
import { showErrorToast, showSuccessToast } from '@components/toast/CustomError';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '@theme/index';

const ProfileForm = () => {
  const router = useRouter();
  const { data: profileData, isLoading: fetchLoading } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileByUserIdMutation();
  const [createMyProfile, { isLoading: isCreating }] = useCreateMyProfileMutation();
  const isLoading = isUpdating || isCreating;

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  // Initialize form with profile data
  useEffect(() => {
    if (profileData) {
      setFullName(profileData.name || '');
      setEmail(profileData.email || '');
      setBio(profileData.bio || '');
      setProfileImage(profileData.photoUrl || profileData.image || null);
      setCharCount((profileData.bio || '').length);
    }
  }, [profileData]);

  // Handle image picker
  const pickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        showErrorToast('Permission to access camera roll is required!', 'Permission Required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showErrorToast('Failed to pick image');
    }
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!fullName.trim()) {
      showErrorToast('Please enter your full name', 'Validation Error');
      return;
    }

    if (bio.length > 200) {
      showErrorToast('Bio must be 200 characters or less', 'Validation Error');
      return;
    }

    const photoFile =
      profileImage && profileImage.startsWith('file://')
        ? ({
            uri: profileImage,
            name: 'photo.jpg',
            type: 'image/jpeg',
          } as any)
        : undefined;

    try {
      // Use userId if available, otherwise fallback to id from profile responses
      const profileId = profileData?.userId || profileData?.id;

      if (!profileId) {
        // No profile yet — create one
        await createMyProfile({
          profileData: { name: fullName, bio },
          photoFile,
        }).unwrap();
        showSuccessToast('Profile created successfully!');
      } else {
        // Profile exists — update it
        await updateProfile({
          userId: profileId,
          profileData: { name: fullName, bio },
          photoFile,
        }).unwrap();
        showSuccessToast('Profile updated successfully!');
      }
      router.replace('/(user)/(tabs)/Profile' as any);
    } catch (error: any) {
      console.error('Save error:', error);
      showErrorToast(error?.data?.detail || 'Failed to save profile');
    }
  }, [fullName, bio, profileImage, profileData, createMyProfile, updateProfile, router]);

  // Handle bio change
  const handleBioChange = useCallback((text: string) => {
    if (text.length <= 200) {
      setBio(text);
      setCharCount(text.length);
    }
  }, []);

  if (fetchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <AppLoadingAnimation visible={true} message="Fetching profile..." />
      </View>
    );
  }

  return (
    <ScreenWrapper backgroundColor={colors.light.surface} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <Header title="Profile" showBackButton={true} onBackPress={() => router.back()} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage as string }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={60} color={colors.light.mutedText} />
                </View>
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.editPhotoButton,
                  Platform.OS === 'ios' && pressed && { opacity: 0.9 },
                ]}
                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={18} color={colors.light.surface} />
              </Pressable>
            </View>
            <Pressable
              onPress={pickImage}
              style={({ pressed }) => [Platform.OS === 'ios' && pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FullName</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.light.mutedText}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email (Read-only) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.readOnlyText}>Read-only</Text>
              </View>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <TextInput style={styles.input} value={email} editable={false} />
                <Ionicons name="lock-closed" size={18} color={colors.light.mutedText} />
              </View>
            </View>

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <View style={[styles.inputBioContainer, styles.textareaContainer]}>
                <TextInput
                  style={styles.textarea}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={colors.light.mutedText}
                  value={bio}
                  onChangeText={handleBioChange}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <Text style={styles.charCount}>{charCount} / 200 characters</Text>
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              isUpdating && styles.saveButtonDisabled,
              Platform.OS === 'ios' && pressed && { opacity: 0.9 },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <AppLoadingAnimation
                visible={true}
                fullscreen={false}
                message=""
                style={{ paddingVertical: 0 }}
              />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </Pressable>

          {/* Spacing at bottom */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.altBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.altBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.light.altBorder,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.light.altBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.light.surface,
  },
  changePhotoText: {
    fontSize: 15,
    color: colors.light.success,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  readOnlyText: {
    fontSize: 12,
    color: colors.light.mutedText,
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.altBackground,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputBioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.light.altBackground,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    height: 120,
  },
  disabledInput: {
    backgroundColor: colors.light.altBorder,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.light.text,
    padding: 0,
  },
  textareaContainer: {
    paddingBottom: 12,
  },
  textarea: {
    flex: 1,
    fontSize: 15,
    color: colors.light.text,
    padding: 0,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: colors.light.mutedText,
    textAlign: 'right',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: colors.light.success,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.light.success,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: colors.light.mutedText,
  },
  saveButtonText: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileForm;
