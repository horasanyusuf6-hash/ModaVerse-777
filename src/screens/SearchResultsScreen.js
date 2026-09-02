// 📁 src/screens/SearchResultsScreen.js - LÜKS MİNİMALİST VERSİYON
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
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

// MOCK DATA
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
    isNew: true,
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
    isNew: false,
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
    isNew: true,
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
    isNew: false,
  },
];

// ============ FİLTRE MODALI ============
const FilterModal = ({ visible, onClose, onApplyFilters, products, currentFilters }) => {
  if (!visible) return null;
  return (
    <View style={styles.modalPlaceholder}>
      <View style={styles.modalCard}>
        <Ionicons name="filter-outline" size={40} color={COLORS.grayMedium} />
        <Text style={styles.modalPlaceholderText}>FİLTRELEME</Text>
        <Text style={styles.modalPlaceholderSub}>Gelişmiş filtreleme seçenekleri yakında!</Text>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseText}>KAPAT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============ ÜRÜN KARTI ============
const ProductCard = ({ product, onPress }) => {
  const formatPrice = (price) => {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      {product.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>YENİ</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.productPrice}>₺{formatPrice(product.price)}</Text>
        {!product.inStock && (
          <Text style={styles.outOfStockText}>STOKTA YOK</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ============ ANA BİLEŞEN ============
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

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const SearchInput = useCallback(() => (
    <View style={styles.searchInputContainer}>
      <Ionicons name="search-outline" size={16} color={COLORS.grayMedium} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Marka, ürün veya kategori ara..."
        placeholderTextColor={COLORS.grayMedium}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        autoCapitalize="none"
        autoFocus={true}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={14} color={COLORS.grayMedium} />
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
        size={14} 
        color={activeFilterCount > 0 ? COLORS.white : COLORS.black} 
      />
      <Text style={[
        styles.filterButtonText,
        activeFilterCount > 0 && styles.filterButtonTextActive
      ]}>
        FİLTRELE {activeFilterCount > 0 && `(${activeFilterCount})`}
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
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
        </TouchableOpacity>
        
        <View style={styles.searchWrapper}>
          <SearchInput />
        </View>
      </View>
    </View>
  ), [handleGoBack, SearchInput]);

  const renderProductItem = useCallback(({ item }) => (
    <View style={styles.productItem}>
      <ProductCard product={item} onPress={() => handleProductPress(item)} />
    </View>
  ), []);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="search-outline" size={40} color={COLORS.grayMedium} />
      </View>
      <Text style={styles.emptyStateTitle}>ÜRÜN BULUNAMADI</Text>
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
          <Text style={styles.tryAgainText}>FİLTRELERİ TEMİZLE</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [searchQuery, filters, clearFilters]);

  const keyExtractor = useCallback((item, index) => item?.id?.toString() || index.toString(), []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {renderHeader()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.black} />
            <Text style={styles.loadingText}>ARANIYOR...</Text>
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
              {filteredProducts.length} ÜRÜN BULUNDU
              {activeFilterCount > 0 && ` • ${activeFilterCount} FİLTRE AKTİF`}
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
                <Ionicons name="close" size={10} color={COLORS.white} />
                <Text style={styles.clearButtonText}>TÜM FİLTRELERİ TEMİZLE</Text>
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

// ============ STILLER ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 8 : SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.xs,
  },
  searchWrapper: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.md,
    height: 44,
  },
  searchIcon: {
    marginRight: SIZES.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    paddingVertical: SIZES.xs,
  },
  fixedFilterContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
  },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  resultCount: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
  },
  filterButtonActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  filterButtonText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.black,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  activeFilters: {
    alignItems: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    backgroundColor: COLORS.black,
  },
  clearButtonText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.white,
  },
  productsGrid: {
    padding: SIZES.sm,
    paddingBottom: SIZES.md,
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
  productCard: {
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    margin: 4,
  },
  productImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: SIZES.md,
  },
  productBrand: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    marginBottom: 2,
  },
  productName: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
  },
  newBadge: {
    position: 'absolute',
    top: SIZES.sm,
    left: SIZES.sm,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
  },
  newBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.black,
  },
  outOfStockText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    marginTop: SIZES.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
    minHeight: height * 0.5,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.caption,
    marginTop: SIZES.sm,
    marginBottom: 2,
  },
  emptyStateText: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    lineHeight: 18,
  },
  tryAgainButton: {
    marginTop: SIZES.lg,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
  },
  tryAgainText: {
    ...TYPOGRAPHY.button,
    color: COLORS.black,
  },
  modalPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.xl,
    width: width * 0.8,
  },
  modalPlaceholderText: {
    ...TYPOGRAPHY.caption,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  modalPlaceholderSub: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  modalCloseButton: {
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
  },
  modalCloseText: {
    ...TYPOGRAPHY.button,
    color: COLORS.black,
  },
});

export default SearchResultsScreen;