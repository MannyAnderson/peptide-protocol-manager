import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator, View } from 'react-native';
import theme, { colors, spacing, radii, typography } from '../lib/theme';

type ButtonVariant = 'primary' | 'ghost';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const Button: React.FC<Props> = ({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
  leftIcon,
  rightIcon,
}) => {
  const isPrimary = variant === 'primary';
  const containerStyle = [
    styles.base,
    isPrimary ? styles.primary : styles.ghost,
    disabled ? styles.disabled : undefined,
    style,
  ];

  return (
    <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [containerStyle, pressed && styles.pressed]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? 'white' : colors.primary} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelGhost]} numberOfLines={1}>
            {title}
          </Text>
          {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 44,
    paddingHorizontal: spacing.s16,
    borderRadius: radii.input,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  label: {
    ...typography.subtitle,
  },
  labelPrimary: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  labelGhost: {
    color: colors.primary,
    fontWeight: '600',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8 as unknown as number,
  },
  icon: {
    marginHorizontal: spacing.s4,
  },
});

export default Button;


