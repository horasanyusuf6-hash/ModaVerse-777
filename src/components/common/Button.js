// 📁 src/components/common/Button.js
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SIZES } from '../../constants/Theme';

// ============================================================
// 📌 BUTTON BİLEŞENİ
// ============================================================
export default function Button({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) {
  // ============================================================
  // 📌 STİL SEÇİMİ
  // ============================================================
  const buttonStyles = [styles.button];
  const textStyles = [styles.text];
  
  // TİP
  switch (type) {
    case 'primary':
      buttonStyles.push(styles.primary);
      textStyles.push(styles.primaryText);
      break;
    case 'secondary':
      buttonStyles.push(styles.secondary);
      textStyles.push(styles.secondaryText);
      break;
    case 'outline':
      buttonStyles.push(styles.outline);
      textStyles.push(styles.outlineText);
      break;
    case 'danger':
      buttonStyles.push(styles.danger);
      textStyles.push(styles.dangerText);
      break;
    case 'success':
      buttonStyles.push(styles.success);
      textStyles.push(styles.successText);
      break;
    case 'ghost':
      buttonStyles.push(styles.ghost);
      textStyles.push(styles.ghostText);
      break;
    default:
      buttonStyles.push(styles.primary);
      textStyles.push(styles.primaryText);
  }
  
  // BOYUT
  switch (size) {
    case 'small':
      buttonStyles.push(styles.small);
      textStyles.push(styles.smallText);
      break;
    case 'large':
      buttonStyles.push(styles.large);
      textStyles.push(styles.largeText);
      break;
    default:
      // medium
      break;
  }
  
  // DİSABLED
  if (disabled || loading) {
    buttonStyles.push(styles.disabled);
  }

  // ============================================================
  // 📌 RENDER
  // ============================================================
  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={type === 'primary' || type === 'danger' || type === 'success' ? COLORS.white : COLORS.black}
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && icon}
          <Text style={[textStyles, textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </View>
      )}
    </>
  );

  return (
    <TouchableOpacity
      style={[...buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
}

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  // BASE
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    ...TYPOGRAPHY.button,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // TYPES
  primary: {
    backgroundColor: COLORS.black,
  },
  primaryText: {
    color: COLORS.white,
  },
  
  secondary: {
    backgroundColor: COLORS.grayLight,
  },
  secondaryText: {
    color: COLORS.black,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  outlineText: {
    color: COLORS.black,
  },
  
  danger: {
    backgroundColor: COLORS.danger || '#E74C3C',
  },
  dangerText: {
    color: COLORS.white,
  },
  
  success: {
    backgroundColor: COLORS.success || '#2ECC71',
  },
  successText: {
    color: COLORS.white,
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: COLORS.black,
  },
  
  // SIZES
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 32,
  },
  smallText: {
    fontSize: 11,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  largeText: {
    fontSize: 16,
  },
  
  // STATES
  disabled: {
    opacity: 0.5,
  },
  
  // CONTENT
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});