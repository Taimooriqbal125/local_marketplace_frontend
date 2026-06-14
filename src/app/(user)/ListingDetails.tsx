import { showErrorToast, showSuccessToast } from '@/components/toast/CustomError';
import {
  useCreateListingMutation,
  useGetListingByIdQuery,
  useUpdateListingMutation,
} from '@/redux/listings/listingApi';
import { CACHE_KEYS } from '@/storage/keys';
import { storage } from '@/storage/storage';
import { PriceType } from '@/types';
import AppLoadingAnimation from '@components/animations/AppLoadingAnimation';
import Header from '@components/common/Header';
import Pagination from '@components/common/Pagination';
import ScreenWrapper from '@components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '@theme/index';

interface PricingSectionProps {
  pricingType: PriceType;
  setPricingType: (type: PriceType) => void;
  initialPrice: string;
  onUpdate: (price: string) => void;
  isNegotiable: boolean;
  setIsNegotiable: (negotiable: boolean) => void;
}

interface LocationSectionProps {
  initialLocation: string;
  onUpdate: (location: string) => void;
}

interface RadiusSectionProps {
  serviceRadius: number;
  setServiceRadius: (radius: number) => void;
}

interface PhotoSectionProps {
  coverPhoto: { uri: string; isExisting?: boolean } | null;
  pickCoverPhoto: () => Promise<void>;
  removeCoverPhoto: () => void;
}

interface StatusSectionProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

const PricingSection = memo(
  ({
    pricingType,
    setPricingType,
    initialPrice,
    onUpdate,
    isNegotiable,
    setIsNegotiable,
  }: PricingSectionProps) => {
    const [localPrice, setLocalPrice] = useState(initialPrice);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pricing</Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.toggleContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.toggleOption,
                pricingType === 'fixed' && styles.toggleOptionActive,
                Platform.OS === 'ios' && pressed && { opacity: 0.8 },
              ]}
              android_ripple={{ color: colors.light.border }}
              onPress={() => {
                setPricingType('fixed');
                setIsNegotiable(false);
              }}
            >
              <Text style={[styles.toggleText, pricingType === 'fixed' && styles.toggleTextActive]}>
                Fixed
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.toggleOption,
                pricingType === 'hourly' && styles.toggleOptionActive,
                Platform.OS === 'ios' && pressed && { opacity: 0.8 },
              ]}
              android_ripple={{ color: colors.light.border }}
              onPress={() => setPricingType('hourly')}
            >
              <Text
                style={[styles.toggleText, pricingType === 'hourly' && styles.toggleTextActive]}
              >
                Hourly
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Price Amount (PKR) {pricingType === 'hourly' && '/ hour'}
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>Rs</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.light.subText}
              value={localPrice}
              onChangeText={(text) => {
                if (text === '' || /^\d*\.?\d{0,2}$/.test(text)) {
                  setLocalPrice(text);
                  onUpdate(text);
                }
              }}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.switchContainer}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Price Negotiable</Text>
            <Text style={styles.switchSubtitle}>Allow clients to propose a price</Text>
          </View>
          <Switch
            value={isNegotiable}
            onValueChange={(val) => {
              if (val && pricingType === 'fixed') {
                showErrorToast(
                  'Negotiable price is only allowed for Hourly services.',
                  'Pricing Rule',
                  'alert-circle',
                );
                return;
              }
              setIsNegotiable(val);
            }}
            trackColor={{ false: colors.light.border, true: colors.light.primary + '80' }}
            thumbColor={isNegotiable ? colors.light.primary : colors.light.surface}
          />
        </View>
      </View>
    );
  },
);
PricingSection.displayName = 'PricingSection';

const LocationSection = memo(({ initialLocation, onUpdate }: LocationSectionProps) => {
  const [localLocation, setLocalLocation] = useState(initialLocation);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Service Location</Text>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="location"
            size={20}
            color={colors.light.subText}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.input}
            placeholder="e.g. Near DHA or Office Name"
            placeholderTextColor={colors.light.subText}
            value={localLocation}
            onChangeText={(text) => {
              setLocalLocation(text);
              onUpdate(text);
            }}
          />
        </View>
        <View style={styles.locationInfoShort}>
          <Ionicons name="information-circle" size={14} color={colors.light.subText} />
          <Text style={styles.locationInfoTextShort}>
            Enter your office or point where you are based.
          </Text>
        </View>
      </View>
    </View>
  );
});
LocationSection.displayName = 'LocationSection';

