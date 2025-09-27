import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors, spacing, radii, typography } from '../lib/theme';

type Props = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  contentStyle?: ViewStyle;
};

const Sheet: React.FC<Props> = ({ visible, title, onClose, children, contentStyle }) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.spacer} />
        </View>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.s16,
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s12,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8 as unknown as number,
  },
  title: {
    ...typography.subtitle,
    flex: 1,
    textAlign: 'center',
  },
  close: {
    paddingVertical: spacing.s8,
    paddingHorizontal: spacing.s12,
    borderRadius: radii.input,
  },
  closeText: {
    ...(typography.body as any),
    color: colors.primary,
    fontWeight: '600',
  },
  spacer: {
    width: 56,
  },
  content: {
    flex: 1,
    padding: spacing.s16,
  },
});

export default Sheet;


