// 📁 src/components/common/Card.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SIZES } from '../../constants/Theme';

// ============================================================
// 📌 CARD BİLEŞENİ
// ============================================================
export default function Card({
  title,
  subtitle,
  onPress,
  children,
  style,
  variant = 'elevated',
  loading = false,
  disabled = false,
  headerStyle,
  bodyStyle,
}) {
  // ============================================================
  // 📌 STİL SEÇİMİ
  // ============================================================
  const cardStyles = [styles.card];
  
  switch (variant) {
    case 'elevated':
      cardStyles.push(styles.elevated);
      break;
    case 'outlined':
      cardStyles.push(styles.outlined);
      break;
    case 'filled':
      cardStyles.push(styles.filled);
      break;
    default:
      cardStyles.push(styles.elevated);
  }

  if (disabled) {
    cardStyles.push(styles.disabled);
  }

  // ============================================================
  // 📌 CONTENT
  // ============================================================
  const content = (
    <View style={[styles.card, cardStyles, style]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.black} />
        </View>
      ) : (
        <>
          {/* Header */}
          {(title || subtitle) && (
            <View style={[styles.header, headerStyle]}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}
          
          {/* Body */}
          <View style={[styles.body, bodyStyle]}>
            {children}
          </View>
        </>
      )}
    </View>
  );

  // ============================================================
  // 📌 RENDER
  // ============================================================
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled || loading}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  // BASE
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.md,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },

  // VARIANTS
  elevated: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  filled: {
    backgroundColor: COLORS.surface,
    shadowOpacity: 0,
    elevation: 0,
  },

  // STATES
  disabled: {
    opacity: 0.5,
  },

  // HEADER
  header: {
    marginBottom: SIZES.sm,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.grayMedium,
  },

  // BODY
  body: {
    // flex: 1,
  },

  // LOADING
  loadingContainer: {
    paddingVertical: SIZES.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
});