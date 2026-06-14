import React, { useRef, useState } from 'react';

import Header from '@components/common/Header';
import { colors } from '@theme/index';
import { Href, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import {
  Animated,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Platform,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import ActiveTab from './ActiveTab';
import PausedTab from './PausedTab';

type TabKey = 'active' | 'paused';

type SearchParams = {
  tab?: string | string[];
};

type PageSelectedEvent = NativeSyntheticEvent<{
  position: number;
}>;

type PageScrollEvent = NativeSyntheticEvent<{
  position: number;
  offset: number;
}>;

type TabItem = {
  key: TabKey;
  label: string;
  component: React.ComponentType;
};

const TABS: TabItem[] = [
  { key: 'active', label: 'Active', component: ActiveTab },
  { key: 'paused', label: 'Paused', component: PausedTab },
];

const LISTING_BASIC_INFO_ROUTE = '/(user)/ListingBasicInfo' as Href;

export default function AllListingsScreen(): React.JSX.Element {
  const params = useLocalSearchParams<SearchParams>();
  const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;

  const initialIndex = tabParam === 'active' ? 0 : tabParam === 'paused' ? 1 : 0;

  const { width } = useWindowDimensions();
  const pagerRef = useRef<PagerView | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const animatedPosition = useRef(new Animated.Value(initialIndex)).current;

  const handleTabPress = (index: number): void => {
    pagerRef.current?.setPage(index);
    setActiveIndex(index);
    animatedPosition.setValue(index);
  };

  const handlePageSelected = (e: PageSelectedEvent): void => {
    const position = e.nativeEvent.position;
    setActiveIndex(position);
    animatedPosition.setValue(position);
  };

  const handlePageScroll = (e: PageScrollEvent): void => {
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
  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Header
          title="My Listings"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          isRightIconVisible={true}
          rightIcon="add"
          onRightIconPress={() => router.push(LISTING_BASIC_INFO_ROUTE)}
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
              style={({ pressed }) => [
                styles.tab,
                Platform.OS === 'ios' && pressed && { opacity: 0.6 },
              ]}
              android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
              onPress={() => handleTabPress(index)}
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
        initialPage={initialIndex}
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
    backgroundColor: colors.light.altBackground,
  },
  header: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: colors.light.altBackground,
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
    backgroundColor: colors.light.surface,
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
