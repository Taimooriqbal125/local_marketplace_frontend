import ServiceItemCard from '@/components/common/ServiceItemCard';
import fontsize from '@theme/fontsize';
import { useState } from 'react';
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

const RequestServiceModal = ({ visible, onClose, service }) => {
  const [proposedPrice, setProposedPrice] = useState(service?.price?.replace('$', '') || '');
  const [notes, setNotes] = useState('');
  const onSendRequest = () => {
    onClose();
  };

  if (!service) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.bottomSheetContainer}
            >
              <View style={styles.bottomSheet}>
                {/* Drag Handle */}
                <View style={styles.handleContainer}>
                  <View style={styles.dragHandle} />
                </View>

                {/* Title */}
                <Text style={styles.modalTitle}>Request Service</Text>

                {/* Service Card Summary */}
                <ServiceItemCard
                  title={service.title}
                  price={service.price}
                  image={service.image}
                />

                {/* Proposed Price Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Proposed Price</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={proposedPrice}
                      onChangeText={setProposedPrice}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <Text style={styles.helperText}>
                    Service providers are more likely to accept requests close to their list price.
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
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <Pressable style={styles.sendButton} activeOpacity={0.8} onPress={onSendRequest}>
                    <Text style={styles.sendButtonText}>Send Request</Text>
                  </Pressable>
                  <Pressable style={styles.cancelButton} activeOpacity={0.7} onPress={onClose}>
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

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    width: '100%',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    width: '100%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: fontsize.xl,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#9CA3AF',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  helperText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    lineHeight: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
  },
  actionButtons: {
    marginTop: 8,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RequestServiceModal;