const RadiusSection = memo(({ serviceRadius, setServiceRadius }: RadiusSectionProps) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Service Radius</Text>
      <View style={styles.radiusBadge}>
        <Text style={styles.radiusValue}>{serviceRadius} km</Text>
      </View>
    </View>

    <View style={styles.sliderContainer}>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={50}
        step={1}
        value={serviceRadius}
        onValueChange={setServiceRadius}
        minimumTrackTintColor={colors.light.primary}
        maximumTrackTintColor={colors.light.border}
        thumbTintColor={colors.light.primary}
      />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>1 km</Text>
        <Text style={styles.sliderLabel}>50 km</Text>
      </View>
    </View>
  </View>
));
RadiusSection.displayName = 'RadiusSection';

const PhotoSection = memo(({ coverPhoto, pickCoverPhoto, removeCoverPhoto }: PhotoSectionProps) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Cover Photo</Text>
    </View>

    {coverPhoto ? (
      <View style={styles.coverPhotoContainer}>
        <Image source={{ uri: coverPhoto.uri }} style={styles.coverPhoto} />
        <Pressable
          style={({ pressed }) => [
            styles.photoRemoveButton,
            Platform.OS === 'ios' && pressed && { opacity: 0.8 },
          ]}
          onPress={removeCoverPhoto}
        >
          <Ionicons name="close-circle" size={26} color={colors.light.surface} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.replacePhotoButton,
            Platform.OS === 'ios' && pressed && { opacity: 0.8 },
          ]}
          onPress={pickCoverPhoto}
        >
          <Ionicons name="image-outline" size={18} color={colors.light.surface} />
          <Text style={styles.replacePhotoText}>Replace</Text>
        </Pressable>
      </View>
    ) : (
      <Pressable
        style={({ pressed }) => [
          styles.coverPhotoPlaceholder,
          Platform.OS === 'ios' && pressed && { opacity: 0.8 },
        ]}
        android_ripple={{ color: colors.light.border }}
        onPress={pickCoverPhoto}
      >
        <Ionicons name="image" size={40} color={colors.light.subText} />
        <Text style={styles.coverPlaceholderText}>Upload Cover Photo</Text>
      </Pressable>
    )}
  </View>
));
PhotoSection.displayName = 'PhotoSection';

const StatusSection = memo(({ isActive, setIsActive }: StatusSectionProps) => (
  <View style={styles.section}>
    <View style={styles.statusCard}>
      <View style={styles.statusLeft}>
        <View style={styles.statusIcon}>
          <Ionicons name="checkmark-circle" size={24} color={colors.light.primary} />
        </View>
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>Listing Status</Text>
          <Text style={styles.statusSubtext}>Currently set to {isActive ? 'Active' : 'Draft'}</Text>
        </View>
      </View>
      <Switch
        value={isActive}
        onValueChange={setIsActive}
        trackColor={{ false: colors.light.border, true: colors.light.primary + '80' }}
        thumbColor={isActive ? colors.light.primary : colors.light.surface}
      />
    </View>
  </View>
));
StatusSection.displayName = 'StatusSection';

