// 📁 src/screens/ProductDetailScreen.js - REVİZE (Geri Butonu Kaldırıldı, Header Tamamen Kaldırıldı)
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Image,
  FlatList,
  Platform,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

const STORAGE_KEYS = {
  FAVORITES: '@user_favorites',
  CART: '@user_cart',
};

// ============ ÜRÜN GALERİSİ BİLEŞENİ ============
const ProductGallery = ({ images, onFavoritePress, isFavorite }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  return (
    <View style={styles.galleryContainer}>
      <FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        data={images}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.galleryImage} />
        )}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      
      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
      
      <TouchableOpacity style={styles.favoriteButton} onPress={onFavoritePress}>
        <Ionicons 
          name={isFavorite ? "heart" : "heart-outline"} 
          size={18} 
          color={isFavorite ? COLORS.black : COLORS.white} 
        />
      </TouchableOpacity>
    </View>
  );
};

// ============ ÜRÜN BİLGİLERİ BİLEŞENİ ============
const ProductInfo = ({ product }) => {
  const formatPrice = (price) => {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <View style={styles.productInfoContainer}>
      <View style={styles.brandContainer}>
        <Text style={styles.brand}>{product.brand}</Text>
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>YENİ</Text>
          </View>
        )}
      </View>
      <Text style={styles.productName}>{product.name}</Text>
      
      <View style={styles.priceRow}>
        <Text style={styles.price}>₺{formatPrice(product.price)}</Text>
        {product.originalPrice && (
          <Text style={styles.originalPrice}>₺{formatPrice(product.originalPrice)}</Text>
        )}
      </View>
      
      <Text style={styles.description}>{product.description}</Text>
      
      <View style={styles.ratingContainer}>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons 
              key={star} 
              name="star" 
              size={12} 
              color={star <= (product.rating || 4.8) ? COLORS.black : COLORS.grayLight} 
            />
          ))}
        </View>
        <Text style={styles.ratingText}>
          {product.rating || 4.8} ({product.reviews || 128} DEĞERLENDİRME)
        </Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="shirt-outline" size={14} color={COLORS.grayMedium} />
          <Text style={styles.detailText}>{product.category || 'GİYİM'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="water-outline" size={14} color={COLORS.grayMedium} />
          <Text style={styles.detailText}>{product.material || 'PAMUK'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="resize-outline" size={14} color={COLORS.grayMedium} />
          <Text style={styles.detailText}>{product.fit || 'REGULAR'}</Text>
        </View>
      </View>
    </View>
  );
};

// ============ BEDEN SEÇİCİ BİLEŞENİ ============
const SizeSelector = ({ sizes, selectedSize, onSelect }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>BEDEN SEÇİMİ</Text>
    <View style={styles.sizeList}>
      {sizes.map(size => (
        <TouchableOpacity
          key={size}
          style={[styles.sizeButton, selectedSize === size && styles.sizeButtonActive]}
          onPress={() => onSelect(size)}
        >
          <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextActive]}>{size}</Text>
        </TouchableOpacity>
      ))}
    </View>
    {!selectedSize && (
      <Text style={styles.warningText}>LÜTFEN BİR BEDEN SEÇİN</Text>
    )}
  </View>
);

// ============ MİKTAR SEÇİCİ BİLEŞENİ ============
const QuantitySelector = ({ quantity, onIncrease, onDecrease, maxStock }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>MİKTAR</Text>
    <View style={styles.quantityContainer}>
      <TouchableOpacity 
        style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
        onPress={onDecrease}
        disabled={quantity <= 1}
      >
        <Ionicons name="remove" size={14} color={quantity <= 1 ? COLORS.grayMedium : COLORS.black} />
      </TouchableOpacity>
      
      <Text style={styles.quantityText}>{quantity}</Text>
      
      <TouchableOpacity 
        style={[styles.quantityButton, quantity >= maxStock && styles.quantityButtonDisabled]}
        onPress={onIncrease}
        disabled={quantity >= maxStock}
      >
        <Ionicons name="add" size={14} color={quantity >= maxStock ? COLORS.grayMedium : COLORS.black} />
      </TouchableOpacity>
    </View>
    <Text style={styles.stockText}>STOKTA {maxStock} ADET</Text>
  </View>
);

