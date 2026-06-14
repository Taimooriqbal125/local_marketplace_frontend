import { showErrorToast, showSuccessToast } from '@/components/toast/CustomError';
import { useCreateReviewMutation } from '@/redux/reviews/reviewApi';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { colors } from '@theme/index';

interface AddReviewsProps {
  visible: boolean;
  onClose: () => void;
  orderId: string | null;
}

const AddReviews = ({ visible, onClose, orderId }: AddReviewsProps) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');

  const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleClose = () => {
    if (!isLoading) {
      setRating(5);
      setComment('');
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!orderId) {
      showErrorToast('Order ID is missing', 'Error');
      return;
    }

    try {
      await createReview({
        orderId,
        rating,
        comment,
      }).unwrap();

      showSuccessToast('Review submitted successfully!', 'Success');
      handleClose();
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      showErrorToast(
        error?.data?.detail?.[0]?.msg || error?.message || 'Failed to submit review',
        'Review Error',
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
            >
              <View style={styles.content}>
                <Text style={styles.modalTitle}>Leave a Review</Text>

                <Text style={styles.label}>Rate your experience</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                      key={star}
                      onPress={() => setRating(star)}
                      style={({ pressed }) => [
                        styles.starPressable,
                        Platform.OS === 'ios' && pressed && { scaleX: 1.1, scaleY: 1.1 },
                      ]}
                      android_ripple={{ color: colors.light.border, borderless: true, radius: 24 }}
                    >
                      <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={40}
                        color={star <= rating ? colors.light.warning : colors.light.border}
                      />
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>Add a comment (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tell us about your experience..."
                  placeholderTextColor={colors.light.mutedText}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View style={styles.actionButtons}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.submitButton,
                      isLoading && styles.disabledButton,
                      Platform.OS === 'ios' &&
                        pressed && { opacity: 0.8, scaleX: 0.98, scaleY: 0.98 },
                    ]}
                    onPress={handleSubmit}
                    android_ripple={{ color: colors.light.successBackground }}
                    disabled={isLoading}
                  >
                    <Text style={styles.submitButtonText}>
                      {isLoading ? 'Submitting Review...' : 'Submit Review'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.cancelButton,
                      Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                    ]}
                    onPress={handleClose}
                    android_ripple={{ color: colors.light.border }}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddReviews;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    width: '100%',
    backgroundColor: colors.light.surface,
    borderRadius: 24,
    padding: 32,
    shadowColor: colors.light.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.light.subText,
    marginBottom: 10,
    marginTop: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starPressable: {
    paddingHorizontal: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.light.altBackground,
    fontSize: 15,
    color: colors.light.text,
    minHeight: 120,
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: colors.light.success,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.light.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: colors.light.successBackground,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.light.altBackground,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.light.subText,
    fontSize: 16,
    fontWeight: '600',
  },
});