const ListingDetails = () => {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const id = typeof searchParams.id === 'string' ? searchParams.id : undefined;

  const { data: listingDetails, isLoading: isLoadingDetails } = useGetListingByIdQuery(
    id as string,
    {
      skip: !id,
    },
  );

  const previousData = useMemo(() => {
    try {
      const listingDataRaw = searchParams.listingData;
      const dataStr = Array.isArray(listingDataRaw) ? listingDataRaw[0] : listingDataRaw;
      return dataStr ? JSON.parse(dataStr) : {};
    } catch (e) {
      console.error('Failed to parse listingData:', e);
      return {};
    }
  }, [searchParams.listingData]);

  const [pricingType, setPricingType] = useState<PriceType>('fixed');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [serviceRadius, setServiceRadius] = useState(25);
  const [coverPhoto, setCoverPhoto] = useState<{
    uri: string;
    type?: string;
    isExisting?: boolean;
    name?: string;
  } | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Refs for high-frequency input to avoid full screen re-renders
  const priceAmountRef = useRef('');
  const serviceLocationRef = useRef('');

  const [createListing, { isLoading: isCreating }] = useCreateListingMutation();
  const [updateListing, { isLoading: isUpdating }] = useUpdateListingMutation();
  const isLoading = isCreating || isUpdating;

  // Pre-fill details if in edit mode
  useEffect(() => {
    if (listingDetails && id) {
      setPricingType((listingDetails.priceType as PriceType) || 'fixed');
      setIsNegotiable(listingDetails.isNegotiable || false);
      setServiceRadius(listingDetails.serviceRadiusKm || 25);
      setIsActive(listingDetails.status === 'active');
      priceAmountRef.current = listingDetails.priceAmount?.toString() || '';
      serviceLocationRef.current = listingDetails.serviceLocation || '';

      if (listingDetails.imageUrl || listingDetails.photoUrl) {
        setCoverPhoto({
          uri: (listingDetails.imageUrl || listingDetails.photoUrl) as string,
          type: 'image',
          isExisting: true,
        });
      }
    }
  }, [listingDetails, id]);

  const pickCoverPhoto = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showErrorToast(
          'Permission to access media library is required.',
          'Permission Required',
          'alert-circle',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setCoverPhoto({
          uri: result.assets[0].uri,
          type: 'image',
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showErrorToast('Failed to pick image', 'Error', 'alert-circle');
    }
  }, []);

  const removeCoverPhoto = useCallback(() => {
    setCoverPhoto(null);
  }, []);

  const validateStep = () => {
    if (!coverPhoto) {
      showErrorToast('Please upload a cover photo', 'Validation Error', 'alert-circle');
      return false;
    }

    if (!priceAmountRef.current || parseFloat(priceAmountRef.current) <= 0) {
      showErrorToast('Please enter a valid price amount', 'Validation Error', 'alert-circle');
      return false;
    }

    if (isNegotiable && pricingType === 'fixed') {
      showErrorToast(
        'Negotiable price is only allowed for Hourly pricing.',
        'Validation Error',
        'alert-circle',
      );
      return false;
    }
    return true;
  };

  const handlePublish = async () => {
    if (!validateStep()) {
      return;
    }

    try {
      const formData = new FormData();

      // Basic listing fields
      const title = previousData.serviceTitle || previousData.title || listingDetails?.title;
      const description = previousData.description || listingDetails?.description;
      const categoryId =
        previousData.subCategoryId || previousData.categoryId || listingDetails?.categoryId;
      const cityId = previousData.cityId || listingDetails?.cityId;

      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      if (pricingType) formData.append('priceType', pricingType);
      if (priceAmountRef.current) formData.append('priceAmount', priceAmountRef.current);

      // Postman aligned fields
      formData.append('isNegotiable', isNegotiable ? 'true' : 'false');
      if (serviceLocationRef.current)
        formData.append('serviceLocation', serviceLocationRef.current);
      if (categoryId) formData.append('categoryId', categoryId);
      if (cityId) formData.append('cityId', cityId);
      formData.append('serviceRadiusKm', serviceRadius.toString());
      formData.append('status', isActive ? 'active' : 'draft');

      // Fetch dynamic user coordinates from cache
      const cachedLocation = await storage.get(CACHE_KEYS.LOCATION_COORDS);
      if (cachedLocation && cachedLocation.value) {
        const { latitude, longitude } = cachedLocation.value;
        formData.append('serviceLocationPoint', JSON.stringify({ latitude, longitude }));
      } else {
        // Fallback or ignore if no location is available
        console.warn('No location coordinates found in cache. Using fallback.');
        formData.append(
          'serviceLocationPoint',
          JSON.stringify({ latitude: 24.8138, longitude: 67.0325 }),
        );
      }

      // Image handling
      if (coverPhoto && !coverPhoto.isExisting) {
        const uri =
          Platform.OS === 'android' ? coverPhoto.uri : coverPhoto.uri.replace('file://', '');
        const fileType = coverPhoto.uri.split('.').pop() || 'jpg';

        // @ts-ignore
        formData.append('images', {
          uri: uri,
          name: coverPhoto.name || `photo_${Date.now()}.jpg`,
          type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
        });
      } else if (listingDetails?.imageUrl) {
        // As per guide: Provide imageUrl if images not sent
        formData.append('imageUrl', listingDetails.imageUrl);
      }

      const listingId = Array.isArray(id) ? id[0] : id;

      if (listingId) {
        await updateListing({ id: listingId, data: formData }).unwrap();
      } else {
        await createListing(formData).unwrap();
      }

      showSuccessToast(
        id
          ? 'Your changes have been saved successfully.'
          : 'Your service is now live on the marketplace.',
        id ? 'Listing Updated! 🎉' : 'Listing Published! 🎉',
      );

      router.push({
        pathname: '/(user)/(tabs)/mylisting',
        params: { tab: 'active' },
      });
    } catch (error: any) {
      console.error('Publish error:', error);
      showErrorToast(
        error?.data?.detail?.[0]?.msg || error?.message || 'Something went wrong.',
        'Publish Failed',
      );
    }
  };

  return (
    <ScreenWrapper withTopInset={false} backgroundColor={colors.light.surface}>
      <Header
        title={id ? 'Edit Listing' : 'Create Listing'}
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pagination totalSteps={2} currentStep={1} />

          {isLoadingDetails ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <AppLoadingAnimation visible={true} message="Loading details..." />
            </View>
          ) : (
            <>
              <PricingSection
                key={`pricing-${id}-${listingDetails?.priceAmount}`}
                initialPrice={listingDetails?.priceAmount?.toString() || ''}
                onUpdate={(val: string) => (priceAmountRef.current = val)}
                pricingType={pricingType}
                setPricingType={setPricingType}
                isNegotiable={isNegotiable}
                setIsNegotiable={setIsNegotiable}
              />

              <LocationSection
                key={`location-${id}-${listingDetails?.serviceLocation}`}
                initialLocation={listingDetails?.serviceLocation || ''}
                onUpdate={(val: string) => (serviceLocationRef.current = val)}
              />

              <RadiusSection serviceRadius={serviceRadius} setServiceRadius={setServiceRadius} />

              <PhotoSection
                coverPhoto={coverPhoto}
                pickCoverPhoto={pickCoverPhoto}
                removeCoverPhoto={removeCoverPhoto}
              />

              <StatusSection isActive={isActive} setIsActive={setIsActive} />
            </>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.publishButton,
              (isLoading || pressed) && styles.publishButtonDisabled,
              Platform.OS === 'ios' && pressed && { opacity: 0.85 },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            onPress={handlePublish}
            disabled={isLoading}
          >
            {isLoading ? (
              <AppLoadingAnimation
                visible={true}
                fullscreen={false}
                style={{ paddingVertical: 0 }}
              />
            ) : (
              <>
                <Text style={styles.publishButtonText}>
                  {id ? 'Update Listing' : 'Publish Listing'}
                </Text>
                <Ionicons name={id ? 'save' : 'rocket'} size={20} color={colors.light.surface} />
              </>
            )}
          </Pressable>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  locationInfoShort: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: colors.light.text,
    paddingVertical: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  locationInfoTextShort: {
    fontSize: 12,
    color: colors.light.subText,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
  },
  locationCard: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeAreaBadge: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: colors.light.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeAreaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.text,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.light.surface,
  },
  locationInfoText: {
    fontSize: 13,
    color: colors.light.subText,
    marginLeft: 8,
    flex: 1,
  },
  radiusBadge: {
    backgroundColor: colors.light.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  radiusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.primary,
  },
  sliderContainer: {
    paddingVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.light.subText,
  },
  coverPhotoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    height: 220,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPhotoPlaceholder: {
    height: 220,
    backgroundColor: colors.light.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.light.border,
    borderStyle: 'dashed',
  },
  coverPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.light.subText,
  },
  photoRemoveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  replacePhotoButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  replacePhotoText: {
    color: colors.light.surface,
    fontSize: 13,
    fontWeight: '600',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.light.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
    marginBottom: 8,
  },
  dollarSign: {
    fontSize: 16,
    color: colors.light.subText,
    marginRight: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.light.border,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleOptionActive: {
    backgroundColor: colors.light.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.light.subText,
  },
  toggleTextActive: {
    color: colors.light.text,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 13,
    color: colors.light.subText,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.light.text,
  },
  statusSubtext: {
    fontSize: 13,
    color: colors.light.subText,
    marginTop: 2,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.primary,
    borderRadius: 12,
    height: 56,
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  publishButtonDisabled: {
    backgroundColor: colors.light.border,
  },
  publishButtonText: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default ListingDetails;
