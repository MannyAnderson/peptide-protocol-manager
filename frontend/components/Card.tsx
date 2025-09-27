import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radii } from '../lib/theme';

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

const Card: React.FC<Props> = ({ children, style, padded = true }) => {
  return <View style={[styles.base, padded && styles.padded, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  padded: {
    padding: spacing.s16,
  },
});

export default Card;


