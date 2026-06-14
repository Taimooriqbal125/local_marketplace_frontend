import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors } from '@theme/index';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ProfileViewCardProps {
  title?: string;
  subtitle?: string;
  subtitleSuffix?: string;
  iconName?: IoniconName;
  iconSize?: number;
  iconColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  ratingStyle?: StyleProp<TextStyle>;
  reviewTextStyle?: StyleProp<TextStyle>;
  istitle?: boolean;
  toptitle?: string;
}

const ProfileViewCard: React.FC<ProfileViewCardProps> = ({
  title = '4.9',
  subtitle = '',
  subtitleSuffix = '',
  iconName = 'star',
  iconSize = 18,
  iconColor = colors.light.primary,
  containerStyle,
  ratingStyle,
  reviewTextStyle,
  istitle = false,
  toptitle = '',
}) => {
  return (
    <View style={[styles.card, containerStyle]}>
      {istitle ? (
        <Text style={styles.toptitle}>{toptitle}</Text>
      ) : (
        <Ionicons name={iconName} size={iconSize} color={iconColor} style={styles.icon} />
      )}

      <Text style={[styles.rating, ratingStyle]}>{title}</Text>

      {!!subtitle && (
        <Text style={[styles.reviewText, reviewTextStyle]}>
          {subtitle} {subtitleSuffix}
        </Text>
      )}
    </View>
  );
};

export default React.memo(ProfileViewCard);

const styles = StyleSheet.create({
  card: {
    width: 88,
    minHeight: 76,
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginBottom: 6,
  },
  rating: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.light.text,
    lineHeight: 26,
  },
  toptitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.light.text,
    marginBottom: 4,
  },
  reviewText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: colors.light.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
