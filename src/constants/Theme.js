// 📁 src/constants/Theme.js - REVİZE (Eksik Renkler Tamamlandı)

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 AÇIK TEMA RENKLERİ (Light Mode)
// ============================================================
export const LIGHT_COLORS = {
  // SİYAH TONLARI
  black: '#000000',
  noir: '#0A0A0A',
  charcoal: '#141414',
  graphite: '#1E1E1E',
  slate: '#2A2A2A',
  
  // GRİ TONLARI
  grayDark: '#1C1C1C',
  grayMedium: '#8E8E8E',
  grayLight: '#D4D4D4',
  ash: '#6B6B6B',
  silver: '#9B9B9B',
  cloud: '#D4D4D4',
  porcelain: '#EFEFEF',
  
  // BEYAZ
  white: '#FFFFFF',
  
  // VURGU RENKLERİ
  gold: '#C9A84C',
  goldLight: '#E8D5A3',
  cognac: '#BFA085',
  cognacLight: '#D4BFA8',
  rose: '#D4A5A5',
  
  // 🆕 FONKSİYONEL RENKLER (GENİŞLETİLDİ)
  background: '#FFFFFF',
  surface: '#FAFAFA',
  card: '#FFFFFF',
  border: '#D4D4D4',
  overlay: 'rgba(0,0,0,0.5)',
  input: '#FAFAFA',
  placeholder: '#B0B0B0',
  separator: '#EEEEEE',
  
  // 🆕 RENK PALETİ (GENİŞLETİLDİ)
  primary: '#BFA085',
  primaryLight: '#D4BFA8',
  primaryDark: '#A68B72',
  secondary: '#8E8E8E',
  secondaryLight: '#B0B0B0',
  secondaryDark: '#6B6B6B',
  
  // STATUS
  danger: '#EF5350',
  success: '#4CAF50',
  warning: '#FFA726',
  info: '#42A5F5',
  error: '#EF5350',
  like: '#EF5350',
  
  // METİN
  text: '#000000',
  textSecondary: '#8E8E8E',
  textDisabled: '#D4D4D4',
  textInverse: '#FFFFFF',
};

// ============================================================
// 📌 KARANLIK TEMA RENKLERİ (Dark Mode)
// ============================================================
export const DARK_COLORS = {
  // SİYAH TONLARI
  black: '#FFFFFF',
  noir: '#121212',
  charcoal: '#1E1E1E',
  graphite: '#2D2D2D',
  slate: '#3D3D3D',
  
  // GRİ TONLARI
  grayDark: '#E0E0E0',
  grayMedium: '#AAAAAA',
  grayLight: '#555555',
  ash: '#888888',
  silver: '#666666',
  cloud: '#333333',
  porcelain: '#2A2A2A',
  
  // BEYAZ
  white: '#FFFFFF',
  
  // VURGU RENKLERİ
  gold: '#C9A84C',
  goldLight: '#E8D5A3',
  cognac: '#BFA085',
  cognacLight: '#D4BFA8',
  rose: '#D4A5A5',
  
  // 🆕 FONKSİYONEL RENKLER (GENİŞLETİLDİ)
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2D2D2D',
  border: '#3D3D3D',
  overlay: 'rgba(0,0,0,0.7)',
  input: '#2D2D2D',
  placeholder: '#666666',
  separator: '#333333',
  
  // 🆕 RENK PALETİ (GENİŞLETİLDİ)
  primary: '#BFA085',
  primaryLight: '#D4BFA8',
  primaryDark: '#A68B72',
  secondary: '#AAAAAA',
  secondaryLight: '#CCCCCC',
  secondaryDark: '#888888',
  
  // STATUS
  danger: '#EF5350',
  success: '#4CAF50',
  warning: '#FFA726',
  info: '#42A5F5',
  error: '#EF5350',
  like: '#EF5350',
  
  // METİN
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textDisabled: '#555555',
  textInverse: '#000000',
};

// ============================================================
// 📌 TEMA GETİRME FONKSİYONU
// ============================================================
export const getThemeColors = (isDark) => {
  return isDark ? DARK_COLORS : LIGHT_COLORS;
};

// ============================================================
// 🆕 TEMA RENKLERİNİ CONTEXT İLE KULLANMAK İÇİN HOOK
// ============================================================
export const useThemeColors = (isDark) => {
  return getThemeColors(isDark);
};

// ============================================================
// 📌 DEFAULT COLORS (Eski sistem uyumluluğu için)
// ============================================================
export const COLORS = LIGHT_COLORS;

// ============================================================
// 📌 FONT AİLELERİ
// ============================================================
const getFontFamily = (type, weight) => {
  if (Platform.OS === 'ios') {
    if (type === 'serif') {
      if (weight === 'bold') return 'Didot-Bold';
      if (weight === 'semiBold') return 'Didot-Bold';
      return 'Didot';
    } else {
      if (weight === 'bold') return 'HelveticaNeue-Bold';
      if (weight === 'medium') return 'HelveticaNeue-Medium';
      return 'HelveticaNeue';
    }
  } else {
    if (type === 'serif') {
      if (weight === 'bold') return 'sans-serif-condensed';
      return 'sans-serif';
    } else {
      if (weight === 'bold') return 'sans-serif-black';
      if (weight === 'medium') return 'sans-serif-medium';
      return 'sans-serif';
    }
  }
};

