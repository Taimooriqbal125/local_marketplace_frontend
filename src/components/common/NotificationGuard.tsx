import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@theme/index';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import EnableNotificationUI from '@/components/common/EnableNotificationUI';
import { storage } from '@/storage/storage';
import { CACHE_KEYS } from '@/storage/keys';

const PROMPT_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 Days in milliseconds

export const NotificationGuard = ({ children }: { children: React.ReactNode }) => {
  const { isPermissionGranted, permissionStatus, reInitialize } = usePushNotifications();
  const [shouldShowPrompt, setShouldShowPrompt] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkPromptStatus = async (): Promise<void> => {
      // 1. If permission is already granted, never show the prompt
      if (isPermissionGranted || permissionStatus === 'granted') {
        setShouldShowPrompt(false);
        setIsLoading(false);
        return;
      }

      // 2. If status is still undetermined by the native module, wait
      if (permissionStatus === null) {
        return;
      }

      // 3. Time-based logic: Check when the user last skipped the prompt
      const lastSkippedData = await storage.get<number>(CACHE_KEYS.HAS_SEEN_NOTIFICATION_PROMPT);

      if (!lastSkippedData?.value) {
        // Never seen the prompt before
        setShouldShowPrompt(true);
      } else {
        // Skipped before. Check if the 3-day cooldown has elapsed
        const timeSinceSkip = Date.now() - lastSkippedData.value;
        if (timeSinceSkip > PROMPT_COOLDOWN_MS) {
          setShouldShowPrompt(true);
        } else {
          setShouldShowPrompt(false);
        }
      }

      setIsLoading(false);
    };

    checkPromptStatus();
  }, [permissionStatus, isPermissionGranted]);

  const handleSkip = async (): Promise<void> => {
    // Record current timestamp as the last skip time
    await storage.set<number>(CACHE_KEYS.HAS_SEEN_NOTIFICATION_PROMPT, Date.now());
    setShouldShowPrompt(false);
  };

  const handleEnable = async (): Promise<void> => {
    await reInitialize();
    setShouldShowPrompt(false);
  };

  // 1. Loading State
  if (isLoading || permissionStatus === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.light.surface,
        }}
      >
        <ActivityIndicator size="large" color={colors.light.success} />
      </View>
    );
  }

  // 2. Progressive Onboarding Prompt
  if (shouldShowPrompt) {
    return <EnableNotificationUI onEnable={handleEnable} onSkip={handleSkip} />;
  }

  // 3. Main App Content
  return <>{children}</>;
};
