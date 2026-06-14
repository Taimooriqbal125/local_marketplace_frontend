import LocationPermissionUI from '@/components/common/EnableLocationUI';
import { showErrorToast, showSuccessToast } from '@/components/toast/CustomError';
import { useLocation } from '@/hooks/useLocation';
import {
  useGetParentCategoriesQuery,
  useGetSubCategoriesQuery,
} from '@/redux/category/categoryApi';
import { useGetAllCitiesQuery } from '@/redux/cities/cityApi';
import { useGetListingByIdQuery } from '@/redux/listings/listingApi';
import { CACHE_KEYS } from '@/storage/keys';
import { storage } from '@/storage/storage';
import { Category, City, Listing } from '@/types';
import CustomDropdown from '@components/common/DropDown';
import Header from '@components/common/Header';
import Pagination from '@components/common/Pagination';
import ScreenWrapper from '@components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '@theme/index';

type DropdownOption = {
  label: string;
  value: string;
};

type ListingDataType = Partial<Listing>;

const ListingBasicInfo = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: listingData } = useGetListingByIdQuery(id as string, {
    skip: !id,
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [serviceTitle, setServiceTitle] = useState<string>('');
  const [category, setCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');

  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const { requestAndSyncLocation } = useLocation();
  const appState = useRef(AppState.currentState);

  // Check location on mount
  useEffect(() => {
    const checkLocation = async () => {
      const cachedLocation = await storage.get(CACHE_KEYS.LOCATION_COORDS);
      if (cachedLocation && !cachedLocation.isStale && cachedLocation.value) {
        setLocationGranted(true);
      } else {
        setLocationGranted(false);
      }
    };
    checkLocation();
  }, []);

  // Listen for AppState changes to detect when user returns from Settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        locationGranted === false
      ) {
        // User came back to the app, try to fetch location
        const result = await requestAndSyncLocation();
        if (result?.success) {
          setLocationGranted(true);
          showSuccessToast('Location fetched successfully!', 'Success');
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [locationGranted, requestAndSyncLocation]);

  const handleEnableLocation = () => {
    // Open settings directly
    Linking.openSettings();
  };

  useEffect(() => {
    const typedListingData = listingData as ListingDataType | undefined;

    if (typedListingData && id) {
      setServiceTitle(typedListingData.title || '');
      setCategory(typedListingData.categoryId || null);
      setCity(typedListingData.cityId || null);
      setDescription(typedListingData.description || '');
    }
  }, [listingData, id]);

  const { data: parentCategoriesData } = useGetParentCategoriesQuery();
  const parentCategories = useMemo(() => {
    return Array.isArray(parentCategoriesData)
      ? parentCategoriesData
      : parentCategoriesData?.results || parentCategoriesData?.items || [];
  }, [parentCategoriesData]);

  const { data: subCategoriesData } = useGetSubCategoriesQuery(category as string, {
    skip: !category,
  });
  const dynamicSubcategories = useMemo(() => {
    return Array.isArray(subCategoriesData)
      ? subCategoriesData
      : subCategoriesData?.results || subCategoriesData?.items || [];
  }, [subCategoriesData]);

  const formattedCategories: DropdownOption[] = useMemo(() => {
    return parentCategories.map((cat: Category) => ({
      label: cat.name,
      value: cat.id,
    }));
  }, [parentCategories]);

  const formattedSubcategories: DropdownOption[] = useMemo(() => {
    return dynamicSubcategories.map((sub: Category) => ({
      label: sub.name,
      value: sub.id,
    }));
  }, [dynamicSubcategories]);

  const { data: citiesData } = useGetAllCitiesQuery();
  const dynamicCities = useMemo(() => {
    return Array.isArray(citiesData) ? citiesData : citiesData?.results || citiesData?.items || [];
  }, [citiesData]);

  const formattedCities: DropdownOption[] = useMemo(() => {
    return dynamicCities.map((c: City) => ({
      label: c.name,
      value: c.id,
    }));
  }, [dynamicCities]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!serviceTitle.trim()) {
          showErrorToast('Please enter a service title', 'Validation Error', 'alert-circle');
          return false;
        }
        if (!category) {
          showErrorToast('Please select a category', 'Validation Error', 'alert-circle');
          return false;
        }
        if (!subcategory) {
          showErrorToast('Please select a subcategory', 'Validation Error', 'alert-circle');
          return false;
        }
        if (!city) {
          showErrorToast('Please select a city', 'Validation Error', 'alert-circle');
          return false;
        }
        if (!description.trim()) {
          showErrorToast('Please enter a description', 'Validation Error', 'alert-circle');
          return false;
        }
        if (description.trim().length < 50) {
          showErrorToast(
            'Description must be at least 50 characters',
            'Validation Error',
            'alert-circle',
          );
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleNext = (): void => {
    if (validateStep(currentStep)) {
      const nextListingData = {
        serviceTitle,
        categoryId: category,
        subCategoryId: subcategory,
        cityId: city,
        description,
      };

      router.push({
        pathname: '/(user)/ListingDetails',
        params: {
          listingData: JSON.stringify(nextListingData),
          id: id || undefined,
        },
      });
    }
  };

  const totalSteps = 2;

  return (
    <ScreenWrapper withTopInset={false} backgroundColor={colors.light.surface}>
      <Header
        title={id ? 'Edit Listing' : 'Create Listing'}
        showBackButton={true}
        onBackPress={() => {
          if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
          } else {
            router.back();
          }
        }}
      />

      {locationGranted === false ? (
        <LocationPermissionUI
          title="Location Required"
          description="We need your location to list your services correctly and connect you with nearest buyers."
          onEnable={handleEnableLocation}
          mandatory={true}
        />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Pagination totalSteps={totalSteps} currentStep={currentStep} />

            {currentStep === 0 && (
              <View style={styles.stepContent}>
                <Text style={styles.sectionTitle}>Basic Info</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Service Title</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Professional House Cleaning"
                      placeholderTextColor={colors.light.subText}
                      value={serviceTitle}
                      onChangeText={setServiceTitle}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <CustomDropdown
                  label="Category"
                  placeholder="Select a category"
                  options={formattedCategories}
                  value={category}
                  onChange={(val: string) => {
                    setCategory(val);
                    setSubcategory(null);
                  }}
                  icon="apps"
                  searchable={true}
                />

                <CustomDropdown
                  label="Subcategory"
                  placeholder="Select a subcategory"
                  options={formattedSubcategories}
                  value={subcategory}
                  onChange={(val: string) => setSubcategory(val)}
                  icon="grid"
                  searchable={true}
                />

                <CustomDropdown
                  label="City"
                  placeholder="Choose city"
                  options={formattedCities}
                  value={city}
                  onChange={(val: string) => setCity(val)}
                  icon="location"
                  searchable={true}
                />

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <View style={[styles.inputContainer, styles.textareaContainer]}>
                    <TextInput
                      style={styles.textarea}
                      placeholder="Describe your service in detail..."
                      placeholderTextColor={colors.light.subText}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                    />
                  </View>
                  <Text style={styles.charCount}>{description.length} characters (min 50)</Text>
                </View>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.nextButton,
                Platform.OS === 'ios' && pressed && { opacity: 0.85 },
              ]}
              android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next Step</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.light.surface} />
            </Pressable>

            <View style={{ height: 20 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
  },
  saveButton: {
    fontSize: 16,
    color: colors.light.primary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  stepContent: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
    marginBottom: 8,
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
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.light.text,
    padding: 0,
  },
  textareaContainer: {
    height: 140,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'flex-start',
  },
  textarea: {
    flex: 1,
    fontSize: 15,
    color: colors.light.text,
    padding: 0,
    width: '100%',
  },
  charCount: {
    fontSize: 12,
    color: colors.light.subText,
    textAlign: 'right',
    marginTop: 6,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.light.border,
    borderRadius: 12,
    padding: 4,
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
  dollarSign: {
    fontSize: 16,
    color: colors.light.subText,
    marginRight: 8,
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
  reviewCard: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.light.border,
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 14,
    color: colors.light.text,
    marginLeft: 12,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
    marginBottom: 8,
  },
  reviewDescription: {
    fontSize: 14,
    color: colors.light.subText,
    lineHeight: 22,
    backgroundColor: colors.light.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.primary,
    borderRadius: 12,
    height: 56,
    marginTop: 24,
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: colors.light.border,
  },
  nextButtonText: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default ListingBasicInfo;
