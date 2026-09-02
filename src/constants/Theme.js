// 📁 src/constants/Theme.js - TAM REVİZE (Eski Sistem Uyumlu)
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// ==================== RENK PALETİ (PREMIUM LÜKS) ====================
export const COLORS = {
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
  
  // FONKSİYONEL
  background: '#FFFFFF',
  surface: '#FAFAFA',
  
  // 🆕 EKSİK RENKLER EKLENDİ
  primary: '#BFA085',     // cognac ile aynı
  danger: '#EF5350',      // error ile aynı
  success: '#4CAF50',
  warning: '#FFA726',
  info: '#42A5F5',
  error: '#EF5350',
  
  // 🆕 BEĞENİ RENGİ
  like: '#EF5350',
};

// ==================== FONT AİLELERİ ====================
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

// ==================== TİPOGRAFİ ====================
export const TYPOGRAPHY = {
  title1: {
    fontFamily: getFontFamily('serif', 'bold'),
    fontSize: 34,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    letterSpacing: -0.5,
    lineHeight: 42,
    color: COLORS.black,
  },
  title2: {
    fontFamily: getFontFamily('serif', 'bold'),
    fontSize: 28,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    letterSpacing: -0.3,
    lineHeight: 36,
    color: COLORS.black,
  },
  title3: {
    fontFamily: getFontFamily('serif', 'semiBold'),
    fontSize: 22,
    fontWeight: Platform.OS === 'ios' ? '500' : 'bold',
    letterSpacing: 0,
    lineHeight: 30,
    color: COLORS.black,
  },
  headline: {
    fontFamily: getFontFamily('serif', 'semiBold'),
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '500' : 'bold',
    letterSpacing: 0.2,
    lineHeight: 26,
    color: COLORS.black,
  },
  bodyLarge: {
    fontFamily: getFontFamily('sans', 'regular'),
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 24,
    color: COLORS.grayDark,
  },
  body: {
    fontFamily: getFontFamily('sans', 'regular'),
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 22,
    color: COLORS.grayDark,
  },
  bodySmall: {
    fontFamily: getFontFamily('sans', 'regular'),
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.2,
    lineHeight: 18,
    color: COLORS.grayMedium,
  },
  caption: {
    fontFamily: getFontFamily('sans', 'medium'),
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 14,
    color: COLORS.grayMedium,
    textTransform: 'uppercase',
  },
  logo: {
    fontFamily: getFontFamily('serif', 'bold'),
    fontSize: 24,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    letterSpacing: 3,
    color: COLORS.black,
  },
  button: {
    fontFamily: getFontFamily('sans', 'medium'),
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.black,
  },
  price: {
    fontFamily: getFontFamily('serif', 'semiBold'),
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '500' : 'bold',
    letterSpacing: 0.5,
    color: COLORS.black,
  },
};

// ==================== 🆕 FONTS (ESKİ SİSTEM UYUMLULUĞU) ====================
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

// ==================== BOYUTLAR ====================
export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // 🆕 ESKİ SİSTEM UYUMLULUĞU
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

// ==================== KART STILLERI ====================
export const CARD_STYLES = {
  premium: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: COLORS.cloud,
  },
  minimal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 0.5,
    borderColor: COLORS.cloud,
  },
  luxury: {
    backgroundColor: COLORS.graphite,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: COLORS.gold,
  },
  product: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: COLORS.cloud,
  },
};

// ==================== BUTON STILLERI ====================
export const BUTTON_STYLES = {
  primary: {
    backgroundColor: COLORS.cognac,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.cognac,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: {
    fontFamily: getFontFamily('sans', 'medium'),
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.white,
  },
  secondary: {
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryText: {
    fontFamily: getFontFamily('sans', 'medium'),
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.white,
  },
  outline: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.cognac,
  },
  outlineText: {
    fontFamily: getFontFamily('sans', 'medium'),
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.cognac,
  },
  gold: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  goldText: {
    fontFamily: getFontFamily('sans', 'medium'),
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.black,
  },
  chip: {
    backgroundColor: COLORS.porcelain,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: getFontFamily('sans', 'medium'),
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
    color: COLORS.grayMedium,
  },
  miniPrimary: {
    backgroundColor: COLORS.cognac,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPrimaryText: {
    fontFamily: getFontFamily('sans', 'medium'),
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: COLORS.white,
  },
};

// ==================== GÖLGE STILLERI ====================
export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heavy: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  gold: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
};

// ==================== EKSPORT ====================
const appTheme = { 
  COLORS, 
  TYPOGRAPHY, 
  FONTS,      // 🆕 EKLENDİ
  SIZES,
  CARD_STYLES,
  BUTTON_STYLES,
  SHADOWS,
};

export default appTheme;