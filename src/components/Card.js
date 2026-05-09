// 📁 src/components/Card.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/Theme';

export default function Card({ title, subtitle, onPress, children, style }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.card, style]}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {children}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.cloud,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.base,
  },
  title: {
    ...FONTS.h4,
    color: COLORS.charcoal,
    marginBottom: SIZES.base,
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.ash,
  },
});