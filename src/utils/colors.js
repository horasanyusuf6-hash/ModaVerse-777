// 📁 src/constants/colors.js - SADECE REVİZE
export const colors = {
  primary: '#8C7853',    // ✅ DÜZELTİLDİ: cognac rengi (App.js ile uyumlu)
  secondary: '#4CAF50',  // Yeşil - COLORS.success ile aynı
  accent: '#3498DB',     // ✅ DÜZELTİLDİ: Mavi - COLORS.info ile aynı
  warning: '#F39C12',    // ✅ DÜZELTİLDİ: Turuncu - COLORS.warning ile aynı
  danger: '#E74C3C',     // ✅ DÜZELTİLDİ: Kırmızı - COLORS.error ile aynı
  background: '#FFFFFF', // Beyaz - COLORS.white ile aynı
  text: '#1A1A1A',       // ✅ DÜZELTİLDİ: Koyu gri - COLORS.charcoal ile aynı
  textLight: '#666666',  // Orta gri - COLORS.ash ile aynı
  border: '#E5E5E5',     // ✅ DÜZELTİLDİ: Açık gri - COLORS.cloud ile aynı
};

// ✅ Theme.js ile eşleştirme
export const mapColorsToTheme = (COLORS) => ({
  primary: COLORS.cognac,
  secondary: COLORS.success,
  accent: COLORS.info,
  warning: COLORS.warning,
  danger: COLORS.error,
  background: COLORS.white,
  text: COLORS.charcoal,
  textLight: COLORS.ash,
  border: COLORS.cloud,
});

export default colors;