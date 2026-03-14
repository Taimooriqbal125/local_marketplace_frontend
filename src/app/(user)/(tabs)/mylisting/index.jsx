import Header from '@components/common/Header';
import ListingCard from '@components/listings/ListingCard';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';
import { useNavigation } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import ActiveTab from './ActiveTab';
import PausedTab from './PausedTab';
const allListings = [
  {
    id: '1',
    title: 'Listing #1001',
    location: 'Location',
    status: 'active',
    category: 'Category',
    price: '50',
    priceUnit: '/hr',
    badgeText: 'Active',
    tagText: 'Negotiable',
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '2',
    title: 'Listing #1002',
    location: 'Location',
    status: 'paused',
    category: 'Category',
    price: '40',
    priceUnit: '/hr',
    badgeText: 'Paused',
    tagText: 'Fixed',
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '3',
    title: 'Listing #1003',
    location: 'Location',
    status: 'active',
    category: 'Category',
    price: '60',
    priceUnit: '/hr',
    badgeText: 'Active',
    tagText: 'Negotiable',
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '4',
    title: 'Listing #1004',
    location: 'Location',
    status: 'paused',
    category: 'Category',
    price: '45',
    priceUnit: '/hr',
    badgeText: 'Paused',
    tagText: 'Fixed',
    image: 'https://via.placeholder.com/100',
  },
];

function EmptyListings() {
  return (
    <View style={tabStyles.emptyContainer}>
      {/* Illustration */}
      <View style={tabStyles.illustrationWrapper}>
        {/* Background circle */}
        <View style={tabStyles.bgCircle} />

        {/* Stacked card effect */}
        <View style={tabStyles.cardBack} />
        <View style={tabStyles.cardFront}>
          <Ionicons name="filing" size={36} color="#B0BAD0" />
          {/* Simulated content lines */}
          <View style={tabStyles.cardLine} />
          <View style={[tabStyles.cardLine, tabStyles.cardLineShort]} />
        </View>

        {/* Floating add badge */}
        <View style={tabStyles.addBadge}>
          <Ionicons name="document-text" size={18} color="#fff" />
          <View style={tabStyles.addBadgePlus}>
            <Ionicons name="add" size={10} color="#fff" />
          </View>
        </View>
      </View>

      {/* Text */}
      <Text style={tabStyles.emptyTitle}>No listings found</Text>
      <Text style={tabStyles.emptySubtitle}>
        You haven&apos;t posted any services yet.{`\n`}Start selling by creating your first listing.
      </Text>
    </View>
  );
}

function AllListingsTab() {
  return (
    <View style={tabStyles.container}>
      <FlatList
        data={allListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard
            title={item.title}
            category={item.category}
            location={item.location}
            price={item.price}
            priceUnit={item.priceUnit}
            badgeText={item.badgeText}
            tagText={item.tagText}
            image={item.image}
            isshowbuttons={false}
            onEdit={() => { }}
            onPause={() => { }}
            onView={() => { }}
          />
        )}
        contentContainerStyle={tabStyles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyListings />}
      />
    </View>
  );
}

const TABS = [
  { key: 'all', label: 'All', component: AllListingsTab },
  { key: 'active', label: 'Active', component: ActiveTab },
  { key: 'paused', label: 'Paused', component: PausedTab },
];

export default function AllListingsScreen() {
  const { width } = useWindowDimensions();
  const pagerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const animatedPosition = useRef(new Animated.Value(0)).current;

  const handleTabPress = (index) => {
    pagerRef.current?.setPage(index);
    setActiveIndex(index);
    animatedPosition.setValue(index);
  };

  const handlePageSelected = (e) => {
    const position = e.nativeEvent.position;
    setActiveIndex(position);
    animatedPosition.setValue(position);
  };

  const handlePageScroll = (e) => {
    const { position, offset } = e.nativeEvent;
    animatedPosition.setValue(position + offset);
  };

  const indicatorWidth = width / TABS.length;

  const indicatorLeft = animatedPosition.interpolate({
    inputRange: TABS.map((_, index) => index),
    outputRange: TABS.map((_, index) => index * indicatorWidth),
    extrapolate: 'clamp',
  });

  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      {/* ---- Header Section ---- */}
      <View style={styles.header}>
        <Header
          title="My Listings"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          isRightIconVisible={true}
          rightIcon="add"
          onRightIconPress={() => navigation.navigate('/(user)/(tabs)/mylisting/create')}
        />
      </View>

      <View
        style={[
          styles.tabBar,
          {
            borderBottomColor: colors.light.border,
          },
        ]}
      >
        {TABS.map((tab, index) => {
          const isActive = index === activeIndex;

          return (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.light.primary : colors.light.subText,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}

        <Animated.View
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              backgroundColor: colors.light.primary,
              transform: [{ translateX: indicatorLeft }],
            },
          ]}
        />
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={handlePageSelected}
        onPageScroll={handlePageScroll}
      >
        {TABS.map((tab) => {
          const Component = tab.component;

          return (
            <View key={tab.key} style={styles.page}>
              <Component />
            </View>
          );
        })}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light.text,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  tabLabel: {
    fontSize: 14,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderRadius: 999,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});

const tabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },

  // ---- Empty state ----
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  illustrationWrapper: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  bgCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#EEF1F8',
  },
  cardBack: {
    position: 'absolute',
    width: 98,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#D8DFF0',
    top: 24,
    left: 52,
    transform: [{ rotate: '6deg' }],
  },
  cardFront: {
    width: 98,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#EAEDFA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
    paddingTop: 4,
  },
  cardLine: {
    width: 60,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#C5CCE0',
  },
  cardLineShort: {
    width: 40,
  },
  addBadge: {
    position: 'absolute',
    bottom: 18,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  addBadgePlus: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
