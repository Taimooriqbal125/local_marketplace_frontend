import SuccessAnimation from '@/components/animations/SuccessAnimation';
import ServiceItemCard from '@/components/common/ServiceItemCard';
import { showErrorToast } from '@/components/toast/CustomError';
import { toastConfig } from '@/components/toast/toastConfig';
import { useCreateOrderMutation } from '@/redux/orders/orderApi';
import fontsize from '@theme/fontsize';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { colors } from '@theme/index';

import { Listing } from '@/types';

interface RequestServiceModalProps {
  visible: boolean;
  onClose: () => void;
  service: Listing | null;
}

const RequestServiceModal = ({ visible, onClose, service }: RequestServiceModalProps) => {
  const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();
  const [proposedPrice, setProposedPrice] = useState(
    service?.priceAmount ? service.priceAmount.toString() : '',
  );
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const onSendRequest = async () => {
    if (!service) return;

    // Validation
    if (!proposedPrice.trim()) {
      showErrorToast('Please enter a proposed price.', 'Input Required');
      return;
    }

    try {
      const resultAction = await createOrder({
        listingId: service.id,
        proposedPrice: parseFloat(proposedPrice),
        notes: notes,
      }).unwrap();

      if (resultAction) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setNotes('');
          onClose();
        }, 2500);
      }
    } catch (error: any) {
      // Explicitly show error toast inside the modal context
      const errorMessage =
        error?.data?.detail || error?.message || 'Order request failed. Please try again later.';
      showErrorToast(errorMessage, 'Request Failed');
      console.error('Order creation failed:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !showSuccess) {
      onClose();
    }
  };

  if (!service) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          {showSuccess ? (
            <View style={styles.successContainer}>
              <SuccessAnimation visible={true} fullscreen={false} />
            </View>
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.content}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {/* Title */}
                    <Text style={styles.modalTitle}>Request Service</Text>

                    {/* Service Card Summary */}
                    <ServiceItemCard
                      title={service.title}
                      price={service.priceAmount as any}
                      image={service.imageUrl || ''}
                      containerStyle={{ marginBottom: 20 }}
                    />

                    {/* Proposed Price Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Proposed Price</Text>
                      <View style={styles.priceInputContainer}>
                        <Text style={styles.currencySymbol}>Rs</Text>
                        <TextInput
                          style={styles.priceInput}
                          value={proposedPrice}
                          onChangeText={setProposedPrice}
                          keyboardType="numeric"
                          placeholder="0.00"
                          placeholderTextColor={colors.light.mutedText}
                        />
                      </View>
                      <Text style={styles.helperText}>
                        Service providers are more likely to accept requests close to their list
                        price.
                      </Text>
                    </View>

                    {/* Add Notes Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Add Notes</Text>
                      <TextInput
                        style={styles.notesInput}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                        placeholder="Tell the seller more about your requirements, specific areas to focus on, or parking instructions..."
                        placeholderTextColor={colors.light.mutedText}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.sendButton,
                          Platform.OS === 'ios' &&
                            pressed && { opacity: 0.8, scaleX: 0.98, scaleY: 0.98 },
                        ]}
                        onPress={onSendRequest}
                        android_ripple={{ color: colors.light.successBackground }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.light.surface} />
                            <Text style={styles.sendButtonText}>Sending Request...</Text>
                          </View>
                        ) : (
                          <Text style={styles.sendButtonText}>Send Request</Text>
                        )}
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          styles.cancelButton,
                          Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                        ]}
                        onPress={handleClose}
                        android_ripple={{ color: colors.light.border }}
                        disabled={isSubmitting}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </Pressable>
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          )}
          <Toast config={toastConfig} />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const styles = StyleSheet.create({
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
    fontSize: fontsize.xl,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.subText,
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: colors.light.altBackground,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.light.mutedText,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: colors.light.text,
  },
  helperText: {
    fontSize: 11,
    color: colors.light.mutedText,
    marginTop: 6,
    lineHeight: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.light.altBackground,
    fontSize: 14,
    color: colors.light.text,
    minHeight: 100,
  },
  actionButtons: {
    marginTop: 16,
    marginBottom: 8,
  },
  sendButton: {
    backgroundColor: colors.light.success,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.light.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonText: {
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
  successContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.light.surface,
    borderRadius: 24,
    padding: 32,
    minHeight: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RequestServiceModal;
