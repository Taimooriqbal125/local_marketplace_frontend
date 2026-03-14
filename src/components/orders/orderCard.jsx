import { colors } from '@theme/index';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function OrderCard({
  title,
  buyerName,
  price,
  date,
  status,
  image,
  onAccept,
  onReject,
  onAddReviews,
  isshowbuttons = true,
}) {
  return (
    <View style={styles.card}>
      {/* Top Section */}
      <View style={styles.topSectionContainer}>
        <View style={styles.topSection}>
          <Image source={{ uri: image }} style={styles.image} />

          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{title}</Text>

              <View style={styles.statusTag}>
                <Text style={styles.statusText}>{status}</Text>
              </View>
            </View>

            <Text style={styles.buyer}>Buyer: {buyerName}</Text>

            <View style={styles.bottomRow}>
              <Text style={styles.price}>${price}</Text>
              <Text style={styles.date}>{date}</Text>
            </View>
          </View>
        </View>
        {isshowbuttons && (
          <>
            {status === 'completed' && (
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.button, styles.acceptButton]}
                  activeOpacity={0.85}
                  onPress={onAddReviews}
                >
                  <Text style={styles.acceptText}>Add Reviews</Text>
                </Pressable>
              </View>
            )}
            {status === 'requested' && (
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.button, styles.acceptButton]}
                  activeOpacity={0.85}
                  onPress={onAccept}
                >
                  <Text style={styles.acceptText}>Accept</Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.rejectButton]}
                  activeOpacity={0.85}
                  onPress={onReject}
                >
                  <Text style={styles.rejectText}>Reject</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light.surface,
    borderRadius: 14,
    padding: 11,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  topSectionContainer: {},

  topSection: {
    flexDirection: 'row',
  },

  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 14,
  },

  infoContainer: {
    flex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    width: '70%',
  },

  statusTag: {
    backgroundColor: '#FDECC8',
    position: 'absolute',
    right: 0,
    padding: 4,
    top: 0,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#C76A00',
    textTransform: 'uppercase',
  },

  buyer: {
    marginTop: 4,
    fontSize: 14,
    color: colors.light.subText,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
    marginTop: 16,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  acceptButton: {
    backgroundColor: colors.light.primary,
    marginRight: 10,
  },

  rejectButton: {
    backgroundColor: '#E5E7EB',
  },

  acceptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  rejectText: {
    color: colors.light.text,
    fontWeight: '600',
    fontSize: 15,
  },
});
