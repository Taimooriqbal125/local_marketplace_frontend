import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';

interface EnableNotificationUIProps {
  title?: string;
  description?: string;
  onEnable: () => void;
  onSkip?: () => void;
  mandatory?: boolean;
}

/**
 * A reusable UI component to encourage users to enable push notifications.
 * Following the design pattern of EnableLocationUI.
 */
export default function EnableNotificationUI({
  title = 'Stay Updated',
  description = 'Enable notifications to receive real-time updates about your orders, messages, and marketplace activity.',
  onEnable,
  onSkip,
  mandatory = false,
}: EnableNotificationUIProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="notifications-outline" size={40} color={colors.light.success} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          Platform.OS === 'ios' && pressed && { opacity: 0.9 },
        ]}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        onPress={onEnable}
      >
        <Text style={styles.buttonText}>
          {mandatory ? 'Enable Notifications to Continue' : 'Enable Notifications'}
        </Text>
      </Pressable>

      {!mandatory && onSkip && (
        <Pressable
          style={({ pressed }) => [
            styles.skipButton,
            Platform.OS === 'ios' && pressed && { opacity: 0.7 },
          ]}
          android_ripple={{ color: colors.light.altBorder, borderless: true, radius: 40 }}
          onPress={onSkip}
        >
          <Text style={styles.skipButtonText}>Maybe Later</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.light.altBackground,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.light.successBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.light.subText,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.light.success,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.light.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 10,
    borderRadius: 8,
  },
  skipButtonText: {
    color: colors.light.mutedText,
    fontSize: 14,
    fontWeight: '500',
  },
});
