import axios from 'axios';

export const checkUserProfile = async (token: string) => {
  try {
    const response = await axios.get('http://localhost:8000/profiles/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const profile = response.data;

    const isIncomplete =
      !profile?.fullName || !profile?.bio || !profile?.image;

    return {
      exists: true,
      isIncomplete,
      profile,
    };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return {
        exists: false,
        isIncomplete: true,
        profile: null,
      };
    }

    throw error;
  }
};

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CompleteProfilePromptModal from '../components/CompleteProfilePromptModal';
import { checkUserProfile } from '../services/checkUserProfile';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [showCompleteProfilePrompt, setShowCompleteProfilePrompt] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = 'YOUR_USER_TOKEN'; // yahan apna real token lagana

  useEffect(() => {
    const fetchProfileStatus = async () => {
      try {
        const result = await checkUserProfile(token);

        if (result.isIncomplete) {
          setShowCompleteProfilePrompt(true);
        }
      } catch (error) {
        console.error('Profile check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStatus();
  }, [token]);

  const handleCloseModal = () => {
    setShowCompleteProfilePrompt(false);
  };

  const handleCompleteNow = () => {
    setShowCompleteProfilePrompt(false);
    navigation.navigate('CompleteProfileScreen');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text>Home Screen</Text>

      <CompleteProfilePromptModal
        visible={showCompleteProfilePrompt}
        onClose={handleCloseModal}
        onCompleteNow={handleCompleteNow}
      />
    </View>
  );
};

export default HomeScreen;