// 📁 src/screens/FavoritesScreen.js - REVİZE (Premium Kart Eklendi)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  RefreshControl,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/Theme';
import { auth } from '../config/firebase';
import { wardrobeAPI } from '../services/api';

// ============================================================
// 📌 TOAST İMPORTU
// ============================================================
import { showToast } from '../components/CustomAlert';

const { width, height } = Dimensions.get('window');

// ============================================================
// 📌 FAVORİ HOOK (Backend Entegre)
// ============================================================
const useRealFavorites = () => {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadFavorites(currentUser);
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const loadFavorites = async (currentUser) => {
    try {
      const uid = currentUser?.uid || user?.uid;
      if (!uid) {
        setFavoriteItems([]);
        setFavoriteIds([]);
        setLoading(false);
        return;
      }

      const response = await wardrobeAPI.getAllItems(uid);
      
      if (response && response.success) {
        const allItems = [];
        if (response.categories) {
          Object.values(response.categories).forEach(categoryItems => {
            if (Array.isArray(categoryItems)) {
              allItems.push(...categoryItems);
            }
          });
        }
        
        const starItems = allItems.filter(item => item.is_star === true);
        const starIds = starItems.map(item => item.product_id || item.id);
        
        setFavoriteItems(starItems);
        setFavoriteIds(starIds);
      } else {
        setFavoriteItems([]);
        setFavoriteIds([]);
      }
    } catch (error) {
      console.error('Favori yükleme hatası:', error);
      setFavoriteItems([]);
      setFavoriteIds([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (itemId, productId) => {
    try {
      const uid = user?.uid;
      if (!uid) {
        showToast({
          title: 'Giriş Yapın',
          message: 'Favori işlemi için lütfen giriş yapın.',
          type: 'warning',
          autoClose: true,
          autoCloseDelay: 2500,
        });
        return null;
      }

      const isCurrentlyFavorite = favoriteIds.includes(productId || itemId);
      const newStatus = !isCurrentlyFavorite;
      
      const response = await wardrobeAPI.toggleStar(
        uid,
        productId || itemId,
        newStatus
      );

      if (response && response.success) {
        if (newStatus) {
          const product = await getProductDetails(productId || itemId);
          if (product) {
            setFavoriteItems(prev => [...prev, product]);
          }
          setFavoriteIds(prev => [...prev, productId || itemId]);
        } else {
          setFavoriteItems(prev => prev.filter(item => (item.product_id || item.id) !== (productId || itemId)));
          setFavoriteIds(prev => prev.filter(id => id !== (productId || itemId)));
        }
        return { success: true, isStar: newStatus };
      }
      return { success: false };
    } catch (error) {
      console.error('Favori güncelleme hatası:', error);
      showToast({
        title: 'Hata',
        message: 'Favori işlemi başarısız oldu.',
        type: 'error',
        autoClose: true,
        autoCloseDelay: 2000,
      });
      return { success: false };
    }
  };

  const getProductDetails = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/depo/urun/${productId}`);
      if (response.ok) {
        const data = await response.json();
        return data.urun || null;
      }
      return null;
    } catch (error) {
      console.error('Ürün detayı alınamadı:', error);
      return null;
    }
  };

  return { 
    favoriteItems, 
    favoriteIds, 
    toggleFavorite, 
    loading, 
    loadFavorites,
    user 
  };
};

// ============================================================
// 📌 ANA BİLEŞEN
// ============================================================
const FavoritesScreen = ({ navigation }) => {
  const { favoriteItems, favoriteIds, toggleFavorite, loading, loadFavorites } = useRealFavorites();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const favoritesCount = useMemo(() => favoriteItems.length, [favoriteItems]);

  // ============================================================
  // 📌 HANDLERS
  // ============================================================
  const handleRemoveFavorite = useCallback((item) => {
    Alert.alert(
      'Favorilerden Çıkar',
      `"${item.ad || item.name || 'Ürün'}" favorilerden çıkarmak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkar', 
          onPress: async () => {
            const result = await toggleFavorite(item.id, item.product_id || item.id);
            if (result?.success) {
              await loadFavorites();
              showToast({
                title: '💔 Favoriden Çıkarıldı',
                message: `${item.ad || item.name} favorilerden çıkarıldı.`,
                type: 'info',
                autoClose: true,
                autoCloseDelay: 2000,
              });
            }
          },
          style: 'destructive'
        }
      ]
    );
  }, [toggleFavorite, loadFavorites]);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  }, [isSelectionMode]);

  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const removeSelectedItems = useCallback(async () => {
    if (selectedItems.length === 0) return;
    
    Alert.alert(
      'Toplu Kaldırma',
      `${selectedItems.length} ürünü favorilerinizden çıkarmak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          onPress: async () => {
            for (const id of selectedItems) {
              await toggleFavorite(id, id);
            }
            await loadFavorites();
            setSelectedItems([]);
            setIsSelectionMode(false);
            showToast({
              title: '🗑️ Toplu Kaldırıldı',
              message: `${selectedItems.length} ürün favorilerden kaldırıldı.`,
              type: 'info',
              autoClose: true,
              autoCloseDelay: 2000,
            });
          },
          style: 'destructive'
        }
      ]
    );
  }, [selectedItems, toggleFavorite, loadFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  const handleProductPress = useCallback((product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const formatPrice = (price) => {
    if (!price) return '0';
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // ============================================================
  // 📌 RENDER FUNCTIONS
  // ============================================================
  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity 
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        
        <View>
          <Text style={[styles.title, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>FAVORİLERİM</Text>
          <Text style={[styles.subtitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
            {favoritesCount} {favoritesCount === 1 ? 'ÜRÜN' : 'ÜRÜN'}
          </Text>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        {favoritesCount > 0 && (
          <TouchableOpacity 
            onPress={toggleSelectionMode}
            style={styles.selectButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isSelectionMode ? "close" : "checkbox-outline"} 
              size={20} 
              color={COLORS.black} 
            />
          </TouchableOpacity>
        )}
        
        {isSelectionMode && selectedItems.length > 0 && (
          <TouchableOpacity 
            onPress={removeSelectedItems}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={12} color={COLORS.white} />
            <Text style={[styles.deleteButtonText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
              {selectedItems.length}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [favoritesCount, isSelectionMode, selectedItems.length, toggleSelectionMode, removeSelectedItems, navigation]);

  const renderItem = useCallback(({ item }) => {
    const itemId = item.id || item.product_id;
    const isSelected = selectedItems.includes(itemId);
    const productName = item.ad || item.name || 'Ürün';
    const productBrand = item.marka || item.brand || 'Marka';
    const productColor = item.renk || item.color;
    const imageUrl = item.img_url || item.image_url || 'https://picsum.photos/400/500';
    const price = item.fiyat || item.price;
    
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => {
          if (isSelectionMode) {
            toggleItemSelection(itemId);
          } else {
            handleProductPress(item);
          }
        }}
        onLongPress={() => {
          if (!isSelectionMode) {
            toggleSelectionMode();
            toggleItemSelection(itemId);
          }
        }}
        delayLongPress={500}
      >
        <View style={[styles.productCard, isSelected && styles.productCardSelected]}>
          {isSelectionMode && (
            <View style={styles.selectionIndicator}>
              <Ionicons 
                name={isSelected ? "checkbox" : "square-outline"} 
                size={18} 
                color={isSelected ? COLORS.black : COLORS.grayMedium} 
              />
            </View>
          )}
          
          <View style={[styles.productContent, isSelectionMode && styles.productWithSelection]}>
            <Image source={{ uri: imageUrl }} style={styles.productImage} />
            
            <View style={styles.productInfo}>
              <Text style={[styles.productBrand, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{productBrand}</Text>
              <Text style={[styles.productName, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]} numberOfLines={2}>{productName}</Text>
              {productColor && (
                <Text style={[styles.productColor, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>{productColor}</Text>
              )}
              {price && (
                <Text style={[styles.productPrice, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>₺{formatPrice(price)}</Text>
              )}
            </View>
            
            {!isSelectionMode && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveFavorite(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={16} color={COLORS.grayMedium} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [isSelectionMode, selectedItems, toggleItemSelection, handleRemoveFavorite, toggleSelectionMode, handleProductPress]);

  // ============================================================
  // 📌 EMPTY STATE - REVİZE (Premium Kart Eklendi)
  // ============================================================
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={40} color={COLORS.grayMedium} />
      </View>
      <Text style={[styles.emptyTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>HENÜZ FAVORİN YOK</Text>
      <Text style={[styles.emptyText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
        Beğendiğin ürünleri favorilere ekleyerek buradan takip edebilirsin.
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => {
          showToast({
            title: '🛍️ Alışverişe Başla',
            message: 'Senin için en iyi ürünleri keşfetmeye hazır mısın?',
            type: 'success',
            autoClose: false,
            showPremium: true,
          });
          navigation.navigate('Vitrinim', { initialTab: 'shop' });
        }}
      >
        <Text style={[styles.exploreButtonText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>ALIŞVERİŞE BAŞLA</Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  // ============================================================
  // 📌 RENDER
  // ============================================================
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={[styles.loadingText, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>YÜKLENİYOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {renderHeader()}
      
      <FlatList
        data={favoriteItems}
        keyExtractor={(item) => (item.id || item.product_id)?.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.black}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

// ============================================================
// 📌 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.md },
  loadingText: { ...TYPOGRAPHY.caption, color: COLORS.grayMedium },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
    backgroundColor: COLORS.white,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  title: { ...TYPOGRAPHY.caption, letterSpacing: 2 },
  subtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.grayMedium, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  selectButton: { padding: 4 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    gap: 4,
  },
  deleteButtonText: { ...TYPOGRAPHY.caption, color: COLORS.white },

  // LIST
  listContent: { paddingHorizontal: SIZES.lg, paddingBottom: SIZES.xl },

  // PRODUCT CARD
  productCard: {
    marginBottom: SIZES.md,
    borderWidth: 0.5,
    borderColor: COLORS.grayLight,
    backgroundColor: COLORS.white,
  },
  productCardSelected: { borderWidth: 1, borderColor: COLORS.black },
  selectionIndicator: { width: 44, alignItems: 'center', justifyContent: 'center' },
  productContent: { flex: 1, flexDirection: 'row', padding: SIZES.md, position: 'relative' },
  productWithSelection: { marginRight: 0 },
  productImage: { width: 70, height: 90, backgroundColor: COLORS.surface, borderWidth: 0.5, borderColor: COLORS.grayLight },
  productInfo: { flex: 1, marginLeft: SIZES.md, justifyContent: 'center' },
  productBrand: { ...TYPOGRAPHY.caption, marginBottom: 2 },
  productName: { ...TYPOGRAPHY.body, fontWeight: '500', marginBottom: 2 },
  productColor: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.grayMedium, marginBottom: 2 },
  productPrice: { ...TYPOGRAPHY.body, fontWeight: '500' },
  removeButton: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    minHeight: height - 200,
  },
  emptyIconContainer: { width: 80, height: 80, borderWidth: 0.5, borderColor: COLORS.grayLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.lg },
  emptyTitle: { ...TYPOGRAPHY.caption, marginBottom: SIZES.sm },
  emptyText: { ...TYPOGRAPHY.bodySmall, textAlign: 'center', lineHeight: 18, marginBottom: SIZES.lg },
  exploreButton: { borderWidth: 0.5, borderColor: COLORS.grayLight, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.md },
  exploreButtonText: { ...TYPOGRAPHY.button, color: COLORS.black },
});

export default FavoritesScreen;