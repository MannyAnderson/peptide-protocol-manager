// Design tokens for the React Native app
// Export a single theme object plus named exports for convenience

export type TypographyStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight?: '400' | '500' | '600' | '700';
};

export const colors = {
  primary: '#4C8CF5',
  secondary: '#7A5AF8',
  // Semantic neutrals
  textPrimary: '#0B1220',
  textOnDark: '#E8EEF6',
  textSecondary: '#5A6B86',
  background: '#FFFFFF',
  backgroundDark: '#0B0F14',
  // Surfaces and borders
  surface: '#F7F9FC',
  surfaceDark: '#121820',
  surfaceElevated: '#EEF2F7',
  surfaceElevatedDark: '#16202B',
  border: '#D6DEEA',
  borderDark: '#263242',
  success: '#2ECC71',
  warning: '#F5A623',
  error: '#FF5A5F',
} as const;

export const spacing = {
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s20: 20,
  s24: 24,
} as const;

export const radii = {
  input: 8,
  card: 12,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 20, lineHeight: 24, fontWeight: '600' } as TypographyStyle,
  subtitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' } as TypographyStyle,
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' } as TypographyStyle,
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' } as TypographyStyle,
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
} as const;

export default theme;


