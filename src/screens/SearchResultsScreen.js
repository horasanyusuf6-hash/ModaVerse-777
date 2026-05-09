import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert  // ✅ EKLENDI
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// 📏 Ekran boyutları
const { width, height } = Dimensions.get('window');

// 🎨 Renk paleti (App.js ile uyumlu - cognac düzeltildi)
const COLORS = {
  white: '#FFFFFF',
  ivory: '#F9F6F2',
  paper: '#F5F3EF',
  cloud: '#F0F0F0',
  mist: '#E8E8E8',
  ash: '#888888',
  charcoal: '#222222',
  noir: '#000000',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
  porcelain: '#FAFAFA',
  accent: '#8C7853',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  like: '#E91E63',
};

// ✅ MOCK DATA (import hatasını önlemek için)
const mockData = [
  {
    id: '1',
    name: 'Oversize Blazer',
    brand: 'ZARA',
    price: 799,
    category: 'Ceket',
    color: 'Siyah',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300',
  },
  {
    id: '2',
    name: 'Air Force 1',
    brand: 'Nike',
    price: 899,
    category: 'Ayakkabı',
    color: 'Beyaz',
    inStock: true,
    sizes: ['36', '37', '38', '39', '40'],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
  },
  {
    id: '3',
    name: 'Trençkot',
    brand: 'Mango',
    price: 1299,
    category: 'Dış Giyim',
    color: 'Bej',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=300',
  },
  {
    id: '4',
    name: 'Sandalet',
    brand: 'Prada',
    price: 2499,
    category: 'Ayakkabı',
    color: 'Ten',
    inStock: false,
    sizes: ['36', '37', '38', '39'],
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300',
  },
];

