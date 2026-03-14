import ScreenWrapper from '@components/common/ScreenWrapper';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const Message = ({ navigation, route }) => {
  // You can pass custom props via route.params
  const {
    title = 'Coming Soon',
    message = 'Our team is working hard to bring you this feature.',
    icon = 'construction',
    showBackButton = true,
    showContactSupport = true,
  } = route?.params || {};

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Icon Section */}
        <View style={styles.iconSection}>
          <View style={styles.iconCircle}>{getIconComponent(icon)}</View>

          {/* Animated Dots */}
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Additional Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="time" size={24} color="#10B981" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoCardTitle}>Estimated Time</Text>
              <Text style={styles.infoCardText}>2-3 weeks</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons name="progress-check" size={24} color="#10B981" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoCardTitle}>Progress</Text>
              <Text style={styles.infoCardText}>75% Complete</Text>
            </View>
          </View>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Whats Coming:</Text>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.featureText}>Real-time messaging</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.featureText}>File sharing & attachments</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.featureText}>Read receipts & typing indicators</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.featureText}>Voice & video calls</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          {showBackButton && (
            <Pressable style={styles.primaryButton} onPress={() => {}}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Go Back</Text>
            </Pressable>
          )}

          {showContactSupport && (
            <Pressable style={styles.secondaryButton} onPress={() => {}}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#10B981" />
              <Text style={styles.secondaryButtonText}>Contact Support</Text>
            </Pressable>
          )}
        </View>

        {/* Kivo Solutions Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.footerDivider} />
          <Pressable
            style={styles.footerContent}
            onPress={() => {
              // Open Kivo Solutions website
            }}
          >
            <Text style={styles.footerText}>A project by </Text>
            <Text style={styles.kivoText}>Kivo Solutions</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

// Helper function to render different icons
const getIconComponent = (iconName) => {
  const iconProps = { size: 64, color: '#FFFFFF' };

  switch (iconName) {
    case 'console-line':
      return <MaterialCommunityIcons name="console-line" {...iconProps} />;
    case 'mail':
      return <Ionicons name="mail" {...iconProps} />;
    case 'chat':
      return <Ionicons name="chatbubbles" {...iconProps} />;
    case 'code':
      return <Ionicons name="code-slash" {...iconProps} />;
    case 'rocket':
      return <Ionicons name="rocket" {...iconProps} />;
    case 'tools':
      return <FontAwesome5 name="tools" {...iconProps} />;
    default:
      return <MaterialCommunityIcons name="console-line" {...iconProps} />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  infoCardsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    width: '100%',
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  infoIconContainer: {
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 52,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    height: 52,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '60%',
    marginBottom: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  kivoText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
});

export default Message;
