import { showErrorToast } from '@/components/toast/CustomError';
import { toastConfig } from '@/components/toast/toastConfig';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { colors } from '@theme/index';
import Toast from 'react-native-toast-message';

interface ShowRequestedModelProps {
  visible: boolean;
  onClose: () => void;
  onAccept: (agreedPrice: number) => void;
  item: any;
  isLoading?: boolean;
}

const ShowRequestedModel = ({
  visible,
  onClose,
  onAccept,
  item,
  isLoading,
}: ShowRequestedModelProps) => {
  const [agreedPrice, setAgreedPrice] = useState<string>('');

  useEffect(() => {
    if (visible && item) {
      const defaultPrice = item.proposedPrice || item.servicePrice || item.price || '';
      setAgreedPrice(defaultPrice.toString());
    } else {
      setAgreedPrice('');
    }
  }, [visible, item]);

  if (!item) return null;

  const image = item.imageUrl || item.image || item.serviceImage || item.listingImage;
  const title = item.serviceName || item.listingTitle || item.title || 'Untitled Service';
  const servicePrice = item.servicePrice || item.price || 0;
  const proposedPrice = item.proposedPrice;

  const handleAccept = () => {
    if (!agreedPrice.trim()) {
      showErrorToast('Please enter an agreed price.', 'Input Required');
      return;
    }

    const numericPrice = parseFloat(agreedPrice);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      showErrorToast('Please enter a valid price greater than 0.', 'Invalid Price');
      return;
    }
    onAccept(numericPrice);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.content}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.header}>
                    <Text style={styles.headerTitle}>Accept Order</Text>
                    <Pressable
                      onPress={onClose}
                      disabled={isLoading}
                      style={({ pressed }) => [
                        styles.closeButton,
                        Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                      ]}
                      android_ripple={{ color: colors.light.border, borderless: true }}
                    >
                      <Ionicons name="close" size={24} color={colors.light.subText} />
                    </Pressable>
                  </View>

                  <View style={styles.serviceContainer}>
                    {image ? (
                      <Image source={{ uri: image }} style={styles.serviceImage} />
                    ) : (
                      <View style={[styles.serviceImage, styles.placeholderImage]}>
                        <Ionicons name="image-outline" size={30} color={colors.light.mutedText} />
                      </View>
                    )}
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceTitle} numberOfLines={2}>
                        {title}
                      </Text>
                      <Text style={styles.servicePrice}>
                        Service Price: <Text style={styles.boldPrice}>Rs {servicePrice}</Text>
                      </Text>
                    </View>
                  </View>

                  {!!proposedPrice && proposedPrice > 0 && (
                    <View style={styles.proposedPriceContainer}>
                      <Ionicons name="pricetag-outline" size={20} color={colors.light.warning} />
                      <Text style={styles.proposedPriceText}>
                        Buyer proposed:{' '}
                        <Text style={styles.boldProposedPrice}>Rs {proposedPrice}</Text>
                      </Text>
                    </View>
                  )}

                  <Text style={styles.inputLabel}>Set Agreed Price (Rs)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="cash-outline"
                      size={20}
                      color={colors.light.subText}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={agreedPrice}
                      onChangeText={setAgreedPrice}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      editable={!isLoading}
                      placeholderTextColor={colors.light.mutedText}
                    />
                  </View>
                </ScrollView>

                <View style={styles.footer}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.cancelBtn,
                      Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                    ]}
                    onPress={onClose}
                    android_ripple={{ color: colors.light.border }}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.acceptBtn,
                      Platform.OS === 'ios' &&
                        pressed && { opacity: 0.8, scaleX: 0.98, scaleY: 0.98 },
                    ]}
                    onPress={handleAccept}
                    android_ripple={{ color: colors.light.successBackground }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={colors.light.surface} />
                    ) : (
                      <Text style={styles.acceptBtnText}>Accept Order</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
          <Toast config={toastConfig} />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  serviceContainer: {
    flexDirection: 'row',
    backgroundColor: colors.light.altBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    color: colors.light.subText,
  },
  boldPrice: {
    color: colors.light.success,
    fontWeight: '700',
  },
  proposedPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.warningBackground,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  proposedPriceText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.light.warning,
  },
  boldProposedPrice: {
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 24,
    backgroundColor: colors.light.surface,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.light.text,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: colors.light.altBackground,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.subText,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: colors.light.success,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.light.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.surface,
  },
});

export default ShowRequestedModel;
