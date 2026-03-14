import { FlatList, StyleSheet, View } from 'react-native';
import ScreenWrapper from '@components/common/ScreenWrapper';
import OrderCard from '@components/orders/orderCard';

const completedOrders = [
  {
    id: '1',
    title: 'Deep House Cleaning',
    buyerName: 'John Doe',
    price: '120.00',
    date: 'Mar 10, 2024',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200',
  },
  {
    id: '2',
    title: 'Office Cleaning',
    buyerName: 'David Chen',
    price: '80.00',
    date: 'Mar 8, 2024',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94edd56289?w=200',
  },
];

export default function CompletedTab() {
  return (
    <ScreenWrapper withTopInset={false}>
      <View style={styles.container}>
        <FlatList
          data={completedOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              title={item.title}
              buyerName={item.buyerName}
              price={item.price}
              date={item.date}
              status={item.status}
              image={item.image}
              onAddReviews={() => console.log('Add Review for', item.id)}
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
