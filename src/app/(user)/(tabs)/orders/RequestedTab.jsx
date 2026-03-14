import { FlatList, StyleSheet, View } from 'react-native';
import ScreenWrapper from '@components/common/ScreenWrapper';
import OrderCard from '@components/orders/orderCard';

const requestedOrders = [
  {
    id: '1',
    title: 'Deep House Cleaning',
    buyerName: 'John Doe',
    price: '120.00',
    date: 'Mar 14, 2024',
    status: 'requested',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200',
  },
  {
    id: '2',
    title: 'Office Cleaning',
    buyerName: 'Sarah Jenkins',
    price: '80.00',
    date: 'Mar 13, 2024',
    status: 'requested',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94edd56289?w=200',
  },
];

export default function RequestedTab() {
  return (
    <ScreenWrapper withTopInset={false}>
      <View style={styles.container}>
        <FlatList
          data={requestedOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              title={item.title}
              buyerName={item.buyerName}
              price={item.price}
              date={item.date}
              status={item.status}
              image={item.image}
              onAccept={() => console.log('Accepted', item.id)}
              onReject={() => console.log('Rejected', item.id)}
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
