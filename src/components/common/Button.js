// 📁 src/components/Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/Theme';

export default function Button({ title, onPress, type = 'primary', style }) {
  const buttonStyles = [styles.button];
  const textStyles = [styles.text];
  
  if (type === 'primary') {
    buttonStyles.push(styles.primary);
    textStyles.push(styles.primaryText);
  } else if (type === 'secondary') {
    buttonStyles.push(styles.secondary);
    textStyles.push(styles.secondaryText);
  }
  
  return (
    <TouchableOpacity onPress={onPress} style={[...buttonStyles, style]}>
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: COLORS.cognac,
  },
  primaryText: {
    ...FONTS.body2,
    color: COLORS.white,
    fontWeight: '500',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.cognac,
  },
  secondaryText: {
    ...FONTS.body2,
    color: COLORS.cognac,
  },
});