import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@theme/index';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  toppadding?: number;
}

export default function EmptyState({ title, subtitle, toppadding }: EmptyStateProps) {
  return (
    <View style={[styles.emptyContainer, { paddingTop: toppadding }]}>
      {/* Illustration */}
      <View style={styles.illustrationWrapper}>
        {/* Background circle */}
        <View style={styles.bgCircle} />

        {/* Stacked card effect */}
        <View style={styles.cardBack} />
        <View style={styles.cardFront}>
          <Ionicons name="layers-outline" size={36} color={colors.light.primary} />
          {/* Simulated content lines */}
          <View style={styles.cardLine} />
          <View style={[styles.cardLine, styles.cardLineShort]} />
        </View>

        {/* Floating add badge */}
        <View style={styles.addBadge}>
          <Ionicons name="document-text" size={18} color={colors.light.surface} />
          <View style={styles.addBadgePlus}>
            <Ionicons name="add" size={10} color={colors.light.surface} />
          </View>
        </View>
      </View>

      {/* Text */}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },

  // ---- Empty state ----
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  illustrationWrapper: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  bgCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.light.altBackground,
  },
  cardBack: {
    position: 'absolute',
    width: 98,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.light.altBorder,
    top: 24,
    left: 52,
    transform: [{ rotate: '6deg' }],
  },
  cardFront: {
    width: 98,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
    paddingTop: 4,
  },
  cardLine: {
    width: 60,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.light.border,
  },
  cardLineShort: {
    width: 40,
  },
  addBadge: {
    position: 'absolute',
    bottom: 18,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.light.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.light.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  addBadgePlus: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.light.subText,
    textAlign: 'center',
    lineHeight: 22,
  },
});
