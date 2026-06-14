import React from 'react';
import { Tabs } from 'expo-router';

const AdminTabsLayout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="users" options={{ title: 'Users' }} />
    </Tabs>
  );
};

export default AdminTabsLayout;