// ============ TESLİMAT BİLGİSİ BİLEŞENİ ============
const DeliveryInfo = () => (
  <View style={styles.deliveryContainer}>
    <View style={styles.deliveryItem}>
      <View style={styles.deliveryIcon}>
        <Ionicons name="cube-outline" size={14} color={COLORS.black} />
      </View>
      <View>
        <Text style={styles.deliveryTitle}>ÜCRETSİZ KARGO</Text>
        <Text style={styles.deliverySubtext}>250 TL ve üzeri siparişlerde</Text>
      </View>
    </View>
    <View style={styles.deliveryItem}>
      <View style={styles.deliveryIcon}>
        <Ionicons name="calendar-outline" size={14} color={COLORS.black} />
      </View>
      <View>
        <Text style={styles.deliveryTitle}>HIZLI TESLİMAT</Text>
        <Text style={styles.deliverySubtext}>1-3 iş günü</Text>
      </View>
    </View>
    <View style={styles.deliveryItem}>
      <View style={styles.deliveryIcon}>
        <Ionicons name="swap-horizontal-outline" size={14} color={COLORS.black} />
      </View>
      <View>
        <Text style={styles.deliveryTitle}>KOLAY İADE</Text>
        <Text style={styles.deliverySubtext}>14 gün iade garantisi</Text>
      </View>
    </View>
  </View>
);

