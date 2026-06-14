import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { showErrorToast, showSuccessToast } from '@/components/toast/CustomError';
import { useCreateReviewMutation } from '@/redux/reviews/reviewApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@theme/index';

const MIN_REVIEW_LENGTH = 20;
const TOTAL_STARS = 5;

export default function AddReview() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const [createReview, { isLoading }] = useCreateReviewMutation();

  const trimmedReview = review.trim();
  const remainingChars = Math.max(0, MIN_REVIEW_LENGTH - trimmedReview.length);

  const isFormValid = useMemo(() => {
    return rating > 0 && trimmedReview.length >= MIN_REVIEW_LENGTH;
  }, [rating, trimmedReview]);

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showErrorToast('Please select a star rating.', 'Rating required');
      return;
    }

    if (trimmedReview.length < MIN_REVIEW_LENGTH) {
      showErrorToast(`Please enter at least ${MIN_REVIEW_LENGTH} characters.`, 'Review too short');
      return;
    }

    if (!orderId) {
      showErrorToast('Order information is missing.', 'Error');
      return;
    }

    try {
      await createReview({
        orderId,
        rating,
        comment: trimmedReview,
      }).unwrap();

      showSuccessToast('Your review has been submitted.', 'Success');

      // Navigate back after success
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(user)/(tabs)');
      }
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      showErrorToast(
        error?.data?.message || error?.message || 'Failed to submit review',
        'Submission Failed',
      );
    }
  };

  const renderStars = () => {
    return Array.from({ length: TOTAL_STARS }, (_, index) => {
      const starNumber = index + 1;
      const filled = starNumber <= rating;

      return (
        <Pressable
          key={starNumber}
          onPress={() => handleStarPress(starNumber)}
          style={({ pressed }) => [
            styles.starButton,
            Platform.OS === 'ios' && pressed && { opacity: 0.7 },
          ]}
          hitSlop={10}
        >
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={34}
            color={filled ? colors.light.primary : colors.light.border}
          />
          <Text
            style={[
              styles.starNumber,
              { color: filled ? colors.light.primary : colors.light.subText },
            ]}
          >
            {starNumber}
          </Text>
        </Pressable>
      );
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {/* Replace this with your existing card */}
        <View style={styles.cardPlaceholder}>
          <Text style={styles.cardPlaceholderText}>Your existing service card goes here</Text>
        </View>

        <Text style={styles.sectionTitle}>HOW WAS YOUR EXPERIENCE?</Text>

        <View style={styles.starsRow}>{renderStars()}</View>

        <View style={styles.feedbackHeader}>
          <Text style={styles.feedbackTitle}>Your Feedback</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Tell us what you liked or what could be improved..."
          placeholderTextColor={colors.light.subText}
          value={review}
          onChangeText={setReview}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />

        <Text
          style={[
            styles.helperText,
            trimmedReview.length < MIN_REVIEW_LENGTH && styles.helperTextError,
          ]}
        >
          {trimmedReview.length < MIN_REVIEW_LENGTH
            ? `${remainingChars} more characters needed`
            : 'Looks good'}
        </Text>
      </View>

      <Pressable
        testID="submit-review-btn"
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          (!isFormValid || isLoading) && styles.submitButtonDisabled,
          Platform.OS === 'ios' && pressed && isFormValid && !isLoading && { opacity: 0.85 },
        ]}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        disabled={!isFormValid || isLoading}
      >
        <Text style={styles.submitButtonText}>{isLoading ? 'Submitting...' : 'Submit Review'}</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
    justifyContent: 'space-between',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  cardPlaceholder: {
    height: 90,
    borderRadius: 16,
    backgroundColor: colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  cardPlaceholderText: {
    color: colors.light.subText,
    fontSize: 14,
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.subText,
    letterSpacing: 1,
    marginBottom: 18,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  starButton: {
    alignItems: 'center',
  },
  starNumber: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackHeader: {
    marginBottom: 10,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
  },
  input: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.light.text,
    backgroundColor: colors.light.background,
  },
  helperText: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 12,
    color: colors.light.success,
  },
  helperTextError: {
    color: colors.light.subText,
  },
  submitButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: colors.light.primary,
    borderRadius: 14,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.light.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: colors.light.border,
  },
  submitButtonText: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
