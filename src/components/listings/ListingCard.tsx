import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface ListingCardProps {
  title: string;
  category: string;
  location: string;
  price: number | string;
  priceUnit?: string;
  time: string;
  tagText?: string;
  image: string;
  onEdit?: () => void;
  onPause?: () => void;
  onView?: () => void;
  isshowbuttons?: boolean;
  pauseLabel?: string;
  pauseIcon?: any; // Ionicons glyph name
}

const ListingCard = ({
  title,
  category,
  location,
  price,
  priceUnit = '',
  time,
  tagText,
  image,
  onEdit,
  onPause,
  onView,
  isshowbuttons = true,
  pauseLabel = 'Pause',
  pauseIcon = 'pause-circle',
}: ListingCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <Image source={{ uri: image }} style={styles.image} />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            <View style={{}}>
              <Text style={styles.timeText}>{time}</Text>
            </View>
          </View>

          <Text style={styles.metaText} numberOfLines={1}>
            {category}
          </Text>
          <Text style={styles.metaText} numberOfLines={1}>
            {location}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>
              ${price}
              {priceUnit}
            </Text>

            {!!tagText && (
              <View style={styles.tagBox}>
                <Text style={styles.tagText}>{tagText}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      {isshowbuttons && (
        <View style={styles.actionRow}>
          {onEdit && (
            <Pressable
              testID="edit-button"
              style={({ pressed }) => [
                styles.actionButton,
                Platform.OS === 'ios' && pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: colors.light.border }}
              onPress={onEdit}
            >
              <Ionicons name="pencil" size={18} color={colors.light.subText} />
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
          )}

          {onPause && (
            <Pressable
              testID="pause-button"
              style={({ pressed }) => [
                styles.actionButton,
                onEdit && styles.borderLeft,
                Platform.OS === 'ios' && pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: colors.light.border }}
              onPress={onPause}
            >
              <Ionicons name={pauseIcon} size={18} color={colors.light.subText} />
              <Text style={styles.actionText}>{pauseLabel}</Text>
            </Pressable>
          )}

          {onView && (
            <Pressable
              testID="view-button"
              style={({ pressed }) => [
                styles.actionButton,
                (onEdit || onPause) && styles.borderLeft,
                Platform.OS === 'ios' && pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: colors.light.border }}
              onPress={onView}
            >
              <Ionicons name="eye" size={18} color={colors.light.subText} />
              <Text style={styles.actionText}>View</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

export default React.memo(ListingCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    overflow: 'hidden',
    marginBottom: 14,
  },

  topSection: {
    flexDirection: 'row',
    padding: 14,
  },

  image: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 14,
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },

  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    marginRight: 8,
  },

  timeBadge: {
    backgroundColor: colors.light.successBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.primary,
  },

  metaText: {
    fontSize: 14,
    color: colors.light.subText,
    marginTop: 6,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    marginRight: 10,
  },

  tagBox: {
    backgroundColor: colors.light.altBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.subText,
  },

  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },

  actionButton: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  borderLeft: {
    borderLeftWidth: 1,
    borderColor: colors.light.border,
  },

  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.subText,
  },
});
