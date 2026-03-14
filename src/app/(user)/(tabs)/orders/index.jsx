import Header from '@components/common/Header';
import OrderCard from '@components/orders/orderCard';
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
// Import tab screens as plain components
import ScreenWrapper from '@components/common/ScreenWrapper';
import AcceptedTab from './AcceptedTab';
import CompletedTab from './CompletedTab';
import RequestedTab from './RequestedTab';

// ---- Mock data for "All" tab ----
const allOrders = [
  {
    id: '3',
    title: 'Order #1003',
    buyerName: 'Mike T.',
    price: '80.00',
    date: 'Oct 14, 2023',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904',
  },
];

// ---- "All" tab — inline, no ScreenWrapper ----
function AllOrdersTab() {
  return (
    <ScreenWrapper withTopInset={false}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <FlatList
          data={allOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              title={item.title}
              buyerName={item.buyerName}
              price={item.price}
              date={item.date}
              status={item.status}
              isshowbuttons={false}
              image={item.image}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenWrapper>
  );
}

// ---- Tab configuration ----
const TABS = [
  { key: 'all', label: 'All', component: AllOrdersTab },
  { key: 'requested', label: 'Requested', component: RequestedTab },
  { key: 'accepted', label: 'Accepted', component: AcceptedTab },
  { key: 'completed', label: 'Completed', component: CompletedTab },
];

// ---- Main screen ----
export default function AllOrdersScreen() {
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
    const pos = e.nativeEvent.position;
    setActiveIndex(pos);
    animatedPosition.setValue(pos);
  };

  const handlePageScroll = (e) => {
    const { position, offset } = e.nativeEvent;
    animatedPosition.setValue(position + offset);
  };

  const indicatorWidth = width / TABS.length;

  const indicatorLeft = animatedPosition.interpolate({
    inputRange: TABS.map((_, i) => i),
    outputRange: TABS.map((_, i) => i * indicatorWidth),
    extrapolate: 'clamp',
  });
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Header title="Orders" showBackButton={true} onBackPress={() => navigation.goBack()} />
      </View>
      {/* Custom Top Tab Bar */}
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

        {/* Animated underline indicator */}
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

      {/* PagerView carousel */}
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
  listContent: {
    padding: 16,
  },
});
