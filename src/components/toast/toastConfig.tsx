import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ToastConfigParams } from 'react-native-toast-message';
import { colors } from '@theme/index';

interface CustomToastProps {
  icon?: keyof typeof Ionicons.glyphMap;
}

const CustomToast = ({
  text1,
  text2,
  props,
  backgroundColor,
  defaultIcon,
}: ToastConfigParams<CustomToastProps> & {
  backgroundColor: string;
  defaultIcon: keyof typeof Ionicons.glyphMap;
}) => {
  const iconName = props?.icon || defaultIcon;

  return (
    <View style={[styles.container, { borderLeftColor: backgroundColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${backgroundColor}20` }]}>
        <Ionicons name={iconName} size={24} color={backgroundColor} />
      </View>
      <View style={styles.textContainer}>
        {text1 ? <Text style={styles.title}>{text1}</Text> : null}
        {text2 ? (
          <Text style={styles.message} numberOfLines={2}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export const toastConfig = {
  success: (props: ToastConfigParams<CustomToastProps>) => (
    <CustomToast {...props} backgroundColor={colors.light.success} defaultIcon="checkmark-circle" />
  ),
  error: (props: ToastConfigParams<CustomToastProps>) => (
    <CustomToast {...props} backgroundColor={colors.light.danger} defaultIcon="close-circle" />
  ),
  info: (props: ToastConfigParams<CustomToastProps>) => (
    <CustomToast
      {...props}
      backgroundColor={colors.light.success}
      defaultIcon="information-circle"
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderLeftWidth: 6,
    shadowColor: colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    color: colors.light.subText,
    lineHeight: 16,
  },
});
