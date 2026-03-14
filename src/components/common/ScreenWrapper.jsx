import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@theme/index';

export default function ScreenWrapper({
  children,
  style,
  contentStyle,
  backgroundColor = colors.light.background,
  withHorizontalPadding = false,
  withTopInset = true,
  scroll = false,
  keyboardShouldPersistTaps = 'handled',
  paddingBottom = 0,
}) {
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }, style]}
      edges={[withTopInset ? 'top' : null].filter(Boolean)}
    >
      <Container
        style={[
          styles.content,
          withHorizontalPadding && styles.horizontalPadding,
          contentStyle,
          paddingBottom && { paddingBottom }, // Add padding to the bottom of the content
        ]}
        {...(scroll
          ? {
              contentContainerStyle: [
                styles.scrollContent,
                withHorizontalPadding && styles.horizontalPadding,
                contentStyle,
              ],
              keyboardShouldPersistTaps,
              showsVerticalScrollIndicator: false,
            }
          : {})}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  horizontalPadding: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: Platform.select({
      ios: spacing.sm,
      android: spacing.sm,
      default: spacing.sm,
    }),
  },
});
