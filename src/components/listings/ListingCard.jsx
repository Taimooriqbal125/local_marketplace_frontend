import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ListingCard({
  title,
  category,
  location,
  price,
  priceUnit = '',
  badgeText,
  tagText,
  image,
  onEdit,
  onPause,
  onView,
  isshowbuttons = true,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <Image source={{ uri: image }} style={styles.image} />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{badgeText}</Text>
            </View>
          </View>

          <Text style={styles.metaText} numberOfLines={1}>
            {category} • {location}
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
          <Pressable style={styles.actionButton} activeOpacity={0.7} onPress={onEdit}>
            <Ionicons name="pencil" size={18} color={colors.light.subText} />
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.middleActionButton]}
            activeOpacity={0.7}
            onPress={onPause}
          >
            <Ionicons name="pause-circle" size={18} color={colors.light.subText} />
            <Text style={styles.actionText}>Pause</Text>
          </Pressable>

          <Pressable style={styles.actionButton} activeOpacity={0.7} onPress={onView}>
            <Ionicons name="eye" size={18} color={colors.light.subText} />
            <Text style={styles.actionText}>View</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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

  statusBadge: {
    backgroundColor: '#DDF6E8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E9E5A',
    textTransform: 'uppercase',
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
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.subText,
  },

  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  actionButton: {
    flex: 1,
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  middleActionButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },

  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.subText,
  },
});
