import Header from '@components/common/Header';
import ScreenWrapper from '@components/common/ScreenWrapper';
import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const HelpSupport = () => {
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // FAQ Data
  const faqs = [
    {
      id: 1,
      question: 'How do I create a listing?',
      answer:
        'Go to the "My Listings" screen, tap the "+" button, fill in your service details, add photos, and publish. Your listing will be visible to customers immediately.',
    },
    {
      id: 2,
      question: 'How do I receive payments?',
      answer:
        'Payments are processed securely through our platform. You can connect your bank account in Settings > Payments. Funds are transferred within 2-3 business days.',
    },
    {
      id: 3,
      question: 'Can I cancel a booking?',
      answer:
        'Yes, you can cancel bookings up to 24 hours before the scheduled time. Cancellations within 24 hours may incur a fee. Go to Bookings > Select booking > Cancel.',
    },
    {
      id: 4,
      question: 'How do I contact customer support?',
      answer:
        'You can reach us through this screen via chat, email, or phone. We typically respond within 24 hours on business days.',
    },
    {
      id: 5,
      question: 'Is my personal information secure?',
      answer:
        'Yes! We use industry-standard encryption and security measures. Your data is never shared with third parties without your consent.',
    },
  ];

  // Contact Options
  const contactOptions = [
    {
      id: 1,
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      icon: 'chatbubble-ellipses',
      iconType: 'Ionicons',
      color: '#10B981',
      action: () => navigation.navigate('ChatSupport'),
    },
    {
      id: 2,
      title: 'Email Support',
      subtitle: 'support@kivomarket.com',
      icon: 'mail',
      iconType: 'Ionicons',
      color: '#3B82F6',
      action: () => Linking.openURL('mailto:support@kivomarket.com'),
    },
    {
      id: 3,
      title: 'Call Us',
      subtitle: '+1 (555) 123-4567',
      icon: 'call',
      iconType: 'Ionicons',
      color: '#F59E0B',
      action: () => Linking.openURL('tel:+15551234567'),
    },
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const getIconComponent = (iconType, iconName, size, color) => {
    switch (iconType) {
      case 'Ionicons':
        return <Ionicons name={iconName} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName} size={size} color={color} />;
      default:
        return <Ionicons name={iconName} size={size} color={color} />;
    }
  };

  return (
    <ScreenWrapper withTopInset={false} paddingBottom={50}>
      {/* Header */}
      <View style={{ backgroundColor: '#FFFFFF' }}>
        <Header
          title="Help & Support"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
      </View>
      <View style={{ backgroundColor: '#FFFFFF', flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Contact Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <View style={styles.contactCards}>
              {contactOptions.map((option) => (
                <Pressable
                  key={option.id}
                  style={styles.contactCard}
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

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqContainer}>
              {faqs.map((faq) => (
                <View key={faq.id} style={styles.faqItem}>
                  <Pressable style={styles.faqQuestion} onPress={() => toggleFAQ(faq.id)}>
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    <Ionicons
                      name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#10B981"
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

          {/* Additional Resources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Resources</Text>
            <Pressable style={styles.resourceItem}>
              <View style={styles.resourceIconContainer}>
                <Ionicons name="document-text" size={20} color="#10B981" />
              </View>
              <Text style={styles.resourceText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable style={styles.resourceItem}>
              <View style={styles.resourceIconContainer}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              </View>
              <Text style={styles.resourceText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable style={styles.resourceItem}>
              <View style={styles.resourceIconContainer}>
                <Ionicons name="book" size={20} color="#10B981" />
              </View>
              <Text style={styles.resourceText}>User Guide</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable style={styles.resourceItem}>
              <View style={styles.resourceIconContainer}>
                <Ionicons name="notifications" size={20} color="#10B981" />
              </View>
              <Text style={styles.resourceText}>Whats New</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Kivo Solutions Footer */}
          <View style={styles.footerContainer}>
            <View style={styles.footerDivider} />
            <Pressable
              style={styles.footerContent}
              onPress={() => Linking.openURL('https://kivosolutions.com')}
            >
              <Text style={styles.footerText}>A project by </Text>
              <Text style={styles.kivoText}>Kivo Solutions</Text>
              <Ionicons name="open-outline" size={12} color="#10B981" />
            </Pressable>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 40,
  },
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
    color: '#111827',
    marginBottom: 16,
  },
  contactCards: {
    flexDirection: 'row',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topicIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resourceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '60%',
    marginBottom: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
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
  versionText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default HelpSupport;
