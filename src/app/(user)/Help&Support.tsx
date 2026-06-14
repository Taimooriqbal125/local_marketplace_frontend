import Header from '@components/common/Header';
import ScreenWrapper from '@components/common/ScreenWrapper';
import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { colors } from '@theme/index';

// simple types
type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

type ContactOption = {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  iconType: string;
  color: string;
  action: () => void;
};

const HelpSupport = () => {
  const navigation = useNavigation<any>();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: 'How do I create a listing?',
      answer:
        'Go to the "My Listings" screen, tap the "+" button, fill in your service details, add photos, and publish.',
    },
    {
      id: 2,
      question: 'How do I receive payments?',
      answer: 'Payments are processed securely. Connect your bank account in Settings > Payments.',
    },
    {
      id: 3,
      question: 'Can I cancel a booking?',
      answer: 'Yes, you can cancel bookings up to 24 hours before the scheduled time.',
    },
    {
      id: 4,
      question: 'How do I contact customer support?',
      answer: 'You can reach us through chat, email, or phone. We respond within 24 hours.',
    },
    {
      id: 5,
      question: 'Is my personal information secure?',
      answer: 'Yes! We use industry-standard encryption and security measures.',
    },
  ];

  const contactOptions: ContactOption[] = [
    {
      id: 1,
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      icon: 'chatbubble-ellipses',
      iconType: 'Ionicons',
      color: colors.light.primary,
      action: () => navigation.navigate('ChatSupport'),
    },
    {
      id: 2,
      title: 'Email Support',
      subtitle: 'support@kivomarket.com',
      icon: 'mail',
      iconType: 'Ionicons',
      color: colors.light.primary,
      action: () => Linking.openURL('mailto:support@kivomarket.com'),
    },
    {
      id: 3,
      title: 'Call Us',
      subtitle: '+1 (555) 123-4567',
      icon: 'call',
      iconType: 'Ionicons',
      color: colors.light.warning,
      action: () => Linking.openURL('tel:+15551234567'),
    },
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const getIconComponent = (iconType: string, iconName: string, size: number, color: string) => {
    switch (iconType) {
      case 'Ionicons':
        return <Ionicons name={iconName as any} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName as any} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName as any} size={size} color={color} />;
      default:
        return <Ionicons name={iconName as any} size={size} color={color} />;
    }
  };

  return (
    <ScreenWrapper withTopInset={false} paddingBottom={50}>
      <View style={{ backgroundColor: colors.light.surface }}>
        <Header
          title="Help & Support"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <View style={{ backgroundColor: colors.light.surface, flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <View style={styles.contactCards}>
              {contactOptions.map((option) => (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.contactCard,
                    Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                  ]}
                  android_ripple={{ color: colors.light.border }}
                  onPress={option.action}
                >
                  <View
                    style={[styles.contactIconContainer, { backgroundColor: option.color + '20' }]}
                  >
                    {getIconComponent(option.iconType, option.icon, 24, option.color)}
                  </View>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* FAQ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqContainer}>
              {faqs.map((faq) => (
                <View key={faq.id} style={styles.faqItem}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.faqQuestion,
                      Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                    ]}
                    android_ripple={{ color: colors.light.border }}
                    onPress={() => toggleFAQ(faq.id)}
                  >
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    <Ionicons
                      name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.light.primary}
                    />
                  </Pressable>

                  {expandedFAQ === faq.id && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <View style={styles.footerDivider} />
            <Pressable
              style={({ pressed }) => [
                styles.footerContent,
                Platform.OS === 'ios' && pressed && { opacity: 0.7 },
              ]}
              onPress={() => Linking.openURL('https://kivosolutions.com')}
            >
              <Text style={styles.footerText}>A project by </Text>
              <Text style={styles.kivoText}>Kivo Solutions</Text>
              <Ionicons name="open-outline" size={12} color={colors.light.primary} />
            </Pressable>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.light.text,
  },
  contactCards: {
    flexDirection: 'row',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.light.text,
  },
  contactSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.light.subText,
  },

  faqContainer: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    marginRight: 12,
    color: colors.light.text,
    fontWeight: '500',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: colors.light.subText,
    lineHeight: 20,
  },

  footerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerDivider: {
    height: 1,
    width: '60%',
    marginBottom: 16,
    backgroundColor: colors.light.border,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.light.subText,
  },
  kivoText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.text,
  },
  versionText: {
    fontSize: 11,
    color: colors.light.subText,
  },
});

export default HelpSupport;
