// 📁 src/constants/Theme.js - TAM GÜNCELLENMİŞ (ZATEN MÜKEMMEL)
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // ANA RENKLER (Tüm app'te tutarlı - %80)
  black: '#000000',
  white: '#FFFFFF',
  
  // NÖTR TONLAR (Temel palette)
  charcoal: '#1A1A1A',      // Başlıklar
  graphite: '#2D2D2D',      // Ana metin  
  slate: '#3A3A3A',         // İkincil metin
  ash: '#666666',           // Placeholder, disabled
  silver: '#999999',        // Border, ikonlar
  cloud: '#E5E5E5',         // Açık border'lar
  porcelain: '#F5F5F5',     // Background
  
  // VURGU RENKLERİ (Premium öğeler - %20)
  gold: '#D4AF37',          // Favoriler, premium badge'ler
  goldLight: '#E6C158',     // Gold hover states
  cognac: '#9A7352',        // Aktif butonlar, primary actions
  cognacLight: '#B08D6E',   // Cognac hover states
  
  // FONKSİYONEL (Az kullan)
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 8,              // Daha keskin köşeler (modern)
  padding: 20,            // Daha az padding (minimal)
  
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body1: 17,
  body2: 15,
  body3: 13,
  body4: 11,
  micro: 9,
  
  // App dimensions
  width,
  height,
};

export const FONTS = {
  // Başlıklar - İnce ve modern
  h1: { fontSize: SIZES.h1, fontWeight: '300', lineHeight: 38, letterSpacing: -0.5 },
  h2: { fontSize: SIZES.h2, fontWeight: '300', lineHeight: 30, letterSpacing: 0 },
  h3: { fontSize: SIZES.h3, fontWeight: '400', lineHeight: 26, letterSpacing: 0.25 },
  h4: { fontSize: SIZES.h4, fontWeight: '500', lineHeight: 24, letterSpacing: 0.15 },
  
  // Gövde metinleri
  body1: { fontSize: SIZES.body1, fontWeight: '400', lineHeight: 24 },
  body2: { fontSize: SIZES.body2, fontWeight: '400', lineHeight: 22 },
  body3: { fontSize: SIZES.body3, fontWeight: '400', lineHeight: 18 },
  body4: { fontSize: SIZES.body4, fontWeight: '400', lineHeight: 16 },
  
  // Özel stiller
  brandLogo: { fontSize: 24, fontWeight: '300', letterSpacing: 4 },
  subtitle: { fontSize: 10, fontWeight: '400', letterSpacing: 1 },
  productCode: { fontSize: 11, fontWeight: '400', letterSpacing: 1 },
  price: { fontSize: 18, fontWeight: '300', letterSpacing: 0.5 },
  micro: { fontSize: SIZES.micro, fontWeight: '500', letterSpacing: 0.5 },
  
  // Vurgu stilleri
  goldText: { color: COLORS.gold },
  cognacText: { color: COLORS.cognac },
};

// Kullanım rehberi
export const STYLE_GUIDE = {
  // KART STİLLERİ
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.cloud,
    padding: SIZES.padding,
  },
  
  // BUTON STİLLERİ
  buttonPrimary: {
    backgroundColor: COLORS.cognac,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: SIZES.radius,
  },
  buttonPrimaryText: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // BADGE STİLLERİ
  badgeGold: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeGoldText: {
    color: COLORS.black,
    fontSize: SIZES.micro,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // HEADER STİLLERİ
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
};

const appTheme = { 
  COLORS, 
  SIZES, 
  FONTS,
  STYLE_GUIDE
};

export default appTheme;