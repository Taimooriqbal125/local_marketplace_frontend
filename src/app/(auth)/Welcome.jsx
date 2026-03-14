import ScreenWrapper from '@components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

const Welcome = () => {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Image with Gradient Overlay */}
          <View style={styles.imageContainer}>
            <ImageBackground
              source={require('../../assets/images/welcome.png')} // Replace with your image
              style={styles.headerImage}
              imageStyle={styles.headerImageStyle}
            >
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </ImageBackground>

            {/* Trusted Artisans Badge */}
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <View style={styles.greenDot} />
                <Text style={styles.badgeText}>TRUSTED ARTISANS</Text>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.contentContainer}>
            {/* App Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBox}>
                <Ionicons name="hammer" size={32} color="#FFFFFF" />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Artisan by Kivo</Text>

            {/* Description */}
            <Text style={styles.description}>
              Connect with expert services in your neighborhood. From bespoke design to essential
              repairs, find your perfect artisan today.
            </Text>

            {/* Get Started Button */}
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>

            {/* Login Button */}
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 320,
    width: '100%',
  },
  headerImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerImageStyle: {
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.5,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#10B981',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    height: 56,
    width: '100%',
    marginBottom: 16,
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
    marginRight: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    height: 56,
    width: '100%',
    marginBottom: 40,
  },
  secondaryButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  categoryPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
});

export default Welcome;
