// 📁 src/components/ShopGrid.js - SADECE REVİZE
import React, { useState, useContext, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 📏 Ekran boyutları
const { width } = Dimensions.get('window');

// 🎨 Renk paleti (App.js ile uyumlu - cognac düzeltildi)
const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  porcelain: '#FAFAFA',
  ash: '#888888',
  charcoal: '#222222',
  cloud: '#F0F0F0',
  gold: '#C4A747',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
  error: '#F44336',
};

// 📝 Font stilleri
const FONTS = {
  h4: { fontSize: 18, fontWeight: '300' },
  body1: { fontSize: 16, lineHeight: 24 },
  body2: { fontSize: 14, lineHeight: 20 },
  body3: { fontSize: 13, lineHeight: 18 },
  body4: { fontSize: 12, lineHeight: 16 },
};

// ✅ FavoritesContext import (güvenli)
let FavoritesContext;
try {
  FavoritesContext = require('../context/FavoritesContext').FavoritesContext;
} catch (error) {
  console.warn('FavoritesContext bulunamadı, mock context kullanılacak');
  FavoritesContext = React.createContext({
    favorites: [],
    addToFavorites: () => {},
    removeFromFavorites: () => {},
  });
}

// ✅ Mock products (güvenli)
let mockProducts = [];
let categories = [];

try {
  const mockData = require('../data/mockProducts');
  mockProducts = mockData.mockProducts || [];
  categories = mockData.categories || [
    { id: 1, name: 'Luxury', icon: 'diamond-outline' },
    { id: 2, name: 'Street', icon: 'walk-outline' },
    { id: 3, name: 'Casual', icon: 'shirt-outline' },
    { id: 4, name: 'Sport', icon: 'fitness-outline' },
  ];
} catch (error) {
  console.warn('mockProducts bulunamadı, örnek veriler kullanılacak');
  mockProducts = [
    {
      id: 1,
      name: 'Oversize Cotton Shirt',
      brand: 'ZARA',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      category: 'Casual',
      rating: 4.5,
      reviews: 124,
      fabric: '100% Cotton',
      color: 'White',
      aiMatch: '98%'
    },
    {
      id: 2,
      name: 'Leather Biker Jacket',
      brand: 'MANGO',
      price: 799.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
      category: 'Luxury',
      rating: 4.8,
      reviews: 89,
      fabric: 'Reclaimed Leather',
      color: 'Black',
      aiMatch: '95%'
    },
  ];
  categories = [
    { id: 1, name: 'Luxury', icon: 'diamond-outline' },
    { id: 2, name: 'Street', icon: 'walk-outline' },
    { id: 3, name: 'Casual', icon: 'shirt-outline' },
    { id: 4, name: 'Sport', icon: 'fitness-outline' },
  ];
}

