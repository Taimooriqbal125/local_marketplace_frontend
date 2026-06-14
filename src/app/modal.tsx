import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ModalScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Modal Screen</Text>
    </View>
  );
};

export default ModalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
  },
});
