import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const FilterLayout = ({
  filters = [],
  selectedFilter,
  onSelectFilter,
  containerStyle,
  activeButtonStyle,
  inactiveButtonStyle,
  activeTextStyle,
  inactiveTextStyle,
}) => {
  const handleSelectFilter = (item) => {
    if (onSelectFilter) {
      onSelectFilter(item);
    }
  };

  const renderItem = ({ item }) => {
    const isActive = selectedFilter === item.id || selectedFilter === item.label;

    return (
      <Pressable
        style={[
          styles.filterButton,
          isActive
            ? [styles.activeButton, activeButtonStyle]
            : [styles.inactiveButton, inactiveButtonStyle],
        ]}
        onPress={() => handleSelectFilter(item)}
        activeOpacity={0.7}
      >
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
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#16A34A',
  },
  inactiveButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeText: {
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#374151',
  },
  separator: {
    width: 8,
  },
});

export default FilterLayout;
