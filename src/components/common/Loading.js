// 📁 src/components/common/Loading.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SIZES } from '../../constants/Theme';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 LOADING BİLEŞENİ
// ============================================================
export default function Loading({
  size = 'large',
  color = COLORS.black,
  text = 'YÜKLENİYOR...',
  fullScreen = false,
  transparent = false,
  style,
}) {
  // ============================================================
  // 📌 STYLES
  // ============================================================
  const containerStyles = [styles.container];
  
  if (fullScreen) {
    containerStyles.push(styles.fullScreen);
  }
  
  if (transparent) {
    containerStyles.push(styles.transparent);
  }

  // ============================================================
  // 📌 RENDER
  // ============================================================
  return (
    <View style={[...containerStyles, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

// ============================================================
// 📌 LOADING OVERLAY (Modal üstü için)
// ============================================================
export const LoadingOverlay = ({ visible, text = 'YÜKLENİYOR...' }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayBox}>
        <ActivityIndicator size="large" color={COLORS.white} />
        {text && <Text style={styles.overlayText}>{text}</Text>}
      </View>
    </View>
  );
};

// ============================================================
// 📌 SKELETON LOADING (İskelet yüklenme)
// ============================================================
export const Skeleton = ({
  width = '100%',
  height = 100,
  borderRadius = SIZES.md,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

// ============================================================
// 📌 SKELETON TEXT
// ============================================================
export const SkeletonText = ({
  width = '100%',
  height = 14,
  borderRadius = 4,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          marginBottom: 8,
        },
        style,
      ]}
    />
  );
};

// ============================================================
// 📌 SKELETON CARD
// ============================================================
export const SkeletonCard = ({ count = 1 }) => {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(
      <View key={i} style={styles.skeletonCard}>
        <Skeleton height={160} borderRadius={SIZES.sm} />
        <SkeletonText width="80%" />
        <SkeletonText width="60%" height={12} />
        <SkeletonText width="40%" height={12} />
      </View>
    );
  }
  return <>{items}</>;
};

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl,
    gap: SIZES.md,
  },
  fullScreen: {
    flex: 1,
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.white,
    zIndex: 999,
  },
  transparent: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  text: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.grayMedium,
    letterSpacing: 1.5,
  },

  // OVERLAY
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  overlayBox: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: SIZES.md,
    alignItems: 'center',
    gap: SIZES.md,
    minWidth: 120,
  },
  overlayText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.white,
    letterSpacing: 1,
  },

  // SKELETON
  skeleton: {
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZES.sm,
  },
  skeletonCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.md,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    gap: SIZES.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
});