import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@theme/index';

interface OrderCardProps {
  title: string;
  buyerName: string;
  price: string | number;
  date: string;
  image: string;
  onAccept?: () => void;
  onReject?: () => void;
}

const OrderCard = ({
  title,
  buyerName,
  price,
  date,
  image,
  onAccept,
  onReject,
}: OrderCardProps) => {
  return (
    <View style={styles.card}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <Image source={{ uri: image }} style={styles.image} />

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          <Text style={styles.buyer}>Buyer: {buyerName}</Text>

          <View style={styles.bottomRow}>
            <Text style={styles.price}>Rs {price}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.acceptButton,
            Platform.OS === 'ios' && pressed && { opacity: 0.8, scaleX: 0.98, scaleY: 0.98 },
          ]}
          onPress={onAccept}
          android_ripple={{ color: colors.light.successBackground }}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.rejectButton,
            Platform.OS === 'ios' && pressed && { opacity: 0.7 },
          ]}
          onPress={onReject}
          android_ripple={{ color: colors.light.border }}
        >
          <Text style={styles.rejectText}>Reject</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default React.memo(OrderCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.light.text,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  buyer: {
    fontSize: 14,
    color: colors.light.subText,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.primary,
  },
  date: {
    fontSize: 13,
    color: colors.light.subText,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: colors.light.primary,
  },
  rejectButton: {
    backgroundColor: colors.light.altBackground,
  },
  acceptText: {
    color: colors.light.surface,
    fontWeight: '600',
    fontSize: 15,
  },
  rejectText: {
    color: colors.light.text,
    fontWeight: '600',
    fontSize: 15,
  },
});
