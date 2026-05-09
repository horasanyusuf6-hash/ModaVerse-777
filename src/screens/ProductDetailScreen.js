// 📁 src/screens/ProductDetailScreen.js - SADECE HATALAR DÜZELTİLDİ
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ScrollView, 
  View, 
  StyleSheet, 
  Text, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform
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

// ✅ MOCK FAVORİTE FUNCTIONS (Context olmadan çalışsın)
const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  
  const toggleFavorite = useCallback((product) => {
    setFavoriteIds(prev => 
      prev.includes(product.id) 
        ? prev.filter(id => id !== product.id)
        : [...prev, product.id]
    );
  }, []);
  
  const isFavorite = useCallback((id) => favoriteIds.includes(id), [favoriteIds]);
  
  return { toggleFavorite, isFavorite };
};

// ✅ MOCK COMPONENTS (eksik dosyalar için)
const ProductGallery = ({ product, onFavoritePress, isFavorite }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Galeri: {product.name}</Text>
    <TouchableOpacity onPress={onFavoritePress}>
      <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? COLORS.like : COLORS.ash} />
    </TouchableOpacity>
  </View>
);

const ProductInfo = ({ product }) => (
  <View style={styles.productInfoContainer}>
    <Text style={styles.brand}>{product.brand}</Text>
    <Text style={styles.productName}>{product.name}</Text>
    <View style={styles.priceRow}>
      <Text style={styles.price}>₺{product.price}</Text>
      {product.originalPrice && (
        <Text style={styles.originalPrice}>₺{product.originalPrice}</Text>
      )}
    </View>
    <Text style={styles.description}>{product.description}</Text>
  </View>
);