// ============================================================
// 📌 TİPOGRAFİ (Tema Desteği ile)
// ============================================================
export const createTypography = (colors) => ({
  title1: {
    fontFamily: getFontFamily('serif', 'bold'),
    fontSize: 34,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    letterSpacing: -0.5,
    lineHeight: 42,
    color: colors.text,
  },
  title2: {
    fontFamily: getFontFamily('serif', 'bold'),
    fontSize: 28,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    letterSpacing: -0.3,
    lineHeight: 36,
    color: colors.text,
  },
  title3: {
    fontFamily: getFontFamily('serif', 'semiBold'),
    fontSize: 22,
    fontWeight: Platform.OS === 'ios' ? '500' : 'bold',
    letterSpacing: 0,
    lineHeight: 30,
    color: colors.text,
  },
  headline: {
    fontFamily: getFontFamily('serif', 'semiBold'),
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '500' : 'bold',
    letterSpacing: 0.2,
    lineHeight: 26,
    color: colors.text,
  },
  bodyLarge: {
    fontFamily: getFontFamily('sans', 'regular'),
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  body: {
    fontFamily: getFontFamily('sans', 'regular'),
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bodySmall: {
    fontFamily: getFontFamily('sans', 'regular'),
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.2,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: getFontFamily('sans', 'medium'),
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  logo: {
    fontFamily: getFontFamily('serif', 'bold'),
    fontSize: 24,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    letterSpacing: 3,
    color: colors.text,
  },
  button: {
    fontFamily: getFontFamily('sans', 'medium'),
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.text,
  },
  price: {
    fontFamily: getFontFamily('serif', 'semiBold'),
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '500' : 'bold',
    letterSpacing: 0.5,
    color: colors.text,
  },
});

// ============================================================
// 📌 DEFAULT TYPOGRAPHY (Eski sistem uyumluluğu)
// ============================================================
export const TYPOGRAPHY = createTypography(LIGHT_COLORS);

// ============================================================
// 📌 FONTS (Eski sistem uyumluluğu)
// ============================================================
export const FONTS = {
  h1: TYPOGRAPHY.title1,
  h2: TYPOGRAPHY.title2,
  h3: TYPOGRAPHY.title3,
  h4: TYPOGRAPHY.headline,
  body1: TYPOGRAPHY.bodyLarge,
  body2: TYPOGRAPHY.body,
  body3: TYPOGRAPHY.bodySmall,
  caption: TYPOGRAPHY.caption,
  button: TYPOGRAPHY.button,
};

// ============================================================
// 📌 BOYUTLAR
// ============================================================
export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  base: 8,
  padding: 16,
  radius: 16,
  borderRadius: 16,
  
  fontXs: 10,
  fontSm: 12,
  fontMd: 14,
  fontLg: 16,
  fontXl: 20,
  fontXxl: 24,
  fontXxxl: 34,
  width,
  height,
};

// ============================================================
// 📌 KART STILLERİ (Tema Desteği ile)
// ============================================================
export const createCardStyles = (colors) => ({
  premium: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  minimal: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  luxury: {
    backgroundColor: colors.graphite,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: colors.gold,
  },
  product: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
});

// ============================================================
// 📌 DEFAULT CARD STYLES
// ============================================================
export const CARD_STYLES = createCardStyles(LIGHT_COLORS);

// ============================================================
// 📌 GÖLGE STILLERİ
// ============================================================
export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  gold: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
};

// ============================================================
// 🆕 INPUT STILLERİ (YENİ)
// ============================================================
export const createInputStyles = (colors) => ({
  default: {
    backgroundColor: colors.input,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    placeholderTextColor: colors.placeholder,
  },
  focused: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  error: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  disabled: {
    backgroundColor: colors.surface,
    borderColor: colors.separator,
    opacity: 0.6,
  },
});

// ============================================================
// 🆕 BUTTON STILLERİ (YENİ)
// ============================================================
export const createButtonStyles = (colors) => ({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  danger: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

// ============================================================
// 🆕 CHIP STILLERİ (YENİ)
// ============================================================
export const createChipStyles = (colors) => ({
  default: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  textActive: {
    color: colors.textInverse,
  },
});

// ============================================================
// 📌 TEMA UTILITY FONKSİYONLARI (YENİ)
// ============================================================
export const createThemeStyles = (isDark) => {
  const colors = getThemeColors(isDark);
  return {
    colors,
    typography: createTypography(colors),
    cardStyles: createCardStyles(colors),
    inputStyles: createInputStyles(colors),
    buttonStyles: createButtonStyles(colors),
    chipStyles: createChipStyles(colors),
    shadows: SHADOWS,
    sizes: SIZES,
  };
};

// ============================================================
// 📌 EKSPORT
// ============================================================
const appTheme = {
  COLORS,
  LIGHT_COLORS,
  DARK_COLORS,
  getThemeColors,
  useThemeColors,
  createTypography,
  createCardStyles,
  createInputStyles,
  createButtonStyles,
  createChipStyles,
  createThemeStyles,
  TYPOGRAPHY,
  FONTS,
  SIZES,
  CARD_STYLES,
  SHADOWS,
};

export default appTheme;