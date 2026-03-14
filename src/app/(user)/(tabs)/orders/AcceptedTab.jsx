import { FlatList, StyleSheet, View } from 'react-native';
import ScreenWrapper from '@components/common/ScreenWrapper';
import OrderCard from '@components/orders/orderCard';

const acceptedOrders = [
  {
    id: '1',
    title: 'Interior Design Consultation',
    buyerName: 'Mike Thompson',
    price: '200.00',
    date: 'Mar 12, 2024',
    status: 'accepted',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200',
  },
  {
    id: '2',
    title: 'Garden Landscaping',
    buyerName: 'Emily Clark',
    price: '150.00',
    date: 'Mar 11, 2024',
    status: 'accepted',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200',
  },
];

export default function AcceptedTab() {
  return (
    <ScreenWrapper withTopInset={false}>
      <View style={styles.container}>
        <FlatList
          data={acceptedOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              title={item.title}
              buyerName={item.buyerName}
              price={item.price}
              date={item.date}
              status={item.status}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContent: { padding: 16, flexGrow: 1 },
});