const SizeSelector = ({ onSizeSelect, sizes, selectedSize }) => (
  <View style={styles.sizeContainer}>
    <Text style={styles.sectionTitle}>Beden Seçimi</Text>
    <View style={styles.sizeList}>
      {sizes.map(size => (
        <TouchableOpacity
          key={size}
          style={[styles.sizeButton, selectedSize === size && styles.sizeButtonActive]}
          onPress={() => onSizeSelect(size)}
        >
          <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextActive]}>{size}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const AddToCartButton = ({ product, selectedSize, quantity, onPress }) => (
  <TouchableOpacity 
    style={[styles.addToCartButton, !selectedSize && styles.addToCartDisabled]}
    onPress={onPress}
    disabled={!selectedSize}
  >
    <Text style={styles.addToCartText}>Sepete Ekle - ₺{product.price * quantity}</Text>
  </TouchableOpacity>
);

const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Ürün yükleme
  useEffect(() => {
    setLoading(true);
    
    if (route.params?.product) {
      setProduct(route.params.product);
    } else if (route.params?.productId) {
      const mockProduct = {
        id: route.params.productId || '1',
        name: 'Minimalist Siyah Elbise',
        brand: 'PRADA',
        price: 2999,
        originalPrice: 3999,
        description: 'Premium kumaştan üretilmiş, minimalist tasarım siyah elbise. Özel günler için ideal.',
        images: [
          'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400',
          'https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=400',
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
        ],
        fabric: 'Pamuk',
        color: 'Siyah',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        stock: 15,
        rating: 4.8,
        reviews: 124,
        category: 'Elbise',
        season: 'Yaz',
        careInstructions: '30°C yıkama, ütüleme yapmayın',
        inStock: true,
      };
      setProduct(mockProduct);
    }
    
    setLoading(false);
  }, [route.params]);

  const handleGoBack = useCallback(() => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleSizeSelect = useCallback((size) => {
    setSelectedSize(size);
  }, []);

  const handleFavoritePress = useCallback(() => {
    if (product) {
      toggleFavorite(product);
      Alert.alert(
        isFavorite(product.id) ? '❤️ Favorilerden Çıkarıldı' : '❤️ Favorilere Eklendi',
        `${product.name} ${isFavorite(product.id) ? 'favorilerden çıkarıldı' : 'favorilere eklendi'}.`
      );
    }
  }, [product, toggleFavorite, isFavorite]);

  const increaseQuantity = useCallback(() => setQuantity(prev => prev + 1), []);
  const decreaseQuantity = useCallback(() => setQuantity(prev => Math.max(1, prev - 1)), []);

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) {
      Alert.alert('Beden Seçin', 'Lütfen bir beden seçin.');
      return;
    }
    
    Alert.alert(
      '🛒 Sepete Eklendi',
      `${product.name} (${selectedSize}) - ${quantity} adet sepete eklendi.`,
      [
        { text: 'Alışverişe Devam Et', style: 'cancel' },
        { text: 'Sepete Git', onPress: () => navigation.navigate('Sepet') }
      ]
    );
  }, [product, selectedSize, quantity, navigation]);

  const Header = useCallback(() => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={handleGoBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={24} color={COLORS.charcoal} />
      </TouchableOpacity>
      
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => Alert.alert('Arama', 'Arama sayfası açılıyor...')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="search-outline" size={24} color={COLORS.charcoal} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => Alert.alert('Sepet', 'Sepet sayfası açılıyor...')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="cart-outline" size={24} color={COLORS.charcoal} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  ), [handleGoBack]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <ActivityIndicator size="large" color={COLORS.cognac} />
        <Text style={styles.loadingText}>Ürün yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorTitle}>Ürün bulunamadı</Text>
        <Text style={styles.errorText}>İstediğiniz ürün mevcut değil.</Text>
        <TouchableOpacity style={styles.errorButton} onPress={handleGoBack}>
          <Text style={styles.errorButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <Header />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProductGallery 
          product={product} 
          onFavoritePress={handleFavoritePress} 
          isFavorite={isFavorite(product.id)} 
        />

        <ProductInfo product={product} />

        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Miktar</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.ash : COLORS.charcoal} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{quantity}</Text>
            
            <TouchableOpacity 
              style={[styles.quantityButton, product.stock && quantity >= product.stock && styles.quantityButtonDisabled]}
              onPress={increaseQuantity}
              disabled={product.stock && quantity >= product.stock}
            >
              <Ionicons name="add" size={20} color={(product.stock && quantity >= product.stock) ? COLORS.ash : COLORS.charcoal} />
            </TouchableOpacity>
          </View>
          {product.stock && (
            <Text style={styles.stockText}>{product.stock} adet stokta</Text>
          )}
        </View>

        <SizeSelector 
          onSizeSelect={handleSizeSelect} 
          sizes={product.sizes || ['XS', 'S', 'M', 'L', 'XL']}
          selectedSize={selectedSize}
        />

        <View style={styles.deliverySection}>
          <View style={styles.deliveryItem}>
            <Ionicons name="cube-outline" size={20} color={COLORS.cognac} />
            <Text style={styles.deliveryText}>Ücretsiz kargo</Text>
          </View>
          <View style={styles.deliveryItem}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.cognac} />
            <Text style={styles.deliveryText}>1-3 iş günü teslimat</Text>
          </View>
          <View style={styles.deliveryItem}>
            <Ionicons name="swap-horizontal-outline" size={20} color={COLORS.cognac} />
            <Text style={styles.deliveryText}>14 gün iade garantisi</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedBottom}>
        <AddToCartButton 
          product={product} 
          selectedSize={selectedSize}
          quantity={quantity}
          onPress={handleAddToCart}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.ash,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.ash,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: COLORS.cognac,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
    backgroundColor: COLORS.white,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.cognac,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  quantitySection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.porcelain,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.charcoal,
    minWidth: 30,
    textAlign: 'center',
  },
  stockText: {
    fontSize: 14,
    color: COLORS.success,
    marginTop: 8,
  },
  deliverySection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: COLORS.porcelain,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  deliveryText: {
    fontSize: 14,
    color: COLORS.charcoal,
  },
  fixedBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.cloud,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  placeholder: {
    padding: 20,
    backgroundColor: COLORS.porcelain,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.ash,
  },
  productInfoContainer: {
    padding: 16,
  },
  brand: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.cognac,
    letterSpacing: 1,
    marginBottom: 4,
  },
  productName: {
    fontSize: 22,
    fontWeight: '300',
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '400',
    color: COLORS.charcoal,
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: '300',
    color: COLORS.ash,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    color: COLORS.ash,
    lineHeight: 20,
  },
  sizeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
  },
  sizeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sizeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.porcelain,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  sizeButtonActive: {
    backgroundColor: COLORS.cognac,
    borderColor: COLORS.cognac,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.charcoal,
  },
  sizeTextActive: {
    color: COLORS.white,
  },
  addToCartButton: {
    backgroundColor: COLORS.cognac,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartDisabled: {
    backgroundColor: COLORS.ash,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;