import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';

interface LocationPermissionUIProps {
  title?: string;
  description: string;
  onEnable: () => void;
  mandatory?: boolean;
}

export default function LocationPermissionUI({
  title = 'Enable Location',
  description,
  onEnable,
  mandatory = false,
}: LocationPermissionUIProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="location-outline" size={40} color={colors.light.success} />
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
          {mandatory ? 'Enable Location to Continue' : 'Enable Location'}
        </Text>
      </Pressable>

      {!mandatory && (
        <Pressable
          style={({ pressed }) => [
            styles.skipButton,
            Platform.OS === 'ios' && pressed && { opacity: 0.7 },
          ]}
          android_ripple={{ color: colors.light.altBorder, borderless: true, radius: 40 }}
          onPress={() => {}}
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
