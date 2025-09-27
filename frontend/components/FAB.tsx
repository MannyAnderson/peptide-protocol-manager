import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../lib/theme';

type Props = {
  onPress: () => void;
  label?: string;
};

const FAB: React.FC<Props> = ({ onPress, label }) => {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.container, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.label}>{label ?? 'Add'}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.s16,
    bottom: spacing.s16,
    backgroundColor: colors.primary,
    height: 52,
    minWidth: 52,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.s16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    ...typography.subtitle,
    color: '#fff',
    fontWeight: '700',
  },
});

export default FAB;


