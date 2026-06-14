import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@theme/index';

type CompleteProfileModalProps = {
  visible: boolean;
  onCompleteNow: () => void;
};

const CompleteProfileModal = ({ visible, onCompleteNow }: CompleteProfileModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-circle-outline" size={48} color={colors.light.success} />
          </View>

          <Text style={styles.title}>Complete your profile</Text>

          <Text style={styles.description}>
            Add your name, bio, and profile photo to unlock all features and build trust with
            others.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              Platform.OS === 'ios' && pressed && { opacity: 0.8, scaleX: 0.98, scaleY: 0.98 },
            ]}
            onPress={onCompleteNow}
            android_ripple={{ color: colors.light.successBackground }}
          >
            <Text style={styles.primaryButtonText}>Complete Now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default CompleteProfileModal;

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
    backgroundColor: colors.light.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: colors.light.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 20,
    backgroundColor: colors.light.successBackground,
    padding: 12,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.light.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.light.subText,
    marginBottom: 32,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.light.success,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.light.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
