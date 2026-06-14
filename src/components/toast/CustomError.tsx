import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

export const showErrorToast = (message: string, title: string = 'Error', icon?: IconName) => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    props: { icon },
  });
};

export const showSuccessToast = (message: string, title: string = 'Success', icon?: IconName) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    props: { icon },
  });
};

export const showInfoToast = (message: string, title: string = 'Info', icon?: IconName) => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    props: { icon },
  });
};
