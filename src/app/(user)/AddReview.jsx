import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// import YourServiceCard from '../components/YourServiceCard';

const MIN_REVIEW_LENGTH = 20;
const TOTAL_STARS = 5;

export default function AddReview() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const trimmedReview = review.trim();
  const remainingChars = Math.max(0, MIN_REVIEW_LENGTH - trimmedReview.length);

  const isFormValid = useMemo(() => {
    return rating > 0 && trimmedReview.length >= MIN_REVIEW_LENGTH;
  }, [rating, trimmedReview]);

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating.');
      return;
    }

    if (trimmedReview.length < MIN_REVIEW_LENGTH) {
      Alert.alert('Review too short', `Please enter at least ${MIN_REVIEW_LENGTH} characters.`);
      return;
    }

    const payload = {
      rating,
      review: trimmedReview,
      createdAt: new Date().toISOString(),
    };

    console.log('Review Payload:', payload);

    Alert.alert('Success', 'Your review has been submitted.');

    // Optional: reset form after submit
    setRating(0);
    setReview('');
  };

  const renderStars = () => {
    return Array.from({ length: TOTAL_STARS }, (_, index) => {
      const starNumber = index + 1;
      const filled = starNumber <= rating;

      return (
        <Pressable
          key={starNumber}
          onPress={() => handleStarPress(starNumber)}
          style={styles.starButton}
          hitSlop={10}
        >
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={34}
            color={filled ? '#3B82F6' : '#C7CDD9'}
          />
          <Text style={styles.starNumber}>{starNumber}</Text>
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
          placeholderTextColor="#A0AEC0"
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
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          !isFormValid && styles.submitButtonDisabled,
          pressed && isFormValid && styles.submitButtonPressed,
        ]}
        disabled={!isFormValid}
      >
        <Text style={styles.submitButtonText}>Submit Review</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  cardPlaceholder: {
    height: 90,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  cardPlaceholderText: {
    color: '#6B7280',
    fontSize: 14,
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
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
    color: '#3B82F6',
    fontWeight: '600',
  },
  feedbackHeader: {
    marginBottom: 10,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  input: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  helperText: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 12,
    color: '#10B981',
  },
  helperTextError: {
    color: '#94A3B8',
  },
  submitButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#AFC8F8',
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
