// 📁 src/components/common/Input.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SIZES } from '../../constants/Theme';

// ============================================================
// 📌 INPUT BİLEŞENİ
// ============================================================
export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  success,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  maxLength,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;
  const isSecure = secureTextEntry && !showPassword;

  // ============================================================
  // 📌 HANDLERS
  // ============================================================
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ============================================================
  // 📌 STYLES
  // ============================================================
  const containerStyles = [styles.container];
  const inputContainerStyles = [
    styles.inputContainer,
    isFocused && styles.focused,
    error && styles.error,
    success && styles.success,
    disabled && styles.disabled,
    multiline && styles.multilineContainer,
  ];
  const inputStyles = [
    styles.input,
    multiline && styles.multilineInput,
    disabled && styles.disabledInput,
    inputStyle,
  ];

  // ============================================================
  // 📌 RENDER
  // ============================================================
  return (
    <View style={[...containerStyles, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      {/* Input */}
      <View style={inputContainerStyles}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          style={inputStyles}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.grayMedium}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          selectionColor={COLORS.black}
        />

        {/* Right Icon / Password Toggle */}
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}

        {isPassword && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={togglePasswordVisibility}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.grayMedium}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error / Success Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      {success && !error && (
        <Text style={styles.successText}>{success}</Text>
      )}
    </View>
  );
}

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.md,
  },

  // LABEL
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  required: {
    color: COLORS.danger || '#E74C3C',
  },

  // INPUT CONTAINER
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    paddingHorizontal: 12,
    minHeight: 48,
    backgroundColor: COLORS.white,
  },
  focused: {
    borderColor: COLORS.black,
  },
  error: {
    borderColor: COLORS.danger || '#E74C3C',
  },
  success: {
    borderColor: COLORS.success || '#2ECC71',
  },
  disabled: {
    opacity: 0.5,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },

  // INPUT
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.black,
    paddingVertical: 10,
    paddingHorizontal: 0,
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  disabledInput: {
    color: COLORS.grayMedium,
  },

  // ICONS
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
    padding: 4,
  },

  // MESSAGES
  errorText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.danger || '#E74C3C',
    marginTop: 4,
  },
  successText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.success || '#2ECC71',
    marginTop: 4,
  },
});