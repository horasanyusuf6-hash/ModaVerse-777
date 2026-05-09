// src/components/FilterModal.js - SADECE REVİZE
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

// 🎨 Renk paleti (App.js ile uyumlu - cognac düzeltildi)
const COLORS = {
  white: '#FFFFFF',
  noir: '#000000',
  charcoal: '#222222',
  ash: '#888888',
  cloud: '#333333',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
  accent: '#8C7853',
  success: '#4CAF50',
  error: '#F44336',
  background: '#1a1a1a',
};

const FilterModal = ({ visible, onClose, onApplyFilters, products = [], currentFilters = null }) => {
  // Filtre state'i
  const [filters, setFilters] = useState({
    brands: [],
    priceRange: [0, 1000],
    categories: [],
    inStock: false
  });

  // Mevcut filtreler varsa yükle
  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters);
    } else {
      resetFilters();
    }
  }, [currentFilters]);

  // Marka ve kategori listelerini ürünlerden çıkar (benzersiz)
  const { brands, categories, minPrice, maxPrice } = useMemo(() => {
    if (!products || products.length === 0) {
      return { 
        brands: [], 
        categories: [], 
        minPrice: 0, 
        maxPrice: 1000 
      };
    }
    
    const brandSet = new Set();
    const categorySet = new Set();
    let min = Infinity;
    let max = -Infinity;
    
    products.forEach(product => {
      if (product.brand) brandSet.add(product.brand);
      if (product.category) categorySet.add(product.category);
      if (product.price) {
        min = Math.min(min, product.price);
        max = Math.max(max, product.price);
      }
    });
    
    return {
      brands: Array.from(brandSet).sort(),
      categories: Array.from(categorySet).sort(),
      minPrice: min !== Infinity ? Math.floor(min) : 0,
      maxPrice: max !== -Infinity ? Math.ceil(max) : 1000,
    };
  }, [products]);

  // Fiyat aralığını güncelle
  useEffect(() => {
    if (minPrice !== Infinity && maxPrice !== -Infinity) {
      setFilters(prev => ({
        ...prev,
        priceRange: [minPrice, maxPrice]
      }));
    }
  }, [minPrice, maxPrice]);

  // Marka toggle
  const toggleBrand = useCallback((brand) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  }, []);

  // Kategori toggle
  const toggleCategory = useCallback((category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  }, []);

  // Fiyat aralığı değişimi
  const handlePriceRangeChange = useCallback((value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [prev.priceRange[0], value]
    }));
  }, []);

  // Minimum fiyat değişimi
  const handleMinPriceChange = useCallback((value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [value, prev.priceRange[1]]
    }));
  }, []);

  // Stok durumu toggle
  const toggleInStock = useCallback((value) => {
    setFilters(prev => ({ ...prev, inStock: value }));
  }, []);

  // Filtreleri uygula
  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  // Filtreleri sıfırla
  const resetFilters = useCallback(() => {
    setFilters({
      brands: [],
      priceRange: [minPrice, maxPrice],
      categories: [],
      inStock: false
    });
  }, [minPrice, maxPrice]);

  // Aktif filtre sayısı
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.brands.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.inStock) count++;
    if (filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice) count++;
    return count;
  }, [filters, minPrice, maxPrice]);

  // Tüm markaları seç/kaldır
  const toggleAllBrands = useCallback(() => {
    if (filters.brands.length === brands.length) {
      setFilters(prev => ({ ...prev, brands: [] }));
    } else {
      setFilters(prev => ({ ...prev, brands: [...brands] }));
    }
  }, [brands, filters.brands.length]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.noir} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>
            Filtrele {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Text>
          <TouchableOpacity onPress={resetFilters} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.resetText, activeFilterCount === 0 && styles.resetTextDisabled]}>
              Sıfırla
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Marka Filtresi */}
          {brands.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Marka</Text>
                <TouchableOpacity onPress={toggleAllBrands}>
                  <Text style={styles.selectAllText}>
                    {filters.brands.length === brands.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.filterList}>
                {brands.map(brand => (
                  <TouchableOpacity
                    key={brand}
                    style={[
                      styles.filterItem,
                      filters.brands.includes(brand) && styles.filterItemSelected
                    ]}
                    onPress={() => toggleBrand(brand)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterItemText,
                      filters.brands.includes(brand) && styles.filterItemTextSelected
                    ]}>
                      {brand}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Fiyat Aralığı */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fiyat Aralığı</Text>
            <View style={styles.priceContainer}>
              <View style={styles.priceRangeRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Min</Text>
                  <Text style={styles.priceValue}>₺{filters.priceRange[0]}</Text>
                </View>
                <Ionicons name="remove" size={20} color={COLORS.ash} />
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Max</Text>
                  <Text style={styles.priceValue}>₺{filters.priceRange[1]}</Text>
                </View>
              </View>
              
              <Text style={styles.sliderLabel}>Maksimum Fiyat</Text>
              <Slider
                style={styles.slider}
                minimumValue={minPrice}
                maximumValue={maxPrice}
                step={10}
                value={filters.priceRange[1]}
                onValueChange={handlePriceRangeChange}
                minimumTrackTintColor={COLORS.cognac}
                maximumTrackTintColor={COLORS.cloud}
                thumbTintColor={COLORS.cognac}
              />
              
              <Text style={styles.sliderLabel}>Minimum Fiyat</Text>
              <Slider
                style={styles.slider}
                minimumValue={minPrice}
                maximumValue={maxPrice}
                step={10}
                value={filters.priceRange[0]}
                onValueChange={handleMinPriceChange}
                minimumTrackTintColor={COLORS.cognac}
                maximumTrackTintColor={COLORS.cloud}
                thumbTintColor={COLORS.cognac}
              />
            </View>
          </View>

          {/* Kategori Filtresi */}
          {categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kategori</Text>
              <View style={styles.filterList}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterItem,
                      filters.categories.includes(category) && styles.filterItemSelected
                    ]}
                    onPress={() => toggleCategory(category)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterItemText,
                      filters.categories.includes(category) && styles.filterItemTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Stok Durumu */}
          <View style={styles.section}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Sadece stokta olanlar</Text>
              <Switch
                value={filters.inStock}
                onValueChange={toggleInStock}
                trackColor={{ false: COLORS.cloud, true: COLORS.cognac }}
                thumbColor={filters.inStock ? COLORS.white : COLORS.white}
              />
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.applyButton} 
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>
              {activeFilterCount > 0 
                ? `${activeFilterCount} Filtre Uygula` 
                : 'Filtrele'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.noir,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  resetText: {
    color: COLORS.white,
    fontSize: 16,
  },
  resetTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  selectAllText: {
    color: COLORS.cognac,
    fontSize: 14,
  },
  filterList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cloud,
    backgroundColor: COLORS.background,
  },
  filterItemSelected: {
    backgroundColor: COLORS.cognac,
    borderColor: COLORS.cognac,
  },
  filterItemText: {
    color: COLORS.white,
    fontSize: 14,
  },
  filterItemTextSelected: {
    color: COLORS.white,
    fontWeight: '500',
  },
  priceContainer: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
  },
  priceRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.noir,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  priceLabel: {
    color: COLORS.ash,
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  sliderLabel: {
    color: COLORS.ash,
    fontSize: 12,
    marginBottom: 8,
    marginTop: 16,
  },
  slider: {
    height: 40,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
  },
  switchLabel: {
    color: COLORS.white,
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cloud,
  },
  applyButton: {
    backgroundColor: COLORS.cognac,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterModal;