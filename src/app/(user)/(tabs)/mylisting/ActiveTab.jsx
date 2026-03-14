import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ScreenWrapper from '@components/common/ScreenWrapper';
import ListingCard from '@components/listings/ListingCard';

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

export default function ActiveTab() {
  return (
    <ScreenWrapper key={2} withTopInset={false}>
      <View style={styles.container}>
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
              onEdit={() => {}}
              onPause={() => {}}
              onView={() => {}}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  status: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
});
