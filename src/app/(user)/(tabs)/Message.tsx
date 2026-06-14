import React from 'react';
import ScreenWrapper from '@components/common/ScreenWrapper';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@theme/index';

type MessageParams = {
  title?: string;
  message?: string;
  icon?: string;
  showBackButton?: boolean;
  showContactSupport?: boolean;
};

type MessageProps = {
  navigation: any;
  route: {
    params?: MessageParams;
  };
};

const Message = ({ navigation, route }: MessageProps) => {
  const insets = useSafeAreaInsets();
  const {
    title = 'Coming Soon',
    message = 'Our team is working hard to bring you this feature.',
    icon = 'construction',
    showBackButton = true,
    showContactSupport = true,
  } = route?.params || {};

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'ios' ? 100 + insets.bottom : 90 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconSection}>
          <View style={styles.iconCircle}>{getIconComponent(icon)}</View>

          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="time" size={24} color={colors.light.success} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoCardTitle}>Estimated Time</Text>
              <Text style={styles.infoCardText}>2-3 weeks</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons
                name="progress-check"
                size={24}
                color={colors.light.success}
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoCardTitle}>Progress</Text>
              <Text style={styles.infoCardText}>75% Complete</Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Whats Coming:</Text>

          {[
            'Real-time messaging',
            'File sharing & attachments',
            'Read receipts & typing indicators',
            'Voice & video calls',
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="checkmark-circle" size={20} color={colors.light.success} />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          {showBackButton && (
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                Platform.OS === 'ios' && pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color={colors.light.surface} />
              <Text style={styles.primaryButtonText}>Go Back</Text>
            </Pressable>
          )}

          {showContactSupport && (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                Platform.OS === 'ios' && pressed && { opacity: 0.5 },
              ]}
              android_ripple={{ color: `${colors.light.success}33` }}
              onPress={() => {}}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.light.success} />
              <Text style={styles.secondaryButtonText}>Contact Support</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.footerDivider} />
          <Pressable
            style={({ pressed }) => [
              styles.footerContent,
              Platform.OS === 'ios' && pressed && { opacity: 0.5 },
            ]}
          >
            <Text style={styles.footerText}>A project by </Text>
            <Text style={styles.kivoText}>Kivo Solutions</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

// ✅ simple typing
const getIconComponent = (iconName: string) => {
  const iconProps = { size: 64, color: colors.light.surface };

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
    backgroundColor: colors.light.surface,
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
    backgroundColor: colors.light.success,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: colors.light.success,
  },
  dot1: { opacity: 0.3 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 1 },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: colors.light.subText,
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
    backgroundColor: colors.light.successBackground,
    padding: 16,
    borderRadius: 12,
  },

  infoIconContainer: { marginRight: 12 },
  infoTextContainer: { flex: 1 },

  infoCardTitle: {
    fontSize: 12,
    color: colors.light.subText,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    fontWeight: '600',
  },

  featuresContainer: {
    width: '100%',
    backgroundColor: colors.light.altBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },

  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  featureIcon: { marginRight: 12 },
  featureText: { fontSize: 14, flex: 1 },

  buttonsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.success,
    borderRadius: 12,
    height: 52,
    gap: 8,
  },

  primaryButtonText: {
    color: colors.light.surface,
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.light.success,
    borderRadius: 12,
    height: 52,
    gap: 8,
  },

  secondaryButtonText: {
    color: colors.light.success,
    fontSize: 16,
    fontWeight: '600',
  },

  footerContainer: {
    width: '100%',
    alignItems: 'center',
  },

  footerDivider: {
    height: 1,
    backgroundColor: colors.light.altBorder,
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
    color: colors.light.mutedText,
  },

  kivoText: {
    fontSize: 12,
    color: colors.light.success,
    fontWeight: '600',
  },
});

export default Message;
