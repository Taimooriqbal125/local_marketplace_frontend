import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@theme/index';

interface CustomAlertProps {
  visible: boolean;
  title?: string | null;
  message?: string | null;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string | null;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

const CustomAlert = ({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  showCancel = false,
}: CustomAlertProps) => {
  const getIcon = (): { name: any; color: string } => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: colors.light.success };
      case 'error':
        return { name: 'close-circle', color: colors.light.danger };
      case 'warning':
        return { name: 'warning', color: colors.light.warning };
      default:
        return { name: 'information-circle', color: colors.light.success };
    }
  };

  const icon = getIcon();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={styles.container}>
          {/* Icon */}
          <Ionicons name={icon.name} size={48} color={icon.color} style={styles.icon} />

          {/* Title */}
          {title && <Text style={styles.title}>{title}</Text>}

          {/* Message */}
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {showCancel && (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                ]}
                onPress={onCancel}
                android_ripple={{ color: colors.light.border }}
              >
                <Text style={styles.cancelTextText}>{cancelText || 'Cancel'}</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                Platform.OS === 'ios' && pressed && { opacity: 0.8, scaleX: 0.98, scaleY: 0.98 },
              ]}
              onPress={onConfirm}
              android_ripple={{ color: colors.light.successBackground }}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
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

  container: {
    width: '90%',
    maxWidth: 400,
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

  icon: {
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.light.text,
    textAlign: 'center',
  },

  message: {
    fontSize: 15,
    color: colors.light.subText,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
    lineHeight: 22,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  button: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmButton: {
    backgroundColor: colors.light.success,
    shadowColor: colors.light.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  cancelButton: {
    backgroundColor: colors.light.altBackground,
  },

  confirmText: {
    color: colors.light.surface,
    fontWeight: '600',
    fontSize: 16,
  },

  cancelTextText: {
    color: colors.light.subText,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CustomAlert;