const ShopGrid = () => {
  const navigation = useNavigation();
  const context = useContext(FavoritesContext);
  
  const favorites = context?.favorites || [];
  const addToFavorites = context?.addToFavorites || (() => {});
  const removeFromFavorites = context?.removeFromFavorites || (() => {});
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = useMemo(() => {
    return mockProducts
      .filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch = searchText === '' || 
          product.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchText.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low': return (a.price || 0) - (b.price || 0);
          case 'price-high': return (b.price || 0) - (a.price || 0);
          case 'newest': return (b.id || 0) - (a.id || 0);
          case 'featured': 
          default: 
            const aIsFavorite = favorites.some(fav => fav?.id === a.id);
            const bIsFavorite = favorites.some(fav => fav?.id === b.id);
            if (aIsFavorite && !bIsFavorite) return -1;
            if (!aIsFavorite && bIsFavorite) return 1;
            return (b.rating || 0) - (a.rating || 0);
        }
      });
  }, [selectedCategory, searchText, sortBy, favorites]);

  const toggleFavorite = useCallback((item) => {
    const isFavorite = favorites.some(fav => fav?.id === item.id);
    if (isFavorite) {
      removeFromFavorites(item.id);
      Alert.alert('⛔️ Kaldırıldı', `${item.name} favorilerden çıkarıldı.`);
    } else {
      addToFavorites(item);
      Alert.alert('💎 Eklendi', `${item.name} favorilere eklendi.`);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  const goToProductDetail = useCallback((item) => {
    navigation.navigate('ProductDetail', { product: item });
  }, [navigation]);

  const addToCart = useCallback((item) => {
    Alert.alert(
      '🛒 Sepete Eklendi',
      `${item.name} sepete eklendi.`,
      [
        { text: 'Alışverişe Devam Et', style: 'cancel' },
        { text: 'Sepete Git', onPress: () => Alert.alert('Sepet', 'Sepet sayfası açılıyor...') }
      ]
    );
  }, [navigation]);

  const changeSortBy = useCallback(() => {
    const sortOptions = ['featured', 'newest', 'price-low', 'price-high'];
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex]);
  }, [sortBy]);

  const renderGridItem = useCallback(({ item }) => {
    const isFavorite = favorites.some(fav => fav?.id === item.id);
    
    return (
      <View style={styles.gridItem}>
        <TouchableOpacity 
          style={styles.productCard}
          onPress={() => goToProductDetail(item)}
          activeOpacity={0.9}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={isFavorite ? "diamond" : "diamond-outline"} 
                size={20} 
                color={isFavorite ? COLORS.gold : COLORS.white} 
              />
            </TouchableOpacity>
            
            {item.aiMatch && (
              <View style={styles.aiBadge}>
                <Ionicons name="color-wand-outline" size={12} color={COLORS.black} />
                <Text style={styles.aiBadgeText}>{item.aiMatch}</Text>
              </View>
            )}
            
            {item.id <= 5 && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>
          
          <View style={styles.productInfo}>
            <Text style={styles.brand}>{item.brand}</Text>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            
            <View style={styles.ratingContainer}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
              <Text style={styles.reviews}>({item.reviews})</Text>
            </View>
            
            <Text style={styles.price}>€{item.price}</Text>
            <Text style={styles.details}>{item.fabric} • {item.color}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => addToCart(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="bag-outline" size={16} color={COLORS.white} />
          <Text style={styles.addToCartText}>ADD TO BAG</Text>
        </TouchableOpacity>
      </View>
    );
  }, [favorites, toggleFavorite, goToProductDetail, addToCart]);

  const renderListItem = useCallback(({ item }) => {
    const isFavorite = favorites.some(fav => fav?.id === item.id);
    
    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => goToProductDetail(item)}
        activeOpacity={0.9}
      >
        <View style={styles.listImageContainer}>
          <Image source={{ uri: item.image }} style={styles.listImage} />
          
          <TouchableOpacity 
            style={styles.listFavoriteButton}
            onPress={() => toggleFavorite(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isFavorite ? "diamond" : "diamond-outline"} 
              size={18} 
              color={isFavorite ? COLORS.gold : COLORS.charcoal} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.listInfo}>
          <View style={styles.listHeader}>
            <Text style={styles.listBrand}>{item.brand}</Text>
            {item.id <= 5 && (
              <View style={styles.listNewBadge}>
                <Text style={styles.listNewBadgeText}>NEW</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.listName} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.listMeta}>
            <View style={styles.listRating}>
              <Text style={styles.listRatingText}>{item.rating}</Text>
              <Ionicons name="star" size={14} color={COLORS.gold} />
            </View>
            <Text style={styles.listFabric}>{item.fabric}</Text>
          </View>
          
          <View style={styles.listFooter}>
            <Text style={styles.listPrice}>€{item.price}</Text>
            <View style={styles.listActions}>
              <TouchableOpacity 
                style={styles.listWishlistButton}
                onPress={() => toggleFavorite(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name={isFavorite ? "briefcase" : "briefcase-outline"} 
                  size={20} 
                  color={isFavorite ? COLORS.cognac : COLORS.ash} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.listCartButton}
                onPress={() => addToCart(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="bag-outline" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [favorites, toggleFavorite, goToProductDetail, addToCart]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.ash} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search collections..."
          placeholderTextColor={COLORS.ash}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={COLORS.ash} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersRow}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === 'all' && styles.selectedCategoryPill
            ]}
            onPress={() => setSelectedCategory('all')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.categoryPillText,
              selectedCategory === 'all' && styles.selectedCategoryPillText
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryPill,
                selectedCategory === category.name && styles.selectedCategoryPill
              ]}
              onPress={() => setSelectedCategory(category.name)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={category.icon} 
                size={16} 
                color={selectedCategory === category.name ? COLORS.white : COLORS.ash} 
                style={styles.categoryIcon}
              />
              <Text style={[
                styles.categoryPillText,
                selectedCategory === category.name && styles.selectedCategoryPillText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={changeSortBy}
            activeOpacity={0.7}
          >
            <Ionicons name="funnel-outline" size={18} color={COLORS.charcoal} />
            <Text style={styles.sortText}>
              {sortBy === 'featured' && 'Featured'}
              {sortBy === 'price-low' && 'Price: Low'}
              {sortBy === 'price-high' && 'Price: High'}
              {sortBy === 'newest' && 'Newest'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.ash} />
          </TouchableOpacity>
          
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'grid' && styles.activeViewButton]}
              onPress={() => setViewMode('grid')}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons 
                name="grid-outline" 
                size={18} 
                color={viewMode === 'grid' ? COLORS.charcoal : COLORS.ash} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'list' && styles.activeViewButton]}
              onPress={() => setViewMode('list')}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons 
                name="list-outline" 
                size={18} 
                color={viewMode === 'list' ? COLORS.charcoal : COLORS.ash} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} items
        </Text>
        <Text style={styles.selectedCategoryText}>
          {selectedCategory === 'all' ? 'All collections' : selectedCategory}
        </Text>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridColumnWrapper : null}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        key={viewMode}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={COLORS.ash} />
            <Text style={styles.emptyTitle}>Ürün bulunamadı</Text>
            <Text style={styles.emptyText}>Farklı bir kategori veya arama terimi deneyin.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.porcelain,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.cloud,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    ...FONTS.body2,
    color: COLORS.charcoal,
    padding: 0,
  },
  filtersRow: {
    marginBottom: 16,
  },
  categoriesScroll: {
    marginBottom: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  selectedCategoryPill: {
    backgroundColor: COLORS.cognac,
    borderColor: COLORS.cognac,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryPillText: {
    ...FONTS.body3,
    color: COLORS.ash,
  },
  selectedCategoryPillText: {
    color: COLORS.white,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cloud,
    gap: 8,
  },
  sortText: {
    ...FONTS.body3,
    color: COLORS.charcoal,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeViewButton: {
    backgroundColor: COLORS.porcelain,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
  },
  resultsText: {
    ...FONTS.body1,
    fontWeight: '500',
    color: COLORS.charcoal,
  },
  selectedCategoryText: {
    ...FONTS.body3,
    color: COLORS.ash,
  },
  productsList: {
    paddingBottom: 100,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.porcelain,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  aiBadgeText: {
    ...FONTS.body4,
    fontWeight: '700',
    color: COLORS.black,
  },
  newBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    ...FONTS.body4,
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  productInfo: {
    padding: 12,
  },
  brand: {
    ...FONTS.body4,
    fontWeight: '600',
    color: COLORS.ash,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  name: {
    ...FONTS.body2,
    fontWeight: '400',
    color: COLORS.charcoal,
    marginBottom: 8,
    height: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  ratingBadge: {
    backgroundColor: COLORS.porcelain,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  ratingText: {
    ...FONTS.body4,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  reviews: {
    ...FONTS.body4,
    color: COLORS.ash,
  },
  price: {
    ...FONTS.h4,
    fontWeight: '300',
    color: COLORS.charcoal,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  details: {
    ...FONTS.body4,
    color: COLORS.ash,
    fontStyle: 'italic',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cognac,
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
    borderRadius: 6,
  },
  addToCartText: {
    ...FONTS.body3,
    fontWeight: '500',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  listImageContainer: {
    position: 'relative',
  },
  listImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.porcelain,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  listFavoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listBrand: {
    ...FONTS.body3,
    fontWeight: '600',
    color: COLORS.ash,
  },
  listNewBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  listNewBadgeText: {
    ...FONTS.body4,
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  listName: {
    ...FONTS.body1,
    fontWeight: '400',
    color: COLORS.charcoal,
    marginBottom: 8,
    height: 40,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  listRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listRatingText: {
    ...FONTS.body3,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  listFabric: {
    ...FONTS.body4,
    color: COLORS.ash,
    fontStyle: 'italic',
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listPrice: {
    ...FONTS.h4,
    fontWeight: '300',
    color: COLORS.charcoal,
    letterSpacing: 0.5,
  },
  listActions: {
    flexDirection: 'row',
    gap: 8,
  },
  listWishlistButton: {
    padding: 8,
    backgroundColor: COLORS.porcelain,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  listCartButton: {
    padding: 8,
    backgroundColor: COLORS.cognac,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cognac,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.ash,
    textAlign: 'center',
  },
});

export default ShopGrid;