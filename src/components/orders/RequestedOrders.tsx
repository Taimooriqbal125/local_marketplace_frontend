import { View, Text, Image, StyleSheet, Pressable, ViewStyle, Platform } from 'react-native';
import { colors } from '@theme/index';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface RequestedOrdersProps {
  image?: string | null;
  title: string;
  sellerName?: string | null;
  price?: string | number;
  buttontitle?: string | undefined;
  date?: string | null;
  sellerLabel: string;
  showindicator?: boolean;
  onCancel?: () => void;
  indicatorText?: string;
  iconname?: any; // Ionicons glyph name
  showbutton?: boolean;
  iconcolor?: string;
  isLoading?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

const RequestedOrders = ({
  // Image
  image,

  // Content
  title,
  sellerName,
  price,
  buttontitle = '',
  date,
  sellerLabel,
  showindicator = true,

  // Actions
  onCancel,
  indicatorText,
  iconname,
  showbutton = true,
  iconcolor,

  // Configuration
  isLoading = false,
  disabled = false,

  // Styling
  containerStyle,
}: RequestedOrdersProps) => {
  const formatPrice = (priceValue: string | number | undefined) => {
    if (!priceValue && priceValue !== 0) return '';
    const numericPrice = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;
    return `$${numericPrice.toFixed(2)}`;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Top Section */}
      <View style={styles.topSection}>
        {/* Image */}
        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          </View>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Title Row - Full length */}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {/* Seller Name */}
          {sellerName && (
            <Text style={styles.sellerText} numberOfLines={1}>
              {sellerLabel}: {sellerName}
            </Text>
          )}

          {/* Price and Date Row */}
          <View style={styles.priceDateRow}>
            {price !== undefined && <Text style={styles.priceText}>{formatPrice(price)}</Text>}
            {date && <Text style={styles.dateText}>{date}</Text>}
          </View>
        </View>
      </View>
      {showindicator && (
        <View style={styles.waitingContainer}>
          <Ionicons name={iconname} size={16} color={iconcolor} style={styles.clockIcon} />
          <Text style={[styles.waitingText, { color: iconcolor }]}>{indicatorText}</Text>
        </View>
      )}
      {showbutton && (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.cancelButton,
            Platform.OS === 'ios' && pressed && { opacity: 0.7 },
            containerStyle,
          ]}
          onPress={onCancel}
          android_ripple={{ color: colors.light.border }}
          disabled={disabled}
        >
          <Text style={styles.cancelButtonText}>{buttontitle}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    shadowColor: colors.light.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.light.altBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  sellerText: {
    fontSize: 14,
    color: colors.light.subText,
    marginBottom: 6,
  },
  priceDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.success,
  },
  dateText: {
    fontSize: 13,
    color: colors.light.mutedText,
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  clockIcon: {
    marginRight: 6,
  },
  waitingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.warning,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  cancelButton: {
    backgroundColor: colors.light.altBackground,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.light.text,
  },
});

export default React.memo(RequestedOrders);
