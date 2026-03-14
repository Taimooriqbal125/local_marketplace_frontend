import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import HomeListingCard from '@components/listings/HomeListingCard';
import ScreenWrapper from '@components/common/ScreenWrapper';
import FilterLayout from '@components/common/FilterLayout';
import { FilterButtons } from '@components/common/FilterButtons';
import HomeHeader from '@components/listings/HomeHeader';
import { useNavigation } from 'expo-router';

export default function UserMarket() {
  const [selectedFilter, setSelectedFilter] = useState('All Services');
  const [priceType, setPriceType] = useState(''); // '', 'fixed', 'hourly', 'daily'
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation();

  const handlePriceTypeChange = (value) => {
    setPriceType(value);
    console.log('Price Type Selected:', value);
  };

  const handleNegotiableToggle = () => {
    setIsNegotiable(!isNegotiable);
    console.log('Negotiable:', !isNegotiable);
  };

  const filterData = [
    { id: '1', label: 'All Services' },
    { id: '2', label: 'Cleaning' },
    { id: '3', label: 'Tutoring' },
    { id: '4', label: 'Plumbing' },
  ];

  const homeListingCarddata = [
    {
      id: '1',
      image:
        'https://images.unsplash.com/photo-1516450360431-974816311723?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      isTopRated: true,
      isNegotiable: true,
      category: 'HOME SERVICES',
      location: 'Manhattan',
      title: 'Premium Deep Cleaning',
      providerName: 'Mike R.',
      providerAvatar: 'M',
      rating: 5.0,
      price: 25,
      priceUnit: 'hr',
      onPress: () => {},
      containerStyle: {},
    },
    {
      id: '2',
      image:
        'https://images.unsplash.com/photo-1516450360431-974816311723?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      isTopRated: true,
      isNegotiable: true,
      category: 'HOME SERVICES',
      location: 'Manhattan',
      title: 'Premium Deep Cleaning',
      providerName: 'Mike R.',
      providerAvatar: 'M',
      rating: 5.0,
      price: 25,
      priceUnit: 'hr',
      onPress: () => {},
      containerStyle: {},
    },
    {
      id: '3',
      image:
        'https://images.unsplash.com/photo-1516450360431-974816311723?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      isTopRated: true,
      isNegotiable: true,
      category: 'HOME SERVICES',
      location: 'Manhattan',
      title: 'Premium Deep Cleaning',
      providerName: 'Mike R.',
      providerAvatar: 'M',
      rating: 5.0,
      price: 25,
      priceUnit: 'hr',
      onPress: () => {},
      containerStyle: {},
    },
  ];

  // Basic Filter Logic for Search Query
  const filteredData = homeListingCarddata.filter((item) => {
    if (!searchQuery) return true;
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <ScreenWrapper style={{ backgroundColor: '#F9FAFB' }}>
      <View style={styles.container}>
        <HomeHeader
          title="Market"
          logoIcon=""
          logoBackgroundColor="#053727ff"
          notificationCount={1}
          onNotificationPress={() => {
            navigation.navigate('Notification');
          }}
          onProfilePress={() => {}}
          onSearch={setSearchQuery} // Connect search input to state
          profileImage=""
          profileInitials="U"
          containerStyle={{}}
          titleStyle={{}}
          logoStyle={{}}
        />
        {/* <View style={{ flexDirection: 'row', paddingLeft: 12, gap: 6 }}>
            <Ionicons name='location' size={24} color='#10B981' />
            <Text>Faislabad</Text>
          </View> */}
        <FilterLayout
          filters={filterData}
          selectedFilter={selectedFilter}
          onSelectFilter={(item) => setSelectedFilter(item.label)}
        />

        <View style={{ paddingBottom: 12 }}>
          <FilterButtons
            priceType={priceType}
            onPriceTypeChange={handlePriceTypeChange}
            isNegotiable={isNegotiable}
            onNegotiableToggle={handleNegotiableToggle}
          />
        </View>

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <HomeListingCard
              image={item.image}
              isTopRated={item.isTopRated}
              isNegotiable={item.isNegotiable}
              category={item.category}
              location={item.location}
              title={item.title}
              providerName={item.providerName}
              providerAvatar={item.providerAvatar}
              rating={item.rating}
              price={item.price}
              priceUnit={item.priceUnit}
              onPress={() => {
                navigation.navigate('ServicesDetails');
              }}
              containerStyle={item.containerStyle}
            />
          )}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 24,
  },
});
