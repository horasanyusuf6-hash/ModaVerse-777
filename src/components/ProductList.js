import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';

// 🎨 Renk paleti (App.js ile uyumlu - cognac düzeltildi)
const COLORS = {
  white: '#FFFFFF',
  noir: '#000000',
  charcoal: '#222222',
  ash: '#888888',
  cloud: '#333333',
  cognac: '#8C7853',  // ✅ DÜZELTİLDİ
  accent: '#8C7853',
  error: '#F44336',
};

// 📏 Ekran boyutları
const { width } = Dimensions.get('window');

// ✅ ProductCard import (güvenli)
let ProductCard;
try {
  ProductCard = require('./ProductCard').default;
} catch (error) {
  console.warn('ProductCard bulunamadı, placeholder kullanılacak');
  ProductCard = ({ product }) => (
    <View style={styles.productCardPlaceholder}>
      <Text style={styles.productCardPlaceholderText}>{product?.name || 'Ürün'}</Text>
    </View>
  );
}

const ProductList = ({ 
  products = [], 
  showFilters = true,
  numColumns = 2,
  onProductPress,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
  columnWrapperStyle,
  ...restProps 
}) => {
  
  // Boş durum
  if (!products || products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Ürün bulunamadı</Text>
        <Text style={styles.emptyText}>
          Farklı bir filtre veya arama terimi deneyin.
        </Text>
      </View>
    );
  }

  // Sütun genişliğini hesapla
  const columnWidth = (width - (numColumns + 1) * 16) / numColumns;

  // Ürün render
  const renderProductItem = ({ item, index }) => {
    if (!item || !item.id) return null;
    
    return (
      <ProductCard 
        product={item} 
        style={[
          styles.productCard, 
          { width: columnWidth },
          index % numColumns !== numColumns - 1 && styles.productCardMargin
        ]}
        onPress={() => onProductPress && onProductPress(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header - Filtre bilgisi */}
      {showFilters && (
        <View style={styles.header}>
          <Text style={styles.resultCount}>
            {products.length} ürün listeleniyor
          </Text>
        </View>
      )}
      
      {/* Ürün Grid */}
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        numColumns={numColumns}
        contentContainerStyle={[styles.productsGrid, contentContainerStyle]}
        columnWrapperStyle={numColumns > 1 ? [styles.columnWrapper, columnWrapperStyle] : undefined}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        key={`grid-${numColumns}`}
        {...restProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.noir,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
  },
  resultCount: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  productsGrid: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    flex: 1,
  },
  productCardMargin: {
    marginRight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 200,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.ash,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  productCardPlaceholder: {
    padding: 20,
    backgroundColor: COLORS.cloud,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  productCardPlaceholderText: {
    color: COLORS.white,
    fontSize: 14,
  },
});

export default ProductList;