// ============ ANA BİLEŞEN ============
const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  useEffect(() => {
    loadProduct();
    loadCartCount();
  }, []);
  
  const loadProduct = async () => {
    setLoading(true);
    
    let currentProduct;
    if (route.params?.product) {
      currentProduct = route.params.product;
    } else if (route.params?.productId) {
      currentProduct = {
        id: route.params.productId,
        name: 'Oversize Blazer',
        brand: 'ZARA',
        price: 799,
        originalPrice: 999,
        description: 'Modern ve şık oversize blazer, iş toplantılarından günlük kombinlere kadar her ortamda tercih edebileceğiniz bir parça. Yün karışımı kumaşı ile rahat ve şık.',
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
        images: [
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
          'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=400',
          'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=400',
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        stock: 15,
        rating: 4.8,
        reviews: 128,
        category: 'Blazer',
        material: 'Yün',
        fit: 'Oversize',
        isNew: true
      };
    }
    
    setProduct(currentProduct);
    
    const favorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (favorites) {
      const favList = JSON.parse(favorites);
      setIsFavorite(favList.includes(currentProduct.id));
    }
    
    setLoading(false);
  };
  
  const loadCartCount = async () => {
    const cart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
    if (cart) {
      setCartCount(JSON.parse(cart).length);
    }
  };
  
  const handleFavoritePress = async () => {
    try {
      const favorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      let favList = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        favList = favList.filter(id => id !== product.id);
        Alert.alert('Favorilerden Çıkarıldı', `${product.name} favorilerinizden çıkarıldı.`);
      } else {
        favList.push(product.id);
        Alert.alert('Favorilere Eklendi', `${product.name} favorilerinize eklendi!`);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favList));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Favori hatası:', error);
    }
  };
  
  const handleAddToCart = async () => {
    if (!selectedSize) {
      Alert.alert('Beden Seçimi', 'Lütfen bir beden seçin.');
      return;
    }
    
    try {
      const cart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      let cartList = cart ? JSON.parse(cart) : [];
      
      const cartItem = {
        id: `${product.id}_${selectedSize}_${Date.now()}`,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.images?.[0] || product.image,
        size: selectedSize,
        quantity: quantity,
        addedAt: new Date().toISOString()
      };
      
      cartList.push(cartItem);
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartList));
      setCartCount(cartList.length);
      
      Alert.alert(
        'Sepete Eklendi!',
        `${product.name} (${selectedSize}) - ${quantity} adet sepete eklendi.`,
        [
          { text: 'Alışverişe Devam Et', style: 'cancel' },
          { text: 'Sepete Git', onPress: () => navigation.navigate('Cart') }
        ]
      );
    } catch (error) {
      console.error('Sepet hatası:', error);
      Alert.alert('Hata', 'Ürün sepete eklenemedi');
    }
  };
  
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else {
      Alert.alert('Stok Bilgisi', 'Stokta yeterli ürün yok.');
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const formatPrice = (price) => {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <ActivityIndicator size="large" color={COLORS.black} />
        <Text style={styles.loadingText}>YÜKLENİYOR...</Text>
      </SafeAreaView>
    );
  }
  
  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.errorIconContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.grayMedium} />
        </View>
        <Text style={styles.errorTitle}>ÜRÜN BULUNAMADI</Text>
        <Text style={styles.errorText}>İstediğiniz ürün mevcut değil.</Text>
        <TouchableOpacity style={styles.errorButton} onPress={handleGoBack}>
          <Text style={styles.errorButtonText}>GERİ DÖN</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* ✅ HEADER TAMAMEN KALDIRILDI - Geri butonu yok! */}
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <ProductGallery 
          images={product.images || [product.image]} 
          onFavoritePress={handleFavoritePress}
          isFavorite={isFavorite}
        />
        
        <ProductInfo product={product} />
        
        <QuantitySelector 
          quantity={quantity}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          maxStock={product.stock || 10}
        />
        
        <SizeSelector 
          sizes={product.sizes || ['XS', 'S', 'M', 'L', 'XL']}
          selectedSize={selectedSize}
          onSelect={setSelectedSize}
        />
        
        <DeliveryInfo />
      </ScrollView>
      
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.addToCartButton, !selectedSize && styles.addToCartDisabled]}
          onPress={handleAddToCart}
          disabled={!selectedSize}
        >
          <Ionicons name="cart-outline" size={16} color={COLORS.white} />
          <Text style={styles.addToCartText}>
            SEPETE EKLE • ₺{formatPrice(product.price * quantity)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ============ STILLER ============
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white 
  },
  
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.white 
  },
  loadingText: { 
    ...TYPOGRAPHY.caption,
    marginTop: SIZES.md,
  },
  
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    padding: SIZES.xl 
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  errorTitle: { 
    ...TYPOGRAPHY.caption,
    marginTop: SIZES.sm, 
    marginBottom: SIZES.sm 
  },
  errorText: { 
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center', 
    marginBottom: SIZES.lg 
  },
  errorButton: { 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.xl, 
    paddingVertical: SIZES.md 
  },
  errorButtonText: { 
    ...TYPOGRAPHY.button,
    color: COLORS.black 
  },
  
  // ✅ HEADER TAMAMEN KALDIRILDI - Bu stil artık kullanılmıyor ama hata vermemesi için bırakıyorum
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.lg, 
    paddingTop: Platform.OS === 'ios' ? 12 : SIZES.md, 
    paddingBottom: SIZES.md, 
    borderBottomWidth: 0.5, 
    borderBottomColor: COLORS.grayLight 
  },
  headerButton: { 
    padding: SIZES.xs, 
    position: 'relative' 
  },
  headerRight: { 
    flexDirection: 'row', 
    gap: SIZES.md 
  },
  cartBadge: { 
    position: 'absolute', 
    top: 0, 
    right: 0, 
    backgroundColor: COLORS.black, 
    width: 16, 
    height: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  cartBadgeText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.white 
  },
  
  scrollContent: { 
    paddingBottom: 100 
  },
  
  galleryContainer: { 
    position: 'relative', 
    height: 380,
    backgroundColor: COLORS.surface,
  },
  galleryImage: { 
    width: width, 
    height: 380, 
    resizeMode: 'cover' 
  },
  paginationContainer: {
    position: 'absolute',
    bottom: SIZES.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  paginationDot: {
    width: 4,
    height: 4,
    backgroundColor: COLORS.white,
    opacity: 0.5,
  },
  paginationDotActive: {
    width: 16,
    opacity: 1,
    backgroundColor: COLORS.black,
  },
  favoriteButton: { 
    position: 'absolute', 
    top: SIZES.md, 
    right: SIZES.md, 
    backgroundColor: COLORS.black, 
    width: 36, 
    height: 36, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  productInfoContainer: { 
    padding: SIZES.lg 
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  brand: { 
    ...TYPOGRAPHY.caption,
    letterSpacing: 0.5,
  },
  newBadge: {
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
  },
  newBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.grayMedium,
  },
  productName: { 
    ...TYPOGRAPHY.title3,
    marginBottom: SIZES.md 
  },
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SIZES.md, 
    marginBottom: SIZES.md 
  },
  price: { 
    ...TYPOGRAPHY.title2,
    fontSize: 24,
  },
  originalPrice: { 
    ...TYPOGRAPHY.body,
    color: COLORS.grayMedium, 
    textDecorationLine: 'line-through' 
  },
  description: { 
    ...TYPOGRAPHY.body,
    lineHeight: 22, 
    marginBottom: SIZES.md 
  },
  ratingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SIZES.md, 
    marginBottom: SIZES.lg 
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.grayMedium 
  },
  divider: { 
    height: 0.5, 
    backgroundColor: COLORS.grayLight, 
    marginVertical: SIZES.lg 
  },
  detailsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  detailItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  detailText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.grayMedium 
  },
  
  sectionContainer: { 
    paddingHorizontal: SIZES.lg, 
    paddingVertical: SIZES.md, 
    borderTopWidth: 0.5, 
    borderTopColor: COLORS.grayLight 
  },
  sectionTitle: { 
    ...TYPOGRAPHY.caption,
    marginBottom: SIZES.md 
  },
  
  quantityContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SIZES.lg 
  },
  quantityButton: { 
    width: 40, 
    height: 40, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  quantityButtonDisabled: { 
    opacity: 0.5 
  },
  quantityText: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500',
    minWidth: 40, 
    textAlign: 'center' 
  },
  stockText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium, 
    marginTop: SIZES.sm 
  },
  warningText: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium, 
    marginTop: SIZES.sm 
  },
  
  sizeList: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: SIZES.md 
  },
  sizeButton: { 
    width: 44, 
    height: 44, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  sizeButtonActive: { 
    backgroundColor: COLORS.black, 
    borderColor: COLORS.black 
  },
  sizeText: { 
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  sizeTextActive: { 
    color: COLORS.white 
  },
  
  deliveryContainer: { 
    margin: SIZES.lg, 
    padding: SIZES.md, 
    borderWidth: 0.5, 
    borderColor: COLORS.grayLight, 
    gap: SIZES.md 
  },
  deliveryItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SIZES.md 
  },
  deliveryIcon: {
    width: 32,
    height: 32,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryTitle: { 
    ...TYPOGRAPHY.caption,
    fontSize: 11,
  },
  deliverySubtext: { 
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.grayMedium, 
    marginTop: 2 
  },
  
  bottomBar: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: COLORS.white, 
    borderTopWidth: 0.5, 
    borderTopColor: COLORS.grayLight, 
    padding: SIZES.md 
  },
  addToCartButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: COLORS.black, 
    paddingVertical: SIZES.md, 
    gap: SIZES.sm 
  },
  addToCartDisabled: { 
    backgroundColor: COLORS.grayLight, 
    opacity: 0.7 
  },
  addToCartText: { 
    ...TYPOGRAPHY.button,
    color: COLORS.white 
  },
});

export default ProductDetailScreen;