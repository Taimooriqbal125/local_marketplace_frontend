import React from 'react';
import { Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@theme/index';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  withHorizontalPadding?: boolean;
  withTopInset?: boolean;
  scroll?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  paddingBottom?: number;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  contentStyle,
  backgroundColor = colors.light.background,
  withHorizontalPadding = false,
  withTopInset = true,
  scroll = false,
  keyboardShouldPersistTaps = 'handled',
  paddingBottom = 0,
}) => {
  const edges: Edge[] = withTopInset ? ['top'] : [];

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]} edges={edges}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.scrollContent,
            withHorizontalPadding && styles.horizontalPadding,
            contentStyle,
            paddingBottom ? { paddingBottom } : null,
          ]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]} edges={edges}>
      <View
        style={[
          styles.content,
          withHorizontalPadding && styles.horizontalPadding,
          contentStyle,
          paddingBottom ? { paddingBottom } : null,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(ScreenWrapper);

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
