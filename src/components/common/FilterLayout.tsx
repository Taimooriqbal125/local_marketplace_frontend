import React from 'react';
import {
  FlatList,
  ListRenderItem,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '@theme/index';

export interface FilterItem {
  id: string | number;
  label: string | React.ReactNode;
  [key: string]: any;
}

interface FilterLayoutProps {
  filters?: FilterItem[];
  selectedFilter?: string | number;
  onSelectFilter?: (item: FilterItem) => void;
  containerStyle?: StyleProp<ViewStyle>;
  activeButtonStyle?: StyleProp<ViewStyle>;
  inactiveButtonStyle?: StyleProp<ViewStyle>;
  activeTextStyle?: StyleProp<TextStyle>;
  inactiveTextStyle?: StyleProp<TextStyle>;
}

const FilterLayout: React.FC<FilterLayoutProps> = ({
  filters = [],
  selectedFilter,
  onSelectFilter,
  containerStyle,
  activeButtonStyle,
  inactiveButtonStyle,
  activeTextStyle,
  inactiveTextStyle,
}) => {
  const handleSelectFilter = (item: FilterItem) => {
    onSelectFilter?.(item);
  };

  const renderItem: ListRenderItem<FilterItem> = ({ item }) => {
    const isActive = selectedFilter === item.id || selectedFilter === item.label;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.filterButton,
          isActive
            ? [styles.activeButton, activeButtonStyle]
            : [styles.inactiveButton, inactiveButtonStyle],
          Platform.OS === 'ios' && pressed && { opacity: 0.8 },
        ]}
        android_ripple={{ color: isActive ? 'rgba(255,255,255,0.2)' : colors.light.border }}
        onPress={() => handleSelectFilter(item)}
      >
        {typeof item.label === 'string' ? (
          <Text
            style={[
              styles.filterText,
              isActive
                ? [styles.activeText, activeTextStyle]
                : [styles.inactiveText, inactiveTextStyle],
            ]}
          >
            {item.label}
          </Text>
        ) : (
          item.label
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        data={filters}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.altBackground,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: colors.light.success,
  },
  inactiveButton: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeText: {
    color: colors.light.surface,
  },
  inactiveText: {
    color: colors.light.text,
  },
  separator: {
    width: 8,
  },
});

export default FilterLayout;
