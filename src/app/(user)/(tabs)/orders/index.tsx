import React, { useRef, useState } from 'react';
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
import { useNavigation } from 'expo-router';

import Header from '@components/common/Header';
import { colors } from '@theme/index';

import RequestedTab from './RequestedTab';
import ActiveTab from './ActiveTab';
import CompletedTab from './CompletedTab';
import CancelledTab from './Cancelled';

type TabKey = 'requested' | 'accepted' | 'completed' | 'cancelled';

type TabItem = {
  key: TabKey;
  label: string;
  component: React.ComponentType;
};

const TABS: TabItem[] = [
  { key: 'requested', label: 'Requested', component: RequestedTab },
  { key: 'accepted', label: 'Accepted', component: ActiveTab },
  { key: 'completed', label: 'Completed', component: CompletedTab },
  { key: 'cancelled', label: 'Cancelled', component: CancelledTab },
];

type PageSelectedEvent = NativeSyntheticEvent<{
  position: number;
}>;

type PageScrollEvent = NativeSyntheticEvent<{
  position: number;
  offset: number;
}>;

export default function AllOrdersScreen() {
  const { width } = useWindowDimensions();
  const pagerRef = useRef<PagerView | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const animatedPosition = useRef(new Animated.Value(0)).current;

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

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Header title="Orders" showBackButton={true} onBackPress={() => navigation.goBack()} />
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
                Platform.OS === 'ios' && pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: colors.light.border }}
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
    backgroundColor: colors.light.surface,
  },
  header: {
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 0,
    backgroundColor: colors.light.surface,
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
