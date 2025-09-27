import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../lib/theme';
import Button from './Button';

type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  actionLabel?: string;
  onActionPress?: () => void;
};

const EmptyState: React.FC<Props> = ({ title, subtitle, icon, style, actionLabel, onActionPress }) => {
  return (
    <View style={[styles.container, style]}>
      {icon ? <View style={styles.icon}>{icon}</View> : <View style={styles.placeholder} />}
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel ? (
        <View style={styles.cta}> 
          <Button title={actionLabel} onPress={onActionPress} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s24,
  },
  icon: {
    marginBottom: spacing.s16,
  },
  placeholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    marginBottom: spacing.s16,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.s8,
  },
  cta: {
    marginTop: spacing.s16,
    alignSelf: 'stretch',
  },
});

export default EmptyState;


