// 📁 src/components/SearchBar.js - SADECE REVİZE
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 🎨 Renk paleti (App.js ile uyumlu)
const COLORS = {
  porcelain: '#FAFAFA',
  ash: '#888888',
  charcoal: '#222222',
  cloud: '#F0F0F0',
};

/**
 * Arama çubuğu component'i
 * @param {Function} onSearch - Arama metni değiştiğinde çağrılır
 * @param {Function} onFocus - Input focus olduğunda çağrılır
 * @param {string} placeholder - Placeholder metni (varsayılan: "Ara...")
 * @param {string} value - Input değeri (controlled component için)
 * @param {Function} onSubmit - Arama butonuna basıldığında
 * @param {boolean} autoFocus - Otomatik focus
 */
const SearchBar = ({ 
  onSearch, 
  onFocus, 
  placeholder = "Ara...", 
  value,
  onSubmit,
  autoFocus = false,
  ...restProps 
}) => {
  
  const handleSubmit = () => {
    if (onSubmit) onSubmit();
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color={COLORS.ash} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.ash}
        onChangeText={onSearch}
        onFocus={onFocus}
        onSubmitEditing={handleSubmit}
        value={value}
        autoFocus={autoFocus}
        returnKeyType="search"
        clearButtonMode="while-editing"
        {...restProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.porcelain,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.charcoal,
    padding: 0,
  },
});

export default SearchBar;