// ✅ MOCK COMPONENTS
const FilterModal = ({ visible, onClose, onApplyFilters, products, currentFilters }) => {
  if (!visible) return null;
  return (
    <View style={styles.modalPlaceholder}>
      <Text style={styles.modalPlaceholderText}>🔍 Filtreleme</Text>
      <Text style={styles.modalPlaceholderSub}>Filtre seçenekleri yakında!</Text>
      <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
        <Text style={styles.modalCloseText}>Kapat</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProductCard = ({ product }) => (
  <View style={styles.productCardPlaceholder}>
    <Text style={styles.productCardBrand}>{product?.brand}</Text>
    <Text style={styles.productCardName}>{product?.name}</Text>
    <Text style={styles.productCardPrice}>₺{product?.price}</Text>
  </View>
);

const SearchResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialQuery = route.params?.query || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce effect
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filtreleme mantığı
  const filteredProducts = useMemo(() => {
    let results = [...mockData];
    
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase().trim();
      results = results.filter(product =>
        product?.name?.toLowerCase().includes(query) ||
        product?.brand?.toLowerCase().includes(query) ||
        product?.category?.toLowerCase().includes(query)
      );
    }
    
    if (filters) {
      if (filters.priceRange) {
        results = results.filter(product =>
          product?.price >= filters.priceRange[0] &&
          product?.price <= filters.priceRange[1]
        );
      }
      if (filters.categories?.length > 0) {
        results = results.filter(product =>
          filters.categories.includes(product?.category)
        );
      }
      if (filters.brands?.length > 0) {
        results = results.filter(product =>
          filters.brands.includes(product?.brand)
        );
      }
      if (filters.inStockOnly) {
        results = results.filter(product => product?.inStock === true);
      }
    }
    
    return results;
  }, [debouncedQuery, filters]);

  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(null);
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  const getActiveFilterCount = useCallback(() => {
    if (!filters) return 0;
    let count = 0;
    if (filters.priceRange && filters.priceRange[1] < 10000) count++;
    if (filters.categories?.length > 0) count++;
    if (filters.brands?.length > 0) count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters]);

  const activeFilterCount = getActiveFilterCount();

  const handleGoBack = useCallback(() => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else {
      Alert.alert('Bilgi', 'Geri dönülüyor...');
    }
  }, [navigation]);

  const SearchInput = useCallback(() => (
    <View style={styles.searchInputContainer}>
      <Ionicons name="search-outline" size={20} color={COLORS.ash} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Marka, ürün veya kategori ara..."
        placeholderTextColor={COLORS.ash}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        autoCapitalize="none"
        autoFocus={true}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={18} color={COLORS.ash} />
        </TouchableOpacity>
      )}
    </View>
  ), [searchQuery]);

  const FilterButton = useCallback(() => (
    <TouchableOpacity 
      style={[
        styles.filterButton,
        activeFilterCount > 0 && styles.filterButtonActive
      ]}
      onPress={() => setFilterModalVisible(true)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="filter-outline" 
        size={20} 
        color={activeFilterCount > 0 ? COLORS.charcoal : COLORS.white} 
      />
      <Text style={[
        styles.filterButtonText,
        activeFilterCount > 0 && styles.filterButtonTextActive
      ]}>
        Filtrele {activeFilterCount > 0 && `(${activeFilterCount})`}
      </Text>
    </TouchableOpacity>
  ), [activeFilterCount]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.searchWrapper}>
          <SearchInput />
        </View>
      </View>
    </View>
  ), [handleGoBack, SearchInput]);

  const renderProductItem = useCallback(({ item }) => (
    <View style={styles.productItem}>
      <ProductCard product={item} />
    </View>
  ), []);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color={COLORS.ash} />
      <Text style={styles.emptyStateTitle}>Ürün bulunamadı</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || filters ? 
          'Aradığınız kriterlere uygun ürün bulunamadı.' : 
          'Henüz hiç ürün bulunmuyor.'}
      </Text>
      {(searchQuery || filters) && (
        <TouchableOpacity 
          style={styles.tryAgainButton}
          onPress={clearFilters}
        >
          <Text style={styles.tryAgainText}>Filtreleri Temizle</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [searchQuery, filters, clearFilters]);

  const keyExtractor = useCallback((item, index) => item?.id?.toString() || index.toString(), []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.noir} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {renderHeader()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.cognac} />
            <Text style={styles.loadingText}>Aranıyor...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={keyExtractor}
            numColumns={2}
            contentContainerStyle={[
              styles.productsGrid,
              filteredProducts.length === 0 && styles.emptyGrid
            ]}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

        <View style={styles.fixedFilterContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.resultCount}>
              {filteredProducts.length} ürün bulundu
              {activeFilterCount > 0 && ` • ${activeFilterCount} filtre aktif`}
            </Text>
            <FilterButton />
          </View>

          {filters && activeFilterCount > 0 && (
            <View style={styles.activeFilters}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearFilters}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={16} color={COLORS.white} />
                <Text style={styles.clearButtonText}>Tüm Filtreleri Temizle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        products={mockData}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.noir,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.noir,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.charcoal,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  searchWrapper: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.charcoal,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.ash,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    paddingVertical: 8,
  },
  fixedFilterContainer: {
    backgroundColor: COLORS.noir,
    borderTopWidth: 1,
    borderTopColor: COLORS.charcoal,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultCount: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: COLORS.charcoal,
    borderWidth: 1,
    borderColor: COLORS.ash,
  },
  filterButtonActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  filterButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: COLORS.noir,
  },
  activeFilters: {
    alignItems: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.error,
    borderRadius: 20,
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  productsGrid: {
    padding: 8,
    paddingBottom: 16,
  },
  emptyGrid: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  productItem: {
    flex: 1,
    margin: 4,
    maxWidth: (width - 24) / 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    marginTop: 12,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: height * 0.5,
  },
  emptyStateTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    color: COLORS.ash,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  tryAgainButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.cognac,
    borderRadius: 8,
  },
  tryAgainText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalPlaceholderText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalPlaceholderSub: {
    color: COLORS.ash,
    fontSize: 16,
    marginBottom: 30,
  },
  modalCloseButton: {
    backgroundColor: COLORS.cognac,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  modalCloseText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  productCardPlaceholder: {
    padding: 16,
    backgroundColor: COLORS.charcoal,
    borderRadius: 8,
    alignItems: 'center',
    margin: 4,
  },
  productCardBrand: {
    color: COLORS.ash,
    fontSize: 12,
    marginBottom: 4,
  },
  productCardName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  productCardPrice: {
    color: COLORS.cognac,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SearchResultsScreen;